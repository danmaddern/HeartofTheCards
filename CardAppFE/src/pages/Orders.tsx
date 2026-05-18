import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronDown, ChevronRight, CheckCircle, Circle, Clock, Truck, Star, XCircle } from 'lucide-react';
import { ordersService } from '../services/orders.service';
import { Order } from '../types';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

const STATUS_STEPS = [
  { key: 'PAID',       label: 'Order Placed',  icon: CheckCircle },
  { key: 'PROCESSING', label: 'Processing',     icon: Clock },
  { key: 'SHIPPED',    label: 'In Transit',     icon: Truck },
  { key: 'DELIVERED',  label: 'Delivered',      icon: Star },
];

const STATUS_ORDER = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const CANCELLED_STATUSES = ['CANCELLED', 'REFUNDED'];

const STATUS_LABELS: Record<string, string> = {
  PENDING:    'Pending Payment',
  PAID:       'Order Placed',
  PROCESSING: 'Processing',
  SHIPPED:    'In Transit',
  DELIVERED:  'Delivered',
  CANCELLED:  'Cancelled',
  REFUNDED:   'Refunded',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PAID:       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  SHIPPED:    'bg-gold-500/10 text-gold-400 border-gold-500/20',
  DELIVERED:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED:  'bg-red-500/10 text-red-400 border-red-500/20',
  REFUNDED:   'bg-red-500/10 text-red-400 border-red-500/20',
};

const OrderProgressTracker = ({ status }: { status: string }) => {
  if (CANCELLED_STATUSES.includes(status)) {
    return (
      <div className="flex items-center gap-2 py-3">
        <XCircle size={18} className="text-red-400" />
        <span className="text-red-400 text-sm font-medium">{STATUS_LABELS[status]}</span>
      </div>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div className="py-3">
      <div className="flex items-center">
        {STATUS_STEPS.map((step, i) => {
          const stepIdx = STATUS_ORDER.indexOf(step.key);
          const completed = currentIdx >= stepIdx;
          const active = currentIdx === stepIdx;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    completed
                      ? 'bg-gold-500 border-gold-500 text-dark-950'
                      : 'bg-dark-900 border-dark-600 text-dark-500'
                  } ${active ? 'ring-2 ring-gold-500/30' : ''}`}
                >
                  <Icon size={14} />
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap ${completed ? 'text-gold-400' : 'text-dark-500'}`}>
                  {step.label}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${completed && currentIdx > stepIdx ? 'bg-gold-500' : 'bg-dark-700'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Orders = () => {
  const [page, setPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', page],
    queryFn: () => ordersService.getMyOrders(page),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map(i => <LoadingSkeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Package size={48} className="text-dark-600 mx-auto mb-4" />
        <h1 className="font-display font-bold text-white text-2xl mb-2">No Orders Yet</h1>
        <p className="text-dark-400 mb-8">Once you place an order, it will appear here.</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="section-title mb-8">My Orders</h1>

      <div className="space-y-4">
        {data.data.map((order: Order) => (
          <motion.div key={order.id} layout className="card overflow-hidden">
            {/* Order Header */}
            <button
              className="w-full p-5 flex items-center justify-between hover:bg-dark-700/30 transition-colors"
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-semibold font-mono text-sm">{order.orderNumber}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[order.status] || ''}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-dark-400 text-xs mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-gold-400 font-bold">A${Number(order.total).toFixed(2)}</p>
                  <p className="text-dark-400 text-xs">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                </div>
                {expandedOrder === order.id
                  ? <ChevronDown size={18} className="text-dark-400" />
                  : <ChevronRight size={18} className="text-dark-400" />
                }
              </div>
            </button>

            {/* Progress Tracker — always visible */}
            <div className="px-5 border-t border-dark-800">
              <OrderProgressTracker status={order.status} />
            </div>

            {/* Expanded Detail */}
            <AnimatePresence>
              {expandedOrder === order.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-dark-700 overflow-hidden"
                >
                  <div className="p-5 space-y-4">
                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <div>
                            <p className="text-white">{item.productName}</p>
                            <p className="text-dark-400 text-xs">×{item.quantity} @ A${Number(item.unitPrice).toFixed(2)}</p>
                          </div>
                          <span className="text-white font-medium">A${Number(item.totalPrice).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-dark-700 pt-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-dark-400">Subtotal</span>
                        <span className="text-white">A${Number(order.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">Shipping</span>
                        <span className={Number(order.shippingCost) === 0 ? 'text-emerald-400' : 'text-white'}>
                          {Number(order.shippingCost) === 0 ? 'FREE' : `A$${Number(order.shippingCost).toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-base pt-1">
                        <span className="text-white">Total</span>
                        <span className="text-gold-400">A${Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Address */}
                    {order.deliveryAddress && (
                      <div className="text-sm bg-dark-900 rounded-xl p-4">
                        <p className="text-dark-400 text-xs font-medium uppercase tracking-wider mb-2">Delivering to</p>
                        <p className="text-white font-medium">{order.deliveryAddress.fullName}</p>
                        <p className="text-dark-300 mt-0.5">{order.deliveryAddress.line1}</p>
                        <p className="text-dark-300">{order.deliveryAddress.suburb} {order.deliveryAddress.state} {order.deliveryAddress.postcode}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-2 px-4 disabled:opacity-40">
            Previous
          </button>
          <span className="flex items-center px-4 text-dark-400 text-sm">Page {page} of {data.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === data.totalPages} className="btn-secondary py-2 px-4 disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  );
};
