import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MdxErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("MDX render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role='alert'
          className='my-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive'
        >
          <p className='font-medium'>
            This documentation page could not be rendered.
          </p>

          {this.state.error?.message && (
            <pre className='mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-destructive/80'>
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
