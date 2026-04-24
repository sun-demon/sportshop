import { observer } from 'mobx-react-lite';
import { Link, useNavigate } from 'react-router-dom';
import { cartStore } from '../stores/CartStore';
import { orderStore } from '../stores/OrderStore';

const CartPage = observer(() => {
  const navigate = useNavigate();

  async function handleCheckout() {
    if (cartStore.isEmpty) return;
    try {
      await orderStore.createOrder(
        cartStore.items.map((i) => ({
          productId: i.product.id,
          quantity:  i.quantity,
        }))
      );
      cartStore.clear();
      navigate('/orders');
    } catch {
      alert('Не удалось оформить заказ');
    }
  }

  if (cartStore.isEmpty) {
    return (
      <div className="container">
        <h1>Корзина</h1>
        <div className="empty-cart">
          <p>Корзина пуста</p>
          <Link to="/catalog" className="btn btn-primary">Перейти в каталог</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Корзина</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cartStore.items.map(({ product, quantity }) => (
            <div key={product.id} className="cart-item">
              <div className="cart-item-image">
                {product.imageUrl
                  ? <img src={product.imageUrl} alt={product.name} />
                  : <div className="product-image-placeholder small">🏃</div>}
              </div>

              <div className="cart-item-info">
                <h3>{product.name}</h3>
                <p style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>{product.category}</p>
              </div>

              <div className="cart-item-controls">
                <button
                  className="qty-btn"
                  onClick={() => cartStore.updateQuantity(product.id, quantity - 1)}
                >−</button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => cartStore.updateQuantity(product.id, quantity + 1)}
                  disabled={quantity >= product.stock}
                >+</button>
              </div>

              <div className="cart-item-subtotal">
                {(product.price * quantity).toLocaleString('ru-RU')} ₽
              </div>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => cartStore.removeItem(product.id)}
              >✕</button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Итого</h2>
          <div className="cart-total">
            <span>Товаров:</span>
            <strong>{cartStore.count} шт.</strong>
          </div>
          <div className="cart-total">
            <span>Сумма:</span>
            <strong>{cartStore.total.toLocaleString('ru-RU')} ₽</strong>
          </div>
          <button className="btn btn-primary btn-full" onClick={handleCheckout}>
            Оформить заказ
          </button>
          <button className="btn btn-outline btn-full btn-sm" onClick={() => cartStore.clear()}>
            Очистить корзину
          </button>
        </div>
      </div>
    </div>
  );
});

export default CartPage;
