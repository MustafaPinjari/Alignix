import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-surface gap-4 p-8">
          <div className="text-danger text-4xl">⚠</div>
          <h1 className="text-white font-bold text-lg">Something went wrong</h1>
          <pre className="text-muted text-xs bg-surface-2 p-4 rounded-xl max-w-2xl overflow-auto w-full">
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
