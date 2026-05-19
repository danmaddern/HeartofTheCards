import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Package, Heart } from 'lucide-react';

const badges = [
  {
    icon: ShieldCheck,
    title: '100% Authentic',
    description: 'All products sourced directly from authorised Australian distributors.',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    accentBorder: 'hover:border-emerald-200',
    accentShadow: 'hover:shadow-emerald-500/5',
  },
  {
    icon: Truck,
    title: 'Fast Dispatch',
    description: 'Same-day dispatch on weekdays. Free tracked shipping on orders over $150.',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
    accentBorder: 'hover:border-blue-200',
    accentShadow: 'hover:shadow-blue-500/5',
  },
  {
    icon: Package,
    title: 'Secure Packaging',
    description: 'Every order carefully packed so your cards arrive in perfect condition.',
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-50',
    accentBorder: 'hover:border-violet-200',
    accentShadow: 'hover:shadow-violet-500/5',
  },
  {
    icon: Heart,
    title: 'Australian Owned',
    description: 'Proudly Australian owned and operated, supporting the local TCG community.',
    iconColor: 'text-crimson-500',
    iconBg: 'bg-red-50',
    accentBorder: 'hover:border-red-200',
    accentShadow: 'hover:shadow-red-500/5',
  },
];

export const TrustBadges = () => (
  <section className="py-16 bg-white border-y border-slate-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10"
      >
        <p className="text-gold-500 text-xs font-bold uppercase tracking-widest mb-2">Why choose us</p>
        <h2 className="text-xl font-display font-semibold text-dark-900">Shop with confidence</h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {badges.map(({ icon: Icon, title, description, iconColor, iconBg, accentBorder, accentShadow }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className={`group relative bg-white rounded-2xl border border-slate-100 p-6 shadow-sm transition-all duration-300 ${accentBorder} hover:shadow-md ${accentShadow} hover:-translate-y-0.5`}
          >
            <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
              <Icon size={20} className={iconColor} />
            </div>
            <h3 className="text-dark-900 font-semibold text-sm mb-2 tracking-tight">{title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed">{description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
