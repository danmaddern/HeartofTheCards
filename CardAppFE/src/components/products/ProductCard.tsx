import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Zap, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { cartService } from '../../services/cart.service';
import { useAuthStore } from '../../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { handleApiError } from '../../lib/api';

interface ProductCardProps {
  product: Product;
}

const BRAND_CONFIG: Record<string, { label: string; cls: string }> = {
  POKEMON:  { label: 'Pokémon',  cls: 'bg-yellow-400/15 text-yellow-600 border-yellow-400/20' },
  ONE_PIECE: { label: 'One Piece', cls: 'bg-red-500/10   text-red-600   border-red-500/15' },
};

const TYPE_LABELS: Record<string, string> = {
  BOOSTER_BOX:     'Booster Box',
  INDIVIDUAL_CARD: 'Single Card',
  ACCESSORY:       'Accessory',
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const { setCart, getSessionId } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);

  const discount = product.compareAtPrice
    ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
    : null;

  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock   = product.stockQuantity > 0 && product.stockQuantity <= 5;

  const brand = BRAND_CONFIG[product.brand] ?? { label: product.brand, cls: 'bg-slate-100 text-slate-600 border-slate-200' };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock || adding) return;
    setAdding(true);
    try {
      const sessionId = !isAuthenticated ? getSessionId() : undefined;
      const cart = await cartService.addItem({ productId: product.id, quantity: 1, sessionId });
      setCart(cart);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`Added to cart`, { icon: '🃏', duration: 2000 });
    } catch (err) {
      handleApiError(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group card-hover flex flex-col"
    >
      <Link to={`/products/${product.slug}`} className="flex flex-col flex-1">

        {/* ── Image area ────────────────────────────────────────────── */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl bg-gradient-to-br from-slate-100 via-slate-100 to-slate-200">

          {/* Product image */}
          <img
            src={product.imageUrls[0] || '/placeholder-card.jpg'}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />

          {/* Subtle inner vignette for depth */}
          <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.06)] pointer-events-none" />

          {/* Top badge row */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between pointer-events-none">
            <div className="flex flex-col gap-1.5">
              {product.isFeatured && (
                <span className="inline-flex items-center gap-1 bg-dark-950/80 backdrop-blur-sm text-gold-400 text-[10px] font-bold px-2 py-1 rounded-full border border-gold-500/25 tracking-wide uppercase">
                  ✦ Featured
                </span>
              )}
              {discount && discount > 0 && (
                <span className="inline-flex items-center bg-crimson-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                  -{discount}%
                </span>
              )}
            </div>
            {isLowStock && (
              <span className="inline-flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                <AlertCircle size={9} />
                {product.stockQuantity} left
              </span>
            )}
          </div>

          {/* Bottom gradient overlay + add to cart */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-dark-950/70 via-dark-950/20 to-transparent" />
          <div
            className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
          >
            <button
              onClick={handleAddToCart}
              disabled={adding || isOutOfStock}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold-300 to-gold-400 hover:from-gold-200 hover:to-gold-300 text-dark-950 text-sm font-bold py-2.5 rounded-xl shadow-lg shadow-gold-500/20 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {adding ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <ShoppingCart size={14} />
                  Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Out-of-stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
              <div className="bg-dark-900/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide">
                Out of Stock
              </div>
            </div>
          )}
        </div>

        {/* ── Info section ──────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 p-3.5">

          {/* Brand + type */}
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${brand.cls}`}>
              {brand.label}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">{TYPE_LABELS[product.productType] ?? product.productType}</span>
          </div>

          {/* Product name */}
          <h3 className="text-dark-900 text-sm font-semibold leading-snug line-clamp-2 mb-auto group-hover:text-gold-600 transition-colors duration-200">
            {product.name}
          </h3>

          {/* Price row */}
          <div className="flex items-end justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-baseline gap-1.5">
              <span className="text-gold-500 font-bold text-[15px] leading-none">
                A${Number(product.price).toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="text-slate-400 text-xs line-through leading-none">
                  A${Number(product.compareAtPrice).toFixed(2)}
                </span>
              )}
            </div>
            {product.stockQuantity > 0 && (
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                <Zap size={9} className="fill-emerald-500" />
                In stock
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
