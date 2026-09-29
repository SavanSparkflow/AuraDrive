import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  HardDrive,
  Github,
  Twitter,
  Linkedin,
  Heart
} from 'lucide-react';
import Logo from '../common/Logo';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col (2 span) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-block brightness-125">
              <Logo size="default" to="/" />
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              AuraDrive is an intelligent, high-speed cloud storage platform built with MERN stack and Cloudinary. Store, stream, and share your media with complete confidence.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational (Cloudinary CDN Active)</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-tight uppercase tracking-wider text-[11px]">
              Product
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  Features & Tools
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-white transition-colors">
                  Security Architecture
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Cloud Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-tight uppercase tracking-wider text-[11px]">
              Resources
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Help Center & FAQ
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-white transition-colors">
                  Cloudinary CDN Status
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  15 GB Free Sign Up
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Quick Demo Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-tight uppercase tracking-wider text-[11px]">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-white transition-colors">
                  256-Bit Data Safety
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Cookie Preferences
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 AuraDrive. Built with modern MERN Stack & Cloudinary.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">
              Terms
            </Link>
            <Link to="/faq" className="hover:text-slate-300 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
