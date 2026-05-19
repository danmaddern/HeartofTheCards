import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Gift, TrendingUp, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { loyaltyService, LoyaltyTransaction, Reward } from '../services/loyalty.service';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

const TRANSACTION_TYPE_LABEL: Record<string, string> = {
  EARN: 'Points Earned',
  REDEEM: 'Points Redeemed',
  ADMIN_ADJUSTMENT: 'Manual Adjustment',
};

const TRANSACTION_TYPE_COLOR: Record<string, string> = {
  EARN: 'text-emerald-600',
  REDEEM: 'text-gold-600',
  ADMIN_ADJUSTMENT: 'text-blue-600',
};

const RewardCard = ({ reward, userPoints }: { reward: Reward; userPoints: number }) => {
  const canRedeem = userPoints >= reward.pointsCost;
  const progress = Math.min(100, (userPoints / reward.pointsCost) * 100);
  const pointsNeeded = reward.pointsCost - userPoints;

  return (
    <div className={`card p-5 flex flex-col gap-3 transition-all duration-200 ${canRedeem ? 'border-gold-400/60 shadow-gold-400/10 shadow-md' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gift size={18} className={canRedeem ? 'text-gold-500' : 'text-slate-400'} />
            <h3 className="font-semibold text-dark-900">{reward.name}</h3>
            {canRedeem && (
              <span className="badge-gold text-xs">Available!</span>
            )}
          </div>
          <p className="text-slate-500 text-sm">{reward.description}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <p className="text-lg font-bold text-dark-900">{reward.pointsCost}</p>
          <p className="text-xs text-slate-400">points</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${canRedeem ? 'bg-gold-400' : 'bg-slate-300'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {!canRedeem && (
          <p className="text-xs text-slate-400 mt-1">{pointsNeeded} more points needed</p>
        )}
      </div>

      {canRedeem && (
        <Link
          to="/checkout"
          className="btn-primary text-sm py-2 text-center flex items-center justify-center gap-2 mt-1"
        >
          Redeem at Checkout <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
};

const TransactionRow = ({ tx }: { tx: LoyaltyTransaction }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        tx.type === 'EARN' ? 'bg-emerald-50' : tx.type === 'REDEEM' ? 'bg-gold-50' : 'bg-blue-50'
      }`}>
        {tx.type === 'EARN' ? <TrendingUp size={14} className="text-emerald-500" /> :
         tx.type === 'REDEEM' ? <Gift size={14} className="text-gold-500" /> :
         <Star size={14} className="text-blue-500" />}
      </div>
      <div>
        <p className="text-dark-900 text-sm font-medium">{TRANSACTION_TYPE_LABEL[tx.type]}</p>
        <p className="text-slate-400 text-xs">{tx.description}</p>
        {tx.order && (
          <p className="text-slate-400 text-xs">Order: {tx.order.orderNumber}</p>
        )}
      </div>
    </div>
    <div className="text-right">
      <p className={`font-semibold text-sm ${TRANSACTION_TYPE_COLOR[tx.type]}`}>
        {tx.points > 0 ? '+' : ''}{tx.points} pts
      </p>
      <p className="text-slate-400 text-xs">Balance: {tx.balance}</p>
      <p className="text-slate-400 text-xs">
        {new Date(tx.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
      </p>
    </div>
  </div>
);

export const Rewards = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['loyalty-balance'],
    queryFn: loyaltyService.getBalance,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <LoadingSkeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const points = data?.points ?? 0;
  const totalEarned = data?.totalEarned ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="section-title mb-2">Rewards &amp; Points</h1>
      <p className="text-slate-500 mb-8">Earn 1 point for every $1 you spend. Redeem points for discounts on future orders.</p>

      {/* Balance banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-dark-950 p-6 mb-8 border border-gold-500/20"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-gold-400" />
              <span className="text-gold-400 text-sm font-medium">Your Balance</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-display font-bold text-white">{points.toLocaleString()}</span>
              <span className="text-gold-400 text-lg mb-1">points</span>
            </div>
            <p className="text-dark-300 text-sm mt-1">{totalEarned.toLocaleString()} points earned lifetime</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1">
            <p className="text-dark-300 text-xs">Next reward at</p>
            {data?.rewards
              .filter((r: Reward) => r.pointsCost > points)
              .sort((a: Reward, b: Reward) => a.pointsCost - b.pointsCost)[0] ? (
              <div className="text-right">
                <p className="text-white font-semibold">
                  {data.rewards.filter((r: Reward) => r.pointsCost > points).sort((a: Reward, b: Reward) => a.pointsCost - b.pointsCost)[0].pointsCost} pts
                </p>
                <p className="text-gold-400 text-sm">
                  {data.rewards.filter((r: Reward) => r.pointsCost > points).sort((a: Reward, b: Reward) => a.pointsCost - b.pointsCost)[0].name}
                </p>
              </div>
            ) : (
              <p className="text-gold-400 font-semibold">All rewards unlocked!</p>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Rewards catalog */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-semibold text-dark-900 flex items-center gap-2">
            <Gift size={18} className="text-gold-500" /> Available Rewards
          </h2>
          {data?.rewards.map((reward: Reward) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <RewardCard reward={reward} userPoints={points} />
            </motion.div>
          ))}

          {/* How it works */}
          <div className="card p-5 mt-6">
            <h3 className="font-semibold text-dark-900 mb-3 flex items-center gap-2">
              <Star size={16} className="text-gold-500" /> How It Works
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-gold-400 text-dark-950 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                Shop at Heart of the Cards and earn 1 point for every $1 spent
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-gold-400 text-dark-950 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                Points are awarded automatically when your order is confirmed
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-gold-400 text-dark-950 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                At checkout, choose a reward to redeem your points for a discount
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-gold-400 text-dark-950 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                Points are deducted and the discount is applied instantly
              </li>
            </ul>
          </div>
        </div>

        {/* Transaction history */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-dark-900 flex items-center gap-2 mb-4">
            <Clock size={18} className="text-gold-500" /> Recent Activity
          </h2>
          <div className="card p-4">
            {!data?.transactions.length ? (
              <div className="text-center py-8">
                <TrendingUp size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No activity yet.</p>
                <p className="text-slate-400 text-xs mt-1">Make a purchase to start earning!</p>
                <Link to="/products" className="inline-block mt-4 text-gold-600 text-sm font-medium hover:text-gold-500">
                  Shop Now →
                </Link>
              </div>
            ) : (
              <div>
                {data.transactions.map((tx: LoyaltyTransaction) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
                {data.transactions.length === 20 && (
                  <p className="text-center text-slate-400 text-xs mt-3">Showing last 20 transactions</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
