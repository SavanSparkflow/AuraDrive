import React, { useState } from 'react';
import {
  User,
  Mail,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Camera,
  Save,
  Clock,
  Layers
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDriveStore } from '../store/driveStore';
import { formatBytes } from '../utils/formatBytes';
import { formatDate } from '../utils/formatDate';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const AVATAR_PRESETS = [
  '7c3aed,a855f7',
  '3b82f6,60a5fa',
  '10b981,34d399',
  'f59e0b,fbbf24',
  'ef4444,f87171',
  'ec4899,f472b6',
  '6366f1,818cf8'
];

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const { storageStats } = useDriveStore();

  const [name, setName] = useState(user?.name || '');
  const [avatarSeed, setAvatarSeed] = useState(user?.name || 'User');
  const [selectedGradient, setSelectedGradient] = useState('7c3aed,a855f7');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const used = user?.storageUsed || storageStats?.totalUsed || 0;
  const limit = user?.storageLimit || storageStats?.storageLimit || 15 * 1024 * 1024 * 1024;
  const percentage = Math.min(Math.round((used / limit) * 100), 100);

  const currentAvatar =
    user?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=${selectedGradient}`;

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const randomGradient = AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)];
    setAvatarSeed(randomSeed);
    setSelectedGradient(randomGradient);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsSubmitting(true);
    const newAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(avatarSeed || name)}&backgroundColor=${selectedGradient}`;
    const res = await updateProfile({ name: name.trim(), avatar: newAvatar });
    setIsSubmitting(false);

    if (res.success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(res.message || 'Failed to update profile');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-brand-100 text-brand-600 shadow-xs">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Profile</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your personal details, storage quota, and cloud preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Summary */}
        <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <img
              src={currentAvatar}
              alt={user?.name}
              className="w-28 h-28 rounded-full object-cover ring-4 ring-brand-100 shadow-md transition-transform group-hover:scale-105"
            />
            <button
              type="button"
              onClick={handleRandomizeAvatar}
              title="Generate New Avatar"
              className="absolute bottom-0 right-0 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500 truncate max-w-[200px]">{user?.email}</p>
          </div>

          {/* Color Scheme Picker for Avatar */}
          <div className="w-full pt-3 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Avatar Style
            </p>
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {AVATAR_PRESETS.map((grad, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedGradient(grad)}
                  className={`w-6 h-6 rounded-full transition-all ${
                    selectedGradient === grad
                      ? 'ring-2 ring-brand-500 scale-110'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, #${grad.split(',')[0]}, #${grad.split(',')[1]})`
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleRandomizeAvatar}
              className="mt-3 text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Randomize Avatar</span>
            </button>
          </div>
        </div>

        {/* Right Column: Edit Profile & Storage Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Personal Information</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setAvatarSeed(e.target.value);
                }}
                icon={User}
                placeholder="Your Name"
                required
              />

              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                icon={Mail}
                helperText="Email address cannot be changed"
              />

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  icon={Save}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Storage Quota Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <HardDrive className="w-4 h-4 text-brand-600" />
                <span>Cloud Storage Quota</span>
              </div>
              <span className="text-xs font-extrabold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                {percentage}% used
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-brand-500 via-purple-600 to-brand-700 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(percentage, 2)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-5">
              <span>{formatBytes(used)} used</span>
              <span>{formatBytes(limit)} total available</span>
            </div>

            {/* Storage Breakdown Tags */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-center">
              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl">
                <p className="text-[11px] font-medium text-amber-700">Images</p>
                <p className="text-xs font-bold text-amber-900 mt-0.5">
                  {formatBytes(storageStats?.images || 0)}
                </p>
              </div>

              <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-2xl">
                <p className="text-[11px] font-medium text-rose-700">Videos</p>
                <p className="text-xs font-bold text-rose-900 mt-0.5">
                  {formatBytes(storageStats?.videos || 0)}
                </p>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl">
                <p className="text-[11px] font-medium text-blue-700">Documents</p>
                <p className="text-xs font-bold text-blue-900 mt-0.5">
                  {formatBytes(storageStats?.documents || 0)}
                </p>
              </div>

              <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-2xl">
                <p className="text-[11px] font-medium text-purple-700">Audio & Other</p>
                <p className="text-xs font-bold text-purple-900 mt-0.5">
                  {formatBytes((storageStats?.audio || 0) + (storageStats?.others || 0))}
                </p>
              </div>
            </div>
          </div>

          {/* Security & Plan info */}
          <div className="bg-gradient-to-r from-brand-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-brand-300 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">AuraDrive Starter Plan</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  15 GB Complimentary Cloudinary Storage with 256-bit encryption
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-semibold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
