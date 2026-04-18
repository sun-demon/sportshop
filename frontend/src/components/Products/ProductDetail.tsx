import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../../services/api';
import { useCart } from '../../hooks/useCart';
import type { IProduct } from '@sportshop/shared-types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getProduct(Number(id))
        .then(({ data }) => setProduct(data))
        .catch(() => navigate('/products'))
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      navigate('/cart');
    }
  };

  if (loading) return <div className="text-center py-8">Загрузка...</div>;
  if (!product) return <div className="text-center py-8">Товар не найден</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/products')}
        className="mb-6 text-blue-500 hover:underline"
      >
        ← Назад к каталогу
      </button>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 h-96 bg-gray-200 flex items-center justify-center">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-6xl text-gray-400">📦</span>
            )}
          </div>
          <div className="md:w-1/2 p-6">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="mb-4">
              <span className="text-gray-500">Категория:</span>{' '}
              <span className="font-medium">{product.category}</span>
            </div>
            <div className="mb-4">
              <span className="text-gray-500">В наличии:</span>{' '}
              <span className="font-medium">{product.stock} шт.</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-6">
              {product.price} ₽
            </div>
            <div className="flex items-center gap-4 mb-6">
              <label className="text-gray-700">Количество:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                >
                  -
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Добавить в корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
