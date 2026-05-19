import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, BarChart3, ChevronRight, Warehouse, Star } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/loyalty', label: 'Loyalty', icon: Star },
];

export const AdminLayout = () => {
  const { isAdmin } = useAuthStore();
  const { pathname } = useLocation();

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 hidden md:block">
          <div className="card p-3 sticky top-24">
            <p className="text-dark-500 text-xs font-medium uppercase tracking-wider px-2 mb-2">Admin Panel</p>
            {adminNav.map(({ to, label, icon: Icon, exact }) => {
              const active = exact ? pathname === to : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                      : 'text-dark-300 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                  {active && <ChevronRight size={12} className="ml-auto" />}
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Mobile Nav */}
        <div className="md:hidden flex gap-2 mb-4 overflow-x-auto w-full">
          {adminNav.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  active ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 'bg-dark-800 text-dark-300 hover:text-white'
                }`}
              >
                <Icon size={14} /> {label}
              </Link>
            );
          })}
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
