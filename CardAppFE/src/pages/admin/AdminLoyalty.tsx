import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Star, TrendingUp, Gift, ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react';
import { loyaltyService, AdminUserPoints, LoyaltyTransaction } from '../../services/loyalty.service';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { handleApiError } from '../../lib/api';

const TransactionBadge = ({ type }: { type: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    EARN: { label: 'Earn', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    REDEEM: { label: 'Redeem', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    ADMIN_ADJUSTMENT: { label: 'Adjustment', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  };
  const { label, cls } = map[type] ?? { label: type, cls: 'bg-slate-50 text-slate-700 border-slate-200' };
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cls}`}>{label}</span>;
};

type AdjustForm = { points: number; description: string };

const UserRow = ({ user }: { user: AdminUserPoints }) => {
  const [expanded, setExpanded] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const queryClient = useQueryClient();

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['loyalty-admin-user', user.id],
    queryFn: () => loyaltyService.adminGetUserTransactions(user.id),
    enabled: expanded,
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<AdjustForm>({
    defaultValues: { points: 0, description: '' },
  });

  const onAdjust = async (data: AdjustForm) => {
    try {
      await loyaltyService.adminAdjustPoints(user.id, Number(data.points), data.description);
      toast.success('Points adjusted');
      queryClient.invalidateQueries({ queryKey: ['loyalty-admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-admin-user', user.id] });
      reset();
      setShowAdjust(false);
    } catch (err) {
      handleApiError(err);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center flex-shrink-0">
            <span className="text-gold-600 text-sm font-bold">{user.firstName[0]}</span>
          </div>
          <div>
            <p className="text-dark-900 font-medium text-sm">{user.firstName} {user.lastName}</p>
            <p className="text-slate-400 text-xs">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-dark-900 font-bold">{user.loyaltyPoints.toLocaleString()}</p>
            <p className="text-slate-400 text-xs">current pts</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-slate-600 text-sm">{user.totalPointsEarned.toLocaleString()}</p>
            <p className="text-slate-400 text-xs">lifetime earned</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-slate-600 text-sm">{user._count.orders}</p>
            <p className="text-slate-400 text-xs">orders</p>
          </div>
          {expanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Adjust points */}
              <div>
                {!showAdjust ? (
                  <button
                    onClick={() => setShowAdjust(true)}
                    className="text-sm text-gold-600 hover:text-gold-500 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} /> Adjust Points
                  </button>
                ) : (
                  <form onSubmit={handleSubmit(onAdjust)} className="bg-slate-50 rounded-lg p-3 space-y-3">
                    <p className="text-sm font-medium text-dark-900">Adjust Points for {user.firstName}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label text-xs">Points (+/-)</label>
                        <input
                          {...register('points', { required: true, valueAsNumber: true })}
                          type="number"
                          className="input-field text-sm"
                          placeholder="-50 or +100"
                        />
                      </div>
                      <div>
                        <label className="label text-xs">Reason</label>
                        <input
                          {...register('description', { required: true })}
                          className="input-field text-sm"
                          placeholder="Bonus for..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={isSubmitting} className="btn-primary text-sm py-2 flex-1">
                        {isSubmitting ? 'Saving...' : 'Apply'}
                      </button>
                      <button type="button" onClick={() => setShowAdjust(false)} className="btn-secondary text-sm py-2">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Transaction history */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Transaction History</p>
                {detailLoading ? (
                  <LoadingSkeleton className="h-20 rounded-lg" />
                ) : !detail?.transactions.length ? (
                  <p className="text-slate-400 text-sm">No transactions yet.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {detail.transactions.map((tx: LoyaltyTransaction) => (
                      <div key={tx.id} className="flex items-center justify-between text-sm bg-white border border-slate-100 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <TransactionBadge type={tx.type} />
                          <span className="text-slate-600 text-xs">{tx.description}</span>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium text-xs ${tx.points > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {tx.points > 0 ? '+' : ''}{tx.points} pts
                          </p>
                          <p className="text-slate-400 text-xs">
                            {new Date(tx.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AdminLoyalty = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['loyalty-admin-users', page],
    queryFn: () => loyaltyService.adminGetUsers(page, 20),
  });

  const totalPoints = data?.data.reduce((s: number, u: AdminUserPoints) => s + u.loyaltyPoints, 0) ?? 0;
  const totalEarned = data?.data.reduce((s: number, u: AdminUserPoints) => s + u.totalPointsEarned, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-dark-900">Loyalty Points</h1>
        <p className="text-slate-500 text-sm mt-1">Manage customer loyalty points and view transaction history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center">
            <Star size={20} className="text-gold-500" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium">Total Points Outstanding</p>
            <p className="text-dark-900 text-xl font-bold">{totalPoints.toLocaleString()}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium">Total Points Ever Issued</p>
            <p className="text-dark-900 text-xl font-bold">{totalEarned.toLocaleString()}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Gift size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-medium">Members with Points</p>
            <p className="text-dark-900 text-xl font-bold">
              {data?.data.filter((u: AdminUserPoints) => u.loyaltyPoints > 0).length ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* User list */}
      <div>
        <h2 className="text-sm font-semibold text-dark-900 mb-3 uppercase tracking-wider">Customer Points</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <LoadingSkeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {data?.data.map((user: AdminUserPoints) => (
              <UserRow key={user.id} user={user} />
            ))}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-2 px-4 disabled:opacity-40">
              Previous
            </button>
            <span className="flex items-center px-4 text-slate-400 text-sm">Page {page} of {data.totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === data.totalPages} className="btn-secondary py-2 px-4 disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
