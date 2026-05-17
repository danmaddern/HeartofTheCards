import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Package, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { Order } from '../../types';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

const StatCard = ({ icon: Icon, label, value, color, subtext }: any) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="card p-5 flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-dark-400 text-sm">{label}</p>
      <p className="text-white font-bold text-2xl">{value}</p>
      {subtext && <p className="text-dark-500 text-xs mt-0.5">{subtext}</p>}
    </div>
  </motion.div>
);

const statusColors: Record<string, string> = {
  PENDING: 'bg-blue-500/10 text-blue-400',
  PAID: 'bg-emerald-500/10 text-emerald-400',
  PROCESSING: 'bg-blue-500/10 text-blue-400',
  SHIPPED: 'bg-gold-500/10 text-gold-400',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400',
  CANCELLED: 'bg-red-500/10 text-red-400',
  REFUNDED: 'bg-red-500/10 text-red-400',
};

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminService.getDashboard,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <LoadingSkeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Dashboard</h1>
        <span className="text-dark-400 text-sm">Last updated: {new Date().toLocaleTimeString()}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`A$${Number(stats?.totalRevenue || 0).toLocaleString('en-AU', { minimumFractionDigits: 2 })}`}
          color="bg-emerald-500/20 text-emerald-400"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={stats?.totalOrders || 0}
          color="bg-blue-500/20 text-blue-400"
        />
        <StatCard
          icon={Package}
          label="Active Products"
          value={stats?.totalProducts || 0}
          color="bg-purple-500/20 text-purple-400"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={stats?.lowStockProducts || 0}
          color={`${(stats?.lowStockProducts || 0) > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-dark-700 text-dark-400'}`}
          subtext="≤10 units"
        />
      </div>

      {/* Order Status Breakdown */}
      {stats?.ordersByStatus && (
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-gold-400" /> Orders by Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div key={status} className={`rounded-xl p-3 ${statusColors[status] || 'bg-dark-700 text-dark-300'}`}>
                <p className="font-bold text-2xl">{count as number}</p>
                <p className="text-sm opacity-80 font-medium">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Recent Orders</h2>
          <Link to="/admin/orders" className="text-gold-400 hover:text-gold-300 text-sm flex items-center gap-1 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {stats?.recentOrders?.map((order: Order & { user?: any }) => (
            <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-dark-800 last:border-0">
              <div>
                <p className="text-white text-sm font-medium">{order.orderNumber}</p>
                <p className="text-dark-400 text-xs">
                  {(order as any).user?.email || 'N/A'} · {new Date(order.createdAt).toLocaleDateString('en-AU')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gold-400 font-medium text-sm">A${Number(order.total).toFixed(2)}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded ${statusColors[order.status] || ''}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
