import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { cartService } from '../../services/cart.service';
import { useAuthStore } from '../../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { handleApiError } from '../../lib/api';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { setCart, getSessionId } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);

  const discount = product.compareAtPrice
    ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
    : null;

  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock || adding) return;

    setAdding(true);
    try {
      const sessionId = !isAuthenticated ? getSessionId() : undefined;
      const cart = await cartService.addItem({
        productId: product.id,
        quantity: 1,
        sessionId,
      });
      setCart(cart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`${product.name.substring(0, 30)}... added to cart`, { icon: '🃏' });
    } catch (error) {
      handleApiError(error);
    } finally {
      setAdding(false);
    }
  };

  const brandLabel = product.brand === 'POKEMON' ? 'Pokémon' : 'One Piece';
  const typeLabel = product.productType === 'BOOSTER_BOX' ? 'Booster Box' :
    product.productType === 'INDIVIDUAL_CARD' ? 'Single Card' : 'Accessory';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card-hover group"
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/4] bg-dark-900 overflow-hidden">
          <img
            src={product.imageUrls[0] || '/placeholder-card.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.isFeatured && (
              <span className="badge-gold flex items-center gap-1">
                <Star size={10} className="fill-gold-400" />
                Featured
              </span>
            )}
            {discount && (
              <span className="badge-red">-{discount}%</span>
            )}
          </div>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-dark-950/70 flex items-center justify-center">
              <span className="text-dark-300 font-medium text-sm">Out of Stock</span>
            </div>
          )}

          {/* Quick Add overlay */}
          {!isOutOfStock && (
            <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="w-full bg-gold-500 hover:bg-gold-400 text-dark-950 font-semibold text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <ShoppingCart size={16} />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              product.brand === 'POKEMON' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {brandLabel}
            </span>
            <span className="text-xs text-dark-500">{typeLabel}</span>
          </div>

          <h3 className="text-white text-sm font-medium leading-tight line-clamp-2 mb-2 group-hover:text-gold-400 transition-colors">
            {product.name}
          </h3>

          {isLowStock && (
            <div className="flex items-center gap-1 mb-1.5">
              <AlertCircle size={11} className="text-amber-500" />
              <span className="text-amber-500 text-xs">Only {product.stockQuantity} left</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-gold-400 font-bold text-base">
              A${Number(product.price).toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="text-dark-500 text-xs line-through">
                A${Number(product.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
