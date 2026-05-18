import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsService, ProductFilters } from '../services/products.service';
import { ProductGrid } from '../components/products/ProductGrid';
import { ProductFiltersPanel } from '../components/products/ProductFilters';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<ProductFilters>({
    brand: searchParams.get('brand') as any || undefined,
    productType: searchParams.get('productType') as any || undefined,
    search: searchParams.get('search') || undefined,
    featured: searchParams.get('featured') === 'true' ? true : undefined,
    page: Number(searchParams.get('page')) || 1,
    limit: 16,
    sort: (searchParams.get('sort') as any) || 'newest',
  });

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, String(v));
    });
    setSearchParams(params, { replace: true });
  }, [filters]);

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsService.getAll(filters),
  });

  const pageTitle = () => {
    if (filters.brand === 'POKEMON') return 'Pokémon Products';
    if (filters.brand === 'ONE_PIECE') return 'One Piece Products';
    if (filters.productType === 'BOOSTER_BOX') return 'Booster Boxes';
    if (filters.productType === 'INDIVIDUAL_CARD') return 'Single Cards';
    if (filters.search) return `Search: "${filters.search}"`;
    if (filters.featured) return 'Featured Products';
    return 'All Products';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">{pageTitle()}</h1>
          {data && (
            <p className="text-slate-500 text-sm mt-1">
              {data.total} product{data.total !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value as any, page: 1 })}
            className="input-field text-sm py-2 w-auto"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="featured">Featured</option>
          </select>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden btn-secondary flex items-center gap-2 py-2 px-3 text-sm"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters - Desktop */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <ProductFiltersPanel filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Mobile Filters Drawer */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60" onClick={() => setShowFilters(false)}>
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-white border-l border-slate-200 p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-dark-900 font-semibold">Filters</h3>
                <button onClick={() => setShowFilters(false)}><X size={20} className="text-slate-400" /></button>
              </div>
              <ProductFiltersPanel filters={filters} onFilterChange={(f) => { setFilters(f); setShowFilters(false); }} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={data?.data} isLoading={isLoading} />

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={filters.page === 1}
                className="btn-secondary py-2 px-3 disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - (filters.page || 1)) <= 2)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilters({ ...filters, page: p })}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      p === filters.page
                        ? 'bg-gold-500 text-dark-950'
                        : 'bg-slate-100 text-slate-600 hover:text-dark-900 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}

              <button
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                disabled={filters.page === data.totalPages}
                className="btn-secondary py-2 px-3 disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
