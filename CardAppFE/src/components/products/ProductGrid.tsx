import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products?: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const ProductGrid = ({ products, isLoading, emptyMessage = 'No products found' }: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <LoadingSkeleton className="aspect-[3/4]" />
            <div className="p-3 space-y-2">
              <LoadingSkeleton className="h-3 w-16" />
              <LoadingSkeleton className="h-4 w-full" />
              <LoadingSkeleton className="h-4 w-3/4" />
              <LoadingSkeleton className="h-5 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mb-4">
          <Package size={24} className="text-dark-500" />
        </div>
        <h3 className="text-white font-semibold mb-2">No Products Found</h3>
        <p className="text-dark-400 text-sm max-w-xs">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
