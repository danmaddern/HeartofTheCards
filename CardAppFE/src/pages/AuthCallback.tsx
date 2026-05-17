import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { cartService } from '../services/cart.service';
import { useCartStore } from '../store/cartStore';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();
  const { getSessionId, setCart } = useCartStore();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      authService.getMe().then(async (user) => {
        setAuth(user, { accessToken, refreshToken });

        try {
          const sessionId = getSessionId();
          await cartService.mergeCart(sessionId);
          const cart = await cartService.getCart();
          setCart(cart);
        } catch {}

        toast.success(`Welcome, ${user.firstName}!`);
        navigate('/');
      }).catch(() => {
        toast.error('Authentication failed');
        navigate('/login');
      });
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-dark-400">Completing sign in...</p>
      </div>
    </div>
  );
};
