import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronDown, ChevronRight } from 'lucide-react';
import { ordersService } from '../services/orders.service';
import { Order } from '../types';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

const statusColors: Record<string, string> = {
  PENDING: 'badge-blue',
  PAID: 'badge-green',
  PROCESSING: 'badge-blue',
  SHIPPED: 'badge-gold',
  DELIVERED: 'badge-green',
  CANCELLED: 'badge-red',
  REFUNDED: 'badge-red',
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={statusColors[status] || 'badge-blue'}>{status}</span>
);

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
            <button
              className="w-full p-5 flex items-center justify-between hover:bg-dark-700/30 transition-colors"
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            >
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <p className="text-white font-semibold">{order.orderNumber}</p>
                  <p className="text-dark-400 text-xs mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-gold-400 font-bold">A${Number(order.total).toFixed(2)}</p>
                  <p className="text-dark-400 text-xs">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                </div>
                {expandedOrder === order.id ? <ChevronDown size={18} className="text-dark-400" /> : <ChevronRight size={18} className="text-dark-400" />}
              </div>
            </button>

            {expandedOrder === order.id && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="border-t border-dark-700 overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-white">{item.productName}</p>
                          <p className="text-dark-400">×{item.quantity} @ A${Number(item.unitPrice).toFixed(2)}</p>
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
                    <div className="flex justify-between font-semibold text-base">
                      <span className="text-white">Total</span>
                      <span className="text-gold-400">A${Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Address */}
                  {order.deliveryAddress && (
                    <div className="text-sm bg-dark-900 rounded-xl p-3">
                      <p className="text-dark-400 mb-1 font-medium">Delivery Address</p>
                      <p className="text-white">{order.deliveryAddress.fullName}</p>
                      <p className="text-dark-300">{order.deliveryAddress.line1}</p>
                      <p className="text-dark-300">{order.deliveryAddress.suburb} {order.deliveryAddress.state} {order.deliveryAddress.postcode}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
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
