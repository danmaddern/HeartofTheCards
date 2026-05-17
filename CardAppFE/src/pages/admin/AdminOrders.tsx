import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ordersService } from '../../services/orders.service';
import { Order } from '../../types';
import { handleApiError } from '../../lib/api';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

const ORDER_STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const statusColors: Record<string, string> = {
  PENDING: 'bg-blue-500/10 text-blue-400',
  PAID: 'bg-emerald-500/10 text-emerald-400',
  PROCESSING: 'bg-blue-500/10 text-blue-400',
  SHIPPED: 'bg-gold-500/10 text-gold-400',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400',
  CANCELLED: 'bg-red-500/10 text-red-400',
  REFUNDED: 'bg-red-500/10 text-red-400',
};

export const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, filterStatus],
    queryFn: () => ordersService.getAllAdmin(page, 20, filterStatus || undefined),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated');
    },
    onError: handleApiError,
  });

  return (
    <div className="space-y-5">
      <h1 className="section-title">Orders</h1>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="input-field w-auto"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {data && <span className="text-dark-400 text-sm">{data.total} orders</span>}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left text-dark-400 font-medium px-4 py-3">Order</th>
                <th className="text-left text-dark-400 font-medium px-4 py-3 hidden sm:table-cell">Customer</th>
                <th className="text-left text-dark-400 font-medium px-4 py-3 hidden md:table-cell">Date</th>
                <th className="text-left text-dark-400 font-medium px-4 py-3">Total</th>
                <th className="text-left text-dark-400 font-medium px-4 py-3">Status</th>
                <th className="text-right text-dark-400 font-medium px-4 py-3">Update</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-dark-800">
                    <td className="px-4 py-3" colSpan={6}><div className="h-8 skeleton rounded" /></td>
                  </tr>
                ))
              ) : data?.data.map((order: Order & { user?: any }) => (
                <tr key={order.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{order.orderNumber}</p>
                    <p className="text-dark-500 text-xs">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-white text-xs">{order.user?.email || 'N/A'}</p>
                    <p className="text-dark-500 text-xs">{order.user?.firstName} {order.user?.lastName}</p>
                  </td>
                  <td className="px-4 py-3 text-dark-400 hidden md:table-cell text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-AU')}
                  </td>
                  <td className="px-4 py-3 text-gold-400 font-medium">A${Number(order.total).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <select
                      value={order.status}
                      onChange={e => updateMut.mutate({ id: order.id, status: e.target.value })}
                      disabled={updateMut.isPending}
                      className="text-xs bg-dark-700 border border-dark-600 text-white rounded px-2 py-1 focus:outline-none focus:border-gold-500"
                    >
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-2 px-4 disabled:opacity-40 text-sm">Prev</button>
          <span className="flex items-center px-3 text-dark-400 text-sm">{page} / {data.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === data.totalPages} className="btn-secondary py-2 px-4 disabled:opacity-40 text-sm">Next</button>
        </div>
      )}
    </div>
  );
};
