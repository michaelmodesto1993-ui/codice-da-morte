import React, { useState, useEffect } from 'react';
import {
  Play,
  X,
  Users,
  Smartphone,
  Globe,
  Sparkles,
  Key,
  Bot,
  Shield,
  ChevronRight,
  RefreshCw,
  Lock,
  PlusCircle,
  Search,
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export interface PublicRoomItem {
  code: string;
  name: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  isPrivate: boolean;
  gameMode: string;
  phase?: string;
}

interface PlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSoloGame: () => void;
  onStartPassAndPlay: () => void;
  onHostOnlineRoom: () => void;
  onJoinRoom: (code: string, password?: string) => void;
  roomCodeInput: string;
  setRoomCodeInput: (code: string) => void;
  mode?: 'all' | 'create' | 'join';
}

export const PlayModal: React.FC<PlayModalProps> = ({
  isOpen,
  onClose,
  onStartSoloGame,
  onStartPassAndPlay,
  onHostOnlineRoom,
  onJoinRoom,
  roomCodeInput,
  setRoomCodeInput,
  mode = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<'modos' | 'publicas' | 'codigo'>(
    mode === 'join' ? 'publicas' : 'modos'
  );
  const [passwordInput, setPasswordInput] = useState('');
  const [publicRooms, setPublicRooms] = useState<PublicRoomItem[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  // Fetch public rooms list from server API
  const fetchPublicRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.rooms)) {
          setPublicRooms(data.rooms);
        }
      }
    } catch (err) {
      console.warn('Não foi possível carregar salas públicas:', err);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPublicRooms();
      if (mode === 'join') {
        setActiveTab('publicas');
      } else {
        setActiveTab('modos');
      }
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in text-[#e8dfd8]">
      {/* Ornate Gothic Modal Window */}
      <div className="relative bg-gradient-to-b from-[#18120e] via-[#0d0a08] to-[#050403] border-2 border-[#b88c3a] rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.95)] max-h-[95vh] flex flex-col space-y-4 overflow-hidden">
        {/* Gold filigree corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#e5b358] pointer-events-none" />

        {/* Header with Gothic Ornament */}
        <div className="relative flex flex-col items-center justify-center pt-1 pb-2 border-b border-[#a67c32]/30">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="absolute right-0 top-0 p-1.5 rounded-full bg-[#1c1510] text-[#c9a75e] hover:text-white border border-[#a67c32]/50 hover:border-[#e5b358] transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-[#e5b358] to-transparent mb-1" />
          <h2 className="text-base sm:text-xl font-serif font-black text-[#f7e4ba] uppercase tracking-[0.25em] drop-shadow">
            {mode === 'create' ? 'CRIAR SALA' : 'PARTIDA RÁPIDA'}
          </h2>
          <p className="text-[10px] sm:text-[11px] text-[#c9a75e] font-serif tracking-widest uppercase mt-0.5">
            COMO DESEJA DESVENDAR O CRIME?
          </p>
        </div>

        {/* Gothic Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-black/60 p-1 rounded-2xl border border-[#a67c32]/30">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('modos');
            }}
            className={`py-1.5 px-2 rounded-xl text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider transition-all ${
              activeTab === 'modos'
                ? 'bg-gradient-to-b from-[#6e1010] to-[#3a0808] text-[#f7e4ba] border border-[#e5b358] shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                : 'text-[#9c8464] hover:text-[#f7e4ba]'
            }`}
          >
            MODOS
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('publicas');
              fetchPublicRooms();
            }}
            className={`py-1.5 px-2 rounded-xl text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
              activeTab === 'publicas'
                ? 'bg-gradient-to-b from-[#6e1010] to-[#3a0808] text-[#f7e4ba] border border-[#e5b358] shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                : 'text-[#9c8464] hover:text-[#f7e4ba]'
            }`}
          >
            <span>PÚBLICAS</span>
            {publicRooms.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-mono font-bold flex items-center justify-center">
                {publicRooms.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('codigo');
            }}
            className={`py-1.5 px-2 rounded-xl text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider transition-all ${
              activeTab === 'codigo'
                ? 'bg-gradient-to-b from-[#6e1010] to-[#3a0808] text-[#f7e4ba] border border-[#e5b358] shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                : 'text-[#9c8464] hover:text-[#f7e4ba]'
            }`}
          >
            CÓDIGO
          </button>
        </div>

        {/* Tab 1: Game Modes */}
        {activeTab === 'modos' && (
          <div className="space-y-2.5 overflow-y-auto max-h-[60vh] pr-0.5 custom-scrollbar">
            {/* 1. Solo Bot Game (Gold / Mystic Hood Card) */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
                onStartSoloGame();
              }}
              className="w-full p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#1f1810] via-[#140f0a] to-[#0b0805] hover:from-[#2a2015] border border-[#a67c32]/60 hover:border-[#e5b358] transition-all flex items-center justify-between group shadow-[0_4px_15px_rgba(0,0,0,0.7)] text-left relative overflow-hidden"
            >
              <div className="flex items-center gap-3.5 z-10">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#2e2113] to-[#120d08] border border-[#d4af37]/60 flex items-center justify-center text-[#f3ce7b] shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                  <Bot className="w-6 h-6 text-[#e5b358]" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-serif font-bold text-[#f7e4ba] group-hover:text-white tracking-wider block">
                    JOGAR SOLO
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-serif text-[#b89759] tracking-wide block uppercase">
                    TREINE CONTRA BOTS INTELIGENTES
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8a6e38] group-hover:text-[#f3ce7b] transition-transform group-hover:translate-x-1 z-10" />
            </button>

            {/* 2. Pass and Play Local Mode (Crimson / Phone Card) */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
                onStartPassAndPlay();
              }}
              className="w-full p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#2c0a0a] via-[#1a0505] to-[#0d0303] hover:from-[#3d0f0f] border border-[#8f1d1d]/80 hover:border-[#c92a2a] transition-all flex items-center justify-between group shadow-[0_4px_15px_rgba(44,10,10,0.6)] text-left relative overflow-hidden"
            >
              <div className="flex items-center gap-3.5 z-10">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#400d0d] to-[#170303] border border-[#b82323]/80 flex items-center justify-center text-[#ff9999] shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-6 h-6 text-[#ff6666]" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-serif font-bold text-[#ffdede] group-hover:text-white tracking-wider block">
                    PASSAR O CELULAR
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-serif text-[#d67e7e] tracking-wide block uppercase">
                    PRESENCIAL COM 1 APARELHO
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8f2d2d] group-hover:text-[#ff9999] transition-transform group-hover:translate-x-1 z-10" />
            </button>

            {/* 3. Host Online Room */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
                onHostOnlineRoom();
              }}
              className="w-full p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#0d1726] via-[#070e1a] to-[#040810] hover:from-[#13233b] border border-[#2b4d7a]/80 hover:border-[#4d85cc] transition-all flex items-center justify-between group shadow-[0_4px_15px_rgba(13,23,38,0.7)] text-left relative overflow-hidden"
            >
              <div className="flex items-center gap-3.5 z-10">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#142640] to-[#080f1a] border border-[#3b68a6]/80 flex items-center justify-center text-[#99c2ff] shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                  <Globe className="w-6 h-6 text-[#66a3ff]" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-serif font-bold text-[#e1ecfa] group-hover:text-white tracking-wider block">
                    CRIAR MINHA SALA
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-serif text-[#7d9ec7] tracking-wide block uppercase">
                    PÚBLICA OU PRIVADA COM SENHA
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#355a8a] group-hover:text-[#99c2ff] transition-transform group-hover:translate-x-1 z-10" />
            </button>
          </div>
        )}

        {/* Tab 2: Public Rooms List */}
        {activeTab === 'publicas' && (
          <div className="space-y-2.5 overflow-y-auto max-h-[60vh] pr-0.5 custom-scrollbar">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-serif uppercase tracking-wider text-[#c9a75e]">
                CÂMARAS ABERTAS NO REINO
              </span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  fetchPublicRooms();
                }}
                disabled={isLoadingRooms}
                className="flex items-center gap-1 text-[10px] font-serif text-[#e5b358] hover:text-white transition-colors"
                title="Atualizar lista de salas"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingRooms ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>

            {isLoadingRooms ? (
              <div className="p-8 text-center space-y-2 text-[#b89759]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
                <p className="text-xs font-serif">Consultando os manuscritos do servidor...</p>
              </div>
            ) : publicRooms.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#0e0a08] border border-[#a67c32]/30 text-center space-y-3">
                <Globe className="w-8 h-8 mx-auto text-amber-500/40" />
                <div className="space-y-1">
                  <p className="text-xs font-serif font-bold text-[#f7e4ba]">
                    Nenhuma câmara pública aberta no momento.
                  </p>
                  <p className="text-[10px] font-serif text-[#9c8464]">
                    Seja o primeiro a consagrar uma câmara de investigação!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onClose();
                    onHostOnlineRoom();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#6e1010] to-[#360808] border border-[#e5b358] text-[#f7e4ba] font-serif font-bold text-xs uppercase tracking-wider shadow-lg hover:from-[#8a1414] transition-all"
                >
                  CRIAR UMA SALA AGORA
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {publicRooms.map((room) => (
                  <div
                    key={room.code}
                    className="p-3 rounded-2xl bg-[#140f0a] border border-[#a67c32]/50 hover:border-[#e5b358] transition-all flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-serif font-bold text-[#f7e4ba] truncate">
                          {room.name}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-black/60 border border-amber-600/40 rounded text-amber-400">
                          {room.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#9c8464] font-serif">
                        <span>Líder: {room.hostName}</span>
                        <span>•</span>
                        <span className="text-amber-300 font-mono">
                          {room.playerCount}/{room.maxPlayers} Jogadores
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          onClose();
                          onJoinRoom(room.code);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#6e1010] to-[#360808] border border-[#b82323] hover:border-[#e5b358] text-[#f7e4ba] font-serif font-bold text-xs uppercase tracking-wider transition-all shadow shrink-0"
                      >
                        ENTRAR
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm(`Deseja realmente fechar a sala ${room.code}?`)) {
                            soundEngine.playClick();
                            try {
                              const res = await fetch(`/api/rooms/${room.code}`, { method: 'DELETE' });
                              if (res.ok) fetchPublicRooms();
                            } catch (err) { console.error(err); }
                          }
                        }}
                        className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-red-500 text-zinc-500 hover:text-red-400 transition-all shrink-0"
                        title="Fechar Sala"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Join via Room Code & Password */}
        {activeTab === 'codigo' && (
          <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-0.5 custom-scrollbar">
            <div className="p-3.5 rounded-2xl bg-[#0d0a08]/95 border border-[#a67c32]/50 space-y-3 shadow-md">
              <span className="text-[11px] font-serif font-bold text-[#f5e7c8] block tracking-wide uppercase">
                ENTRAR EM SALA POR CÓDIGO
              </span>

              {/* Code input */}
              <div className="space-y-1">
                <label className="text-[9px] font-serif uppercase tracking-wider text-[#c9a75e] block">
                  CÓDIGO DA SALA (5 DÍGITOS)
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="EX: X7K9P"
                  className="w-full bg-black/80 border border-[#8a6828]/60 text-sm text-[#f7e4ba] rounded-xl px-3 py-2 font-mono uppercase tracking-[0.25em] focus:outline-none focus:border-[#e5b358] placeholder-[#6b5530]"
                />
              </div>

              {/* Password input for private rooms */}
              <div className="space-y-1">
                <label className="text-[9px] font-serif uppercase tracking-wider text-[#c9a75e] block flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>SENHA (APENAS SE A SALA FOR PRIVADA)</span>
                </label>
                <div className="relative flex items-center">
                  <Key className="w-3.5 h-3.5 text-amber-500/70 absolute left-3 pointer-events-none" />
                  <input
                    type="password"
                    maxLength={20}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Deixe em branco se a sala for pública"
                    className="w-full pl-8 pr-3 py-2 bg-black/80 border border-[#8a6828]/60 text-xs text-[#f7e4ba] rounded-xl font-mono focus:outline-none focus:border-[#e5b358] placeholder-[#6b5530]"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  if (roomCodeInput.trim()) {
                    onClose();
                    onJoinRoom(roomCodeInput.trim().toUpperCase(), passwordInput.trim() || undefined);
                  }
                }}
                disabled={!roomCodeInput.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-b from-[#6e1010] to-[#360808] hover:from-[#8c1515] border border-[#b82323] hover:border-[#e5b358] disabled:opacity-40 text-[#f7e4ba] font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]"
              >
                ENTRAR NA CÂMARA
              </button>
            </div>
          </div>
        )}

        {/* Footer Gothic Quote */}
        <div className="pt-2 border-t border-[#a67c32]/20 text-center">
          <p className="text-[9px] sm:text-[9.5px] font-serif italic text-[#a3844d] tracking-widest">
            “JUNTOS, ATÉ O SILÊNCIO REVELA PISTAS — O ORÁCULO —”
          </p>
        </div>
      </div>
    </div>
  );
};
