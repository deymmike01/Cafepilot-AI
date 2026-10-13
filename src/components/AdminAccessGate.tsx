import React, { useState } from 'react';
import { ShieldAlert, Lock, KeyRound, ArrowRight, Store, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';

interface AdminAccessGateProps {
  moduleTitle: string;
  moduleDescription: string;
  onUnlockAdmin: () => void;
  onGoToInventory: () => void;
}

export const AdminAccessGate: React.FC<AdminAccessGateProps> = ({
  moduleTitle,
  moduleDescription,
  onUnlockAdmin,
  onGoToInventory,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default Manager PIN is 1234 or any manager pass
    if (pin.trim() === '1234' || pin.trim() === 'admin' || pin.trim() === 'manager') {
      setSuccess(true);
      setError('');
      setTimeout(() => {
        onUnlockAdmin();
      }, 400);
    } else {
      setError('Incorrect Manager PIN. (Default demonstration PIN is 1234)');
    }
  };

  return (
    <div className="max-w-xl mx-auto my-12 bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-md text-center space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
        <Lock className="w-7 h-7 text-amber-800" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Administrator Access Only</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Manager Authorization Required
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          The <strong>{moduleTitle}</strong> module contains confidential business financials, overhead bills, employee payroll rates, and profit margin targets reserved for Café Managers and Admins.
        </p>
      </div>

      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-left text-slate-700 space-y-2">
        <div className="font-bold text-slate-900 flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-800" />
          <span>Employee Authorization Notice:</span>
        </div>
        <p>
          Staff & employees have authorized access to view and update <strong>Inventory & Stocks On Hand</strong>, receive deliveries, log spoilage, and generate printable stock requisitions.
        </p>
      </div>

      {/* PIN Unlock Form */}
      <form onSubmit={handleVerifyPin} className="space-y-3 max-w-xs mx-auto">
        <label className="block text-xs font-semibold text-slate-700">
          Enter Manager PIN to Unlock:
        </label>
        <div className="relative">
          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            maxLength={6}
            placeholder="Default PIN: 1234"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError('');
            }}
            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-center font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
          />
        </div>

        {error && <p className="text-rose-700 text-xs font-semibold">{error}</p>}
        {success && (
          <p className="text-emerald-700 text-xs font-bold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Manager Authenticated!
          </p>
        )}

        <button
          type="submit"
          className="w-full py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold shadow-2xs transition flex items-center justify-center gap-2"
        >
          <span>Unlock Administrator View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
        <button
          type="button"
          onClick={onGoToInventory}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-xl font-semibold flex items-center gap-1.5 transition"
        >
          <Store className="w-3.5 h-3.5 text-amber-700" />
          <span>Switch to Inventory & Stocks Workspace</span>
        </button>
        <button
          type="button"
          onClick={() => onUnlockAdmin()}
          className="text-amber-800 hover:underline font-bold text-xs"
        >
          Quick Switch to Manager (Bypass PIN)
        </button>
      </div>
    </div>
  );
};
