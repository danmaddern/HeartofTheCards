import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { authService } from '../services/auth.service';
import { cartService } from '../services/cart.service';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { handleApiError } from '../lib/api';
import { apiUrl } from '../lib/apiUrl';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { setAuth } = useAuthStore();
  const { getSessionId, setCart } = useCartStore();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const sessionId = getSessionId();
      const result = await authService.login(data);
      setAuth(result.user, result.tokens);

      try {
        await cartService.mergeCart(sessionId);
        const cart = await cartService.getCart();
        setCart(cart);
      } catch {}

      toast.success(`Welcome back, ${result.user.firstName}!`);
      navigate(redirect);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = apiUrl('/api/auth/google');
  };

  const handleDevLogin = async () => {
    try {
      const sessionId = getSessionId();
      const result = await authService.login({ email: 'dev@heartofthecards.dev', password: 'dev' });
      setAuth(result.user, result.tokens);
      try {
        await cartService.mergeCart(sessionId);
        const cart = await cartService.getCart();
        setCart(cart);
      } catch {}
      toast.success('Dev admin login');
      navigate(redirect);
    } catch {
      toast.error('Dev user not seeded — run npm run db:seed in CardAppBE/');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-dark-950 font-display font-bold text-xl">H</span>
          </div>
          <h1 className="font-display font-bold text-white text-2xl">Welcome Back</h1>
          <p className="text-dark-400 text-sm mt-1">Sign in to your Heart of the Cards account</p>
        </div>

        <div className="card p-6 space-y-5">
          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full btn-secondary flex items-center justify-center gap-3 py-3"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-dark-700" />
            <span className="text-dark-500 text-xs">or sign in with email</span>
            <div className="flex-1 h-px bg-dark-700" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="input-field pl-9"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label !mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-gold-400 hover:text-gold-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pl-9 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-dark-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
              Create one
            </Link>
          </p>

          {/* Dev bypass — remove before production */}
          <div className="border-t border-dark-700 pt-4">
            <button
              type="button"
              onClick={handleDevLogin}
              className="w-full py-2 px-4 rounded-lg border border-dashed border-dark-600 text-dark-400 hover:text-dark-200 hover:border-dark-500 text-xs font-mono transition-colors"
            >
              ⚡ Dev Login (admin)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
