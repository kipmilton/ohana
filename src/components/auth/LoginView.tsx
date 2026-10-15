import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, 
  Mail, 
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Database,
  CheckCircle2,
  AlertTriangle,
  X,
  Server
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { getStoredSupabaseConfig, saveSupabaseConfig, getSupabase } from '../../lib/supabase';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Supabase connection state
  const [supabaseConfig, setSupabaseConfig] = useState(getStoredSupabaseConfig());
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [inputUrl, setInputUrl] = useState(supabaseConfig.url || '');
  const [inputKey, setInputKey] = useState(supabaseConfig.anonKey || '');
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);

  const getCleanDomain = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname;
    } catch {
      return url || 'supabase.co';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Invalid email or password. Please verify your credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(inputUrl, inputKey);
    const updated = getStoredSupabaseConfig();
    setSupabaseConfig(updated);
    setConfigSuccess('Supabase credentials saved successfully! Authentication is now live.');
    setTimeout(() => {
      setShowConfigModal(false);
      setConfigSuccess(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ohana-sand-100 via-white to-ohana-sand-200 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-ohana-sand-300 p-6 sm:p-10 space-y-6">
        
        {/* Logo and Brand */}
        <div className="text-center space-y-2">
          <img 
            src={logoImg} 
            alt="Ohana Swimwear" 
            className="h-16 w-auto mx-auto object-contain"
          />
          <h1 className="text-xl sm:text-2xl font-bold font-display text-ohana-charcoal-900 tracking-tight">
            Ohana Operations Portal
          </h1>
          <p className="text-xs text-gray-500">
            Nationwide Retail Partner Distribution & Management System
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Unified Authentication Form (Role automatically detected) */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-semibold mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your registered email (e.g. admin or store email)..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ohana-terracotta/20 focus:border-ohana-terracotta outline-none text-xs font-medium min-h-[46px]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ohana-terracotta/20 focus:border-ohana-terracotta outline-none text-xs font-medium min-h-[46px]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-gray-500 block mt-1.5 leading-relaxed">
              First-time login for new stores? Use the temporary password issued by Ohana Admin. You will be prompted to set your private password upon login.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[46px] text-sm"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100 text-center flex items-center justify-between text-[11px] text-gray-400">
          <span>Ohana Family Wear Limited · Kenya</span>
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="text-gray-500 hover:text-ohana-charcoal underline"
          >
            Database Config
          </button>
        </div>

      </div>

      {/* Supabase Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-ohana-charcoal">
                <Database className="w-5 h-5 text-ohana-terracotta" />
                <h3 className="font-bold text-sm">Supabase Cloud Connection</h3>
              </div>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              This app authenticates users and their roles directly via Supabase Auth and the <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">public.profiles</code> table. Ensure your project keys are set here or in Vercel environment variables.
            </p>

            {configSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{configSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Supabase Project URL (<code className="text-gray-500">VITE_SUPABASE_URL</code>)
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl outline-none focus:border-ohana-terracotta text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Supabase Anon Key (<code className="text-gray-500">VITE_SUPABASE_ANON_KEY</code>)
                </label>
                <textarea
                  rows={3}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-ohana-terracotta text-xs font-mono"
                  required
                />
              </div>

              <div className="p-3 bg-ohana-sand-100 rounded-xl text-[11px] text-gray-600 space-y-1">
                <p className="font-semibold text-ohana-charcoal">Recommended setup for production:</p>
                <p>Add these 2 variables into your Vercel Dashboard under <strong>Project Settings → Environment Variables</strong>. Once set in Vercel, every visitor connects automatically!</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
