import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { cartService } from '../../services/cart.service';
import { useAuthStore } from '../../store/authStore';
import { handleApiError } from '../../lib/api';
import { useState } from 'react';

export const CartDrawer = () => {
  const { cart, isOpen, closeCart, setCart, getSessionId } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleQuantityChange = async (itemId: string, newQty: number) => {
    setUpdating(itemId);
    try {
      const updated = await cartService.updateItem(itemId, newQty);
      setCart(updated);
    } catch (error) {
      handleApiError(error);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setUpdating(itemId);
    try {
      const updated = await cartService.removeItem(itemId);
      setCart(updated);
    } catch (error) {
      handleApiError(error);
    } finally {
      setUpdating(null);
    }
  };

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const shippingCost = cart && Number(cart.subtotal) >= 150 ? 0 : 9.95;
  const total = cart ? Number(cart.subtotal) + shippingCost : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-dark-900 border-l border-dark-700 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-800">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-gold-400" />
                <h2 className="text-white font-display font-semibold text-lg">Your Cart</h2>
                {cart && cart.itemCount > 0 && (
                  <span className="bg-gold-500 text-dark-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cart.itemCount}
                  </span>
                )}
              </div>
              <button onClick={closeCart} className="p-1.5 text-dark-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!cart || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={24} className="text-dark-500" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-dark-400 text-sm mb-6">Start adding some amazing cards!</p>
                  <button onClick={() => { closeCart(); navigate('/products'); }} className="btn-primary text-sm px-5 py-2.5">
                    Browse Products
                  </button>
                </div>
              ) : (
                cart.items.map((item) => (
                  <div key={item.id} className={`flex gap-3 p-3 bg-dark-800 rounded-xl border border-dark-700 transition-opacity ${updating === item.id ? 'opacity-50' : ''}`}>
                    <Link to={`/products/${item.product.slug}`} onClick={closeCart}>
                      <img
                        src={item.product.imageUrls[0]}
                        alt={item.product.name}
                        className="w-16 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.product.slug}`} onClick={closeCart}>
                        <h4 className="text-white text-sm font-medium line-clamp-2 hover:text-gold-400 transition-colors">
                          {item.product.name}
                        </h4>
                      </Link>
                      <p className="text-gold-400 font-semibold text-sm mt-1">
                        A${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 bg-dark-700 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={updating === item.id}
                            className="p-1.5 text-dark-300 hover:text-white transition-colors disabled:opacity-50"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-white text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={updating === item.id || item.quantity >= item.product.stockQuantity}
                            className="p-1.5 text-dark-300 hover:text-white transition-colors disabled:opacity-50"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={updating === item.id}
                          className="p-1.5 text-dark-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart && cart.items.length > 0 && (
              <div className="border-t border-dark-800 p-4 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Subtotal</span>
                    <span className="text-white">A${Number(cart.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Shipping</span>
                    <span className={shippingCost === 0 ? 'text-emerald-400' : 'text-white'}>
                      {shippingCost === 0 ? 'FREE' : `A$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  {Number(cart.subtotal) < 150 && (
                    <p className="text-dark-500 text-xs">
                      Add A${(150 - Number(cart.subtotal)).toFixed(2)} more for free shipping
                    </p>
                  )}
                  <div className="flex justify-between font-semibold pt-1 border-t border-dark-700">
                    <span className="text-white">Total</span>
                    <span className="text-gold-400">A${total.toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={handleCheckout} className="btn-primary w-full">
                  Proceed to Checkout
                </button>
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="block text-center text-dark-400 hover:text-white text-sm transition-colors"
                >
                  View full cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
