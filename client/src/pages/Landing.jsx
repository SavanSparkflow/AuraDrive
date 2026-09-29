import React from 'react';
import { Link } from 'react-router-dom';
import {
  Cloud,
  ShieldCheck,
  Zap,
  Share2,
  Lock,
  HardDrive,
  FolderSync,
  ArrowRight,
  CheckCircle,
  Eye,
  Search,
  Sparkles
} from 'lucide-react';
import PublicHeader from '../components/layout/PublicHeader';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import { useAuthStore } from '../store/authStore';

export default function Landing() {
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: Zap,
      title: 'Blazing Fast Cloudinary Engine',
      description: 'Streamlined upload and global CDN delivery ensures your photos, videos, and large archives transfer at lightning speeds.'
    },
    {
      icon: ShieldCheck,
      title: 'Secure Hierarchical Storage',
      description: 'Unlimited nested folder structures with isolated user permissions and JWT-authenticated data protection.'
    },
    {
      icon: Share2,
      title: 'One-Click Public Sharing',
      description: 'Generate secure, revocable public access links to share large media and documents instantly with anyone.'
    },
    {
      icon: Eye,
      title: 'Instant Multi-Format Preview',
      description: 'Preview high-resolution photos, 4K videos, audio tracks, and documents without needing to download them first.'
    },
    {
      icon: Search,
      title: 'Intelligent Real-time Search',
      description: 'Find files and directories instantaneously by name, mime type, category, or modification timestamp.'
    },
    {
      icon: FolderSync,
      title: 'Intuitive Drag & Drop',
      description: 'Drop files anywhere onto your workspace for immediate upload with interactive real-time percentage progress.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-brand-500 selection:text-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Glow backdrop decorative gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-400/20 via-purple-300/20 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-6 shadow-xs animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Cloud Storage for Modern Teams</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
            Store, Share & Collaborate with{' '}
            <span className="bg-gradient-to-r from-brand-600 via-purple-600 to-brand-700 bg-clip-text text-transparent">
              Zero Friction.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            AuraDrive brings you clean, high-performance cloud storage powered by Cloudinary and MERN stack.
            Organize nested folders, preview rich media instantly, and share links with complete confidence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-8 shadow-lg shadow-brand-600/25" iconRight={ArrowRight}>
                {isAuthenticated ? 'Open AuraDrive' : 'Start with 15 GB Free'}
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-6">
                Sign In to Account
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-14 pt-10 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">15 GB</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Free Storage Default</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-brand-600">100%</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Cloudinary CDN Backed</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">&lt; 100ms</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Instant Media Streaming</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">256-Bit</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">End-to-End JWT Auth</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">
              Engineered for Simplicity
            </h2>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">
              Everything you need in a modern cloud drive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-7 rounded-3xl bg-slate-50/70 hover:bg-brand-50/40 border border-slate-200/80 hover:border-brand-200 transition-all duration-300 hover:shadow-card group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Multi-column Rich Footer */}
      <Footer />
    </div>
  );
}
