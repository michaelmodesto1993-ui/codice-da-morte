import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Skull, RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Códice da Morte:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('codice_last_room');
    } catch {
      // Ignore
    }
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          id="codice-error-boundary-screen"
          className="fixed inset-0 z-[9999] min-h-[100dvh] w-full flex items-center justify-center bg-[#070404] text-[#e8dfd8] p-4 select-none font-serif"
        >
          <div className="relative z-10 max-w-md w-full p-6 rounded-3xl bg-gradient-to-b from-[#1c0808] via-[#100303] to-black border-2 border-red-500/70 shadow-[0_0_50px_rgba(220,38,38,0.35)] text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/80 border border-red-500/60 flex items-center justify-center shadow-lg animate-pulse">
              <Skull className="w-8 h-8 text-red-400" />
            </div>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-red-950 border border-red-500/50 text-[10px] font-mono text-red-300 uppercase tracking-widest">
                Oscilação no Códice
              </span>
              <h2 className="text-xl font-bold text-amber-200 uppercase tracking-wider">
                Uma sombra obscureceu a cúpula
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                Ocorreu uma falha inesperada na renderização da cena. O Códice protegeu seu progresso.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/80 border border-red-900/40 text-left overflow-x-auto max-h-24 no-scrollbar">
                <p className="text-[11px] font-mono text-red-300 break-words">
                  {this.state.error.message || 'Erro desconhecido'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tentar Novamente</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Home className="w-4 h-4 text-amber-400" />
                <span>Menu Principal</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
