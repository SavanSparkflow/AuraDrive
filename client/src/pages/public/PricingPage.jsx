import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import PublicHeader from '../../components/layout/PublicHeader';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'Forever free',
      desc: 'Perfect for personal file storage and daily sharing.',
      storage: '15 GB Storage',
      features: [
        '15 GB Cloudinary-backed storage',
        'Unlimited nested folders',
        'Public link sharing with direct preview',
        'Global search and category filters',
        'High-speed streaming CDN'
      ],
      cta: 'Get Started Free',
      highlighted: false,
      link: '/register'
    },
    {
      name: 'Pro Aura',
      price: '$9',
      period: 'per user / month',
      desc: 'For power creators, designers, and high-res media workflows.',
      storage: '200 GB Storage',
      features: [
        '200 GB Cloudinary-backed storage',
        'Unlimited file sizes up to 10 GB',
        'Custom domain share links',
        'Password-protected shareable links',
        'Priority Cloudinary transcoding',
        '24/7 Priority Support'
      ],
      cta: 'Upgrade to Pro',
      highlighted: true,
      link: '/register'
    },
    {
      name: 'Team Workspace',
      price: '$24',
      period: 'per user / month',
      desc: 'Collaborative cloud storage designed for fast-paced teams.',
      storage: '2 TB Storage',
      features: [
        '2 TB High-speed Cloud Storage',
        'Multi-user shared team drives',
        'Audit logs & access history',
        'Custom branding & logo watermarks',
        'Dedicated SLA & account manager'
      ],
      cta: 'Contact Sales',
      highlighted: false,
      link: '/faq'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-brand-500 selection:text-white">
      <PublicHeader />

      <main className="flex-1">
        {/* Header */}
        <section className="py-20 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simple, Transparent Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Choose the Perfect Plan for{' '}
            <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
              Your Storage
            </span>
          </h1>
          <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Get started with 15 GB free, then upgrade as your files and team grow.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((p, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 ${
                  p.highlighted
                    ? 'bg-gradient-to-b from-brand-900 to-slate-900 text-white shadow-2xl ring-2 ring-brand-500 relative scale-105 md:-translate-y-2'
                    : 'bg-white text-slate-900 border border-slate-200/80 shadow-card hover:border-brand-200'
                }`}
              >
                {p.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-brand-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <h3 className="text-lg font-bold">{p.name}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.highlighted ? 'bg-brand-800 text-brand-200' : 'bg-brand-50 text-brand-700'}`}>
                      {p.storage}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-extrabold">{p.price}</span>
                    <span className={`text-xs ${p.highlighted ? 'text-slate-300' : 'text-slate-500'}`}>
                      {p.period}
                    </span>
                  </div>
                  <p className={`text-xs mb-8 ${p.highlighted ? 'text-slate-300' : 'text-slate-500'}`}>
                    {p.desc}
                  </p>

                  <div className="space-y-3 mb-8">
                    {p.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <div className={`p-1 rounded-full ${p.highlighted ? 'bg-brand-600 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className={p.highlighted ? 'text-slate-200' : 'text-slate-700'}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link to={p.link} className="w-full">
                  <Button
                    variant={p.highlighted ? 'primary' : 'outline'}
                    size="md"
                    className="w-full"
                    iconRight={ArrowRight}
                  >
                    {p.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
