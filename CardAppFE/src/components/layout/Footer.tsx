import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, Clock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-dark-900 border-t border-dark-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
                <span className="text-dark-950 font-display font-bold text-sm">H</span>
              </div>
              <div>
                <span className="font-display font-bold text-white">Heart of the</span>
                <span className="font-display font-bold text-gold-400 ml-1">Cards</span>
              </div>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed mb-4">
              Premium Pokémon and One Piece TCG products, shipped across Australia. Your trusted source for trading card game excellence.
            </p>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <Heart size={14} className="text-red-500 fill-red-500" />
              <span>Australian Owned & Operated</span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              {[
                { to: '/products?brand=POKEMON', label: 'Pokémon Products' },
                { to: '/products?brand=ONE_PIECE', label: 'One Piece Products' },
                { to: '/products?productType=BOOSTER_BOX', label: 'Booster Boxes' },
                { to: '/products?productType=INDIVIDUAL_CARD', label: 'Single Cards' },
                { to: '/products?featured=true', label: 'Featured Items' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-dark-400 hover:text-gold-400 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2">
              {[
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Create Account' },
                { to: '/orders', label: 'My Orders' },
                { to: '/account', label: 'Account Settings' },
                { to: '/cart', label: 'Shopping Cart' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-dark-400 hover:text-gold-400 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-dark-400 text-sm">
                <Mail size={14} className="mt-0.5 text-gold-500 flex-shrink-0" />
                <a href="mailto:support@heartofthecards.com.au" className="hover:text-gold-400 transition-colors">
                  support@heartofthecards.com.au
                </a>
              </li>
              <li className="flex items-start gap-2 text-dark-400 text-sm">
                <MapPin size={14} className="mt-0.5 text-gold-500 flex-shrink-0" />
                <span>Australia-wide shipping</span>
              </li>
              <li className="flex items-start gap-2 text-dark-400 text-sm">
                <Clock size={14} className="mt-0.5 text-gold-500 flex-shrink-0" />
                <span>Orders dispatched Mon-Fri</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-dark-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-dark-500 text-sm">
            © {new Date().getFullYear()} heartofthecards.com.au. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-dark-500 text-xs">Secure payments via</span>
            <div className="flex items-center gap-2">
              <div className="bg-dark-700 rounded px-2 py-1">
                <span className="text-blue-400 font-bold text-xs">PayPal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
