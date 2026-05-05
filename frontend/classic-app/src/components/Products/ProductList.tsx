import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteProduct, getProducts } from '../../services/api';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import type { IProduct } from '@sportshop/shared-types';

export default function ProductList() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getProducts()
      .then(({ data }) => setProducts(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const isAdmin = user?.role === 'admin';
  const categories = [...new Set(products.map((p) => p.category))].sort();
  const filtered = products.filter((p) => {
    const matchCategory = !category || p.category === category;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  async function handleDelete(productId: number) {
    if (!confirm('Удалить товар?')) return;
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      alert('Не удалось удалить товар');
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Каталог товаров</h1>
        {isAdmin && (
          <Link to="/products/new" className="btn btn-primary">
            + Добавить товар
          </Link>
        )}
      </div>
      <div className="filters">
        <input type="text" className="form-control" placeholder="Поиск…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {loading && <div className="loading">Загрузка товаров…</div>}
      {error && <div className="alert alert-error">Не удалось загрузить каталог</div>}
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
              {product.stock > 0 && user && (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => addToCart(product)}>
                  В корзину
                </button>
              )}
              {isAdmin && (
                <>
                  <Link to={`/products/${product.id}/edit`} className="btn btn-outline btn-sm">
                    ✏️
                  </Link>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(product.id)}>
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {!loading && filtered.length === 0 && <p className="empty-message">Товары не найдены</p>}
    </div>
  );
}
