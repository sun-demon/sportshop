import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { productStore } from '../stores/ProductStore';

function getIsAdmin(): boolean {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.role === 'admin';
  } catch {
    return false;
  }
}

const ProductDetailPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAdmin = getIsAdmin();

  // Динамически подгружаем cartStore из Orders MFE
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cartStoreRef = useRef<any>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    import('orders/CartStore').then((m) => {
      cartStoreRef.current = m.cartStore;
    }).catch(() => {
      console.warn('Orders MFE недоступен — корзина не работает');
    });
  }, []);

  useEffect(() => {
    if (id) productStore.fetchProduct(Number(id));
    return () => { productStore.clearSelected(); };
  }, [id]);

  if (productStore.isLoadingOne) return <div className="loading container">Загрузка…</div>;
  if (productStore.error)        return <div className="container"><div className="alert alert-error">{productStore.error}</div></div>;

  const product = productStore.selectedProduct;
  if (!product) return null;

  function handleAddToCart() {
    if (!cartStoreRef.current) {
      alert('Корзина временно недоступна');
      return;
    }
    cartStoreRef.current.addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  async function handleDelete() {
    if (!window.confirm('Удалить товар?')) return;
    try {
      await productStore.deleteProduct(product!.id);
      navigate('/catalog');
    } catch {
      alert('Не удалось удалить товар');
    }
  }

  return (
    <div className="container">
      <Link to="/catalog" className="back-link">← Назад в каталог</Link>

      <div className="product-detail">
        <div className="product-detail-image">
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} />
            : <div className="product-image-placeholder large">🏃</div>}
        </div>

        <div className="product-detail-info">
          <p className="product-category">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="product-price product-price-large">
            {product.price.toLocaleString('ru-RU')} ₽
          </p>

          {product.stock > 0
            ? <p className="in-stock">✓ В наличии: {product.stock} шт.</p>
            : <p className="out-of-stock">✗ Нет в наличии</p>}

          {product.description && (
            <p className="product-description" style={{ marginTop: 16 }}>
              {product.description}
            </p>
          )}

          <div className="product-detail-actions">
            {/* Кнопка «В корзину» — доступна всем авторизованным */}
            {product.stock > 0 && (
              <button
                className={`btn btn-lg ${added ? 'btn-success' : 'btn-primary'}`}
                onClick={handleAddToCart}
              >
                {added ? '✓ Добавлено!' : '🛒 В корзину'}
              </button>
            )}

            {product.stock > 0 && (
              <button
                className="btn btn-outline btn-lg"
                onClick={() => { handleAddToCart(); navigate('/cart'); }}
              >
                Купить сейчас
              </button>
            )}

            {isAdmin && (
              <>
                <button
                  className="btn btn-outline"
                  onClick={() => navigate(`/catalog/${product.id}/edit`)}
                >
                  Редактировать
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Удалить
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductDetailPage;
