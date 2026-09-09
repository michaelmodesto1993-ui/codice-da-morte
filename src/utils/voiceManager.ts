import { Socket } from 'socket.io-client';

export interface VoiceParticipant {
  playerId: string;
  isSpeaking: boolean;
  isMuted: boolean;
  volume: number; // 0 to 100
  lastSpokeAt?: number;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
};

class VoiceManager {
  private socket: Socket | null = null;
  private myPlayerId: string = '';
  private isInVoiceChannel: boolean = false;
  private isMuted: boolean = true;
  private isDeaf: boolean = false;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private localAnalyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private isSpeaking: boolean = false;

  // WebRTC Peer Connections per remote player
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private remoteAudioElements: Map<string, HTMLAudioElement> = new Map();
  private remoteAnalysers: Map<string, { analyser: AnalyserNode; source: MediaStreamAudioSourceNode }> = new Map();

  // Voice state maps and listeners
  private participants: Map<string, VoiceParticipant> = new Map();
  private onSpeakingChangeCallbacks: ((participants: Map<string, VoiceParticipant>) => void)[] = [];
  private onLocalSpeakingCallbacks: ((isSpeaking: boolean, volume: number) => void)[] = [];
  private onMicStatusCallbacks: ((isMuted: boolean) => void)[] = [];
  private onVoiceChannelStatusCallbacks: ((inVoice: boolean) => void)[] = [];

  private masterVoiceVolume: number = (() => {
    try {
      const saved = localStorage.getItem('codice_master_voice_vol');
      return saved ? parseFloat(saved) : 1.0;
    } catch {
      return 1.0;
    }
  })();
  private userVolumes: Map<string, number> = new Map();
  private mobileUnlockAttached: boolean = false;

  constructor() {
    this.attachMobileAudioUnlocker();
  }

  public init(socket: Socket | null, myPlayerId: string) {
    this.socket = socket;
    this.myPlayerId = myPlayerId;
    this.setupSocketListeners();
  }

  public setSocket(socket: Socket | null, myPlayerId: string) {
    this.socket = socket;
    this.myPlayerId = myPlayerId;
    this.setupSocketListeners();
  }

  // iOS iPhone Safari & Android Chrome audio unlocker on first user touch/tap
  private attachMobileAudioUnlocker() {
    if (this.mobileUnlockAttached || typeof window === 'undefined') return;
    this.mobileUnlockAttached = true;

    const unlock = () => {
      this.unlockMobileAudio();
    };

    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('touchend', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
  }

  public unlockMobileAudio() {
    try {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
      // Play any pending remote audio elements
      this.remoteAudioElements.forEach((audio) => {
        if (audio && audio.paused && audio.srcObject) {
          audio.play().catch(() => {});
        }
      });
    } catch (e) {}
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    // Remove existing handlers to avoid duplicates
    this.socket.off('webrtc_signal');
    this.socket.off('voice_channel_users');
    this.socket.off('voice_player_joined');
    this.socket.off('voice_player_left');
    this.socket.off('voice_speaking_state');
    this.socket.off('voice_mic_status');

    // 1. WebRTC Signal exchange (Offer, Answer, ICE Candidate)
    this.socket.on(
      'webrtc_signal',
      async ({
        senderPlayerId,
        signalType,
        data,
      }: {
        senderPlayerId: string;
        signalType: string;
        data: any;
      }) => {
        if (!senderPlayerId || senderPlayerId === this.myPlayerId) return;

        try {
          if (signalType === 'offer') {
            await this.handleIncomingOffer(senderPlayerId, data);
          } else if (signalType === 'answer') {
            await this.handleIncomingAnswer(senderPlayerId, data);
          } else if (signalType === 'ice-candidate') {
            await this.handleIncomingIceCandidate(senderPlayerId, data);
          }
        } catch (err) {
          console.warn('[VoiceManager] WebRTC signal error:', err);
        }
      }
    );

    // 2. Received list of existing voice channel participants when joining
    this.socket.on('voice_channel_users', async ({ activePlayerIds }: { activePlayerIds: string[] }) => {
      if (!Array.isArray(activePlayerIds)) return;
      for (const targetId of activePlayerIds) {
        if (targetId && targetId !== this.myPlayerId) {
          // As the newly joined peer, initiate offer to existing peers
          await this.createOfferToPeer(targetId);
        }
      }
    });

    // 3. Another player joined the voice channel
    this.socket.on('voice_player_joined', ({ playerId }: { playerId: string }) => {
      if (!playerId || playerId === this.myPlayerId) return;
      const p = this.participants.get(playerId) || {
        playerId,
        isSpeaking: false,
        isMuted: true,
        volume: 0,
      };
      this.participants.set(playerId, p);
      this.notifyParticipants();
    });

    // 4. Another player left the voice channel
    this.socket.on('voice_player_left', ({ playerId }: { playerId: string }) => {
      if (!playerId || playerId === this.myPlayerId) return;
      this.closePeer(playerId);
      this.participants.delete(playerId);
      this.notifyParticipants();
    });

    // 5. Remote speaking state updates
    this.socket.on(
      'voice_speaking_state',
      ({ playerId, isSpeaking, volume }: { playerId: string; isSpeaking: boolean; volume: number }) => {
        if (playerId === this.myPlayerId) return;
        const p = this.participants.get(playerId) || {
          playerId,
          isSpeaking,
          isMuted: false,
          volume,
        };
        p.isSpeaking = isSpeaking;
        p.volume = volume;
        this.participants.set(playerId, p);
        this.notifyParticipants();
      }
    );

    // 6. Remote mic status updates
    this.socket.on('voice_mic_status', ({ playerId, isMuted }: { playerId: string; isMuted: boolean }) => {
      if (playerId === this.myPlayerId) return;
      const p = this.participants.get(playerId) || {
        playerId,
        isSpeaking: false,
        isMuted,
        volume: 0,
      };
      p.isMuted = isMuted;
      if (isMuted) p.isSpeaking = false;
      this.participants.set(playerId, p);
      this.notifyParticipants();
    });
  }

  // Create an RTCPeerConnection for a remote peer
  private getOrCreatePeerConnection(targetPlayerId: string): RTCPeerConnection {
    let pc = this.peerConnections.get(targetPlayerId);
    if (pc && pc.connectionState !== 'closed' && pc.connectionState !== 'failed') {
      return pc;
    }

    pc = new RTCPeerConnection(RTC_CONFIG);

    // Attach local audio track if available
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((track) => {
        pc!.addTrack(track, this.mediaStream!);
      });
    }

    // ICE Candidate handler
    pc.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('webrtc_signal', {
          targetPlayerId,
          signalType: 'ice-candidate',
          data: event.candidate,
        });
      }
    };

    // Remote audio track handler
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        this.attachRemoteAudioStream(targetPlayerId, remoteStream);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc!.connectionState === 'failed' || pc!.connectionState === 'disconnected') {
        console.warn(`[VoiceManager] Connection to peer ${targetPlayerId} is ${pc!.connectionState}`);
      }
    };

    this.peerConnections.set(targetPlayerId, pc);
    return pc;
  }

  private async createOfferToPeer(targetPlayerId: string) {
    try {
      const pc = this.getOrCreatePeerConnection(targetPlayerId);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
      });
      await pc.setLocalDescription(offer);

      if (this.socket) {
        this.socket.emit('webrtc_signal', {
          targetPlayerId,
          signalType: 'offer',
          data: offer,
        });
      }
    } catch (err) {
      console.warn(`[VoiceManager] Failed to create offer for ${targetPlayerId}:`, err);
    }
  }

  private async handleIncomingOffer(senderPlayerId: string, offerData: RTCSessionDescriptionInit) {
    try {
      const pc = this.getOrCreatePeerConnection(senderPlayerId);
      await pc.setRemoteDescription(new RTCSessionDescription(offerData));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (this.socket) {
        this.socket.emit('webrtc_signal', {
          targetPlayerId: senderPlayerId,
          signalType: 'answer',
          data: answer,
        });
      }
    } catch (err) {
      console.warn(`[VoiceManager] Failed to handle offer from ${senderPlayerId}:`, err);
    }
  }

  private async handleIncomingAnswer(senderPlayerId: string, answerData: RTCSessionDescriptionInit) {
    try {
      const pc = this.peerConnections.get(senderPlayerId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answerData));
      }
    } catch (err) {
      console.warn(`[VoiceManager] Failed to handle answer from ${senderPlayerId}:`, err);
    }
  }

  private async handleIncomingIceCandidate(senderPlayerId: string, candidateData: RTCIceCandidateInit) {
    try {
      const pc = this.peerConnections.get(senderPlayerId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidateData));
      }
    } catch (err) {
      console.warn(`[VoiceManager] Failed to add ICE candidate from ${senderPlayerId}:`, err);
    }
  }

  // Attach remote stream to HTMLAudioElement with playsinline and volume analysis
  private attachRemoteAudioStream(playerId: string, stream: MediaStream) {
    let audioEl = this.remoteAudioElements.get(playerId);
    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      (audioEl as any).playsInline = true;
      audioEl.setAttribute('playsinline', 'true');
      audioEl.setAttribute('webkit-playsinline', 'true');
      audioEl.muted = this.isDeaf;
      document.body.appendChild(audioEl);
      this.remoteAudioElements.set(playerId, audioEl);
    }

    audioEl.srcObject = stream;
    const userVol = this.userVolumes.get(playerId) ?? 1.0;
    audioEl.volume = Math.max(0, Math.min(1, this.masterVoiceVolume * userVol));

    // Try playing immediately, or unlock on user touch
    audioEl.play().catch(() => {
      // Mobile Safari autoplay policy requires touch
    });

    // Setup Web Audio Analyser for remote speaking detection (Discord green halo)
    this.setupRemoteAudioAnalysis(playerId, stream);
  }

  private setupRemoteAudioAnalysis(playerId: string, stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }

      // Cleanup prior analyser if any
      const existing = this.remoteAnalysers.get(playerId);
      if (existing) {
        try {
          existing.source.disconnect();
          existing.analyser.disconnect();
        } catch {}
      }

      const source = this.audioContext.createMediaStreamSource(stream);
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      this.remoteAnalysers.set(playerId, { analyser, source });
    } catch (err) {
      console.warn(`[VoiceManager] Remote audio analysis setup error for ${playerId}:`, err);
    }
  }

  private closePeer(playerId: string) {
    const pc = this.peerConnections.get(playerId);
    if (pc) {
      try {
        pc.close();
      } catch {}
      this.peerConnections.delete(playerId);
    }

    const audioEl = this.remoteAudioElements.get(playerId);
    if (audioEl) {
      try {
        audioEl.pause();
        audioEl.srcObject = null;
        if (audioEl.parentNode) audioEl.parentNode.removeChild(audioEl);
      } catch {}
      this.remoteAudioElements.delete(playerId);
    }

    const analyserObj = this.remoteAnalysers.get(playerId);
    if (analyserObj) {
      try {
        analyserObj.source.disconnect();
        analyserObj.analyser.disconnect();
      } catch {}
      this.remoteAnalysers.delete(playerId);
    }
  }

  // --- Microphone & Audio Capture ---

  public async startMicrophone(): Promise<boolean> {
    try {
      this.unlockMobileAudio();

      if (this.mediaStream && this.mediaStream.active && this.mediaStream.getAudioTracks().length > 0) {
        this.unmute();
        this.joinVoiceChannel();
        return true;
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        console.warn('getUserMedia is not supported on this browser.');
        return false;
      }

      // Optimal audio constraints for mobile (iOS Safari & Android Chrome)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaStream = stream;
      this.isMuted = false;
      this.isInVoiceChannel = true;
      this.notifyMicStatus(false);
      this.notifyVoiceChannelStatus(true);

      // Join voice channel on socket
      this.joinVoiceChannel();

      if (this.socket) {
        this.socket.emit('voice_mic_status', { isMuted: false });
      }

      // Setup audio analysis loop for local and remote speaking detection
      this.setupLocalAudioAnalysis(stream);

      // Update tracks on all active peer connections
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        this.peerConnections.forEach((pc) => {
          const senders = pc.getSenders();
          const audioSender = senders.find((s) => s.track && s.track.kind === 'audio');
          if (audioSender) {
            audioSender.replaceTrack(audioTrack);
          } else {
            pc.addTrack(audioTrack, stream);
          }
        });
      }

      return true;
    } catch (err) {
      console.warn('[VoiceManager] Microphone access not granted or error:', err);
      return false;
    }
  }

  public joinVoiceChannel(): boolean {
    this.isInVoiceChannel = true;
    this.notifyVoiceChannelStatus(true);
    if (this.socket) {
      this.socket.emit('voice_channel_join');
    }
    return true;
  }

  public leaveVoiceChannel() {
    this.stopMicrophone();
    this.isInVoiceChannel = false;
    this.notifyVoiceChannelStatus(false);
    if (this.socket) {
      this.socket.emit('voice_channel_leave');
    }
    // Close all peer connections
    this.peerConnections.forEach((_, id) => this.closePeer(id));
    this.peerConnections.clear();
    this.participants.clear();
    this.notifyParticipants();
  }

  public mute() {
    this.isMuted = true;
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    }
    this.isSpeaking = false;
    this.notifyLocalSpeaking(false, 0);
    this.notifyMicStatus(true);
    if (this.socket) {
      this.socket.emit('voice_mic_status', { isMuted: true });
      this.socket.emit('voice_speaking_state', { isSpeaking: false, volume: 0 });
    }
  }

  public async unmute() {
    this.unlockMobileAudio();
    if (!this.mediaStream || !this.mediaStream.active) {
      await this.startMicrophone();
      return;
    }
    this.isMuted = false;
    this.mediaStream.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
    this.notifyMicStatus(false);
    if (this.socket) {
      this.socket.emit('voice_mic_status', { isMuted: false });
    }
  }

  public toggleMute() {
    if (this.isMuted || !this.mediaStream) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  public setDeaf(deaf: boolean) {
    this.isDeaf = deaf;
    this.remoteAudioElements.forEach((audio) => {
      audio.muted = deaf;
    });
  }

  public getIsDeaf(): boolean {
    return this.isDeaf;
  }

  public stopMicrophone() {
    this.mute();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
  }

  // Real-time Voice Activity Detection (VAD) for Discord green glow
  private setupLocalAudioAnalysis(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      const source = this.audioContext.createMediaStreamSource(stream);
      this.localAnalyser = this.audioContext.createAnalyser();
      this.localAnalyser.fftSize = 256;
      source.connect(this.localAnalyser);

      const bufferLength = this.localAnalyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const remoteDataArray = new Uint8Array(bufferLength);

      const checkVolumes = () => {
        // 1. Check local microphone volume
        if (this.localAnalyser && !this.isMuted) {
          this.localAnalyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          const volumePercent = Math.min(100, Math.round((average / 128) * 100));
          const nowSpeaking = volumePercent > 8;

          if (nowSpeaking !== this.isSpeaking) {
            this.isSpeaking = nowSpeaking;
            this.notifyLocalSpeaking(nowSpeaking, volumePercent);
            if (this.socket) {
              this.socket.emit('voice_speaking_state', { isSpeaking: nowSpeaking, volume: volumePercent });
            }
          }
        } else if (this.isSpeaking) {
          this.isSpeaking = false;
          this.notifyLocalSpeaking(false, 0);
          if (this.socket) {
            this.socket.emit('voice_speaking_state', { isSpeaking: false, volume: 0 });
          }
        }

        // 2. Check remote participants volumes for Discord avatar glow
        let remoteStateChanged = false;
        this.remoteAnalysers.forEach(({ analyser }, peerId) => {
          analyser.getByteFrequencyData(remoteDataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += remoteDataArray[i];
          }
          const avg = sum / bufferLength;
          const vol = Math.min(100, Math.round((avg / 128) * 100));
          const speaking = vol > 8;

          const p = this.participants.get(peerId);
          if (p) {
            if (p.isSpeaking !== speaking || Math.abs((p.volume || 0) - vol) > 15) {
              p.isSpeaking = speaking;
              p.volume = vol;
              remoteStateChanged = true;
            }
          }
        });

        if (remoteStateChanged) {
          this.notifyParticipants();
        }

        this.animFrameId = requestAnimationFrame(checkVolumes);
      };

      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      this.animFrameId = requestAnimationFrame(checkVolumes);
    } catch (err) {
      console.warn('[VoiceManager] Web Audio analysis setup failed:', err);
    }
  }

  // --- Volume Control ---

  public setMasterVoiceVolume(vol: number) {
    this.masterVoiceVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('codice_master_voice_vol', this.masterVoiceVolume.toString());
    } catch {}

    this.remoteAudioElements.forEach((audio, peerId) => {
      const userVol = this.userVolumes.get(peerId) ?? 1.0;
      audio.volume = Math.max(0, Math.min(1, this.masterVoiceVolume * userVol));
    });
  }

  public getMasterVoiceVolume(): number {
    return this.masterVoiceVolume;
  }

  public setUserVolume(playerId: string, vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.userVolumes.set(playerId, clamped);
    const audio = this.remoteAudioElements.get(playerId);
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, this.masterVoiceVolume * clamped));
    }
  }

  public getUserVolume(playerId: string): number {
    return this.userVolumes.get(playerId) ?? 1.0;
  }

  // --- Callbacks & Subscriptions ---

  public onParticipantsChange(cb: (participants: Map<string, VoiceParticipant>) => void) {
    this.onSpeakingChangeCallbacks.push(cb);
    return () => {
      this.onSpeakingChangeCallbacks = this.onSpeakingChangeCallbacks.filter((c) => c !== cb);
    };
  }

  public onLocalSpeaking(cb: (isSpeaking: boolean, volume: number) => void) {
    this.onLocalSpeakingCallbacks.push(cb);
    return () => {
      this.onLocalSpeakingCallbacks = this.onLocalSpeakingCallbacks.filter((c) => c !== cb);
    };
  }

  public onMicStatus(cb: (isMuted: boolean) => void) {
    this.onMicStatusCallbacks.push(cb);
    return () => {
      this.onMicStatusCallbacks = this.onMicStatusCallbacks.filter((c) => c !== cb);
    };
  }

  public onVoiceChannelStatus(cb: (inVoice: boolean) => void) {
    this.onVoiceChannelStatusCallbacks.push(cb);
    return () => {
      this.onVoiceChannelStatusCallbacks = this.onVoiceChannelStatusCallbacks.filter((c) => c !== cb);
    };
  }

  private notifyParticipants() {
    this.onSpeakingChangeCallbacks.forEach((cb) => cb(new Map(this.participants)));
  }

  private notifyLocalSpeaking(isSpeaking: boolean, volume: number) {
    this.onLocalSpeakingCallbacks.forEach((cb) => cb(isSpeaking, volume));
  }

  private notifyMicStatus(isMuted: boolean) {
    this.onMicStatusCallbacks.forEach((cb) => cb(isMuted));
  }

  private notifyVoiceChannelStatus(inVoice: boolean) {
    this.onVoiceChannelStatusCallbacks.forEach((cb) => cb(inVoice));
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsMicActive(): boolean {
    return !this.isMuted && this.mediaStream !== null;
  }

  public getIsInVoiceChannel(): boolean {
    return this.isInVoiceChannel;
  }
}

export const voiceManager = new VoiceManager();
