import React, { Component } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "../common/Button";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(
      "ErrorBoundary caught an unhandled exception:",
      error,
      errorInfo,
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h2 className="text-lg font-bold text-text-main">
              Application Render Exception
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              A view exception occurred while rendering this interface.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={RotateCcw}
            onClick={this.handleReset}
          >
            Return to Safe Home
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
