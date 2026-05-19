import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { MapPin, Plus, CheckCircle, Star, Gift, X } from 'lucide-react';
import { cartService } from '../services/cart.service';
import { ordersService } from '../services/orders.service';
import { addressesService } from '../services/addresses.service';
import { paymentsService } from '../services/payments.service';
import { loyaltyService, Reward } from '../services/loyalty.service';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { Address } from '../types';
import { handleApiError } from '../lib/api';

const addressSchema = z.object({
  fullName: z.string().min(2),
  line1: z.string().min(5),
  line2: z.string().optional(),
  suburb: z.string().min(2),
  state: z.string().min(2),
  postcode: z.string().regex(/^\d{4}$/, 'Must be 4 digits'),
  phone: z.string().min(8),
});

type AddressForm = z.infer<typeof addressSchema>;

const AU_STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];

export const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { cart, setCart } = useCartStore();
  const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  const [pointsEarnedPreview, setPointsEarnedPreview] = useState<number>(0);

  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressesService.getAll,
    enabled: isAuthenticated,
  });

  const { data: cartData } = useQuery({
    queryKey: ['cart-checkout'],
    queryFn: () => cartService.getCart(),
    enabled: isAuthenticated,
  });

  const { data: loyalty } = useQuery({
    queryKey: ['loyalty-balance'],
    queryFn: loyaltyService.getBalance,
    enabled: isAuthenticated,
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { state: 'VIC' },
  });

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(def.id);
    }
    if (addresses && addresses.length === 0) {
      setShowNewAddress(true);
    }
  }, [addresses]);

  const handleSaveAddress = async (data: AddressForm) => {
    try {
      const addr = await addressesService.create({ ...data, country: 'Australia', isDefault: !addresses?.length });
      await refetchAddresses();
      setSelectedAddressId(addr.id);
      setShowNewAddress(false);
      toast.success('Address saved');
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedAddressId) { toast.error('Please select a delivery address'); return; }
    try {
      const order = await ordersService.create({
        deliveryAddressId: selectedAddressId,
        rewardId: selectedRewardId ?? undefined,
      } as any);
      setCreatedOrderId(order.id);
      setPointsEarnedPreview(Math.floor(subtotal));
      const { paypalOrderId: ppOrderId } = await paymentsService.createPayPalOrder(order.id);
      setPaypalOrderId(ppOrderId);
      setStep('payment');
    } catch (err) {
      handleApiError(err);
    }
  };

  const handlePayPalApprove = async (data: any) => {
    if (!createdOrderId || !paypalOrderId) return;
    try {
      await paymentsService.capturePayPalOrder(paypalOrderId, createdOrderId);
      setStep('success');
      const emptyCart = await cartService.getCart();
      setCart(emptyCart);
      toast.success('Payment successful! Your order is confirmed.', { duration: 5000 });
    } catch (err) {
      handleApiError(err);
    }
  };

  const displayCart = cartData || cart;
  const subtotal = displayCart ? Number(displayCart.subtotal) : 0;
  const selectedReward = loyalty?.rewards.find((r: Reward) => r.id === selectedRewardId) ?? null;
  const freeShipping = (subtotal >= 150) || (selectedReward?.type === 'FREE_SHIPPING');
  const shippingCost = freeShipping ? 0 : 9.95;
  const pointsDiscount = selectedReward?.type === 'FIXED_DISCOUNT' ? (selectedReward.discountAmount ?? 0) : 0;
  const total = Math.max(0, subtotal + shippingCost - pointsDiscount);

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <CheckCircle size={64} className="text-emerald-400 mx-auto mb-6" />
        </motion.div>
        <h1 className="font-display font-bold text-white text-3xl mb-3">Order Confirmed!</h1>
        <p className="text-dark-400 mb-4">Thank you for shopping with Heart of the Cards. Your order has been placed and will be dispatched soon.</p>
        {pointsEarnedPreview > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-medium px-4 py-2 rounded-full mb-6"
          >
            <Star size={14} className="fill-gold-400" />
            +{pointsEarnedPreview} points earned on this order!
          </motion.div>
        )}
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/orders')} className="btn-primary w-full">View My Orders</button>
          <button onClick={() => navigate('/rewards')} className="btn-secondary w-full flex items-center justify-center gap-2">
            <Star size={16} /> View My Rewards
          </button>
          <button onClick={() => navigate('/products')} className="text-dark-400 hover:text-dark-300 text-sm transition-colors">Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="section-title mb-8">Checkout</h1>

      {/* Progress */}
      <div className="flex items-center gap-4 mb-8">
        {['address', 'payment'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className={`flex-1 h-px w-12 ${step === 'payment' ? 'bg-gold-500' : 'bg-dark-700'}`} />}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step === s ? 'bg-gold-500 text-dark-950' :
              (i === 0 && step === 'payment') ? 'bg-emerald-500 text-white' : 'bg-dark-700 text-dark-400'
            }`}>
              {i === 0 && step === 'payment' ? <CheckCircle size={16} /> : i + 1}
            </div>
            <span className={`text-sm font-medium capitalize hidden sm:block ${step === s ? 'text-white' : 'text-dark-500'}`}>{s}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {step === 'address' && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="card p-5">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-gold-400" /> Delivery Address
                </h2>

                {/* Saved Addresses */}
                {addresses && addresses.length > 0 && !showNewAddress && (
                  <div className="space-y-3 mb-4">
                    {addresses.map((addr: Address) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-gold-500 bg-gold-500/5'
                            : 'border-dark-700 hover:border-dark-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 accent-gold-500"
                        />
                        <div className="text-sm">
                          <p className="text-white font-medium">{addr.fullName}</p>
                          <p className="text-dark-400">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                          <p className="text-dark-400">{addr.suburb} {addr.state} {addr.postcode}</p>
                          <p className="text-dark-400">{addr.phone}</p>
                          {addr.isDefault && <span className="text-gold-400 text-xs">Default address</span>}
                        </div>
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowNewAddress(true)}
                      className="flex items-center gap-2 text-gold-400 hover:text-gold-300 text-sm font-medium transition-colors"
                    >
                      <Plus size={16} /> Add new address
                    </button>
                  </div>
                )}

                {/* New Address Form */}
                {showNewAddress && (
                  <form onSubmit={handleSubmit(handleSaveAddress)} className="space-y-4">
                    <div>
                      <label className="label">Full Name</label>
                      <input {...register('fullName')} className="input-field" placeholder="John Smith" />
                      {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
                    </div>
                    <div>
                      <label className="label">Address Line 1</label>
                      <input {...register('line1')} className="input-field" placeholder="123 Collins Street" />
                      {errors.line1 && <p className="text-red-400 text-xs mt-1">{errors.line1.message}</p>}
                    </div>
                    <div>
                      <label className="label">Address Line 2 (optional)</label>
                      <input {...register('line2')} className="input-field" placeholder="Unit 4" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Suburb</label>
                        <input {...register('suburb')} className="input-field" placeholder="Melbourne" />
                        {errors.suburb && <p className="text-red-400 text-xs mt-1">{errors.suburb.message}</p>}
                      </div>
                      <div>
                        <label className="label">State</label>
                        <select {...register('state')} className="input-field">
                          {AU_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Postcode</label>
                        <input {...register('postcode')} className="input-field" placeholder="3000" maxLength={4} />
                        {errors.postcode && <p className="text-red-400 text-xs mt-1">{errors.postcode.message}</p>}
                      </div>
                      <div>
                        <label className="label">Phone</label>
                        <input {...register('phone')} className="input-field" placeholder="0412 345 678" />
                        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                        {isSubmitting ? 'Saving...' : 'Save Address'}
                      </button>
                      {addresses && addresses.length > 0 && (
                        <button type="button" onClick={() => setShowNewAddress(false)} className="btn-secondary">Cancel</button>
                      )}
                    </div>
                  </form>
                )}

                {!showNewAddress && selectedAddressId && loyalty && (
                  <div className="mt-4 space-y-3">
                    {/* Loyalty Rewards */}
                    {loyalty.points > 0 && (
                      <div className="border border-dark-700 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Star size={16} className="text-gold-400" />
                          <span className="text-white text-sm font-medium">Use Rewards Points</span>
                          <span className="text-dark-400 text-xs ml-auto">{loyalty.points.toLocaleString()} pts available</span>
                        </div>
                        {loyalty.availableRewards.length === 0 ? (
                          <p className="text-dark-400 text-xs">Keep shopping to unlock rewards! Next reward at {
                            loyalty.rewards.sort((a: Reward, b: Reward) => a.pointsCost - b.pointsCost)[0]?.pointsCost
                          } pts.</p>
                        ) : (
                          <div className="space-y-2">
                            {loyalty.availableRewards.map((reward: Reward) => (
                              <label
                                key={reward.id}
                                className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                                  selectedRewardId === reward.id
                                    ? 'border-gold-500 bg-gold-500/5'
                                    : 'border-dark-700 hover:border-dark-500'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="reward"
                                  value={reward.id}
                                  checked={selectedRewardId === reward.id}
                                  onChange={() => setSelectedRewardId(reward.id)}
                                  className="accent-gold-500"
                                />
                                <div className="flex-1">
                                  <p className="text-white text-sm font-medium">{reward.name}</p>
                                  <p className="text-dark-400 text-xs">{reward.description}</p>
                                </div>
                                <span className="text-gold-400 text-xs font-medium">{reward.pointsCost} pts</span>
                              </label>
                            ))}
                            {selectedRewardId && (
                              <button
                                type="button"
                                onClick={() => setSelectedRewardId(null)}
                                className="flex items-center gap-1 text-dark-400 hover:text-dark-300 text-xs transition-colors"
                              >
                                <X size={12} /> Remove reward
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <button onClick={handleProceedToPayment} className="btn-primary w-full">
                      Continue to Payment
                    </button>
                  </div>
                )}

                {!showNewAddress && selectedAddressId && !loyalty && (
                  <button onClick={handleProceedToPayment} className="btn-primary w-full mt-4">
                    Continue to Payment
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {step === 'payment' && paypalOrderId && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="card p-5">
                <h2 className="text-white font-semibold mb-4">Payment</h2>
                <p className="text-dark-400 text-sm mb-4">Complete your payment securely with PayPal.</p>
                <PayPalScriptProvider options={{
                  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test',
                  currency: 'AUD',
                }}>
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
                    createOrder={() => Promise.resolve(paypalOrderId)}
                    onApprove={handlePayPalApprove}
                    onError={(err) => { console.error(err); toast.error('Payment failed. Please try again.'); }}
                  />
                </PayPalScriptProvider>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Summary */}
        <div className="card p-5 space-y-4 h-fit sticky top-24">
          <h2 className="text-white font-semibold">Order Summary</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {displayCart?.items.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <img src={item.product.imageUrls[0]} alt="" className="w-10 h-12 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs line-clamp-1">{item.product.name}</p>
                  <p className="text-dark-400 text-xs">×{item.quantity}</p>
                </div>
                <span className="text-white text-xs font-medium">A${(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dark-700 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-dark-400">Subtotal</span>
              <span className="text-white">A${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-400">Shipping</span>
              <span className={shippingCost === 0 ? 'text-emerald-400' : 'text-white'}>
                {shippingCost === 0 ? 'FREE' : `A$${shippingCost.toFixed(2)}`}
              </span>
            </div>
            {selectedReward && pointsDiscount > 0 && (
              <div className="flex justify-between text-gold-400">
                <span className="flex items-center gap-1"><Gift size={12} /> {selectedReward.name}</span>
                <span>-A${pointsDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-1 border-t border-dark-700">
              <span className="text-white">Total</span>
              <span className="text-gold-400">A${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Points preview */}
          <div className="flex items-center gap-1.5 bg-gold-500/5 border border-gold-500/10 rounded-lg px-3 py-2">
            <Star size={12} className="text-gold-400" />
            <span className="text-gold-400 text-xs">
              Earn ~{Math.floor(subtotal)} points on this order
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
