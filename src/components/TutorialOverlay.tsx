import React from 'react';
import { Sparkles, ChevronRight, X, Info, HelpCircle } from 'lucide-react';
import { TutorialStep } from '../data/tutorialData';
import { soundEngine } from '../utils/soundEngine';

interface TutorialOverlayProps {
  step: TutorialStep;
  onNext: () => void;
  onClose: () => void;
  isLast: boolean;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  step,
  onNext,
  onClose,
  isLast,
}) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6 flex justify-center animate-slide-up pointer-events-none">
      <div className="w-full max-w-xl bg-black/90 border-2 border-amber-500/60 rounded-3xl p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] backdrop-blur-lg flex flex-col gap-3 pointer-events-auto ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/30 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-500/40">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="font-serif font-black text-amber-200 text-sm tracking-widest uppercase">
              {step.title}
            </h3>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <div className="py-2">
          <p className="text-zinc-200 font-serif text-sm leading-relaxed whitespace-pre-line">
            {step.message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-500/60 uppercase">
            <HelpCircle className="w-3 h-3" />
            <span>Guia de Investigação</span>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onNext();
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-800 to-amber-600 hover:from-amber-700 hover:to-amber-500 text-white font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
          >
            <span>{isLast ? 'FINALIZAR' : 'PRÓXIMO'}</span>
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Target Element Highlight Mask (Simplified) */}
      {step.targetElementId && (
        <style>{`
          #${step.targetElementId} {
            position: relative;
            z-index: 101;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.6) !important;
            pointer-events: auto !important;
            border-color: #f59e0b !important;
          }
        `}</style>
      )}
    </div>
  );
};
