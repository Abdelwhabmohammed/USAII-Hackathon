"use client";

import { ReactNode, Component } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("HomePath AI error boundary:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="max-w-md rounded-3xl border border-border/60 bg-card p-8 shadow-lg">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h2 className="font-serif-display text-2xl font-semibold text-foreground">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We hit an unexpected error. Your progress is saved — try again, or
              start fresh.
            </p>
            {this.state.error?.message && (
              <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-5 flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  if (typeof window !== "undefined") {
                    window.location.href = "/";
                  }
                }}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                <Home className="h-4 w-4" />
                Back to home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
