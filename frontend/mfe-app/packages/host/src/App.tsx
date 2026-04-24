/**
 * App — корневой компонент host-приложения.
 *
 * Маршрутизация:
 *   /            → HomePage
 *   /login       → LoginPage      (host)
 *   /register    → RegisterPage   (host)
 *   /catalog/*   → Catalog MFE    (удалённый, порт 3001)
 *   /cart        → Orders MFE     (удалённый, порт 3002)
 *   /orders      → Orders MFE
 *   /profile     → Orders MFE
 *
 * MFE загружаются лениво через Module Federation.
 * RemoteApp оборачивает их в Suspense + ErrorBoundary.
 */

import React, { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import RemoteApp from './components/RemoteApp';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

/**
 * Обёртка над lazy() с graceful degradation:
 * если удалённый MFE недоступен — импорт завершается ошибкой,
 * которую перехватывает ErrorBoundary в RemoteApp.
 * Без этой обёртки promise rejection всплывает как unhandledrejection
 * и webpack-dev-server показывает красный оверлей поверх страницы.
 */
function safeLazy(factory: () => Promise<{ default: React.ComponentType }>) {
  return lazy(() =>
    factory().catch((err) => {
      // Пробрасываем ошибку как компонент, чтобы ErrorBoundary её поймал
      return {
        default: () => { throw err; },
      };
    })
  );
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — типы для federated modules не генерируются автоматически
const CatalogApp = safeLazy(() => import('catalog/App'));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const OrdersApp  = safeLazy(() => import('orders/App'));

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Header />

        <main className="main-content">
          <Routes>
            {/* Публичные */}
            <Route path="/"         element={<HomePage />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Catalog MFE — защищён авторизацией */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/catalog/*"
                element={<RemoteApp component={CatalogApp} name="Catalog MFE (порт 4001)" />}
              />
            </Route>

            {/* Orders MFE — защищён авторизацией */}
            <Route element={<ProtectedRoute />}>
              <Route path="/cart"    element={<RemoteApp component={OrdersApp} name="Orders MFE (порт 4002)" />} />
              <Route path="/orders"  element={<RemoteApp component={OrdersApp} name="Orders MFE (порт 4002)" />} />
              <Route path="/profile" element={<RemoteApp component={OrdersApp} name="Orders MFE (порт 4002)" />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
