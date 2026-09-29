import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  FolderTree,
  Share2,
  Eye,
  Search,
  UploadCloud,
  Lock,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import PublicHeader from '../../components/layout/PublicHeader';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';

export default function FeaturesPage() {
  const featureList = [
    {
      icon: FolderTree,
      title: 'Infinite Nested Folders',
      desc: 'Create deeply nested directory hierarchies with color-coded custom tags, automatic breadcrumb navigation, and real-time path inheritance.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: UploadCloud,
      title: 'Global Drag & Drop Uploads',
      desc: 'Drop files anywhere on your browser window for instant, multi-file uploads with animated percentage progress and chunk streaming.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Zap,
      title: 'Cloudinary CDN Acceleration',
      desc: 'Every image, 4K video, audio track, and archive is optimized and cached globally across Cloudinary CDN edges for instant loading.',
      color: 'bg-amber-100 text-amber-600'
    },
    {
      icon: Eye,
      title: 'Multi-Format In-App Preview',
      desc: 'Preview high-resolution photos, stream video and audio directly, and read PDFs and document files without downloading them.',
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      icon: Share2,
      title: 'Instant Public Link Sharing',
      desc: 'Generate secure, 1-click revocable share links. Recipients can view media in a clean previewer and download with full bandwidth.',
      color: 'bg-brand-100 text-brand-600'
    },
    {
      icon: Search,
      title: 'Real-time Intelligent Search',
      desc: 'Instantly find any file or folder by typing partial keywords, format types, or categories with our debounced autocomplete search engine.',
      color: 'bg-rose-100 text-rose-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-brand-500 selection:text-white">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AuraDrive Capabilities</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Powerful Features for Modern{' '}
            <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
              Cloud Productivity
            </span>
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Engineered with speed, aesthetics, and usability in mind. AuraDrive combines MERN stack reliability with Cloudinary CDN delivery.
          </p>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureList.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-8 rounded-3xl bg-white border border-slate-200/80 hover:border-brand-300 hover:shadow-card transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-6 shadow-xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2.5">{f.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Box */}
          <div className="mt-16 p-10 rounded-3xl bg-gradient-to-r from-brand-900 to-slate-900 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <h3 className="text-2xl font-bold">Ready to experience AuraDrive?</h3>
              <p className="text-sm text-slate-300 mt-1">Get 15 GB of high-speed cloud storage free today.</p>
            </div>
            <Link to="/register">
              <Button size="lg" variant="primary" iconRight={ArrowRight}>
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
