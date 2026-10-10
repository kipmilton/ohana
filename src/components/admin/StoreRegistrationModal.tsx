import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StoreAccount } from '../../types';
import { 
  Store, 
  MapPin, 
  User, 
  Mail, 
  Key, 
  CheckCircle2, 
  Copy, 
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreRegistrationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { registerStore } = useApp();

  const [name, setName] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [address, setAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState(`Ohana${Math.floor(1000 + Math.random() * 9000)}!`);

  const [registeredStore, setRegisteredStore] = useState<StoreAccount | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const created = registerStore({
      name,
      locationCity: locationCity || 'Nairobi',
      address: address || 'Kenya',
      contactName: contactName || 'Store Manager',
      email,
      temporaryPassword,
    });

    setRegisteredStore(created);
  };

  const handleCopyCredentials = () => {
    if (!registeredStore) return;
    const text = `OHANA STORE LOGIN CREDENTIALS
Store: ${registeredStore.name}
Portal URL: http://localhost:3000
Username: ${registeredStore.email}
Temporary Password: ${registeredStore.password}
*Note: You will be prompted to reset your password upon first login.*`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetAndClose = () => {
    setName('');
    setLocationCity('');
    setAddress('');
    setContactName('');
    setEmail('');
    setTemporaryPassword(`Ohana${Math.floor(1000 + Math.random() * 9000)}!`);
    setRegisteredStore(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-ohana-sand-300 relative animate-in fade-in zoom-in-95 duration-150">
        
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {registeredStore ? (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold font-display text-ohana-charcoal-900">
                Store Registered Successfully!
              </h2>
              <p className="text-xs text-gray-500">
                The store account has been created. Share these temporary login details with the vendor.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-ohana-sand-50 rounded-2xl border border-ohana-sand-300 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-ohana-sand-200">
                <span className="font-bold text-ohana-charcoal-900">{registeredStore.name}</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  Reset Password Required
                </span>
              </div>

              <div className="space-y-1 font-mono text-[11px]">
                <p><span className="text-gray-500 font-sans">Store Code:</span> <span className="font-bold">{registeredStore.code}</span></p>
                <p><span className="text-gray-500 font-sans">Login Email:</span> <span className="font-bold text-ohana-charcoal-900">{registeredStore.email}</span></p>
                <p><span className="text-gray-500 font-sans">Temporary Password:</span> <span className="font-bold text-ohana-terracotta bg-white px-2 py-0.5 rounded border border-gray-200">{registeredStore.password}</span></p>
              </div>

              <p className="text-[11px] text-gray-500 pt-1">
                When the vendor signs in with these credentials, they will be automatically prompted to choose a new password before accessing their dashboard.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 py-2.5 px-4 bg-ohana-charcoal-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4 text-ohana-gold-400" />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Login Credentials'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="py-2.5 px-5 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <Store className="w-5 h-5 text-ohana-terracotta" />
              <h2 className="text-base font-bold font-display text-ohana-charcoal-900">
                Register New Retail Store
              </h2>
            </div>
            <p className="text-xs text-gray-500 -mt-2 mb-3">
              Create a stockist profile and generate temporary credentials for the vendor.
            </p>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Store / Boutique Name</label>
              <input
                type="text"
                placeholder="e.g. Watamu Beach Club Boutique"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-ohana-terracotta focus:ring-1 focus:ring-ohana-terracotta outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">City / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Watamu / Kilifi"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-ohana-terracotta outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Contact Manager</label>
                <input
                  type="text"
                  placeholder="e.g. Grace Wanjiku"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-ohana-terracotta outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Store Address / Mall</label>
              <input
                type="text"
                placeholder="e.g. Turtle Bay Road, Watamu"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-ohana-terracotta outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Store Login Email</label>
              <input
                type="email"
                placeholder="e.g. watamu@ohana.co.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:border-ohana-terracotta outline-none font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Initial Temporary Password</label>
              <div className="relative">
                <input
                  type="text"
                  value={temporaryPassword}
                  onChange={(e) => setTemporaryPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 pr-20 font-mono text-xs font-bold text-ohana-charcoal-900 bg-gray-50 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setTemporaryPassword(`Ohana${Math.floor(1000 + Math.random() * 9000)}!`)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-ohana-terracotta font-bold hover:underline"
                >
                  Regenerate
                </button>
              </div>
              <span className="text-[10px] text-gray-500 block mt-1">
                Vendor will be required to change this password on their first login.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-ohana-terracotta hover:bg-ohana-terracotta-600 text-white rounded-xl font-bold shadow-md transition-all"
              >
                Register Store & Issue Login
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
