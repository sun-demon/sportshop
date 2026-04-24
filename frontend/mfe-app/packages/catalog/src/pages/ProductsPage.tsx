import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { productStore } from '../stores/ProductStore';
import type { IProduct } from '../types';

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

const ProductsPage = observer(() => {
  const navigate = useNavigate();
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('');
  // id товара, который только что добавили (для анимации кнопки)
  const [addedId, setAddedId]       = useState<number | null>(null);
  const isAdmin = getIsAdmin();

  // Динамически подгружаем cartStore из Orders MFE
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cartStoreRef = useRef<any>(null);

  useEffect(() => {
    productStore.fetchProducts();
    import('orders/CartStore').then((m) => {
      cartStoreRef.current = m.cartStore;
    }).catch(() => {
      console.warn('Orders MFE недоступен — корзина не работает');
    });
  }, []);

  const filtered = productStore.products.filter((p) => {
    const matchSearch   = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category ? p.category === category : true;
    return matchSearch && matchCategory;
  });

  function handleAddToCart(e: React.MouseEvent, product: IProduct) {
    e.preventDefault(); // не переходить по ссылке карточки
    if (!cartStoreRef.current) { alert('Корзина временно недоступна'); return; }
    cartStoreRef.current.addItem(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Удалить товар?')) return;
    try {
      await productStore.deleteProduct(id);
    } catch {
      alert('Не удалось удалить товар');
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Каталог товаров</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate('/catalog/new')}>
            + Добавить товар
          </button>
        )}
      </div>

      <div className="filters">
        <input
          className="form-control"
          placeholder="Поиск по названию…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-control"
          style={{ maxWidth: 200 }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Все категории</option>
          {productStore.categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {productStore.isLoading && <div className="loading">Загрузка товаров…</div>}

      {!productStore.isLoading && filtered.length === 0 && (
        <div className="empty-message">Товары не найдены</div>
      )}

      <div className="products-grid">
        {filtered.map((product) => (
          <div key={product.id} className="product-card">
            <Link to={`/catalog/${product.id}`}>
              <div className="product-image">
                {product.imageUrl
                  ? <img src={product.imageUrl} alt={product.name} />
                  : <div className="product-image-placeholder">🏃</div>}
              </div>
              <div className="product-info">
                <p className="product-category">{product.category}</p>
                <p className="product-name">{product.name}</p>
                <p className="product-price">{product.price.toLocaleString('ru-RU')} ₽</p>
                <p className="product-stock">
                  {product.stock > 0 ? `В наличии: ${product.stock}` : 'Нет в наличии'}
                </p>
              </div>
            </Link>

            <div className="product-actions">
              {/* Кнопка «В корзину» для всех (если есть в наличии) */}
              {product.stock > 0 && (
                <button
                  className={`btn btn-sm btn-full ${addedId === product.id ? 'btn-success' : 'btn-primary'}`}
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  {addedId === product.id ? '✓ Добавлено' : '🛒 В корзину'}
                </button>
              )}

              {isAdmin && (
                <>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate(`/catalog/${product.id}/edit`)}
                  >
                    Изменить
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    Удалить
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ProductsPage;
