import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Package, Heart } from 'lucide-react';

const badges = [
  {
    icon: ShieldCheck,
    title: '100% Authentic',
    description: 'All products are genuine and sourced directly from authorised distributors',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    icon: Truck,
    title: 'Fast Australian Shipping',
    description: 'Orders dispatched same day (weekdays). Free shipping on orders over $150',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: Package,
    title: 'Secure Packaging',
    description: 'Every order carefully packed to ensure your cards arrive in perfect condition',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    icon: Heart,
    title: 'Australian Owned',
    description: 'Proudly Australian owned and operated — supporting the local TCG community',
    iconColor: 'text-crimson-500',
    iconBg: 'bg-red-50',
    border: 'border-red-100',
  },
];

export const TrustBadges = () => {
  return (
    <section className="py-14 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map(({ icon: Icon, title, description, iconColor, iconBg, border }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white border ${border} rounded-xl p-5 shadow-sm`}
            >
              <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center mb-4`}>
                <Icon size={20} className={iconColor} />
              </div>
              <h3 className="text-dark-900 font-semibold text-sm mb-1.5">{title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
