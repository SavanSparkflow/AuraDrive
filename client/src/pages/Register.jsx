import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, CheckCircle2 } from 'lucide-react';
import Logo from '../components/common/Logo';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    const res = await register(name.trim(), email.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      toast.success('Account created! Welcome to AuraDrive');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error(res.message);
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
            Create your account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Get started with 15 GB of complimentary high-speed cloud storage
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Morgan"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@company.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Must be 6+ characters with letters and numbers"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-3"
              isLoading={isSubmitting}
              icon={UserPlus}
            >
              Create Account
            </Button>
          </form>

          {/* Feature List */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>15 GB Instant Cloudinary-powered storage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Unlimited nested folders and file categories</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Instant public shareable links</span>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
