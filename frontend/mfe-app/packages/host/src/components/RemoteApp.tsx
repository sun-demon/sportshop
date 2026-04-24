/**
 * RemoteApp — обёртка для удалённых MFE-компонентов.
 *
 * Показывает спиннер пока MFE грузится и сообщение об ошибке
 * если удалённый сервер недоступен (graceful degradation).
 */

import React, { Suspense } from 'react';

interface Props {
  /** Лениво импортированный MFE-компонент */
  component: React.LazyExoticComponent<React.ComponentType>;
  /** Название MFE для отображения в сообщении об ошибке */
  name?: string;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; name?: string },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const name = this.props.name ?? 'Микрофронтенд';
      return (
        <div className="container" style={{ paddingTop: 60, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔌</div>
          <h2 style={{ marginBottom: 8 }}>{name} недоступен</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Сервис не отвечает. Убедитесь, что MFE запущен, и попробуйте снова.
          </p>
          <button className="btn btn-primary" onClick={this.handleRetry}>
            Повторить попытку
          </button>
          <details style={{ marginTop: 24, fontSize: '.8rem', color: 'var(--text-muted)', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer' }}>Техническая информация</summary>
            <pre style={{ marginTop: 8, padding: 12, background: '#f1f5f9', borderRadius: 6, overflow: 'auto' }}>
              {String(this.state.error)}
            </pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function RemoteApp({ component: Component, name }: Props) {
  return (
    <ErrorBoundary name={name}>
      <Suspense
        fallback={
          <div className="loading">
            Загрузка микрофронтенда…
          </div>
        }
      >
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
}
