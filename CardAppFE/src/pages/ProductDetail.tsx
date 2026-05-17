import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingCart, ChevronLeft, Star, AlertCircle, Package, CheckCircle, Minus, Plus } from 'lucide-react';
import { productsService } from '../services/products.service';
import { cartService } from '../services/cart.service';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { handleApiError } from '../lib/api';
import toast from 'react-hot-toast';

export const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { setCart, getSessionId, openCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsService.getBySlug(slug!),
    enabled: !!slug,
  });

  const handleAddToCart = async () => {
    if (!product || adding) return;
    setAdding(true);
    try {
      const sessionId = !isAuthenticated ? getSessionId() : undefined;
      const cart = await cartService.addItem({ productId: product.id, quantity, sessionId });
      setCart(cart);
      toast.success('Added to cart!', { icon: '🃏' });
      openCart();
    } catch (err) {
      handleApiError(err);
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <LoadingSkeleton className="aspect-square" />
          <div className="space-y-4">
            <LoadingSkeleton className="h-8 w-3/4" />
            <LoadingSkeleton className="h-6 w-1/4" />
            <LoadingSkeleton className="h-4 w-full" />
            <LoadingSkeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-white text-2xl font-semibold mb-4">Product Not Found</h2>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          <ChevronLeft size={16} /> Back to Products
        </Link>
      </div>
    );
  }

  const discount = product.compareAtPrice
    ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
    : null;

  const isOutOfStock = product.stockQuantity === 0;
  const maxQty = Math.min(product.stockQuantity, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-dark-400 mb-8">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-white transition-colors">Products</Link>
        <span>/</span>
        <span className="text-white truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="relative aspect-square bg-dark-900 rounded-2xl overflow-hidden mb-3">
            <img
              src={product.imageUrls[selectedImage] || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount && (
              <div className="absolute top-4 left-4 badge-red text-sm font-bold">
                {discount}% OFF
              </div>
            )}
            {product.isFeatured && (
              <div className="absolute top-4 right-4 badge-gold">
                <Star size={12} className="fill-gold-400" /> Featured
              </div>
            )}
          </div>
          {product.imageUrls.length > 1 && (
            <div className="flex gap-2">
              {product.imageUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? 'border-gold-500' : 'border-dark-700'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                product.brand === 'POKEMON' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {product.brand === 'POKEMON' ? 'Pokémon' : 'One Piece'}
              </span>
              <span className="text-dark-500 text-xs">
                {product.productType === 'BOOSTER_BOX' ? 'Booster Box' :
                  product.productType === 'INDIVIDUAL_CARD' ? 'Single Card' : 'Accessory'}
              </span>
            </div>
            <h1 className="text-white font-display font-bold text-2xl sm:text-3xl leading-tight">{product.name}</h1>
            <p className="text-dark-500 text-sm mt-1">SKU: {product.sku}</p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-gold-400 font-bold text-3xl">A${Number(product.price).toFixed(2)}</span>
            {product.compareAtPrice && (
              <span className="text-dark-500 line-through text-lg">A${Number(product.compareAtPrice).toFixed(2)}</span>
            )}
            {discount && (
              <span className="badge-red text-sm font-bold">Save {discount}%</span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <>
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-red-400 text-sm font-medium">Out of Stock</span>
              </>
            ) : product.stockQuantity <= 5 ? (
              <>
                <AlertCircle size={16} className="text-amber-400" />
                <span className="text-amber-400 text-sm font-medium">Only {product.stockQuantity} left in stock</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} className="text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">In Stock ({product.stockQuantity} available)</span>
              </>
            )}
          </div>

          {/* Shipping */}
          <div className="bg-dark-800 rounded-xl p-3 flex items-center gap-3 border border-dark-700">
            <Package size={18} className="text-gold-400 flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">Free shipping on orders over $150</p>
              <p className="text-dark-400 text-xs">Dispatched same day (weekdays). Express available.</p>
            </div>
          </div>

          {/* Quantity + Add to Cart */}
          {!isOutOfStock && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-dark-300 text-sm font-medium">Quantity:</span>
                <div className="flex items-center bg-dark-800 rounded-lg border border-dark-600">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 text-dark-300 hover:text-white transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center text-white font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                    className="p-2.5 text-dark-300 hover:text-white transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
              >
                <ShoppingCart size={20} />
                {adding ? 'Adding...' : `Add ${quantity > 1 ? `${quantity}x ` : ''}to Cart — A$${(Number(product.price) * quantity).toFixed(2)}`}
              </button>
            </div>
          )}

          {/* Description */}
          <div className="border-t border-dark-800 pt-5">
            <h3 className="text-white font-semibold mb-3">Product Description</h3>
            <p className="text-dark-300 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {/* Category */}
          {product.category && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-dark-500">Category:</span>
              <Link to={`/products?categoryId=${product.category.id}`} className="text-gold-400 hover:text-gold-300 transition-colors">
                {product.category.name}
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
