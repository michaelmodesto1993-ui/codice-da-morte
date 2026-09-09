import React, { useState } from 'react';
import { BookOpen, X, Scroll, Shield, Skull, Eye, Flame, Crown, Sparkles, RefreshCw } from 'lucide-react';
import { MARKER_INFOS } from '../data/gameData';
import { soundEngine } from '../utils/soundEngine';
import { RulesReferenceCard } from './RulesReferenceCard';
import { GothicWaxSeal } from './GothicWaxSeal';
import { MarkerColor } from '../types/game';

interface GrimoireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_SINGLE_CHAPTER_TEXT =
  'Augusto foi encontrado morto em seu escritório, ao lado de uma mesa com papéis espalhados.\nSobre o chão, havia um pequeno objeto metálico, pesado e fora do lugar.\nUm antigo documento apresentava sinais de ter sido recentemente fechado e manipulado.\nUma testemunha ouviu um barulho seco vindo da sala pouco antes da morte.\nNinguém soube explicar por que Augusto guardava tantos documentos cuidadosamente selados.\nAgora, os investigadores precisam descobrir o que realmente aconteceu naquela noite.';

export const GrimoireModal: React.FC<GrimoireModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'historias' | 'regras' | 'marcadores'>('historias');
  const [customStory, setCustomStory] = useState<string | null>(null);
  const [storyZoom, setStoryZoom] = useState<number>(1);
  const [isGeneratingStory, setIsGeneratingStory] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerateAIStory = async () => {
    soundEngine.playClick();
    setIsGeneratingStory(true);
    try {
      const res = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.story) {
        setCustomStory(data.story);
      }
    } catch {
      setCustomStory(
        'Nas sombras gélidas da biblioteca ancestral, um vento cortante apagou as tochas da galeria. O corpo inerte da vítima foi descoberto sobre o tapete persa. As doze almas presentes trocam olhares desconfiados enquanto o Oráculo estende suas mãos para marcar as tábuas da verdade.'
      );
    } finally {
      setIsGeneratingStory(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in text-[#e8dfd8]">
      <div className="bg-gradient-to-b from-[#140b0b] via-[#0d0707] to-black border-2 border-amber-500/60 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl shadow-black max-h-[90vh] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-black text-amber-200 uppercase tracking-widest">
                GRIMÓRIO DO CÓDICE
              </h2>
              <p className="text-[10px] sm:text-xs text-amber-400/80 font-serif">
                Histórias ancestrais do Drácula, crônicas e leis da cúpula
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/10 hover:border-amber-400/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex rounded-xl bg-black/60 p-1 border border-white/10 gap-1">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveSection('historias');
            }}
            className={`flex-1 py-1.5 text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeSection === 'historias'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-amber-200'
            }`}
          >
            Histórias do Drácula
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveSection('regras');
            }}
            className={`flex-1 py-1.5 text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeSection === 'regras'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-amber-200'
            }`}
          >
            Regras de Investigação
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveSection('marcadores');
            }}
            className={`flex-1 py-1.5 text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeSection === 'marcadores'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-amber-200'
            }`}
          >
            Marcadores Místicos
          </button>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeSection === 'historias' && (
            <div className="space-y-4">
              {/* Single Chapter Card with Zoom Controls */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/70 border border-amber-500/40 space-y-3 relative overflow-hidden shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm">
                    <Scroll className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>CAPÍTULO ÚNICO: A CENA DO CRIME</span>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-black/90 border border-amber-500/40 text-amber-200">
                    <span className="text-[10px] font-mono text-amber-400/80 mr-1 uppercase hidden sm:inline">Zoom</span>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setStoryZoom((z) => Math.max(0.7, +(z - 0.15).toFixed(2)));
                      }}
                      disabled={storyZoom <= 0.7}
                      className="w-5 h-5 flex items-center justify-center rounded text-amber-300 hover:text-white hover:bg-amber-950/80 disabled:opacity-40 transition-all font-mono font-bold text-xs"
                      title="Diminuir Zoom"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setStoryZoom(1);
                      }}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-amber-300 hover:text-white"
                      title="Redefinir Zoom (100%)"
                    >
                      {Math.round(storyZoom * 100)}%
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setStoryZoom((z) => Math.min(2.4, +(z + 0.15).toFixed(2)));
                      }}
                      disabled={storyZoom >= 2.4}
                      className="w-5 h-5 flex items-center justify-center rounded text-amber-300 hover:text-white hover:bg-amber-950/80 disabled:opacity-40 transition-all font-mono font-bold text-xs"
                      title="Aumentar Zoom"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-amber-400/80">
                  <span className="italic">Crônica dos acontecimentos na biblioteca ancestral</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-[10px]">
                    Capítulo Canônico
                  </span>
                </div>

                <div className="overflow-auto max-h-72 p-1">
                  <p
                    style={{
                      fontSize: `${13.5 * storyZoom}px`,
                      lineHeight: 1.65,
                      transition: 'font-size 0.12s ease-out',
                    }}
                    className="font-serif text-zinc-200 leading-relaxed pt-2 border-t border-white/10 whitespace-pre-line italic select-text"
                  >
                    "{customStory || DEFAULT_SINGLE_CHAPTER_TEXT}"
                  </p>
                </div>
              </div>

              {/* Interactive AI Chronicle Generator */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-black/80 to-purple-950/40 border border-amber-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-xs font-serif font-bold text-amber-200 uppercase tracking-wider">
                      Crônica Noturna Ancestral (IA)
                    </span>
                  </div>
                  <button
                    onClick={handleGenerateAIStory}
                    disabled={isGeneratingStory}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-serif font-bold text-[11px] tracking-wide transition-all shadow-md active:scale-95"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGeneratingStory ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingStory ? 'Invocando...' : 'Invocar Nova Crônica'}</span>
                  </button>
                </div>
                <p className="text-[11px] font-sans text-zinc-300 italic leading-relaxed">
                  {customStory ||
                    'Clique em "Invocar Nova Crônica" para que a inteligência do Códice teça uma nova narrativa gótica da Transilvânia sob a vigília do Conde, mantendo os mistérios ocultos e sem revelar qualquer vestígio.'}
                </p>
              </div>
            </div>
          )}

          {activeSection === 'regras' && (
            <div className="flex justify-center py-1">
              <RulesReferenceCard className="max-w-[320px] sm:max-w-[360px]" />
            </div>
          )}

          {activeSection === 'marcadores' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(MARKER_INFOS).map(([key, info]) => (
                <div key={key} className="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                    <GothicWaxSeal color={key as MarkerColor} size="custom" glow={false} />
                  </div>
                  <div>
                    <span className="text-xs font-serif font-bold text-amber-200 block uppercase">
                      Marcador {info.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-sans block">
                      {info.meaning}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-serif font-bold text-xs uppercase tracking-wider transition-all"
          >
            Fechar Grimório
          </button>
        </div>
      </div>
    </div>
  );
};
