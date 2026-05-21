'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children:    ReactNode;
  /** Optional fallback. If omitted, the default full-page error UI is shown. */
  fallback?:   ReactNode;
  /** Called when an error is caught. Use for error reporting (e.g. Sentry). */
  onError?:    (error: Error, info: React.ErrorInfo) => void;
  /** Label for the reset button. Default: "Try again" */
  resetLabel?: string;
  /** Scope label shown in the error card (e.g. "Dashboard", "Project"). */
  scope?:      string;
}

interface State {
  hasError:   boolean;
  error:      Error | null;
  errorCount: number;
}

/**
 * Class-based error boundary compatible with React 18 and Next.js App Router.
 *
 * Use it to wrap any subtree that should fail gracefully rather than
 * crashing the entire page. Renders a recovery UI with a "Try again"
 * button that resets the boundary state and retries the child render.
 *
 * Usage:
 *   <ErrorBoundary scope="Payments">
 *     <PaymentsTable />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Production: surface to an error-tracking service
    this.props.onError?.(error, info);
    // Development: log full detail
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[ErrorBoundary${this.props.scope ? ` — ${this.props.scope}` : ''}]`, error, info);
    }
  }

  reset = () => {
    this.setState((s) => ({
      hasError:   false,
      error:      null,
      errorCount: s.errorCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const { scope = 'this section', resetLabel = 'Try again' } = this.props;

      return (
        <div className="flex items-center justify-center min-h-[320px] p-6">
          <div
            className="w-full max-w-md rounded-3xl p-6 text-center"
            style={{
              background:   'rgba(18,18,22,0.95)',
              border:       '1px solid rgba(239,68,68,0.15)',
              boxShadow:    '0 16px 48px rgba(0,0,0,0.3)',
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(239,68,68,0.1)' }}
            >
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>

            <h3 className="text-white font-bold text-lg mb-2">
              Something went wrong
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-1">
              An unexpected error occurred in {scope}.
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <p className="text-red-400/70 text-xs font-mono mt-2 mb-3 text-left bg-red-950/20 rounded-xl px-3 py-2 break-all">
                {this.state.error.message}
              </p>
            )}

            <div className="flex gap-3 mt-5 justify-center">
              <button
                onClick={this.reset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl
                           text-white font-semibold text-sm transition-all
                           active:scale-95"
                style={{ background: '#7c3aed' }}
              >
                <RefreshCw className="w-4 h-4" />
                {resetLabel}
              </button>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl
                           text-slate-300 font-semibold text-sm transition-all
                           active:scale-95"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // key prop forces a remount after reset, clearing child state entirely
    return (
      <React.Fragment key={this.state.errorCount}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

export default ErrorBoundary;
