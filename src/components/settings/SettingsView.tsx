import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Store, 
  Mail, 
  Eye, 
  EyeOff, 
  Save,
  Shield,
  HelpCircle
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { authSession, updateAccountPassword } = useApp();

  const isVendor = authSession.user?.role === 'vendor';
  const userEmail = authSession.user?.email || '';
  const storeName = authSession.user?.storeName || '';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await updateAccountPassword(currentPassword, newPassword);
      if (res.success) {
        setSuccess('Password updated successfully! Your account credentials have been secured.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ohana-charcoal-900 font-display">
            Account & Security Settings
          </h1>
          <p className="text-xs text-gray-500">
            {isVendor 
              ? `Manage authentication credentials and store details for ${storeName}.`
              : 'Admin security center, credential management, and authorized administrator settings.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            isVendor ? 'bg-ohana-sand-100 text-ohana-terracotta border border-ohana-sand-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            {isVendor ? <Store className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>{isVendor ? 'Retail Partner Account' : 'Authorized Administrator'}</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Account Details & Password Reset */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Account Profile Overview (1 col) */}
        <div className="bg-white rounded-3xl border border-ohana-sand-300 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-ohana-charcoal-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-ohana-terracotta" />
            <span>Profile Overview</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-ohana-sand-50 rounded-2xl border border-ohana-sand-200 space-y-1">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                Logged In As:
              </span>
              <p className="font-bold text-ohana-charcoal-900 text-sm flex items-center gap-1.5 break-all">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{userEmail}</span>
              </p>
            </div>

            {isVendor && (
              <div className="p-3 bg-ohana-sand-50 rounded-2xl border border-ohana-sand-200 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Store Boutique:
                </span>
                <p className="font-bold text-ohana-charcoal-900 text-sm flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-ohana-terracotta shrink-0" />
                  <span>{storeName}</span>
                </p>
              </div>
            )}

            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 text-blue-950 space-y-1">
              <div className="flex items-center gap-1 font-bold">
                <Shield className="w-3.5 h-3.5 text-blue-700" />
                <span>Security Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-900">
                {isVendor
                  ? 'Your store account gives you access to real-time sales reporting, invoice statements, and assigned inventory. Keep your credentials private.'
                  : 'For security, administrator privileges are strictly limited to the 2 authorized owners (neemakinoti@gmail.com and kipmilton71@gmail.com).'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Change / Reset Password (2 cols) */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-ohana-sand-300 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <KeyRound className="w-5 h-5 text-ohana-terracotta" />
            <div>
              <h2 className="text-base font-bold text-ohana-charcoal-900 font-display">
                Reset / Change Password
              </h2>
              <p className="text-xs text-gray-500">
                Update your login password. Must be at least 6 characters.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold">{success}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            {/* Current Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password..."
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ohana-terracotta/20 focus:border-ohana-terracotta outline-none text-xs font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Enter new password (min. 6 chars)..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ohana-terracotta/20 focus:border-ohana-terracotta outline-none text-xs font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter new password..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ohana-terracotta/20 focus:border-ohana-terracotta outline-none text-xs font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-ohana-terracotta hover:bg-ohana-terracotta-600 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-2 text-xs"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Updating Password...' : 'Save & Update Password'}</span>
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
};
