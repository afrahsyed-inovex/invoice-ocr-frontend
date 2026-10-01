import { Component } from 'react';
import { createLogger } from '../utils/logger';

const log = createLogger('error-boundary');

/**
 * Catches render errors so the app never shows a blank page.
 * Pass `resetKey` (e.g. the current path) to clear the error when it changes.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    log.error('Unhandled render error', { error, componentStack: info.componentStack });
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  handleReset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div role="alert" className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          An unexpected error occurred while displaying this page. You can try again, or reload the app.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
