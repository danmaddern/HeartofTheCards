import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck } from 'lucide-react';

const STAT_ITEMS = [
  { icon: ShieldCheck,  text: '100% Authentic' },
  { icon: Truck,        text: 'Australia-wide' },
  { icon: Sparkles,     text: 'New Sets Weekly' },
];

export const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden bg-dark-950 min-h-[560px] flex items-center">

      {/* — Background layers — */}
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Gold radial glow — center-left */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 65%)' }}
      />
      {/* Red accent glow — bottom-right */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(193,18,31,0.06) 0%, transparent 60%)' }}
      />

      {/* — Content — */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 w-full">
        <div className="max-w-2xl">

          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/25 text-gold-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-7 tracking-wide uppercase">
              <Sparkles size={12} className="fill-gold-400" />
              Australia's Premier TCG Store
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-display font-bold text-white leading-[1.1] tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 3.75rem)' }}
          >
            Your Journey to
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500">
              Card Mastery
            </span>
            Begins Here
          </motion.h1>

          {/* Sub-copy */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-dark-300 text-base sm:text-lg leading-relaxed mb-9 max-w-xl"
          >
            Premium Pokémon &amp; One Piece TCG products, shipped across Australia.
            From sealed booster boxes to rare singles — build your collection today.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-wrap gap-3 mb-12"
          >
            <Link
              to="/products?brand=POKEMON"
              className="inline-flex items-center gap-2 bg-gradient-to-b from-gold-300 to-gold-400 hover:from-gold-200 hover:to-gold-300 text-dark-950 font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-gold-500/20 transition-all duration-200 active:scale-95"
            >
              Shop Pokémon <ArrowRight size={15} />
            </Link>
            <Link
              to="/products?brand=ONE_PIECE"
              className="inline-flex items-center gap-2 bg-dark-800 hover:bg-dark-700 text-white font-semibold text-sm px-6 py-3 rounded-xl border border-dark-600/80 hover:border-dark-500 transition-all duration-200 active:scale-95"
            >
              Shop One Piece <ArrowRight size={15} />
            </Link>
          </motion.div>

          {/* Trust stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.36 }}
            className="flex flex-wrap items-center gap-x-7 gap-y-2"
          >
            {STAT_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-dark-400 text-sm">
                <Icon size={14} className="text-gold-500 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* — Floating cards — */}
        <div className="absolute right-0 top-0 bottom-0 w-[38%] hidden lg:flex items-center justify-end pr-10">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-72 h-[340px]"
          >
            {/* Back card — One Piece */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 right-12 w-52 h-72 rounded-2xl overflow-hidden shadow-2xl border border-crimson-500/20"
              style={{ transform: 'rotate(7deg)' }}
            >
              <img
                src="/products/op-07.jpg"
                alt="One Piece Booster Box"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950/30 to-transparent" />
            </motion.div>

            {/* Front card — Pokémon */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-10 right-0 w-52 h-72 rounded-2xl overflow-hidden shadow-2xl border border-gold-400/25"
              style={{ transform: 'rotate(-3deg)' }}
            >
              <img
                src="/products/pkm-prismatic-evolutions.png"
                alt="Pokémon Prismatic Evolutions"
                className="w-full h-full object-contain bg-gradient-to-br from-dark-800 to-dark-900 p-2"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950/20 to-transparent" />
            </motion.div>

            {/* Glow beneath cards */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-16 rounded-full pointer-events-none blur-2xl opacity-50"
              style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.35), transparent)' }}
            />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade to page bg */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-dark-700/40 to-transparent" />
    </section>
  );
};
