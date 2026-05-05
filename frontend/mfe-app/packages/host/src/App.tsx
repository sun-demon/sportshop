import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@sportshop/mfe-store';
import ShellLayout from './ShellLayout';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ProtectedRoute from './ProtectedRoute';

const ProductsPage = lazy(() => import('catalog/ProductsPage'));
const ProductDetailPage = lazy(() => import('catalog/ProductDetailPage'));
const ProductFormPage = lazy(() => import('catalog/ProductFormPage'));
const CartPage = lazy(() => import('orders/CartPage'));
const OrdersPage = lazy(() => import('orders/OrdersPage'));
const ProfilePage = lazy(() => import('orders/ProfilePage'));

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route element={<ShellLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/products"
              element={
                <Suspense fallback={<div className="loading container">Загрузка каталога…</div>}>
                  <ProductsPage />
                </Suspense>
              }
            />
            <Route
              path="/products/:id"
              element={
                <Suspense fallback={<div className="loading container">Загрузка товара…</div>}>
                  <ProductDetailPage />
                </Suspense>
              }
            />
            <Route element={<ProtectedRoute />}>
              <Route
                path="/cart"
                element={
                  <Suspense fallback={<div className="loading container">Загрузка корзины…</div>}>
                    <CartPage />
                  </Suspense>
                }
              />
              <Route
                path="/orders"
                element={
                  <Suspense fallback={<div className="loading container">Загрузка заказов…</div>}>
                    <OrdersPage />
                  </Suspense>
                }
              />
              <Route
                path="/profile"
                element={
                  <Suspense fallback={<div className="loading container">Загрузка профиля…</div>}>
                    <ProfilePage />
                  </Suspense>
                }
              />
            </Route>
            <Route element={<ProtectedRoute adminOnly />}>
              <Route
                path="/products/new"
                element={
                  <Suspense fallback={<div className="loading container">Загрузка формы…</div>}>
                    <ProductFormPage />
                  </Suspense>
                }
              />
              <Route
                path="/products/:id/edit"
                element={
                  <Suspense fallback={<div className="loading container">Загрузка формы…</div>}>
                    <ProductFormPage />
                  </Suspense>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
