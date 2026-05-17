import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Menu, X, Search, ChevronDown, LogOut, Package, Settings, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore, cartItemCount } from '../../store/cartStore';

export const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin, clearAuth } = useAuthStore();
  const { cart, toggleCart } = useCartStore();
  const itemCount = cartItemCount(cart);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    clearAuth();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-dark-950/95 backdrop-blur-sm border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
              <span className="text-dark-950 font-display font-bold text-sm">H</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-white text-lg leading-none">Heart of the</span>
              <span className="font-display font-bold text-gold-400 text-lg leading-none ml-1">Cards</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">
              All Products
            </Link>
            <Link to="/products?brand=POKEMON" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">
              Pokémon
            </Link>
            <Link to="/products?brand=ONE_PIECE" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">
              One Piece
            </Link>
            <Link to="/products?productType=INDIVIDUAL_CARD" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">
              Single Cards
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <AnimatePresence>
              {searchOpen ? (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={handleSearch}
                  className="overflow-hidden"
                >
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cards..."
                    className="w-full bg-dark-800 border border-dark-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-gold-500"
                    onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                  />
                </motion.form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-dark-300 hover:text-white transition-colors"
                  aria-label="Search"
                >
                  <Search size={20} />
                </button>
              )}
            </AnimatePresence>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-dark-300 hover:text-white transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-gold-500 text-dark-950 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
                    <span className="text-gold-400 text-xs font-bold">
                      {user?.firstName?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-1 w-48 bg-dark-800 border border-dark-600 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-dark-700">
                        <p className="text-white text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-dark-400 text-xs truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-700 text-sm transition-colors">
                          <User size={14} /> My Account
                        </Link>
                        <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-700 text-sm transition-colors">
                          <Package size={14} /> My Orders
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-gold-400 hover:text-gold-300 hover:bg-dark-700 text-sm transition-colors">
                            <Shield size={14} /> Admin Panel
                          </Link>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-dark-700 text-sm transition-colors">
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-dark-300 hover:text-white transition-colors px-3 py-1.5">
                <User size={16} /> Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-dark-300 hover:text-white"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-dark-800 overflow-hidden"
            >
              <div className="py-3 space-y-1">
                {[
                  { to: '/products', label: 'All Products' },
                  { to: '/products?brand=POKEMON', label: 'Pokémon' },
                  { to: '/products?brand=ONE_PIECE', label: 'One Piece' },
                  { to: '/products?productType=INDIVIDUAL_CARD', label: 'Single Cards' },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-dark-300 hover:text-white text-sm font-medium transition-colors"
                  >
                    {label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-gold-400 text-sm font-medium">
                    Sign In / Register
                  </Link>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
