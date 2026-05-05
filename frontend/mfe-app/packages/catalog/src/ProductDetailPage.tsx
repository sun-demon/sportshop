import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  addToCart,
  selectIsAdmin,
  selectIsAuthenticated,
  useAppDispatch,
  useAppSelector,
  useDeleteProductMutation,
  useGetProductQuery,
} from '@sportshop/mfe-store';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const { data: product, isLoading, isError } = useGetProductQuery(Number(id));
  const [deleteProduct] = useDeleteProductMutation();

  async function handleDelete() {
    if (!confirm('Удалить товар?')) return;
    await deleteProduct(Number(id)).unwrap();
    navigate('/products');
  }

  if (isLoading) return <div className="loading container">Загрузка…</div>;
  if (isError || !product) {
    return (
      <div className="container">
        <div className="alert alert-error">Товар не найден</div>
      </div>
    );
  }

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
              (isAuthenticated ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    dispatch(addToCart(product));
                    navigate('/cart');
                  }}
                >
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
