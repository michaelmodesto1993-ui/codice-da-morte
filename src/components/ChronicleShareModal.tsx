import React, { useState } from 'react';
import { X, Copy, Check, Share2, Scroll, MessageSquare } from 'lucide-react';
import { RoomState } from '../types/game';
import { generatePostMatchChronicleText } from '../utils/postMatchChronicle';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/haptics';

interface ChronicleShareModalProps {
  room: RoomState;
  myRole?: string;
  onClose: () => void;
}

export const ChronicleShareModal: React.FC<ChronicleShareModalProps> = ({
  room,
  myRole,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const chronicleText = generatePostMatchChronicleText(room, myRole);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chronicleText);
      setCopied(true);
      soundEngine.playClick();
      hapticEngine.medium();
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    soundEngine.playClick();
    hapticEngine.medium();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'O Códice da Morte — Crônica da Sessão',
          text: chronicleText,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in text-[#eedec5] overflow-y-auto select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-3xl border-2 border-amber-600/70 bg-[#0e0705] shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col my-auto max-h-[92dvh] p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-950/80 border border-amber-500/50 flex items-center justify-center">
              <Scroll className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-serif font-black text-amber-300 uppercase tracking-widest">
                Crônica dos Fatos
              </h2>
              <p className="text-[10px] font-serif text-zinc-400">
                Registro histórico da sessão para partilhar com os amigos
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white bg-black/50 border border-amber-900/50 transition-all active:scale-95"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scroll Body */}
        <div className="p-3.5 rounded-2xl bg-black/70 border border-amber-950 font-mono text-[11px] sm:text-xs text-amber-200/90 whitespace-pre-line leading-relaxed overflow-y-auto max-h-[48dvh] custom-scrollbar selection:bg-amber-900 selection:text-white">
          {chronicleText}
        </div>

        {/* Share Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            onClick={handleCopy}
            className={`flex-1 py-3 px-4 rounded-xl font-serif font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border shadow-lg active:scale-95 ${
              copied
                ? 'bg-emerald-800 text-white border-emerald-400'
                : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black border-amber-300'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copiado com Sucesso!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Crônica</span>
              </>
            )}
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="py-3 px-4 rounded-xl font-serif font-bold text-xs uppercase tracking-wider bg-black/80 hover:bg-zinc-900 text-amber-300 border border-amber-500/50 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartilhar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
