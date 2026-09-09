import React, { useState, useEffect, useMemo } from 'react';
import {
  NotebookPen,
  X,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  User,
  Shield,
  Skull,
  HelpCircle,
  FileText,
  Search,
  BookOpen,
  Filter,
} from 'lucide-react';
import { Player, RoomState, CardMethod, CardObject } from '../types/game';
import { METHODS, OBJECTS } from '../data/gameData';
import { soundEngine } from '../utils/soundEngine';
import { GothicAvatar } from './GothicAvatar';

interface InvestigatorNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomState;
  myPlayerId: string;
}

type SuspectVerdict = 'indefinido' | 'inocente' | 'suspeito' | 'assassino';

interface SuspectNote {
  verdict: SuspectVerdict;
  notes: string;
}

export const InvestigatorNotebookModal: React.FC<InvestigatorNotebookModalProps> = ({
  isOpen,
  onClose,
  room,
  myPlayerId,
}) => {
  const [activeTab, setActiveTab] = useState<'ANOTACOES' | 'SUSPEITOS' | 'ELIMINACOES'>('ANOTACOES');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [suspectNotes, setSuspectNotes] = useState<Record<string, SuspectNote>>({});
  const [eliminatedMethods, setEliminatedMethods] = useState<string[]>([]);
  const [eliminatedObjects, setEliminatedObjects] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [eliminationPlayerFilter, setEliminationPlayerFilter] = useState<string>('TODOS');

  const storageKey = `gothic_notebook_${room.code || 'default'}_${myPlayerId}`;

  // Compute cards actually present on the table in players' hands
  const tableCards = useMemo(() => {
    const methods: { card: CardMethod; player: Player }[] = [];
    const objects: { card: CardObject; player: Player }[] = [];

    room.players.forEach((p) => {
      (p.methods || []).forEach((m) => {
        methods.push({ card: m, player: p });
      });
      (p.objects || []).forEach((o) => {
        objects.push({ card: o, player: p });
      });
    });

    return {
      methods,
      objects,
      hasTableCards: methods.length > 0 || objects.length > 0,
    };
  }, [room.players]);

  // Load from localStorage on mount/open
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.generalNotes !== undefined) setGeneralNotes(parsed.generalNotes);
          if (parsed.suspectNotes) setSuspectNotes(parsed.suspectNotes);
          if (parsed.eliminatedMethods) setEliminatedMethods(parsed.eliminatedMethods);
          if (parsed.eliminatedObjects) setEliminatedObjects(parsed.eliminatedObjects);
        }
      } catch (err) {
        console.warn('Erro ao carregar anotações locais:', err);
      }
    }
  }, [isOpen, storageKey]);

  // Auto-save debounced
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      try {
        const payload = {
          generalNotes,
          suspectNotes,
          eliminatedMethods,
          eliminatedObjects,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
        setSaveStatus('Salvo');
        const clearTimer = setTimeout(() => setSaveStatus(null), 1800);
        return () => clearTimeout(clearTimer);
      } catch (e) {
        console.error('Falha ao salvar anotações:', e);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [generalNotes, suspectNotes, eliminatedMethods, eliminatedObjects, isOpen, storageKey]);

  if (!isOpen) return null;

  const isFragileMemoryActive =
    room.activeEvent?.event.id === 'EV15' ||
    room.activeEvent?.event.name.toLowerCase().includes('memória frágil') ||
    room.activeEvent?.event.name.toLowerCase().includes('memoria fragil');

  const handleClearNotes = () => {
    if (window.confirm('Tem certeza de que deseja limpar suas anotações gerais?')) {
      soundEngine.playClick();
      setGeneralNotes('');
    }
  };

  const setVerdict = (playerId: string, verdict: SuspectVerdict) => {
    soundEngine.playClick();
    setSuspectNotes((prev) => ({
      ...prev,
      [playerId]: {
        verdict,
        notes: prev[playerId]?.notes || '',
      },
    }));
  };

  const setSuspectText = (playerId: string, text: string) => {
    setSuspectNotes((prev) => ({
      ...prev,
      [playerId]: {
        verdict: prev[playerId]?.verdict || 'indefinido',
        notes: text,
      },
    }));
  };

  const toggleMethodElimination = (methodName: string) => {
    soundEngine.playClick();
    setEliminatedMethods((prev) =>
      prev.includes(methodName) ? prev.filter((m) => m !== methodName) : [...prev, methodName]
    );
  };

  const toggleObjectElimination = (objectName: string) => {
    soundEngine.playClick();
    setEliminatedObjects((prev) =>
      prev.includes(objectName) ? prev.filter((o) => o !== objectName) : [...prev, objectName]
    );
  };

  const insertSnippet = (snippet: string) => {
    soundEngine.playClick();
    setGeneralNotes((prev) => (prev ? `${prev}\n${snippet}` : snippet));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl h-[88vh] max-h-[740px] rounded-3xl bg-gradient-to-b from-[#180d08] via-[#100603] to-[#080201] border-2 border-amber-600/50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-amber-900/60 bg-gradient-to-r from-amber-950/70 via-black to-amber-950/70 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center shadow-lg shrink-0">
              <NotebookPen className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-serif font-black text-amber-200 uppercase tracking-widest truncate">
                Caderno de Anotações do Investigador
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400/80">
                <span>Dossiê Pessoal & Secreto</span>
                {saveStatus && (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold animate-fade-in">
                    <CheckCircle2 className="w-3 h-3" />
                    {saveStatus}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-black/60 border border-white/10 hover:border-amber-500 text-zinc-400 hover:text-white flex items-center justify-center transition-all"
            title="Fechar Caderno"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Memória Frágil Alert (EV15) */}
        {isFragileMemoryActive && (
          <div className="px-4 py-2 bg-gradient-to-r from-red-950/90 via-black to-red-950/90 border-b border-red-500/60 flex items-center gap-2 text-xs font-serif text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>EVENTO EV15 (MEMÓRIA FRÁGIL) ATIVO:</strong> Pelo códice, consultar anotações nesta rodada é proibido! Use apenas a sua memória intuitiva.
            </span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-3 sm:px-6 pt-2 pb-1 border-b border-amber-950/60 bg-black/40 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('ANOTACOES');
            }}
            className={`px-3 py-1.5 rounded-xl font-serif text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ANOTACOES'
                ? 'bg-amber-900/90 text-amber-100 border border-amber-400 shadow-md'
                : 'text-zinc-400 hover:text-amber-200 bg-black/40 border border-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Minhas Anotações</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('SUSPEITOS');
            }}
            className={`px-3 py-1.5 rounded-xl font-serif text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'SUSPEITOS'
                ? 'bg-amber-900/90 text-amber-100 border border-amber-400 shadow-md'
                : 'text-zinc-400 hover:text-amber-200 bg-black/40 border border-white/5'
            }`}
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>Painel de Suspeitos ({room.players.filter((p) => p.role !== 'oraculo').length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('ELIMINACOES');
            }}
            className={`px-3 py-1.5 rounded-xl font-serif text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ELIMINACOES'
                ? 'bg-amber-900/90 text-amber-100 border border-amber-400 shadow-md'
                : 'text-zinc-400 hover:text-amber-200 bg-black/40 border border-white/5'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Pistas Eliminadas</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-4">
          {/* TAB 1: Minhas Anotações */}
          {activeTab === 'ANOTACOES' && (
            <div className="h-full flex flex-col space-y-3">
              {/* Quick Snippet Helpers */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-serif">
                <span className="text-zinc-400 mr-1">Inserir rápido:</span>
                <button
                  type="button"
                  onClick={() => insertSnippet('🔍 SUSPEITA: ')}
                  className="px-2 py-0.5 rounded-lg bg-black/60 border border-amber-500/30 text-amber-300 hover:bg-amber-950/60"
                >
                  + Suspeita
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('🛡️ ÁLIBI: ')}
                  className="px-2 py-0.5 rounded-lg bg-black/60 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/60"
                >
                  + Álibi
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('⚡ CONTRADIÇÃO: ')}
                  className="px-2 py-0.5 rounded-lg bg-black/60 border border-red-500/30 text-red-300 hover:bg-red-950/60"
                >
                  + Contradição
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('📌 DEPOIMENTO: ')}
                  className="px-2 py-0.5 rounded-lg bg-black/60 border border-purple-500/30 text-purple-300 hover:bg-purple-950/60"
                >
                  + Depoimento
                </button>
              </div>

              {/* Textarea Area Styled as Antique Gothic Notebook */}
              <div className="flex-1 min-h-[260px] relative rounded-2xl bg-gradient-to-b from-[#140a05] to-[#0a0402] border border-amber-600/40 p-3 sm:p-4 shadow-inner flex flex-col">
                <textarea
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Escreva livremente suas deduções, pistas apontadas pelo Oráculo, contradições e palpites secretos..."
                  className="w-full flex-1 bg-transparent text-amber-100 font-serif text-xs sm:text-sm leading-relaxed placeholder-zinc-500 focus:outline-none resize-none selection:bg-amber-800 selection:text-white"
                />
                <div className="flex items-center justify-between pt-2 border-t border-amber-950 text-[10px] font-mono text-zinc-500">
                  <span>{generalNotes.length} caracteres</span>
                  <button
                    type="button"
                    onClick={handleClearNotes}
                    className="flex items-center gap-1 text-red-400/80 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Limpar Notas</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Painel de Suspeitos */}
          {activeTab === 'SUSPEITOS' && (
            <div className="space-y-3">
              <p className="text-xs font-serif text-zinc-300 italic">
                Avalie cada jogador na mesa e anote o álibi ou contradição que você percebeu. Suas notas são privadas.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {room.players
                  .filter((p) => p.role !== 'oraculo')
                  .map((player) => {
                    const current = suspectNotes[player.id] || {
                      verdict: 'indefinido',
                      notes: '',
                    };
                    const isMe = player.id === myPlayerId;

                    return (
                      <div
                        key={player.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          current.verdict === 'assassino'
                            ? 'bg-red-950/40 border-red-500/70 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                            : current.verdict === 'suspeito'
                            ? 'bg-amber-950/30 border-amber-500/60'
                            : current.verdict === 'inocente'
                            ? 'bg-emerald-950/30 border-emerald-500/60'
                            : 'bg-black/60 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/5">
                          <div className="flex items-center gap-2 min-w-0">
                            <GothicAvatar
                              characterId={player.characterId}
                              name={player.name}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-serif font-bold text-zinc-100 block truncate">
                                {player.name} {isMe ? '(Você)' : ''}
                              </span>
                              <span className="text-[9px] font-mono text-amber-400/70">
                                Assento #{player.seatNumber + 1}
                              </span>
                            </div>
                          </div>

                          {/* Verdict Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setVerdict(player.id, 'inocente')}
                              title="Marcar como Inocente"
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                current.verdict === 'inocente'
                                  ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                                  : 'bg-black/60 text-zinc-400 border-white/10 hover:text-emerald-300'
                              }`}
                            >
                              Inocente
                            </button>
                            <button
                              type="button"
                              onClick={() => setVerdict(player.id, 'suspeito')}
                              title="Marcar como Suspeito"
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                current.verdict === 'suspeito'
                                  ? 'bg-amber-600 text-white border-amber-400 shadow'
                                  : 'bg-black/60 text-zinc-400 border-white/10 hover:text-amber-300'
                              }`}
                            >
                              Suspeito
                            </button>
                            <button
                              type="button"
                              onClick={() => setVerdict(player.id, 'assassino')}
                              title="Marcar como Provável Assassino"
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                current.verdict === 'assassino'
                                  ? 'bg-red-700 text-white border-red-400 shadow'
                                  : 'bg-black/60 text-zinc-400 border-white/10 hover:text-red-300'
                              }`}
                            >
                              Culpado
                            </button>
                          </div>
                        </div>

                        {/* Note Input */}
                        <div className="pt-2">
                          <input
                            type="text"
                            value={current.notes}
                            onChange={(e) => setSuspectText(player.id, e.target.value)}
                            placeholder="Anotação de conduta, álibi ou desconfiança..."
                            className="w-full px-2.5 py-1.5 rounded-xl bg-black/80 border border-white/10 text-xs font-serif text-amber-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 3: Pistas Eliminadas (Métodos & Objetos na Mesa) */}
          {activeTab === 'ELIMINACOES' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-serif font-black text-amber-200 uppercase tracking-wider">
                    PISTAS NA MESA • CARTAS EM JOGO ({tableCards.methods.length} Métodos • {tableCards.objects.length} Objetos)
                  </h3>
                  <p className="text-[11px] font-serif text-zinc-400 italic">
                    Apenas os métodos e objetos presentes nas mãos dos jogadores na mesa são exibidos. Clique para riscar as pistas que você descartou.
                  </p>
                </div>

                {/* Filter by player pills */}
                {room.players.length > 0 && (
                  <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 no-scrollbar shrink-0">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase shrink-0">Filtrar:</span>
                    <button
                      type="button"
                      onClick={() => setEliminationPlayerFilter('TODOS')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-serif font-bold uppercase shrink-0 transition-all ${
                        eliminationPlayerFilter === 'TODOS'
                          ? 'bg-amber-600 text-black shadow'
                          : 'bg-black/60 text-zinc-400 hover:text-zinc-200 border border-white/10'
                      }`}
                    >
                      Todos ({tableCards.methods.length + tableCards.objects.length})
                    </button>
                    {room.players
                      .filter((p) => p.role !== 'oraculo')
                      .map((p) => {
                        const count = (p.methods?.length || 0) + (p.objects?.length || 0);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setEliminationPlayerFilter(p.id)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-serif font-bold shrink-0 transition-all ${
                              eliminationPlayerFilter === p.id
                                ? 'bg-red-800 text-amber-100 border border-red-500 shadow'
                                : 'bg-black/60 text-zinc-400 hover:text-zinc-200 border border-white/10'
                            }`}
                          >
                            {p.name} ({count})
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Methods on Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-serif font-black text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Skull className="w-3.5 h-3.5 text-red-400" />
                    <span>Métodos do Crime na Mesa</span>
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {eliminatedMethods.length} eliminados
                  </span>
                </div>

                {(() => {
                  const filtered = tableCards.methods.filter(
                    (item) => eliminationPlayerFilter === 'TODOS' || item.player.id === eliminationPlayerFilter
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center text-xs font-serif text-zinc-500">
                        Nenhum método encontrado para este filtro na mesa.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 no-scrollbar">
                      {filtered.map(({ card: m, player }) => {
                        const isEliminated = eliminatedMethods.includes(m.name);
                        return (
                          <button
                            key={`${m.id}_${player.id}`}
                            type="button"
                            onClick={() => toggleMethodElimination(m.name)}
                            className={`p-2.5 rounded-xl text-left text-xs font-serif border transition-all flex flex-col justify-between gap-1 group ${
                              isEliminated
                                ? 'bg-red-950/25 border-red-900/50 text-zinc-500'
                                : 'bg-black/70 border-white/10 hover:border-red-500/60 text-zinc-200 shadow-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 w-full">
                              <span
                                className={`font-bold truncate ${
                                  isEliminated ? 'line-through text-zinc-500' : 'text-amber-100 group-hover:text-white'
                                }`}
                              >
                                {m.name}
                              </span>
                              {isEliminated ? (
                                <span className="text-[9px] font-mono font-bold text-red-400 bg-red-950/80 px-1 py-0.5 rounded border border-red-700/60">
                                  ELIMINADA ✕
                                </span>
                              ) : (
                                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-500/40">
                                  Na Mesa
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-1 border-t border-white/5 w-full">
                              <span className="truncate">
                                Mesa de: <strong className="text-amber-300 font-serif">{player.name}</strong>
                              </span>
                              <span className="text-zinc-500">{m.category}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Objects on Table */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-serif font-black text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-400" />
                    <span>Objetos Chave na Mesa</span>
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {eliminatedObjects.length} eliminados
                  </span>
                </div>

                {(() => {
                  const filtered = tableCards.objects.filter(
                    (item) => eliminationPlayerFilter === 'TODOS' || item.player.id === eliminationPlayerFilter
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center text-xs font-serif text-zinc-500">
                        Nenhum objeto encontrado para este filtro na mesa.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 no-scrollbar">
                      {filtered.map(({ card: o, player }) => {
                        const isEliminated = eliminatedObjects.includes(o.name);
                        return (
                          <button
                            key={`${o.id}_${player.id}`}
                            type="button"
                            onClick={() => toggleObjectElimination(o.name)}
                            className={`p-2.5 rounded-xl text-left text-xs font-serif border transition-all flex flex-col justify-between gap-1 group ${
                              isEliminated
                                ? 'bg-blue-950/20 border-blue-900/40 text-zinc-500'
                                : 'bg-black/70 border-white/10 hover:border-blue-500/60 text-zinc-200 shadow-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 w-full">
                              <span
                                className={`font-bold truncate ${
                                  isEliminated ? 'line-through text-zinc-500' : 'text-blue-100 group-hover:text-white'
                                }`}
                              >
                                {o.name}
                              </span>
                              {isEliminated ? (
                                <span className="text-[9px] font-mono font-bold text-red-400 bg-red-950/80 px-1 py-0.5 rounded border border-red-700/60">
                                  ELIMINADA ✕
                                </span>
                              ) : (
                                <span className="text-[8px] font-mono text-amber-300 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-500/40">
                                  Na Mesa
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-1 border-t border-white/5 w-full">
                              <span className="truncate">
                                Mesa de: <strong className="text-amber-300 font-serif">{player.name}</strong>
                              </span>
                              <span className="text-zinc-500">{o.category}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-amber-950 bg-black/60 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[10px] font-serif text-zinc-400 italic">
            Salvo automaticamente no seu dispositivo. Ninguém mais na sala pode ver este caderno.
          </span>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-900 to-amber-800 hover:from-amber-800 hover:to-amber-700 text-amber-100 font-serif text-xs font-bold uppercase tracking-wider transition-all shadow"
          >
            Fechar Caderno
          </button>
        </div>
      </div>
    </div>
  );
};
