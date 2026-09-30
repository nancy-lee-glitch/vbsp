import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
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
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    window.location.hash = 'home';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] flex items-center justify-center p-6 bg-slate-50">
          <div className="w-full max-w-xl bg-white rounded-xs shadow-xl border border-slate-300 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-5 border border-amber-300">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>Sovereign Guard Active</span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2">
              {this.props.fallbackTitle || 'Display Recovery Mode'}
            </h2>

            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
              {this.props.fallbackMessage || 
                'A component display refresh was initiated. Your vault assets and secure session remain safe and verified.'}
            </p>

            {this.state.error && (
              <div className="text-left bg-slate-100 p-3 rounded-xs text-xs font-mono text-slate-700 overflow-x-auto mb-6 max-h-32 border border-slate-200">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-[#002f5a] hover:bg-[#112e51] text-white rounded-xs font-bold text-sm flex items-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh View</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xs font-bold text-sm flex items-center gap-2 cursor-pointer transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
