import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Server, Key, FileCheck, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import PublicHeader from '../../components/layout/PublicHeader';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';

export default function SecurityPage() {
  const securityPillars = [
    {
      icon: Lock,
      title: '256-Bit SSL/TLS in Transit',
      desc: 'All file transfers between your browser and our servers are encrypted using modern TLS 1.3 cryptographic protocols.'
    },
    {
      icon: Key,
      title: 'JWT Authentication & Salted Hashes',
      desc: 'Passwords are encrypted using strong Bcrypt salt iterations. Sessions use signed JSON Web Tokens with strict expiration.'
    },
    {
      icon: Server,
      title: 'Isolated Multi-Tenant Database',
      desc: 'All MongoDB queries enforce strict owner isolation at the schema level to guarantee your private files are never visible to others.'
    },
    {
      icon: FileCheck,
      title: 'Cloudinary Global CDN Security',
      desc: 'Stored assets are delivered via hardened Cloudinary CDNs with DDoS mitigation, bot blocking, and secure signed transformations.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-brand-500 selection:text-white">
      <PublicHeader />

      <main className="flex-1">
        <section className="py-20 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Trust & Infrastructure</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Enterprise-Grade Security by{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-brand-600 bg-clip-text text-transparent">
              Default
            </span>
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Your data privacy is our highest priority. AuraDrive employs modern encryption standards and isolated access controls.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityPillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
