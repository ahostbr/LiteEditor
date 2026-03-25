// @ts-nocheck
import React from "react";
import { useErrorStore } from "../../stores/error-store";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    useErrorStore
      .getState()
      .addError(
        "critical",
        error.message,
        "ErrorBoundary",
        `${error.stack}\n\nComponent Stack:${info.componentStack}`,
      );
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  handleHardReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center h-full gap-4 p-8"
          style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
        >
          <div className="text-lg font-semibold" style={{ color: "var(--accent)" }}>
            Something went wrong
          </div>
          <div
            className="text-sm max-w-[600px] text-center"
            style={{ color: "var(--text-secondary)" }}
          >
            {this.state.error?.message || "An unexpected error occurred in the UI."}
          </div>
          <pre
            className="text-[10px] max-w-[700px] max-h-[200px] overflow-auto p-3 rounded"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            {this.state.error?.stack}
          </pre>
          <div className="flex gap-3">
            <button
              onClick={this.handleReload}
              className="px-4 py-2 rounded text-sm transition-colors"
              style={{
                backgroundColor: "var(--accent)",
                color: "#000",
              }}
            >
              Try Again
            </button>
            <button
              onClick={this.handleHardReload}
              className="px-4 py-2 rounded text-sm transition-colors"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              Reload Window
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
