import React from 'react';
import { Shield, Lock, Eye, FileText, Sparkles } from 'lucide-react';
import PublicHeader from '../../components/layout/PublicHeader';
import Footer from '../../components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-brand-500 selection:text-white">
      <PublicHeader />

      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-8">
            <div className="border-b border-slate-100 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-3">
                <Shield className="w-3.5 h-3.5" />
                <span>Last updated: September 2026</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="text-sm text-slate-500 mt-2">
                Learn how AuraDrive collects, encrypts, and handles your personal information and uploaded files.
              </p>
            </div>

            <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-600 leading-relaxed">
              <section>
                <h3 className="text-base font-bold text-slate-900 mb-2">1. Information We Collect</h3>
                <p>
                  When you register for AuraDrive, we collect your name, email address, and encrypted credentials. When you upload files, we store their metadata (file name, size, MIME type, and Cloudinary public identifier).
                </p>
              </section>

              <section>
                <h3 className="text-base font-bold text-slate-900 mb-2">2. How Your Files Are Handled</h3>
                <p>
                  Your files are stored securely across authenticated Cloudinary cloud infrastructure with 256-bit encryption. We never access, sell, or analyze your private content for advertising.
                </p>
              </section>

              <section>
                <h3 className="text-base font-bold text-slate-900 mb-2">3. Public Sharing & Access Controls</h3>
                <p>
                  Files remain completely private by default. When you deliberately create a public share link, an anonymous unique cryptographic token is created. You can revoke this link at any moment to disable public access instantly.
                </p>
              </section>

              <section>
                <h3 className="text-base font-bold text-slate-900 mb-2">4. Data Deletion & Trash</h3>
                <p>
                  When you empty your trash bin or delete a file permanently, all associated records are purged from our database and Cloudinary storage endpoints immediately.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
