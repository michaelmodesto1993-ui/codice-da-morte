import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  RoomState,
  Player,
  CharacterInfo,
  CardMethod,
  CardObject,
  MarkerColor,
} from './types/game';
import { CHARACTERS, ABILITIES, MARKER_INFOS } from './data/gameData';
import {
  createNewRoom,
  fillWithAIBots,
  populateLobbyInvestigators,
  startGameDistribution,
  handleNightChoice,
  handleOracleMark,
  finishOraclePhase,
  handleAccusation,
  handleAbilityUse,
  handleDrawRandomEvent,
  handleDrawNewEvidence,
  handleAddSpecificEvidence,
  handleDiscardEvidence,
  handleAdvanceRound,
  autoProcessBotOracleNextRound,
  autoMarkOracleAI,
  handleUpdateStoryNarrative,
  adjustTimer,
  toggleTimer,
  generateAIBotDialogue,
  generateAIBotPersonalResponse,
  performAIBotAccusation,
  handleAnswerAnalystInquiry,
  sanitizeRoomForPlayer
} from './engine/gameLogic';

import { Table2D } from './components/Table2D';
import { InvestigationRoomView } from './components/InvestigationRoomView';
import { LobbyView } from './components/LobbyView';
import { NightPhaseView } from './components/NightPhaseView';
import { OracleView } from './components/OracleView';
import { AccusationModal } from './components/AccusationModal';
import { AccusationsHistoryModal } from './components/AccusationsHistoryModal';
import { CrimeNarrativeModal } from './components/CrimeNarrativeModal';
import { CinematicRevelation } from './components/CinematicRevelation';
import { RulesReferenceModal } from './components/RulesReferenceModal';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { ChatAndVoice } from './components/ChatAndVoice';
import { SettingsModal } from './components/SettingsModal';
import { DiscardedEvidencesModal } from './components/DiscardedEvidencesModal';
import { MobileAppGuideModal } from './components/MobileAppGuideModal';
import { GothicAvatar } from './components/GothicAvatar';
import { HomeScreen } from './components/HomeScreen';
import { GrimoireModal } from './components/GrimoireModal';
import { CollectionModal } from './components/CollectionModal';
import { ShopModal } from './components/ShopModal';
import { ProfileModal } from './components/ProfileModal';
import { NotificationsModal } from './components/NotificationsModal';
import { PlayModal } from './components/PlayModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import { InGameQuickMenuModal } from './components/InGameQuickMenuModal';
import { InvestigatorNotebookModal } from './components/InvestigatorNotebookModal';
import { RoleRevealCutscene } from './components/RoleRevealCutscene';
import { AtmosphericDust } from './components/AtmosphericDust';
import { ConnectionStatusBadge } from './components/ConnectionStatusBadge';
import { soundEngine } from './utils/soundEngine';
import { hapticEngine } from './utils/haptics';
import { voiceManager } from './utils/voiceManager';
import { GameZoomProvider, GameZoomContainer } from './context/GameZoomContext';
import codiceMorteLivroImg from './assets/images/codice_morte_livro_1787918785943.jpg';
import codiceEmblemaCaveiraImg from './assets/images/codice_emblema_caveira_1787918811337.jpg';
import { EventCard, AbilityCard, MethodCard, ObjectCard } from './components/GothicCard';
import {
  PassAndPlaySetupModal,
  PassDeviceScreen,
  LocalRoleRevealModal,
} from './components/PassAndPlayModal';

import { TUTORIAL_STEPS, createTutorialInitialState } from './data/tutorialData';
import { TutorialOverlay } from './components/TutorialOverlay';

import {
  Skull,
  BookOpen,
  Sparkles,
  Shield,
  Eye,
  Volume2,
  VolumeX,
  ShieldAlert,
  Clock,
  Flame,
  UserCheck,
  RefreshCw,
  Smartphone,
  Plus,
  Minus,
  CheckCircle,
  Zap,
  PlusCircle,
  ArrowRight,
  Sliders,
  Archive,
  LogOut,
  Sun,
  Moon,
  Settings,
  Menu,
  AlertTriangle,
  X,
  Mic,
  MicOff,
  Loader2,
} from 'lucide-react';

function GameApp() {
  // Connection & Player State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [isVoiceMicActive, setIsVoiceMicActive] = useState<boolean>(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('codice_player_name') || 'Investigador 1';
  });
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [selectedCharId, setSelectedCharId] = useState<string>(() => {
    return localStorage.getItem('codice_char_id') || CHARACTERS[0].id;
  });
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  // UI Modals
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showDiscardedModal, setShowDiscardedModal] = useState<boolean>(false);
  const [showAccuseModal, setShowAccuseModal] = useState<boolean>(false);
  const [showAccusationsModal, setShowAccusationsModal] = useState<boolean>(false);
  const [showStoryModal, setShowStoryModal] = useState<boolean>(false);
  const [showNotebookModal, setShowNotebookModal] = useState<boolean>(false);
  const [showCharModal, setShowCharModal] = useState<boolean>(false);
  const [showGrimoire, setShowGrimoire] = useState<boolean>(false);
  const [showCollection, setShowCollection] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showPlayModal, setShowPlayModal] = useState<boolean>(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState<boolean>(false);
  const [playModalMode, setPlayModalMode] = useState<'all' | 'create' | 'join'>('all');
  const [inspectCard, setInspectCard] = useState<{
    player: Player;
    type: 'method' | 'object';
    card: CardMethod | CardObject;
  } | null>(null);
  const [observationNotice, setObservationNotice] = useState<{
    targetPlayerId?: string;
    targetName: string;
    observation: string;
  } | null>(null);

  // Tutorial State
  const [isTutorialActive, setIsTutorialActive] = useState<boolean>(false);
  const [tutorialStepIndex, setTutorialStepIndex] = useState<number>(0);
  const currentTutorialStep = isTutorialActive ? TUTORIAL_STEPS[tutorialStepIndex] : null;

  const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);
  const [roomCreationError, setRoomCreationError] = useState<string | null>(null);
  const isLocalModeRef = useRef<boolean>(false);
  const lastPhaseRef = useRef<string>('LOBBY');

  // Handlers
  const handleStartTutorial = () => {
    isLocalModeRef.current = true;
    setIsTutorialActive(true);
    setTutorialStepIndex(0);
    const initial = createTutorialInitialState(playerName);
    setMyPlayerId(initial.players[0].id);
    setRoom(initial);
    soundEngine.playDramaticSting();
  };

  useEffect(() => {
    (window as any).startTutorial = handleStartTutorial;
  }, [playerName]);

  // Connect to Socket.IO
  useEffect(() => {
    const s = io(window.location.origin);
    s.on('connect', () => setConnectionStatus('connected'));
    s.on('joined_success', (data) => {
      setMyPlayerId(data.playerId);
      voiceManager.init(s, data.playerId);
    });
    s.on('room_update', (updatedRoom) => setRoom(updatedRoom));
    s.on('error_message', (msg) => setRoomCreationError(msg));
    setSocket(s);
    return () => { s.disconnect(); };
  }, []);

  // Timer
  useEffect(() => {
    if (!room || !room.phaseTimerActive || room.phaseTimerRemaining <= 0) return;
    const timer = setInterval(() => {
      setRoom(prev => prev ? ({ ...prev, phaseTimerRemaining: prev.phaseTimerRemaining - 1 }) : null);
    }, 1000);
    return () => clearInterval(timer);
  }, [room?.phaseTimerActive]);

  const handleStartGame = () => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('start_game');
    } else if (room) {
      setRoom(startGameDistribution(room.players.length < 4 ? fillWithAIBots(room, 4) : room));
    }
  };

  const handleAdjustTimer = (deltaSeconds: number) => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('adjust_timer', { deltaSeconds });
    } else if (room) {
      setRoom(adjustTimer(room, deltaSeconds));
    }
  };

  const handleNextTutorialStep = () => {
    if (tutorialStepIndex < TUTORIAL_STEPS.length - 1) setTutorialStepIndex(prev => prev + 1);
    else setIsTutorialActive(false);
  };

  const myPlayer = room?.players.find(p => p.id === myPlayerId);
  const myRole = myPlayer?.role;

  if (!room) {
    return (
      <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${codiceMorteLivroImg})` }}>
        <HomeScreen
          playerName={playerName} setPlayerName={setPlayerName}
          selectedCharId={selectedCharId} setSelectedCharId={setSelectedCharId}
          onQuickPlaySolo={() => { isLocalModeRef.current = true; setRoom(startGameDistribution(fillWithAIBots(createNewRoom('SOLO', playerName), 6))); }}
          onOpenCreateRoom={() => setShowCreateRoomModal(true)}
          onOpenJoinRoom={() => { setPlayModalMode('join'); setShowPlayModal(true); }}
          onOpenGrimoire={() => setShowGrimoire(true)}
          onOpenCollection={() => setShowCollection(true)}
          onOpenShop={() => setShowShop(true)}
          onOpenProfile={() => setShowProfile(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
        {showCreateRoomModal && <CreateRoomModal isOpen={true} onClose={() => setShowCreateRoomModal(false)} onConfirmCreate={(c) => {
          isLocalModeRef.current = false;
          socket?.emit('join_room', { roomCode: Math.random().toString(36).substring(2,7).toUpperCase(), playerName, characterId: selectedCharId, ...c });
          setShowCreateRoomModal(false);
        }} />}
        {showPlayModal && <PlayModal isOpen={true} onClose={() => setShowPlayModal(false)} onStartSoloGame={() => { isLocalModeRef.current = true; setRoom(startGameDistribution(fillWithAIBots(createNewRoom('SOLO', playerName), 6))); }} onJoinRoom={(code) => socket?.emit('join_room', { roomCode: code, playerName, characterId: selectedCharId })} roomCodeInput={roomCodeInput} setRoomCodeInput={setRoomCodeInput} mode={playModalMode} />}
        {showCollection && <CollectionModal isOpen={true} onClose={() => setShowCollection(false)} />}
        {showGrimoire && <GrimoireModal isOpen={true} onClose={() => setShowGrimoire(false)} />}
      </div>
    );
  }

  if (room.phase === 'LOBBY') {
    return (
      <div className="w-full h-full">
        <LobbyView
          room={room} myPlayerId={myPlayerId}
          onUpdateCharacter={(id) => socket?.emit('update_character', { characterId: id })}
          onToggleReady={() => socket?.emit('toggle_ready')}
          onAddBot={() => socket?.emit('add_bot')}
          onRemoveBot={() => socket?.emit('remove_bot')}
          onStartGame={handleStartGame}
          onUpdateSettings={(s) => socket?.emit('update_settings', { settings: s })}
          onDesignateOracle={(id) => socket?.emit('designate_oracle', { playerId: id })}
          onLeaveRoom={() => setRoom(null)}
        />
        {isTutorialActive && currentTutorialStep && <TutorialOverlay step={currentTutorialStep} onNext={handleNextTutorialStep} onClose={() => setIsTutorialActive(false)} isLast={tutorialStepIndex === TUTORIAL_STEPS.length - 1} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <main className="relative z-10 w-full h-full flex flex-col p-4">
        {room.phase === 'NOITE' && <NightPhaseView room={room} myPlayerId={myPlayerId} onConfirmChoice={(m, o) => socket?.emit('night_choice', { methodId: m, objectId: o })} />}
        {room.phase === 'ORACULO' && (
          myRole === 'oraculo' ?
          <OracleView room={room} myPlayerId={myPlayerId} onMarkOption={(e, o, c, crd) => socket?.emit('oracle_mark', { evidenceId: e, optionIdx: o, color: c, coords: crd })} onFinishOraclePhase={() => socket?.emit('finish_oracle')} onUpdateStory={(t) => socket?.emit('update_story', { text: t })} onAdjustTimer={handleAdjustTimer} onDrawEvidence={() => socket?.emit('draw_evidence')} onDiscardEvidence={(e) => socket?.emit('discard_evidence', { evidenceId: e })} onDrawEvent={() => socket?.emit('draw_event')} onAnswerAnalystInquiry={(s) => socket?.emit('answer_analyst_inquiry', { selectedItem: s })} /> :
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center"><Eye className="w-12 h-12 text-blue-400 animate-pulse mb-4" /><h2 className="text-xl font-serif font-black uppercase tracking-widest">O Oráculo está examinando o Códice...</h2></div>
        )}
        {room.phase === 'INVESTIGACAO' && <InvestigationRoomView room={room} myPlayerId={myPlayerId} onSelectPlayerCard={(p, t, c) => setInspectCard({ player: p, type: t, card: c })} onAccuseClick={() => setShowAccuseModal(true)} onAdjustTimer={handleAdjustTimer} onSendMessage={(t, w, a) => socket?.emit('send_message', { text: t, isWhisper: w, ...a })} onAdvanceRound={() => socket?.emit('advance_round')} onDrawEvidence={() => socket?.emit('draw_evidence')} onDiscardEvidence={(e) => socket?.emit('discard_evidence', { evidenceId: e })} onUseAbility={(id, pay) => socket?.emit('use_ability', { abilityId: id, extraPayload: pay })} onAnswerAnalystInquiry={(s) => socket?.emit('answer_analyst_inquiry', { selectedItem: s })} />}
        {room.phase === 'REVELACAO' && <CinematicRevelation room={room} myPlayerId={myPlayerId} onRestartGame={() => socket?.emit('restart_game')} onReturnToMainMenu={() => setRoom(null)} />}
      </main>

      {inspectCard && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 backdrop-blur-md" onClick={() => setInspectCard(null)}>
          <div className="bg-[#1a0d0a] border border-amber-600/40 p-8 rounded-3xl max-w-2xl w-full text-center">
             <h2 className="text-amber-200 font-serif font-black uppercase mb-4">{inspectCard.card.name}</h2>
             <p className="text-zinc-300 italic mb-6">"{inspectCard.card.description}"</p>
             <button className="px-6 py-2 bg-amber-600 rounded-xl font-bold uppercase" onClick={() => setInspectCard(null)}>Fechar</button>
          </div>
        </div>
      )}

      {showAccuseModal && <AccusationModal room={room} myPlayerId={myPlayerId} onClose={() => setShowAccuseModal(false)} onConfirmAccusation={(t, m, o) => { socket?.emit('make_accusation', { targetPlayerId: t, methodId: m, objectId: o }); setShowAccuseModal(false); }} />}
      {isTutorialActive && currentTutorialStep && <TutorialOverlay step={currentTutorialStep} onNext={handleNextTutorialStep} onClose={() => setIsTutorialActive(false)} isLast={tutorialStepIndex === TUTORIAL_STEPS.length - 1} />}
    </div>
  );
}

export default function App() {
  return (
    <GameZoomProvider>
      <GameApp />
    </GameZoomProvider>
  );
}
