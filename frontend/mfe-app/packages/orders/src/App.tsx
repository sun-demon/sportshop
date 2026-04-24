/**
 * OrdersApp — корневой компонент Orders MFE.
 *
 * Маршруты:
 *   /cart     → страница корзины
 *   /orders   → список заказов
 *   /profile  → профиль пользователя
 *
 * Примечание: используем useLocation вместо вложенного <Routes>,
 * так как хост рендерит этот компонент через точные маршруты без /*,
 * из-за чего вложенный <Routes> не видит оставшегося пути.
 */

import { useLocation } from 'react-router-dom';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import './styles.css';

export default function OrdersApp() {
  const { pathname } = useLocation();

  if (pathname.startsWith('/orders'))  return <OrdersPage />;
  if (pathname.startsWith('/profile')) return <ProfilePage />;
  return <CartPage />;
}
