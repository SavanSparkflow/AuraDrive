import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, ArrowRight } from 'lucide-react';
import Logo from '../components/common/Logo';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      toast.success('Welcome back to AuraDrive!');
      navigate(from, { replace: true });
    } else {
      toast.error(res.message);
    }
  };

  // 1-Click Quick Demo User login / autologin
  const handleQuickDemo = async () => {
    setIsSubmitting(true);
    // Try demo login first
    let res = await login('demo@auradrive.app', 'auradrive123');
    if (!res.success) {
      // Create demo account if not existing yet
      res = await register('Demo User', 'demo@auradrive.app', 'auradrive123');
    }
    setIsSubmitting(false);

    if (res.success) {
      toast.success('Logged in as Demo User');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error(res.message || 'Could not launch demo');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 via-[#F8FAFC] to-brand-50 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-block mb-3">
            <Logo size="lg" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sign in to access your cloud files and shared workspaces
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isSubmitting}
              icon={LogIn}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl border border-brand-200 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Explore Demo Workspace (1-Click)</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an AuraDrive account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
