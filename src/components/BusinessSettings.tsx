import React, { useState } from 'react';
import {
  Settings,
  Building2,
  CreditCard,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  Check,
  Info,
  Plus,
  Users,
  Store,
  DollarSign,
  AlertTriangle,
  Building,
  Zap,
  Droplets,
  Target,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { BusinessProfile } from '../types';
import { StorageService } from '../services/storage';
import { formatPHP } from '../utils/costing';

interface BusinessSettingsProps {
  activeBusiness: BusinessProfile;
  businesses: BusinessProfile[];
  onUpdateBusiness: (updated: Partial<BusinessProfile>) => void;
  onSwitchBusiness: (bizId: string) => void;
  onCreateBusiness: () => void;
  onRefreshData: () => void;
}

export const BusinessSettings: React.FC<BusinessSettingsProps> = ({
  activeBusiness,
  businesses,
  onUpdateBusiness,
  onSwitchBusiness,
  onCreateBusiness,
  onRefreshData,
}) => {
  const [name, setName] = useState(activeBusiness.name);
  const [ownerName, setOwnerName] = useState(activeBusiness.ownerName);
  const [email, setEmail] = useState(activeBusiness.email);
  const [businessType, setBusinessType] = useState(activeBusiness.businessType);
  const [targetFoodCostPercent, setTargetFoodCostPercent] = useState(
    activeBusiness.targetFoodCostPercent.toString()
  );
  const [simulatedPlan, setSimulatedPlan] = useState<'starter' | 'pro' | 'multi_branch'>(
    activeBusiness.plan
  );

  // Operating Overheads State (Rent, Water & Electricity Bills, Employee Rates)
  const overhead = activeBusiness.overheadSettings || {
    includeInCosting: false,
    monthlyRent: 15000,
    monthlyElectricity: 8500,
    monthlyWater: 1200,
    monthlyLabor: 26000,
    otherMonthlyOverhead: 2500,
    estimatedMonthlyCups: 2500,
    staffDetails: { baristaCount: 2, averageMonthlySalary: 13000 },
  };

  const [includeInCosting, setIncludeInCosting] = useState<boolean>(overhead.includeInCosting ?? false);
  const [monthlyRent, setMonthlyRent] = useState<string>(overhead.monthlyRent.toString());
  const [monthlyElectricity, setMonthlyElectricity] = useState<string>(overhead.monthlyElectricity.toString());
  const [monthlyWater, setMonthlyWater] = useState<string>(overhead.monthlyWater.toString());
  const [baristaCount, setBaristaCount] = useState<string>(
    (overhead.staffDetails?.baristaCount ?? 2).toString()
  );
  const [averageMonthlySalary, setAverageMonthlySalary] = useState<string>(
    (overhead.staffDetails?.averageMonthlySalary ?? 13000).toString()
  );
  const [monthlyLabor, setMonthlyLabor] = useState<string>(overhead.monthlyLabor.toString());
  const [otherMonthlyOverhead, setOtherMonthlyOverhead] = useState<string>(
    overhead.otherMonthlyOverhead.toString()
  );
  const [estimatedMonthlyCups, setEstimatedMonthlyCups] = useState<string>(
    overhead.estimatedMonthlyCups.toString()
  );

  const [overheadSuccess, setOverheadSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Handle staff rates update helper
  const handleStaffChange = (countStr: string, salaryStr: string) => {
    setBaristaCount(countStr);
    setAverageMonthlySalary(salaryStr);
    const count = parseInt(countStr) || 0;
    const salary = parseFloat(salaryStr) || 0;
    setMonthlyLabor((count * salary).toString());
  };

  const handleSaveOverheadSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const rentNum = Math.max(0, parseFloat(monthlyRent) || 0);
    const elecNum = Math.max(0, parseFloat(monthlyElectricity) || 0);
    const waterNum = Math.max(0, parseFloat(monthlyWater) || 0);
    const laborNum = Math.max(0, parseFloat(monthlyLabor) || 0);
    const otherNum = Math.max(0, parseFloat(otherMonthlyOverhead) || 0);
    const cupsNum = Math.max(1, parseInt(estimatedMonthlyCups) || 2500);
    const countNum = Math.max(0, parseInt(baristaCount) || 0);
    const salaryNum = Math.max(0, parseFloat(averageMonthlySalary) || 0);

    onUpdateBusiness({
      overheadSettings: {
        includeInCosting,
        monthlyRent: rentNum,
        monthlyElectricity: elecNum,
        monthlyWater: waterNum,
        monthlyLabor: laborNum,
        otherMonthlyOverhead: otherNum,
        estimatedMonthlyCups: cupsNum,
        staffDetails: {
          baristaCount: countNum,
          averageMonthlySalary: salaryNum,
        },
      },
    });

    setOverheadSuccess(true);
    setTimeout(() => setOverheadSuccess(false), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBusiness({
      name: name.trim(),
      ownerName: ownerName.trim(),
      email: email.trim(),
      businessType,
      targetFoodCostPercent: parseFloat(targetFoodCostPercent) || 28,
      plan: simulatedPlan,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExport = () => {
    const json = StorageService.exportFullBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cafepilot_backup_${activeBusiness.id}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = StorageService.importFullBackup(content);
      if (res.success) {
        setImportStatus('Backup restored successfully!');
        onRefreshData();
      } else {
        setImportStatus(`Restore error: ${res.message}`);
      }
      setTimeout(() => setImportStatus(null), 5000);
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (
      confirm(
        'Reset to standard Filipino café seed dataset? This will restore sample ingredients (Fresh Milk, Arabica Beans, Vanilla Syrup, Cups) and test recipes.'
      )
    ) {
      StorageService.resetToDefaults();
      onRefreshData();
      setImportStatus('Reset completed. Loaded default Philippine café database.');
      setTimeout(() => setImportStatus(null), 4000);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-stone-200">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Business Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage café identity, isolated account data, and future subscription SaaS configuration.
        </p>
      </div>

      {/* Account Profile Form */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-800" />
            <h2 className="text-base font-bold text-slate-900">Café Profile & Currency</h2>
          </div>
          {saveSuccess && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Saved successfully
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Type</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
              >
                <option value="Specialty Coffee">Specialty Coffee Shop</option>
                <option value="Milk Tea & Boba">Milk Tea & Boba Shop</option>
                <option value="Coffee Stall / Kiosk">Coffee Stall / Kiosk</option>
                <option value="Juice & Smoothie Bar">Juice & Smoothie Bar</option>
                <option value="Multi-branch Café">Multi-branch Café Chain</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Owner Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Currency Preference</label>
              <input
                type="text"
                disabled
                value="Philippine Peso (PHP ₱)"
                className="w-full px-3 py-2 bg-stone-100 border border-stone-300 rounded-xl text-slate-600 font-mono"
              />
              <span className="text-[10px] text-slate-500">Configured for Philippine beverage operations</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Direct Cost Benchmark (%)
              </label>
              <input
                type="number"
                step="1"
                min="10"
                max="60"
                value={targetFoodCostPercent}
                onChange={(e) => setTargetFoodCostPercent(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 font-mono"
              />
              <span className="text-[10px] text-slate-500">Industry standard: 25% – 28%</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold shadow-2xs transition"
            >
              Update Café Profile
            </button>
          </div>
        </form>
      </div>

      {/* Operating Overheads, Bills (Electricity & Water), Employee Rates & Rent */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Operating Overheads, Bills & Employee Rates
              </h2>
              <p className="text-xs text-slate-500">
                Set monthly rent, water & electricity bills, and staff wages. Optionally include them in recipe unit costing.
              </p>
            </div>
          </div>
          {overheadSuccess && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <Check className="w-3.5 h-3.5" /> Overhead settings saved
            </span>
          )}
        </div>

        {/* Optional Selection for Costing Banner & Toggle */}
        <div className={`p-4 rounded-xl border transition ${
          includeInCosting
            ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/50'
            : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                  Optional Costing Selection: Include Overheads in Recipe Cost Basis
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  includeInCosting
                    ? 'bg-amber-800 text-white'
                    : 'bg-stone-200 text-slate-600'
                }`}>
                  {includeInCosting ? 'Enabled (Loaded)' : 'Disabled (Direct Only)'}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {includeInCosting
                  ? 'Active: Recipes use Fully-Loaded Cost (Direct Ingredients + Packaging + Allocated Overheads) for target pricing and margin calculations.'
                  : 'Inactive: Recipes calculate Direct COGS (Ingredients + Packaging) for gross profit. Overheads are shown as an informational allocation without inflating direct cost basis.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIncludeInCosting(!includeInCosting)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 self-start sm:self-auto ${
                includeInCosting
                  ? 'bg-amber-800 hover:bg-amber-900 text-white shadow-2xs'
                  : 'bg-white border border-stone-300 hover:bg-stone-100 text-slate-800'
              }`}
            >
              {includeInCosting ? (
                <>
                  <CheckSquare className="w-4 h-4 text-amber-300" />
                  <span>Overheads Active in Costing</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-slate-400" />
                  <span>Click to Enable in Costing</span>
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveOverheadSettings} className="space-y-6 text-xs">
          {/* Rent & Utility Bills Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider text-slate-600">
              <Store className="w-4 h-4 text-amber-800" />
              1. Shop / Stall Rent & Utility Bills
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> Monthly Shop / Stall Rent (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₱</span>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                    placeholder="15000"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Fixed lease for kiosk or store space</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600" /> Monthly Electricity Bill (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₱</span>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={monthlyElectricity}
                    onChange={(e) => setMonthlyElectricity(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                    placeholder="8500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Meralco / electric coop (espresso machine, chillers, AC)</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-600" /> Monthly Water Utility Bill (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₱</span>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={monthlyWater}
                    onChange={(e) => setMonthlyWater(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                    placeholder="1200"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Maynilad / Manila Water / local water district</span>
              </div>
            </div>
          </div>

          {/* Employee Rates & Staff Payroll Section */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider text-slate-600">
              <Users className="w-4 h-4 text-indigo-600" />
              2. Employee Rates & Staff Payroll
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Barista / Staff Headcount
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={baristaCount}
                  onChange={(e) => handleStaffChange(e.target.value, averageMonthlySalary)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                  placeholder="2"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Number of active café workers / baristas</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Monthly Rate per Employee (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₱</span>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={averageMonthlySalary}
                    onChange={(e) => handleStaffChange(baristaCount, e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                    placeholder="13000"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Average monthly salary or rate per staff</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Total Monthly Staff Payroll (₱) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₱</span>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={monthlyLabor}
                    onChange={(e) => setMonthlyLabor(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                    placeholder="26000"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Auto-calculated ({baristaCount} staff × {formatPHP(parseFloat(averageMonthlySalary) || 0)}), or edit directly
                </span>
              </div>
            </div>
          </div>

          {/* Other Operating Expenses & Beverage Volume Allocation */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider text-slate-600">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              3. Other Overheads & Volume Allocation Basis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Other Monthly Overheads (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">₱</span>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={otherMonthlyOverhead}
                    onChange={(e) => setOtherMonthlyOverhead(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                    placeholder="2500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  POS subscription, internet, ice delivery, permits & sanitation
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estimated Monthly Beverage Volume (Cups) *
                </label>
                <input
                  type="number"
                  step="50"
                  min="1"
                  required
                  value={estimatedMonthlyCups}
                  onChange={(e) => setEstimatedMonthlyCups(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                  placeholder="2500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Denominator for allocating fixed costs per cup (~{Math.round((parseInt(estimatedMonthlyCups) || 2500) / 30)} cups/day)
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Itemized Overhead Allocation Summary */}
          {(() => {
            const rVal = Math.max(0, parseFloat(monthlyRent) || 0);
            const eVal = Math.max(0, parseFloat(monthlyElectricity) || 0);
            const wVal = Math.max(0, parseFloat(monthlyWater) || 0);
            const lVal = Math.max(0, parseFloat(monthlyLabor) || 0);
            const oVal = Math.max(0, parseFloat(otherMonthlyOverhead) || 0);
            const cVal = Math.max(1, parseInt(estimatedMonthlyCups) || 2500);
            const totFixed = rVal + eVal + wVal + lVal + oVal;
            const rentCup = rVal / cVal;
            const elecCup = eVal / cVal;
            const waterCup = wVal / cVal;
            const laborCup = lVal / cVal;
            const otherCup = oVal / cVal;
            const totOverheadCup = totFixed / cVal;

            return (
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-800" />
                    <span className="font-extrabold text-slate-900 text-xs">
                      Live Allocated Overheads per Serving (Based on {cVal.toLocaleString()} cups/month)
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-mono">
                    Total Fixed Expenses: <strong className="text-slate-950 font-bold">{formatPHP(totFixed)}</strong>/mo
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" /> Rent Allocation
                    </div>
                    <div className="font-extrabold text-slate-900 mt-1">
                      {formatPHP(rentCup)}
                      <span className="text-[10px] font-normal text-slate-400">/cup</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-sans">
                      {formatPHP(rVal)}/mo
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-600" /> Electricity Bill
                    </div>
                    <div className="font-extrabold text-slate-900 mt-1">
                      {formatPHP(elecCup)}
                      <span className="text-[10px] font-normal text-slate-400">/cup</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-sans">
                      {formatPHP(eVal)}/mo
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-cyan-600" /> Water Bill
                    </div>
                    <div className="font-extrabold text-slate-900 mt-1">
                      {formatPHP(waterCup)}
                      <span className="text-[10px] font-normal text-slate-400">/cup</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-sans">
                      {formatPHP(wVal)}/mo
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                      <Users className="w-3 h-3 text-indigo-600" /> Employee Rates
                    </div>
                    <div className="font-extrabold text-slate-900 mt-1">
                      {formatPHP(laborCup)}
                      <span className="text-[10px] font-normal text-slate-400">/cup</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-sans">
                      {formatPHP(lVal)}/mo
                    </div>
                  </div>

                  <div className="bg-amber-100/80 p-2.5 rounded-xl border border-amber-300 col-span-2 sm:col-span-1">
                    <div className="text-[10px] font-bold uppercase text-amber-950 font-sans">
                      Total Overhead / Cup
                    </div>
                    <div className="font-black text-amber-950 mt-1 text-sm">
                      +{formatPHP(totOverheadCup)}
                    </div>
                    <div className="text-[9px] text-amber-900 font-sans font-medium">
                      per beverage sold
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold shadow-2xs transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Overhead, Bill & Rate Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Multi-Business Isolation Manager */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">
              Multi-Business Accounts & Data Isolation
            </h2>
          </div>
          <button
            onClick={onCreateBusiness}
            className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Café</span>
          </button>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-slate-600">
          <strong>Data Partition Guarantee: </strong>
          Each café business is assigned a unique isolated tenant partition key (<code>businessId</code>).
          Ingredients, recipes, stock logs, and pricing rules never cross over between businesses.
        </div>

        <div className="space-y-2">
          {businesses.map((b) => (
            <div
              key={b.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                b.id === activeBusiness.id
                  ? 'bg-amber-50/60 border-amber-300 text-amber-950 font-medium'
                  : 'bg-white border-stone-200 text-slate-700 hover:bg-stone-50'
              }`}
            >
              <div>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>{b.name}</span>
                  {b.id === activeBusiness.id && (
                    <span className="text-[10px] font-mono uppercase bg-amber-800 text-white px-2 py-0.5 rounded-full">
                      Active Business
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Type: {b.businessType} • Owner: {b.ownerName} ({b.email})
                </div>
              </div>

              {b.id !== activeBusiness.id && (
                <button
                  onClick={() => onSwitchBusiness(b.id)}
                  className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Switch To This Café
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Subscription SaaS Architecture Preview */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-800" />
            <h2 className="text-base font-bold text-slate-900">
              Future SaaS Subscription Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Planned commercial pricing tiers for independent Philippine beverage shops.
          </p>
        </div>

        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Transparent SaaS Architecture Notice: </strong>
            These are proposed subscription tiers for production deployment. In this initial MVP, all core modules are accessible without simulated payment charges.
            Future billing will integrate local Philippine gateways (GCash, Maya, cards via PayMongo or Stripe).
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Starter */}
          <div
            className={`rounded-2xl p-4 border flex flex-col justify-between ${
              simulatedPlan === 'starter'
                ? 'border-amber-800 ring-2 ring-amber-800/20 bg-amber-50/30'
                : 'border-stone-200 bg-white'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tier 1
              </span>
              <h3 className="text-base font-black text-slate-900 mt-0.5">STARTER</h3>
              <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
                ₱299<span className="text-xs font-normal text-slate-500">/month</span>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Full Recipe Costing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Ingredient Database
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Basic Profitability Dashboard
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                setSimulatedPlan('starter');
                onUpdateBusiness({ plan: 'starter' });
              }}
              className="mt-4 w-full py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-semibold rounded-xl text-xs transition"
            >
              {simulatedPlan === 'starter' ? 'Current Plan' : 'Select Starter'}
            </button>
          </div>

          {/* Pro */}
          <div
            className={`rounded-2xl p-4 border flex flex-col justify-between relative ${
              simulatedPlan === 'pro'
                ? 'border-amber-800 ring-2 ring-amber-800/30 bg-amber-50/40'
                : 'border-stone-200 bg-white'
            }`}
          >
            <div className="absolute -top-2.5 right-3 bg-amber-800 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
              Recommended
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Tier 2
              </span>
              <h3 className="text-base font-black text-slate-900 mt-0.5">PRO</h3>
              <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
                ₱599<span className="text-xs font-normal text-slate-500">/month</span>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> All Starter Features
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Advanced Menu Sensitivity Analysis
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> On-Hand Inventory Management
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> CaféPilot AI Advisor
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                setSimulatedPlan('pro');
                onUpdateBusiness({ plan: 'pro' });
              }}
              className="mt-4 w-full py-2 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded-xl text-xs transition"
            >
              {simulatedPlan === 'pro' ? 'Current Plan' : 'Select Pro'}
            </button>
          </div>

          {/* Multi-Branch */}
          <div
            className={`rounded-2xl p-4 border flex flex-col justify-between ${
              simulatedPlan === 'multi_branch'
                ? 'border-amber-800 ring-2 ring-amber-800/20 bg-amber-50/30'
                : 'border-stone-200 bg-white'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tier 3
              </span>
              <h3 className="text-base font-black text-slate-900 mt-0.5">MULTI-BRANCH</h3>
              <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
                ₱1,499<span className="text-xs font-normal text-slate-500">/month</span>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Multi-Location Management
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Consolidated Cost Reporting
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Branch Price Comparisons
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Staff Role Permissions
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                setSimulatedPlan('multi_branch');
                onUpdateBusiness({ plan: 'multi_branch' });
              }}
              className="mt-4 w-full py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-semibold rounded-xl text-xs transition"
            >
              {simulatedPlan === 'multi_branch' ? 'Current Plan' : 'Select Multi-Branch'}
            </button>
          </div>
        </div>
      </div>

      {/* Backup & Disaster Recovery */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-amber-800" />
            <h2 className="text-base font-bold text-slate-900">
              Data Backup, Export & Seed Reset
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Export a full JSON backup of your café's recipes and ingredients to your device.
          </p>
        </div>

        {importStatus && (
          <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl text-xs text-slate-800 font-medium">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleExport}
            className="p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export JSON Backup</span>
          </button>

          <label className="p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-center gap-2 cursor-pointer transition">
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Import JSON Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetData}
            className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4 text-rose-600" />
            <span>Reset Demo Seed Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
