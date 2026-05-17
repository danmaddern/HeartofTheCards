import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Truck } from 'lucide-react';

export const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden bg-dark-950 min-h-[520px] flex items-center">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.03)_0%,_transparent_70%)]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
              <Sparkles size={14} className="fill-gold-400" />
              Australia's Premier TCG Store
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-tight">
              Your Journey to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500">
                Card Mastery
              </span>
              Begins Here
            </h1>

            <p className="text-dark-300 text-lg sm:text-xl mb-8 leading-relaxed">
              Premium Pokémon and One Piece TCG products, shipped across Australia.
              From sealed booster boxes to rare singles — build your collection today.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/products?brand=POKEMON" className="btn-primary flex items-center gap-2">
                Shop Pokémon
                <ArrowRight size={16} />
              </Link>
              <Link to="/products?brand=ONE_PIECE" className="btn-secondary flex items-center gap-2">
                Shop One Piece
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              {[
                { icon: Shield, text: 'Authentic Products' },
                { icon: Truck, text: 'Australia-wide Shipping' },
                { icon: Sparkles, text: 'New Sets Weekly' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-dark-400 text-sm">
                  <Icon size={15} className="text-gold-500" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating card previews */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:flex items-center justify-end pr-8">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative w-64 h-80"
          >
            <div className="absolute top-0 right-8 w-44 h-60 bg-gradient-to-br from-yellow-400/20 to-orange-500/10 rounded-xl border border-yellow-500/20 transform rotate-6 shadow-2xl" />
            <div className="absolute top-4 right-4 w-44 h-60 bg-gradient-to-br from-red-500/20 to-red-800/10 rounded-xl border border-red-500/20 transform rotate-2 shadow-2xl" />
            <div className="absolute top-8 right-0 w-44 h-60 bg-gradient-to-br from-gold-400/20 to-amber-600/10 rounded-xl border border-gold-500/30 transform -rotate-1 shadow-2xl flex items-center justify-center">
              <div className="text-center">
                <p className="font-display text-gold-400 font-bold text-lg">🃏</p>
                <p className="text-gold-300 text-xs font-medium mt-1">New Arrivals</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
