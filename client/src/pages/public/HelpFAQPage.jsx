import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageSquare, Mail, Sparkles, Send } from 'lucide-react';
import PublicHeader from '../../components/layout/PublicHeader';
import Footer from '../../components/layout/Footer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function HelpFAQPage() {
  const [openIndex, setOpenIndex] = useState(0);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  const faqs = [
    {
      q: 'How much free cloud storage is included with an AuraDrive account?',
      a: 'Every new AuraDrive user immediately gets 15 GB of complimentary high-speed cloud storage, powered by Cloudinary and isolated MongoDB storage.'
    },
    {
      q: 'How does drag and drop file uploading work?',
      a: 'Simply drag any file or group of files from your computer and drop it anywhere over the AuraDrive dashboard. An animated drop indicator will appear, and your files will upload with live progress tracking.'
    },
    {
      q: 'Can I share files with people who do not have an AuraDrive account?',
      a: 'Yes! Click the 3-dots menu on any file, select "Share Link", and enable Public Sharing. Copy the link and anyone can view and download the media directly.'
    },
    {
      q: 'What file formats can be previewed directly in the browser?',
      a: 'AuraDrive supports in-app previews for high-resolution images (PNG, JPG, WebP, SVG), 4K videos (MP4, WebM), audio tracks (MP3, WAV), and PDF documents.'
    },
    {
      q: 'What happens when I delete a file or folder?',
      a: 'Deleted items are moved to the Trash bin. You can restore them at any time or choose to permanently remove them to free up storage space.'
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.success('Message sent! Our team will get back to you within 24 hours.');
      setContactName('');
      setContactEmail('');
      setContactMsg('');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-brand-500 selection:text-white">
      <PublicHeader />

      <main className="flex-1">
        <section className="py-20 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-6">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help Center & Support</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Find answers to common questions about AuraDrive, storage tiers, file sharing, and account setup.
          </p>
        </section>

        {/* Accordion */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full text-left p-5 font-semibold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Contact Form */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-brand-100 text-brand-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Still have questions?</h3>
                <p className="text-xs text-slate-500">Send us a message and our support team will help you right away.</p>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  placeholder="John Doe"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 tracking-wide block mb-1.5">
                  Your Message
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm"
                  placeholder="How can we help you today?"
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" icon={Send} isLoading={isSending}>
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
