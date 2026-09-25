import React, { Component, ErrorInfo, ReactNode } from 'react';
import { safeLocalStorage } from '../utils/safeStorage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Suit Bliss Aura ErrorBoundary caught an error:', error, errorInfo);
    try {
      safeLocalStorage.removeItem('sba_cart_v1');
      safeLocalStorage.removeItem('sba_cart_backup');
    } catch {}
  }

  private handleAutoRecover = () => {
    try {
      safeLocalStorage.clear();
    } catch {}
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    try {
      safeLocalStorage.clear();
      window.location.href = window.location.origin + window.location.pathname;
    } catch {
      this.setState({ hasError: false, error: undefined });
    }
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF5EB] flex flex-col items-center justify-center p-6 text-center text-[#3D0F1F]">
          <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-3xl border border-[#B8935A]/30 shadow-xl space-y-4">
            <div className="w-16 h-16 mx-auto bg-[#3D0F1F] text-[#DFBE65] rounded-full flex items-center justify-center text-2xl font-black shadow-md">
              👑
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#3D0F1F]">Suit Bliss Aura</h1>
            <p className="text-xs text-gray-600 leading-relaxed">
              Updating store view for your browser. Click below to continue shopping our latest Jaipuri ethnic collection!
            </p>
            <div className="space-y-2.5 pt-2">
              <button
                onClick={this.handleAutoRecover}
                className="w-full py-3.5 bg-[#3D0F1F] hover:bg-[#58152D] active:scale-95 text-[#FAF5EB] font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition duration-200 cursor-pointer border border-[#B8935A]/30"
              >
                OPEN STORE NOW 🌸
              </button>
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 bg-transparent text-[#3D0F1F] font-semibold text-[11px] uppercase tracking-wider rounded-lg hover:bg-[#B8935A]/10 cursor-pointer"
              >
                Reset Store Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
