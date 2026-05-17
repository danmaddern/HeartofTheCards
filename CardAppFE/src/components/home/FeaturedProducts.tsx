import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '../../services/products.service';
import { ProductGrid } from '../products/ProductGrid';

export const FeaturedProducts = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsService.getFeatured(8),
  });

  return (
    <section className="py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-gold-400 text-sm font-medium mb-1">Handpicked for you</p>
            <h2 className="section-title">Featured Products</h2>
          </div>
          <Link to="/products?featured=true" className="text-gold-400 hover:text-gold-300 text-sm font-medium flex items-center gap-1 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </section>
  );
};
