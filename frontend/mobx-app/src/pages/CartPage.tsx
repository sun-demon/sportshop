import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useCartStore, useOrderStore } from '../stores/StoreContext';

const CartPage = observer(() => {
  const cart = useCartStore();
  const orders = useOrderStore();
  const navigate = useNavigate();

  async function handleCheckout() {
    try {
      await orders.createOrder(cart.items.map((i) => ({ productId: i.product.id, quantity: i.quantity })));
      cart.clear(); navigate('/orders');
    } catch { alert('Ошибка оформления заказа'); }
  }

  if (cart.isEmpty) return (
    <div className="container"><h1>Корзина</h1>
      <div className="empty-cart"><p>Корзина пуста</p><a href="/products" className="btn btn-primary">Перейти в каталог</a></div>
    </div>
  );

  return (
    <div className="container">
      <h1>Корзина</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map(({ product, quantity }) => (
            <div key={product.id} className="cart-item">
              <div className="cart-item-image">
                {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <div className="product-image-placeholder small">🏋️</div>}
              </div>
              <div className="cart-item-info">
                <h3>{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <p className="product-price">{product.price.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="cart-item-controls">
                <button className="qty-btn" onClick={() => cart.updateQuantity(product.id, quantity - 1)}>−</button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => cart.updateQuantity(product.id, quantity + 1)} disabled={quantity >= product.stock}>+</button>
              </div>
              <div className="cart-item-subtotal">{(product.price * quantity).toLocaleString('ru-RU')} ₽</div>
              <button className="btn btn-danger btn-sm" onClick={() => cart.removeItem(product.id)}>✕</button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h2>Итого</h2>
          <div className="cart-total"><span>Сумма:</span><strong>{cart.total.toLocaleString('ru-RU')} ₽</strong></div>
          <button className="btn btn-primary btn-full" onClick={handleCheckout} disabled={orders.isLoading}>{orders.isLoading ? 'Оформление…' : 'Оформить заказ'}</button>
          <button className="btn btn-outline btn-full" onClick={() => cart.clear()}>Очистить корзину</button>
        </div>
      </div>
    </div>
  );
});

export default CartPage;
