import { motion } from 'framer-motion';
import { ShieldCheck, Truck, RotateCcw, Heart, Package, Star } from 'lucide-react';

const badges = [
  {
    icon: ShieldCheck,
    title: '100% Authentic',
    description: 'All products are genuine and sourced directly from authorised distributors',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Truck,
    title: 'Fast Australian Shipping',
    description: 'Orders dispatched same day (weekdays). Free shipping on orders over $150',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Package,
    title: 'Secure Packaging',
    description: 'Every order carefully packed to ensure your cards arrive in perfect condition',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    icon: Heart,
    title: 'Australian Owned',
    description: 'Proudly Australian owned and operated — supporting the local TCG community',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
];

export const TrustBadges = () => {
  return (
    <section className="py-12 bg-dark-900 border-y border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map(({ icon: Icon, title, description, color, bg, border }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`${bg} border ${border} rounded-xl p-4`}
            >
              <Icon size={24} className={`${color} mb-3`} />
              <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
              <p className="text-dark-400 text-xs leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
