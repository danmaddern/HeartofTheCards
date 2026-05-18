import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart2, Package } from 'lucide-react';
import { adminService } from '../../services/admin.service';

const BRAND_COLORS: Record<string, string> = {
  POKEMON: '#fbbf24',
  ONE_PIECE: '#ef4444',
};
const TYPE_COLORS: Record<string, string> = {
  BOOSTER_BOX: '#8b5cf6',
  INDIVIDUAL_CARD: '#3b82f6',
  ACCESSORY: '#10b981',
};
const BRAND_LABELS: Record<string, string> = {
  POKEMON: 'Pokémon',
  ONE_PIECE: 'One Piece',
};
const TYPE_LABELS: Record<string, string> = {
  BOOSTER_BOX: 'Booster Box',
  INDIVIDUAL_CARD: 'Individual Card',
  ACCESSORY: 'Accessory',
};

const CHART_FALLBACK_COLORS = ['#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#ef4444'];

const darkTooltipStyle = {
  contentStyle: { background: '#1f1f1f', border: '1px solid #2d2d2d', borderRadius: 8, color: '#fff' },
  itemStyle: { color: '#d1d5db' },
  labelStyle: { color: '#9ca3af', fontSize: 12 },
};

const FilterBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
      active ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'bg-dark-800 text-dark-400 hover:text-white border border-dark-700'
    }`}
  >
    {children}
  </button>
);

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const AdminAnalytics = () => {
  const [revenueDays, setRevenueDays] = useState(30);
  const [pieMeta, setPieMeta] = useState<'revenue' | 'units'>('revenue');
  const [stockBrand, setStockBrand] = useState('');
  const [stockType, setStockType] = useState('');

  const { data: revenueData = [], isLoading: revenueLoading } = useQuery({
    queryKey: ['charts-revenue', revenueDays],
    queryFn: () => adminService.getRevenueOverTime(revenueDays),
  });

  const { data: brandData = [], isLoading: brandLoading } = useQuery({
    queryKey: ['charts-brand'],
    queryFn: adminService.getSalesByBrand,
  });

  const { data: typeData = [], isLoading: typeLoading } = useQuery({
    queryKey: ['charts-type'],
    queryFn: adminService.getSalesByProductType,
  });

  const { data: stockData = [], isLoading: stockLoading } = useQuery({
    queryKey: ['charts-stock', stockBrand, stockType],
    queryFn: () => adminService.getStockOverview(stockBrand || undefined, stockType || undefined),
  });

  const brandPieData = brandData.map((d) => ({
    name: BRAND_LABELS[d.brand] ?? d.brand,
    value: pieMeta === 'revenue' ? d.revenue : d.units,
    color: BRAND_COLORS[d.brand] ?? '#6b7280',
  }));

  const typePieData = typeData.map((d) => ({
    name: TYPE_LABELS[d.type] ?? d.type,
    value: pieMeta === 'revenue' ? d.revenue : d.units,
    color: TYPE_COLORS[d.type] ?? '#6b7280',
  }));

  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const peakDay = revenueData.reduce((best, d) => d.revenue > (best?.revenue ?? 0) ? d : best, revenueData[0]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return revenueDays <= 14
      ? d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
      : d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  };

  const xAxisInterval = revenueDays <= 14 ? 1 : revenueDays <= 30 ? 4 : 8;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Analytics</h1>
      </div>

      {/* Revenue Over Time */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <TrendingUp size={18} className="text-gold-400" /> Revenue Over Time
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1.5">
              {[7, 14, 30, 90].map((d) => (
                <FilterBtn key={d} active={revenueDays === d} onClick={() => setRevenueDays(d)}>
                  {d}d
                </FilterBtn>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
          <div className="bg-dark-900 rounded-xl p-4">
            <p className="text-dark-400 text-xs mb-1">Total ({revenueDays}d)</p>
            <p className="text-gold-400 font-bold text-xl">A${totalRevenue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-dark-900 rounded-xl p-4">
            <p className="text-dark-400 text-xs mb-1">Daily Avg</p>
            <p className="text-white font-bold text-xl">A${(totalRevenue / revenueDays).toLocaleString('en-AU', { minimumFractionDigits: 2 })}</p>
          </div>
          {peakDay && (
            <div className="bg-dark-900 rounded-xl p-4">
              <p className="text-dark-400 text-xs mb-1">Peak Day</p>
              <p className="text-white font-bold text-xl">A${peakDay.revenue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</p>
              <p className="text-dark-500 text-xs mt-0.5">{peakDay.date}</p>
            </div>
          )}
        </div>

        {revenueLoading ? (
          <div className="h-64 skeleton rounded-xl" />
        ) : revenueData.every(d => d.revenue === 0) ? (
          <div className="h-64 flex items-center justify-center text-dark-500 text-sm">No revenue data for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                interval={xAxisInterval}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={{ stroke: '#2d2d2d' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip
                {...darkTooltipStyle}
                formatter={(v: any) => [`A$${Number(v).toFixed(2)}`, 'Revenue']}
                labelFormatter={(label: any) => formatDate(String(label))}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#f59e0b' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* By Brand */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <PieIcon size={18} className="text-gold-400" /> Sales by Brand
            </h2>
            <div className="flex gap-1.5">
              <FilterBtn active={pieMeta === 'revenue'} onClick={() => setPieMeta('revenue')}>Revenue</FilterBtn>
              <FilterBtn active={pieMeta === 'units'} onClick={() => setPieMeta('units')}>Units</FilterBtn>
            </div>
          </div>
          {brandLoading ? (
            <div className="h-52 skeleton rounded-xl" />
          ) : brandPieData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-dark-500 text-sm">No sales data yet</div>
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={brandPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={CustomPieLabel}
                  >
                    {brandPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    {...darkTooltipStyle}
                    formatter={(v: any) => [
                      pieMeta === 'revenue' ? `A$${Number(v).toFixed(2)}` : `${v} units`,
                      '',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-1">
                {brandPieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-dark-300">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* By Product Type */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <PieIcon size={18} className="text-gold-400" /> Sales by Type
            </h2>
            <div className="flex gap-1.5">
              <FilterBtn active={pieMeta === 'revenue'} onClick={() => setPieMeta('revenue')}>Revenue</FilterBtn>
              <FilterBtn active={pieMeta === 'units'} onClick={() => setPieMeta('units')}>Units</FilterBtn>
            </div>
          </div>
          {typeLoading ? (
            <div className="h-52 skeleton rounded-xl" />
          ) : typePieData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-dark-500 text-sm">No sales data yet</div>
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={typePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={CustomPieLabel}
                  >
                    {typePieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color ?? CHART_FALLBACK_COLORS[i % CHART_FALLBACK_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    {...darkTooltipStyle}
                    formatter={(v: any) => [
                      pieMeta === 'revenue' ? `A$${Number(v).toFixed(2)}` : `${v} units`,
                      '',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-1">
                {typePieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-dark-300">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color ?? CHART_FALLBACK_COLORS[i % CHART_FALLBACK_COLORS.length] }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock Levels */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Package size={18} className="text-gold-400" /> Stock Levels
          </h2>
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1.5">
              <FilterBtn active={stockBrand === ''} onClick={() => setStockBrand('')}>All Brands</FilterBtn>
              <FilterBtn active={stockBrand === 'POKEMON'} onClick={() => setStockBrand('POKEMON')}>Pokémon</FilterBtn>
              <FilterBtn active={stockBrand === 'ONE_PIECE'} onClick={() => setStockBrand('ONE_PIECE')}>One Piece</FilterBtn>
            </div>
            <div className="flex gap-1.5">
              <FilterBtn active={stockType === ''} onClick={() => setStockType('')}>All Types</FilterBtn>
              <FilterBtn active={stockType === 'BOOSTER_BOX'} onClick={() => setStockType('BOOSTER_BOX')}>Booster</FilterBtn>
              <FilterBtn active={stockType === 'INDIVIDUAL_CARD'} onClick={() => setStockType('INDIVIDUAL_CARD')}>Singles</FilterBtn>
              <FilterBtn active={stockType === 'ACCESSORY'} onClick={() => setStockType('ACCESSORY')}>Accessories</FilterBtn>
            </div>
          </div>
        </div>

        {stockLoading ? (
          <div className="h-72 skeleton rounded-xl" />
        ) : stockData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-dark-500 text-sm">No products match the selected filters</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(260, stockData.length * 36)}>
            <BarChart
              data={stockData.map(p => ({
                name: p.name.length > 22 ? p.name.substring(0, 22) + '…' : p.name,
                stock: p.stockQuantity,
                fill: p.stockQuantity <= 5 ? '#ef4444' : p.stockQuantity <= 10 ? '#f59e0b' : '#10b981',
              }))}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={{ stroke: '#2d2d2d' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={160}
                tick={{ fill: '#d1d5db', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                {...darkTooltipStyle}
                formatter={(v: any) => [`${v} units`, 'Stock']}
              />
              <Bar dataKey="stock" radius={[0, 4, 4, 0]} maxBarSize={24}>
                {stockData.map((p, i) => (
                  <Cell
                    key={i}
                    fill={p.stockQuantity <= 5 ? '#ef4444' : p.stockQuantity <= 10 ? '#f59e0b' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-dark-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> &gt;10 units
          </div>
          <div className="flex items-center gap-1.5 text-xs text-dark-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> 6–10 units (low)
          </div>
          <div className="flex items-center gap-1.5 text-xs text-dark-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> ≤5 units (critical)
          </div>
        </div>
      </div>
    </div>
  );
};
