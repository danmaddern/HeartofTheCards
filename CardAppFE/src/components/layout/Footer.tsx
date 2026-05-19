import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, Clock } from 'lucide-react';
import { LogoMark } from '../ui/LogoMark';

export const Footer = () => (
  <footer className="bg-dark-950 border-t border-dark-800/60 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

        {/* Brand column */}
        <div className="lg:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
            <LogoMark size={30} id="footer-logo" />
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-base text-white tracking-tight">
                Heart of the <span className="text-gold-400">Cards</span>
              </span>
              <span className="text-[9px] text-dark-500 font-medium tracking-[0.18em] uppercase mt-0.5">
                Australia's TCG Store
              </span>
            </div>
          </Link>

          <p className="text-dark-400 text-xs leading-relaxed mb-5 max-w-[220px]">
            Premium Pokémon and One Piece TCG products, shipped across Australia.
            Your trusted source for trading card game excellence.
          </p>

          <div className="flex items-center gap-2 text-dark-500 text-xs">
            <Heart size={12} className="text-red-500 fill-red-500 flex-shrink-0" />
            <span>Australian Owned &amp; Operated</span>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-5">Shop</h4>
          <ul className="space-y-2.5">
            {[
              { to: '/products?brand=POKEMON',           label: 'Pokémon Products' },
              { to: '/products?brand=ONE_PIECE',          label: 'One Piece Products' },
              { to: '/products?productType=BOOSTER_BOX',  label: 'Booster Boxes' },
              { to: '/products?productType=INDIVIDUAL_CARD', label: 'Single Cards' },
              { to: '/products?featured=true',            label: 'Featured Items' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="text-dark-400 hover:text-gold-400 text-sm transition-colors duration-150">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-5">Account</h4>
          <ul className="space-y-2.5">
            {[
              { to: '/login',    label: 'Sign In' },
              { to: '/register', label: 'Create Account' },
              { to: '/orders',   label: 'My Orders' },
              { to: '/rewards',  label: 'My Rewards' },
              { to: '/account',  label: 'Account Settings' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="text-dark-400 hover:text-gold-400 text-sm transition-colors duration-150">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-5">Contact</h4>
          <ul className="space-y-3.5">
            <li className="flex items-start gap-2.5 text-dark-400 text-sm">
              <Mail size={13} className="mt-0.5 text-gold-500 flex-shrink-0" />
              <a href="mailto:support@heartofthecards.com.au" className="hover:text-gold-400 transition-colors text-xs leading-relaxed">
                support@heartofthecards.com.au
              </a>
            </li>
            <li className="flex items-start gap-2.5 text-dark-400 text-xs">
              <MapPin size={13} className="mt-0.5 text-gold-500 flex-shrink-0" />
              <span>Australia-wide shipping</span>
            </li>
            <li className="flex items-start gap-2.5 text-dark-400 text-xs">
              <Clock size={13} className="mt-0.5 text-gold-500 flex-shrink-0" />
              <span>Orders dispatched Mon – Fri</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="pt-8 border-t border-dark-800/60 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-dark-600 text-xs">
          © {new Date().getFullYear()} heartofthecards.com.au — All rights reserved.
        </p>
        <div className="flex items-center gap-3">
          <span className="text-dark-600 text-xs">Secure payments via</span>
          <div className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-1.5">
            <span className="text-[#009CDE] font-extrabold text-xs tracking-tight">Pay</span>
            <span className="text-[#012169] font-extrabold text-xs tracking-tight">Pal</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);
