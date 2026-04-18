import { useCart } from '../../hooks/useCart';
import type { IProduct } from '@sportshop/shared-types';

interface Props {
  product: IProduct;
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl text-gray-400">📦</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xl font-bold text-blue-600">{product.price} ₽</span>
          <button
            onClick={() => addToCart(product)}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}
