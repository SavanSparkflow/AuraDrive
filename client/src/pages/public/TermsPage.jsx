import React from 'react';
import { FileText, CheckCircle2, Shield } from 'lucide-react';
import PublicHeader from '../../components/layout/PublicHeader';
import Footer from '../../components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-brand-500 selection:text-white">
      <PublicHeader />

      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-8">
            <div className="border-b border-slate-100 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-3">
                <FileText className="w-3.5 h-3.5" />
                <span>Effective Date: September 2026</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
              <p className="text-sm text-slate-500 mt-2">
                Please review the terms and acceptable use guidelines governing your use of AuraDrive.
              </p>
            </div>

            <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-600 leading-relaxed">
              <section>
                <h3 className="text-base font-bold text-slate-900 mb-2">1. Acceptance of Terms</h3>
                <p>
                  By creating an account or using AuraDrive, you agree to comply with these terms of service and all applicable laws and regulations.
                </p>
              </section>

              <section>
                <h3 className="text-base font-bold text-slate-900 mb-2">2. User Accounts & Security</h3>
                <p>
                  You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h3 className="text-base font-bold text-slate-900 mb-2">3. Storage Limits & Fair Use</h3>
                <p>
                  Each free tier user is entitled to 15 GB of cloud storage. Users may not upload malicious software, illegal content, or infringe upon third-party intellectual property.
                </p>
              </section>

              <section>
                <h3 className="text-base font-bold text-slate-900 mb-2">4. Service Availability & Modifications</h3>
                <p>
                  We strive for 99.9% uptime. AuraDrive reserves the right to make improvements or modifications to features to enhance overall performance and security.
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
