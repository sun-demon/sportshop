import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteProduct, getProduct } from '../../services/api';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import type { IProduct } from '@sportshop/shared-types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!id || id === 'new') return;
    let cancelled = false;
    getProduct(Number(id))
      .then(({ data }) => {
        if (!cancelled) setProduct(data);
      })
      .catch(() => navigate('/products'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  async function handleDelete() {
    if (!product || !confirm('Удалить товар?')) return;
    try {
      await deleteProduct(product.id);
      navigate('/products');
    } catch {
      alert('Не удалось удалить товар');
    }
  }

  if (loading) return <div className="loading container">Загрузка…</div>;
  if (!product) return (
    <div className="container">
      <div className="alert alert-error">Товар не найден</div>
    </div>
  );

  return (
    <div className="container">
      <Link to="/products" className="back-link">
        ← Назад в каталог
      </Link>
      <div className="product-detail">
        <div className="product-detail-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="product-image-placeholder large">
              <span className="product-image-placeholder-icon" aria-hidden>
                🏋️
              </span>
              <span className="media-caption">Демо · фото не задано</span>
            </div>
          )}
        </div>
        <div className="product-detail-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          {product.description && <p className="product-description">{product.description}</p>}
          <p className="product-price product-price-large">{product.price.toLocaleString('ru-RU')} ₽</p>
          <p className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
            {product.stock > 0 ? `✓ В наличии (${product.stock} шт.)` : '✗ Нет в наличии'}
          </p>
          <div className="product-detail-actions">
            {product.stock > 0 &&
              (user ? (
                <button type="button" className="btn btn-primary" onClick={() => { addToCart(product); navigate('/cart'); }}>
                  Добавить в корзину
                </button>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  Войдите для покупки
                </Link>
              ))}
            {isAdmin && (
              <>
                <Link to={`/products/${product.id}/edit`} className="btn btn-outline">
                  Редактировать
                </Link>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  Удалить
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
