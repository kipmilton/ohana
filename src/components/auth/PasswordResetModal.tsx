import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Store,
  Sparkles
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const PasswordResetModal: React.FC = () => {
  const { authSession, resetVendorPassword } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    const ok = await resetVendorPassword(newPassword);
    setLoading(false);

    if (ok) {
      setSuccess(true);
    } else {
      setError('Failed to update password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-ohana-sand-300 p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <img 
            src={logoImg} 
            alt="Ohana Swimwear" 
            className="h-12 w-auto mx-auto object-contain"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[11px] font-bold">
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            <span>First-Time Login Security Setup</span>
          </div>
          <h2 className="text-lg font-bold font-display text-ohana-charcoal-900">
            Set Your Store Password
          </h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Welcome, <span className="font-bold text-gray-800">{authSession.user?.storeName || 'Partner'}</span>. Your store was registered by Ohana Admin with temporary credentials. Please set your private password to activate your dashboard.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-sm font-bold text-emerald-900">Password Successfully Updated!</h3>
            <p className="text-xs text-emerald-700">Redirecting to your store inventory & sales dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">New Store Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter new private password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ohana-terracotta/20 focus:border-ohana-terracotta outline-none text-xs font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Re-type your password..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ohana-terracotta/20 focus:border-ohana-terracotta outline-none text-xs font-medium"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-500">
              ✓ Once submitted, your login credentials will be updated in the database and you will gain access to your assigned inventory and sales recording tools.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Saving New Password...' : 'Save Password & Access Dashboard'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
