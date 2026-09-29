import React from 'react';
import { Link } from 'react-router-dom';
import { HardDrive, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
        <HardDrive className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <p className="text-base font-semibold text-slate-700 mt-1">Page Not Found</p>
      <p className="text-xs text-slate-500 max-w-sm mt-2 mb-6">
        The requested folder, file or route does not exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" icon={ArrowLeft}>
          Return to AuraDrive
        </Button>
      </Link>
    </div>
  );
}
