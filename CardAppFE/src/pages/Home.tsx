import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { HeroBanner } from '../components/home/HeroBanner';
import { TrustBadges } from '../components/home/TrustBadges';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { productsService } from '../services/products.service';
import { ProductGrid } from '../components/products/ProductGrid';

const CategoryCard = ({ to, title, subtitle, color, emoji }: { to: string; title: string; subtitle: string; color: string; emoji: string }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={`${color} rounded-2xl p-6 border cursor-pointer transition-shadow hover:shadow-2xl h-48 flex flex-col justify-between overflow-hidden relative`}
    >
      <div className="absolute top-3 right-3 text-4xl opacity-30">{emoji}</div>
      <div>
        <h3 className="text-white font-display font-bold text-xl mb-1">{title}</h3>
        <p className="text-white/60 text-sm">{subtitle}</p>
      </div>
      <div className="flex items-center gap-1 text-white/70 text-sm font-medium">
        Shop Now <ArrowRight size={14} />
      </div>
    </motion.div>
  </Link>
);

export const Home = () => {
  const { data: pokemonProducts, isLoading: pokemonLoading } = useQuery({
    queryKey: ['pokemon-products'],
    queryFn: () => productsService.getAll({ brand: 'POKEMON', limit: 4 }),
  });

  const { data: onePieceProducts, isLoading: onePieceLoading } = useQuery({
    queryKey: ['onepiece-products'],
    queryFn: () => productsService.getAll({ brand: 'ONE_PIECE', limit: 4 }),
  });

  return (
    <div>
      <HeroBanner />
      <TrustBadges />

      {/* Category Showcase */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-gold-400 text-sm font-medium mb-2">Browse by franchise</p>
            <h2 className="section-title">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CategoryCard
              to="/products?brand=POKEMON"
              title="Pokémon"
              subtitle="Booster boxes & singles"
              color="bg-gradient-to-br from-yellow-600/40 to-orange-700/30 border-yellow-600/30"
              emoji="⚡"
            />
            <CategoryCard
              to="/products?brand=ONE_PIECE"
              title="One Piece"
              subtitle="Latest sets & leaders"
              color="bg-gradient-to-br from-red-700/40 to-red-900/30 border-red-700/30"
              emoji="🏴‍☠️"
            />
            <CategoryCard
              to="/products?productType=BOOSTER_BOX"
              title="Booster Boxes"
              subtitle="36-pack sealed displays"
              color="bg-gradient-to-br from-purple-700/40 to-purple-900/30 border-purple-700/30"
              emoji="📦"
            />
            <CategoryCard
              to="/products?productType=INDIVIDUAL_CARD"
              title="Single Cards"
              subtitle="Rare & promo singles"
              color="bg-gradient-to-br from-emerald-700/40 to-emerald-900/30 border-emerald-700/30"
              emoji="🃏"
            />
          </div>
        </div>
      </section>

      <FeaturedProducts />

      {/* Pokémon Section */}
      <section className="py-14 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-yellow-400 text-sm font-medium mb-1">⚡ Gotta catch 'em all</p>
              <h2 className="section-title">Pokémon TCG</h2>
            </div>
            <Link to="/products?brand=POKEMON" className="text-gold-400 hover:text-gold-300 text-sm font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <ProductGrid products={pokemonProducts?.data} isLoading={pokemonLoading} />
        </div>
      </section>

      {/* One Piece Section */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-red-400 text-sm font-medium mb-1">🏴‍☠️ Set sail for the Grand Line</p>
              <h2 className="section-title">One Piece TCG</h2>
            </div>
            <Link to="/products?brand=ONE_PIECE" className="text-gold-400 hover:text-gold-300 text-sm font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <ProductGrid products={onePieceProducts?.data} isLoading={onePieceLoading} />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-gold-900/30 via-dark-900 to-gold-900/20 border-y border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title mb-4">
              Ready to Start Your <span className="gold-text">Collection</span>?
            </h2>
            <p className="text-dark-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of Australian collectors and competitive players who trust Heart of the Cards for their TCG needs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/products" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                Shop All Products <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn-secondary text-lg px-8 py-4">
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
