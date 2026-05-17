import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { authService } from '../services/auth.service';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export const ForgotPassword = () => {
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
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
          <h1 className="font-display font-bold text-white text-2xl">Forgot Password</h1>
          <p className="text-dark-400 text-sm mt-1">We'll send you a link to reset your password</p>
        </div>

        <div className="card p-6 space-y-5">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <Mail size={28} className="text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Check your inbox</p>
                <p className="text-dark-400 text-sm mt-1">
                  If that email is registered, you'll receive a reset link shortly. Check your spam folder too.
                </p>
              </div>
              <Link to="/login" className="btn-secondary inline-flex items-center gap-2 mt-2">
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          ) : (
            <>
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
                      autoFocus
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-dark-400 text-sm">
                Remember your password?{' '}
                <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
