import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery, useDeleteProductMutation } from '../api/sportshopApi';
import { addToCart } from '../features/cartSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { selectIsAdmin, selectIsAuthenticated } from '../features/authSlice';

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const { data: products = [], isLoading, isError } = useGetProductsQuery();
  const [deleteProduct] = useDeleteProductMutation();

  const categories = [...new Set(products.map((p) => p.category))].sort();
  const filtered = products.filter((p) => {
    const matchCategory = !category || p.category === category;
    const matchSearch = !search
      || p.name.toLowerCase().includes(search.toLowerCase())
      || (p.description ?? '').toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  async function handleDelete(id: number) {
    if (!confirm('Удалить товар?')) return;
    try { await deleteProduct(id).unwrap(); }
    catch { alert('Не удалось удалить товар'); }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Каталог товаров</h1>
        {isAdmin && <Link to="/products/new" className="btn btn-primary">+ Добавить товар</Link>}
      </div>
      <div className="filters">
        <input type="text" className="form-control" placeholder="Поиск…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Все категории</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {isLoading && <div className="loading">Загрузка товаров…</div>}
      {isError && <div className="alert alert-error">Не удалось загрузить каталог</div>}
      <div className="products-grid">
        {filtered.map((product) => (
          <div key={product.id} className="product-card">
            <Link to={`/products/${product.id}`}>
              <div className="product-image">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <div className="product-image-placeholder">
                    <span className="product-image-placeholder-icon" aria-hidden>
                      🏋️
                    </span>
                    <span className="media-caption">Демо · фото не задано</span>
                  </div>
                )}
              </div>
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">{product.price.toLocaleString('ru-RU')} ₽</p>
                <p className="product-stock">{product.stock > 0 ? `В наличии: ${product.stock}` : 'Нет в наличии'}</p>
              </div>
            </Link>
            <div className="product-actions">
              {product.stock > 0 && isAuthenticated && (
                <button className="btn btn-primary btn-sm" onClick={() => dispatch(addToCart(product))}>В корзину</button>
              )}
              {isAdmin && (
                <>
                  <Link to={`/products/${product.id}/edit`} className="btn btn-outline btn-sm">✏️</Link>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product.id)}>🗑️</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {!isLoading && filtered.length === 0 && <p className="empty-message">Товары не найдены</p>}
    </div>
  );
}
