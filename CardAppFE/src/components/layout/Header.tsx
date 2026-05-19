import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Menu, X, Search, ChevronDown, LogOut, Package, Shield, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useCartStore, cartItemCount } from '../../store/cartStore';
import { loyaltyService } from '../../services/loyalty.service';
import { LogoMark } from '../ui/LogoMark';

export const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin, clearAuth } = useAuthStore();
  const { cart, toggleCart } = useCartStore();
  const itemCount = cartItemCount(cart);

  const { data: loyalty } = useQuery({
    queryKey: ['loyalty-balance'],
    queryFn: loyaltyService.getBalance,
    enabled: isAuthenticated,
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

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
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-dark-950/98 backdrop-blur-md shadow-lg shadow-dark-950/20 border-b border-dark-800/80'
        : 'bg-dark-950 border-b border-dark-800/60'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="transition-transform duration-300 group-hover:scale-105">
              <LogoMark size={32} id="header-logo" />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-display font-bold text-[17px] text-white tracking-tight leading-tight">
                Heart of the <span className="text-gold-400">Cards</span>
              </span>
              <span className="text-[9px] text-dark-400 font-medium tracking-[0.2em] uppercase mt-0.5">
                Australia's TCG Store
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: '/products', label: 'All Products' },
              { to: '/products?brand=POKEMON', label: 'Pokémon' },
              { to: '/products?brand=ONE_PIECE', label: 'One Piece' },
              { to: '/products?productType=INDIVIDUAL_CARD', label: 'Singles' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="relative px-3.5 py-2 text-dark-300 hover:text-white text-sm font-medium transition-colors duration-200 rounded-lg hover:bg-dark-800/60 group"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">

            {/* Search */}
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <motion.form
                  key="search-open"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSearch}
                  className="overflow-hidden"
                >
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cards..."
                    className="w-full bg-dark-800 border border-dark-600 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/20 placeholder-dark-400"
                    onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                  />
                </motion.form>
              ) : (
                <motion.button
                  key="search-closed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 text-dark-400 hover:text-white hover:bg-dark-800/60 rounded-xl transition-all duration-200"
                  aria-label="Search"
                >
                  <Search size={18} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 text-dark-400 hover:text-white hover:bg-dark-800/60 rounded-xl transition-all duration-200"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-gold-300 to-gold-500 text-dark-950 text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center leading-none px-1"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-dark-300 hover:text-white hover:bg-dark-800/60 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-400/30 to-gold-600/20 border border-gold-500/40 flex items-center justify-center">
                    <span className="text-gold-300 text-xs font-bold">
                      {user?.firstName?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown size={13} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1.5 w-52 bg-dark-800/95 backdrop-blur-md border border-dark-600/80 rounded-2xl shadow-2xl shadow-dark-950/60 overflow-hidden z-50"
                    >
                      {/* User info */}
                      <div className="px-4 py-3.5 border-b border-dark-700/60">
                        <p className="text-white text-sm font-semibold leading-tight">{user?.firstName} {user?.lastName}</p>
                        <p className="text-dark-400 text-xs truncate mt-0.5">{user?.email}</p>
                        {loyalty !== undefined && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <Star size={11} className="text-gold-400 fill-gold-400 flex-shrink-0" />
                            <span className="text-gold-400 text-xs font-semibold">{loyalty.points.toLocaleString()} pts</span>
                            {loyalty.availableRewards.length > 0 && (
                              <span className="bg-gold-400/15 text-gold-400 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                                {loyalty.availableRewards.length} reward{loyalty.availableRewards.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Nav items */}
                      <div className="py-1.5">
                        {[
                          { to: '/account',  icon: User,    label: 'My Account' },
                          { to: '/orders',   icon: Package, label: 'My Orders' },
                          { to: '/rewards',  icon: Star,    label: 'My Rewards' },
                        ].map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-dark-300 hover:text-white hover:bg-dark-700/60 text-sm transition-all duration-150"
                          >
                            <Icon size={14} className="flex-shrink-0" />
                            {label}
                          </Link>
                        ))}

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-gold-400 hover:text-gold-300 hover:bg-dark-700/60 text-sm transition-all duration-150"
                          >
                            <Shield size={14} className="flex-shrink-0" />
                            Admin Panel
                          </Link>
                        )}

                        <div className="my-1 mx-3 border-t border-dark-700/40" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-400/80 hover:text-red-400 hover:bg-dark-700/60 text-sm transition-all duration-150"
                        >
                          <LogOut size={14} className="flex-shrink-0" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-dark-400 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-dark-800/60"
              >
                <User size={15} /> Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 text-dark-400 hover:text-white hover:bg-dark-800/60 rounded-xl transition-all duration-200"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-dark-800/60 overflow-hidden"
            >
              <div className="py-3 space-y-0.5">
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
                    className="block px-4 py-2.5 text-dark-300 hover:text-white hover:bg-dark-800/60 text-sm font-medium rounded-xl transition-all"
                  >
                    {label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-gold-400 text-sm font-medium"
                  >
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
