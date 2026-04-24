/**
 * Точка входа host-приложения.
 *
 * Асинхронный импорт bootstrap — обязательный паттерн для Module Federation.
 * Без него webpack не успевает инициализировать shared-синглтоны (react и др.)
 * до первого рендера, что приводит к ошибке "Shared module is not available".
 */

/**
 * Подавляем unhandledrejection от упавших MFE-импортов.
 * Когда удалённый MFE недоступен, Module Federation бросает ошибку загрузки чанка.
 * Webpack-dev-server и react-refresh перехватывают её и показывают красный оверлей
 * поверх страницы — даже если ErrorBoundary уже показал нужную заглушку.
 * Здесь мы фильтруем именно эти ошибки, не трогая реальные баги приложения.
 */
function isMfeLoadError(msg: string): boolean {
  return (
    msg.includes('Loading script failed') ||
    msg.includes('Failed to fetch') ||
    msg.includes('ChunkLoadError') ||
    msg.includes('Loading chunk') ||
    msg.includes('Load failed') ||
    msg.includes('NetworkError') ||
    msg.includes('remoteEntry') ||
    msg.includes('ScriptExternalLoadError')
  );
}

// Promise rejection — например при lazy import
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message ?? String(event.reason ?? '');
  if (isMfeLoadError(msg)) event.preventDefault();
});

// Синхронная ошибка — ScriptExternalLoadError при инициализации Module Federation
window.addEventListener('error', (event) => {
  const msg = event.message ?? event.error?.message ?? '';
  if (isMfeLoadError(msg)) event.preventDefault();
});

import('./bootstrap');
