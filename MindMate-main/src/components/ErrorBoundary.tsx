import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Sparkles, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    window.location.href = "/home";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center select-none font-sans" id="error-boundary-screen">
          <div className="max-w-md w-full bg-surface-container p-8 md:p-10 rounded-3xl shadow-sm border border-neutral-100 flex flex-col items-center gap-6" id="error-boundary-card">
            {/* Visual Icon with calm glowing accent */}
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse" id="error-boundary-icon-wrapper">
              <Sparkles className="w-8 h-8" id="error-boundary-icon" />
            </div>

            {/* Support message */}
            <div className="flex flex-col gap-3" id="error-boundary-text-group">
              <h1 className="text-2xl font-semibold text-on-surface tracking-tight" id="error-boundary-title">
                Let's take a gentle breath...
              </h1>
              <p className="text-sm text-on-surface/70 leading-relaxed max-w-sm mx-auto" id="error-boundary-message">
                We encountered a small bump in the path, but we're right here with you to find your balance. Let's restart the moment or head home.
              </p>
            </div>

            {/* Actions group */}
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2" id="error-boundary-actions">
              <button
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-opacity-90 text-on-primary font-medium py-3 px-5 rounded-2xl transition duration-200 cursor-pointer text-sm shadow-sm"
                id="error-boundary-retry-btn"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-background hover:bg-on-surface/5 text-on-surface border border-on-surface/10 font-medium py-3 px-5 rounded-2xl transition duration-200 cursor-pointer text-sm"
                id="error-boundary-home-btn"
              >
                <Home className="w-4 h-4" />
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
