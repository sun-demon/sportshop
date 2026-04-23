import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../api/sportshopApi';
import { addToCart } from '../features/cartSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { selectIsAuthenticated } from '../features/authSlice';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  // Те же закэшированные данные что и на ProductsPage — повторного запроса нет
  const { data: products, isLoading, isError } = useGetProductsQuery();
  const featured = products?.slice(0, 6) ?? [];

  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <h1>Лучшее спортивное снаряжение</h1>
          <p>Профессиональный инвентарь для любого вида спорта</p>
          <Link to="/products" className="btn btn-primary btn-lg">Смотреть каталог</Link>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2 className="section-title">Популярные товары</h2>
          {isLoading && <div className="loading">Загрузка…</div>}
          {isError && <div className="alert alert-error">Не удалось загрузить товары</div>}
          <div className="products-grid">
            {featured.map((product) => (
              <div key={product.id} className="product-card">
                <Link to={`/products/${product.id}`}>
                  <div className="product-image">
                    {product.imageUrl
                      ? <img src={product.imageUrl} alt={product.name} />
                      : <div className="product-image-placeholder">🏋️</div>}
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">{product.price.toLocaleString('ru-RU')} ₽</p>
                  </div>
                </Link>
                <div className="product-actions">
                  {product.stock > 0
                    ? isAuthenticated
                      ? <button className="btn btn-primary btn-sm" onClick={() => dispatch(addToCart(product))}>В корзину</button>
                      : <Link to="/login" className="btn btn-outline btn-sm">Войдите для покупки</Link>
                    : <span className="out-of-stock">Нет в наличии</span>}
                </div>
              </div>
            ))}
          </div>
          {!isLoading && <div className="section-footer"><Link to="/products" className="btn btn-outline">Все товары →</Link></div>}
        </div>
      </section>
    </div>
  );
}
