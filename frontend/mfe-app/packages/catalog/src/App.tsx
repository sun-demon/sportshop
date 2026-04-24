/**
 * CatalogApp — корневой компонент Catalog MFE.
 *
 * Когда монтируется в host:
 *   host уже предоставляет BrowserRouter → используем Routes напрямую.
 *
 * Когда запускается standalone (npm start в packages/catalog):
 *   bootstrap.tsx оборачивает CatalogApp в BrowserRouter.
 *
 * Маршруты внутри MFE:
 *   /catalog        → список товаров
 *   /catalog/new    → форма создания (admin)
 *   /catalog/:id    → карточка товара
 *   /catalog/:id/edit → форма редактирования (admin)
 */

import { Route, Routes } from 'react-router-dom';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductFormPage from './pages/ProductFormPage';
import ProductsPage from './pages/ProductsPage';
import './styles.css';

export default function CatalogApp() {
  return (
    <Routes>
      <Route path="/catalog"           element={<ProductsPage />} />
      <Route path="/catalog/new"       element={<ProductFormPage />} />
      <Route path="/catalog/:id"       element={<ProductDetailPage />} />
      <Route path="/catalog/:id/edit"  element={<ProductFormPage />} />
      {/* Standalone fallback */}
      <Route path="*"                  element={<ProductsPage />} />
    </Routes>
  );
}
