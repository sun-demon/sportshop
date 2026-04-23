import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useAuthStore, useCartStore, useProductStore } from '../stores/StoreContext';

const ProductDetailPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuthStore();
  const products = useProductStore();
  const cart = useCartStore();

  useEffect(() => {
    products.fetchProduct(Number(id));
    return () => { products.clearSelected(); };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const product = products.selectedProduct;

  if (products.isLoadingOne) return <div className="loading container">Загрузка…</div>;
  if (products.error || !product) return <div className="container"><div className="alert alert-error">Товар не найден</div></div>;

  async function handleDelete() {
    if (!confirm('Удалить товар?')) return;
    await products.deleteProduct(Number(id));
    navigate('/products');
  }

  return (
    <div className="container">
      <Link to="/products" className="back-link">← Назад в каталог</Link>
      <div className="product-detail">
        <div className="product-detail-image">
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <div className="product-image-placeholder large">🏋️</div>}
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
            {product.stock > 0 && (auth.isAuthenticated
              ? <button className="btn btn-primary" onClick={() => { cart.addItem(product); navigate('/cart'); }}>Добавить в корзину</button>
              : <Link to="/login" className="btn btn-primary">Войдите для покупки</Link>
            )}
            {auth.isAdmin && (
              <>
                <Link to={`/products/${product.id}/edit`} className="btn btn-outline">Редактировать</Link>
                <button className="btn btn-danger" onClick={handleDelete}>Удалить</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductDetailPage;
