import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import type { IProduct } from '@sportshop/shared-types';

export default function HomePage() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getProducts()
      .then(({ data }) => setProducts(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const featured = products.slice(0, 6);

  return (
    <div>
      <section className="hero">
        <h1>Лучшее спортивное снаряжение</h1>
        <p>Профессиональный инвентарь для любого вида спорта</p>
        <Link to="/products" className="btn btn-primary btn-lg">
          Смотреть каталог
        </Link>
      </section>
      <section className="section">
        <div className="container">
          <h2 className="section-title">Популярные товары</h2>
          {loading && <div className="loading">Загрузка…</div>}
          {error && <div className="alert alert-error">Не удалось загрузить товары</div>}
          <div className="products-grid">
            {featured.map((product) => (
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
                  </div>
                </Link>
                <div className="product-actions">
                  {product.stock > 0 ? (
                    user ? (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => addToCart(product)}>
                        В корзину
                      </button>
                    ) : (
                      <Link to="/login" className="btn btn-outline btn-sm">
                        Войдите для покупки
                      </Link>
                    )
                  ) : (
                    <span className="out-of-stock">Нет в наличии</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {!loading && (
            <div className="section-footer">
              <Link to="/products" className="btn btn-outline">
                Все товары →
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
