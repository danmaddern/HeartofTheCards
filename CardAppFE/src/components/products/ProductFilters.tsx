import { SlidersHorizontal, X } from 'lucide-react';
import { ProductFilters as Filters } from '../../services/products.service';

interface ProductFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const AU_STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];

export const ProductFiltersPanel = ({ filters, onFilterChange }: ProductFiltersProps) => {
  const update = (key: keyof Filters, value: any) => {
    onFilterChange({ ...filters, [key]: value || undefined, page: 1 });
  };

  const clearAll = () => {
    onFilterChange({ page: 1, limit: filters.limit });
  };

  const hasFilters = !!(filters.brand || filters.productType || filters.minPrice || filters.maxPrice || filters.categoryId);

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-semibold">
          <SlidersHorizontal size={16} className="text-gold-400" />
          Filters
        </div>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-dark-400 hover:text-gold-400 flex items-center gap-1 transition-colors">
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Brand */}
      <div>
        <label className="label">Brand</label>
        <div className="space-y-1.5">
          {[
            { value: undefined, label: 'All Brands' },
            { value: 'POKEMON', label: 'Pokémon' },
            { value: 'ONE_PIECE', label: 'One Piece' },
          ].map(({ value, label }) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="brand"
                checked={filters.brand === value}
                onChange={() => update('brand', value)}
                className="accent-gold-500"
              />
              <span className="text-sm text-dark-300 group-hover:text-white transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Product Type */}
      <div>
        <label className="label">Product Type</label>
        <div className="space-y-1.5">
          {[
            { value: undefined, label: 'All Types' },
            { value: 'BOOSTER_BOX', label: 'Booster Boxes' },
            { value: 'INDIVIDUAL_CARD', label: 'Individual Cards' },
            { value: 'ACCESSORY', label: 'Accessories' },
          ].map(({ value, label }) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="productType"
                checked={filters.productType === value}
                onChange={() => update('productType', value as any)}
                className="accent-gold-500"
              />
              <span className="text-sm text-dark-300 group-hover:text-white transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="label">Price Range (AUD)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => update('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="input-field text-sm py-2 w-full"
            min={0}
          />
          <span className="text-dark-500 text-sm">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => update('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="input-field text-sm py-2 w-full"
            min={0}
          />
        </div>
      </div>

      {/* Featured */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.featured === true}
            onChange={(e) => update('featured', e.target.checked ? true : undefined)}
            className="accent-gold-500 w-4 h-4"
          />
          <span className="text-sm text-dark-300 group-hover:text-white transition-colors">Featured Items Only</span>
        </label>
      </div>
    </div>
  );
};
