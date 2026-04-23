import { useNavigate } from 'react-router-dom';
import { clearCart, removeFromCart, selectCartItems, selectCartTotal, updateQuantity } from '../features/cartSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { useCreateOrderMutation } from '../api/sportshopApi';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  async function handleCheckout() {
    try {
      await createOrder({ items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })) }).unwrap();
      dispatch(clearCart());
      navigate('/orders');
    } catch (err: unknown) {
      alert((err as { data?: { message?: string } })?.data?.message ?? 'Ошибка оформления заказа');
    }
  }

  if (items.length === 0) return (
    <div className="container"><h1>Корзина</h1>
      <div className="empty-cart"><p>Корзина пуста</p><a href="/products" className="btn btn-primary">Перейти в каталог</a></div>
    </div>
  );

  return (
    <div className="container">
      <h1>Корзина</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map(({ product, quantity }) => (
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
                <button className="qty-btn" onClick={() => dispatch(updateQuantity({ productId: product.id, quantity: quantity - 1 }))}>−</button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => dispatch(updateQuantity({ productId: product.id, quantity: quantity + 1 }))} disabled={quantity >= product.stock}>+</button>
              </div>
              <div className="cart-item-subtotal">{(product.price * quantity).toLocaleString('ru-RU')} ₽</div>
              <button className="btn btn-danger btn-sm" onClick={() => dispatch(removeFromCart(product.id))}>✕</button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h2>Итого</h2>
          <div className="cart-total"><span>Сумма:</span><strong>{total.toLocaleString('ru-RU')} ₽</strong></div>
          <button className="btn btn-primary btn-full" onClick={handleCheckout} disabled={isLoading}>{isLoading ? 'Оформление…' : 'Оформить заказ'}</button>
          <button className="btn btn-outline btn-full" onClick={() => dispatch(clearCart())}>Очистить корзину</button>
        </div>
      </div>
    </div>
  );
}
