import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { cartService } from '../services/cart.service';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { handleApiError } from '../lib/api';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export const Cart = () => {
  const navigate = useNavigate();
  const { setCart, getSessionId } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [updating, setUpdating] = useState<string | null>(null);

  const { data: cart, isLoading, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
  });

  const handleQtyChange = async (itemId: string, qty: number) => {
    setUpdating(itemId);
    try {
      const updated = await cartService.updateItem(itemId, qty);
      setCart(updated);
      refetch();
    } catch (err) {
      handleApiError(err);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setUpdating(itemId);
    try {
      const updated = await cartService.removeItem(itemId);
      setCart(updated);
      refetch();
    } catch (err) {
      handleApiError(err);
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map(i => <LoadingSkeleton key={i} className="h-24" />)}
      </div>
    );
  }

  const shippingCost = cart && Number(cart.subtotal) >= 150 ? 0 : 9.95;
  const total = cart ? Number(cart.subtotal) + shippingCost : 0;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="text-dark-600 mx-auto mb-4" />
        <h1 className="font-display font-bold text-white text-2xl mb-2">Your Cart is Empty</h1>
        <p className="text-dark-400 mb-8">Looks like you haven't added any cards yet!</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="section-title mb-8">Shopping Cart ({cart.itemCount} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`card p-4 flex gap-4 ${updating === item.id ? 'opacity-50' : ''}`}
            >
              <Link to={`/products/${item.product.slug}`}>
                <img src={item.product.imageUrls[0]} alt={item.product.name} className="w-20 h-24 object-cover rounded-lg flex-shrink-0" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product.slug}`}>
                  <h3 className="text-white font-medium text-sm hover:text-gold-400 transition-colors line-clamp-2">{item.product.name}</h3>
                </Link>
                <p className="text-dark-500 text-xs mt-0.5">SKU: {item.product.sku}</p>
                <p className="text-gold-400 font-bold mt-2">A${(Number(item.unitPrice) * item.quantity).toFixed(2)}</p>
                <p className="text-dark-500 text-xs">A${Number(item.unitPrice).toFixed(2)} each</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center bg-dark-900 rounded-lg border border-dark-700">
                    <button onClick={() => handleQtyChange(item.id, item.quantity - 1)} disabled={!!updating} className="p-2 text-dark-300 hover:text-white">
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-white text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                      disabled={!!updating || item.quantity >= item.product.stockQuantity}
                      className="p-2 text-dark-300 hover:text-white disabled:opacity-40"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => handleRemove(item.id)} disabled={!!updating} className="p-2 text-dark-500 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 space-y-4 sticky top-24">
            <h2 className="text-white font-semibold text-lg">Order Summary</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Subtotal ({cart.itemCount} items)</span>
                <span className="text-white">A${Number(cart.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Shipping</span>
                <span className={shippingCost === 0 ? 'text-emerald-400' : 'text-white'}>
                  {shippingCost === 0 ? 'FREE' : `A$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              {Number(cart.subtotal) < 150 && (
                <p className="text-xs text-dark-500 bg-dark-800 rounded p-2">
                  Add A${(150 - Number(cart.subtotal)).toFixed(2)} more for free shipping
                </p>
              )}
              <div className="pt-2 border-t border-dark-700 flex justify-between font-semibold text-base">
                <span className="text-white">Total</span>
                <span className="text-gold-400">A${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate(isAuthenticated ? '/checkout' : '/login?redirect=/checkout')}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>
            <Link to="/products" className="block text-center text-dark-400 hover:text-white text-sm transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
