import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  // Extrai arquivo, linha e coluna do stacktrace
  extractErrorLocation = (stack) => {
    if (!stack) return null;

    // Regex para capturar: arquivo.jsx:linha:coluna
    const regex = /\((.*?):(\d+):(\d+)\)/;
    const match = stack.match(regex);

    if (match) {
      return {
        file: match[1],
        line: match[2],
        column: match[3]
      };
    }

    return null;
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) this.props.onReset();
  };

  renderDevDebug(error, errorInfo) {
    if (process.env.NODE_ENV !== "development") return null;

    const location = this.extractErrorLocation(error?.stack);

    return (
      <div className="mt-6 p-4 border rounded bg-muted text-sm overflow-auto max-w-full">
        <h3 className="font-semibold mb-2">🔍 Detalhes do Erro (Dev Mode)</h3>

        {location && (
          <p className="mb-2">
            <strong>Arquivo:</strong> {location.file}<br />
            <strong>Linha:</strong> {location.line}<br />
            <strong>Coluna:</strong> {location.column}
          </p>
        )}

        <details open>
          <summary className="cursor-pointer mb-2">Stack Trace</summary>
          <pre className="whitespace-pre-wrap text-xs">{error?.stack}</pre>
        </details>

        {errorInfo && (
          <details open>
            <summary className="cursor-pointer mb-2">Component Stack</summary>
            <pre className="whitespace-pre-wrap text-xs">
              {errorInfo.componentStack}
            </pre>
          </details>
        )}
      </div>
    );
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback({
          error,
          reset: this.handleReset,
          errorInfo,
        });
      }

      const location = this.extractErrorLocation(error?.stack);

      return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <h1 className="text-2xl font-bold mb-2">Ocorreu um erro na aplicação.</h1>

          {location && (
            <p className="text-sm text-muted-foreground mb-4 text-center">
              <strong>Arquivo:</strong> {location.file}<br />
              <strong>Linha:</strong> {location.line} — <strong>Coluna:</strong> {location.column}
            </p>
          )}

          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            Tentar novamente
          </button>

          {this.renderDevDebug(error, errorInfo)}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
