import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Logo from '../common/Logo';
import Button from '../common/Button';
import { useAuthStore } from '../../store/authStore';

export default function PublicHeader() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Security', path: '/security' },
    { name: 'FAQ & Help', path: '/faq' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo size="default" to="/" />

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors hover:text-brand-600 ${
                  location.pathname === link.path ? 'text-brand-600 font-semibold' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="primary" size="sm" iconRight={ArrowRight}>
                Open Drive
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" iconRight={ArrowRight}>
                  Get Started Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
