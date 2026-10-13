import React, { useState } from 'react';
import {
  Coffee,
  LayoutDashboard,
  UtensilsCrossed,
  Sparkles,
  BookOpen,
  DollarSign,
  Boxes,
  Settings,
  ChevronDown,
  Plus,
  ShieldCheck,
  Globe,
  Store,
} from 'lucide-react';
import { BusinessProfile, UserRole } from '../types';

export type NavTab =
  | 'dashboard'
  | 'ingredients'
  | 'recipes'
  | 'profitability'
  | 'inventory'
  | 'advisor'
  | 'settings';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  businesses: BusinessProfile[];
  activeBusiness: BusinessProfile;
  userRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  onSwitchBusiness: (bizId: string) => void;
  onCreateBusiness: () => void;
  onOpenTests: () => void;
  isLandingPageMode: boolean;
  setIsLandingPageMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  businesses,
  activeBusiness,
  userRole,
  onSwitchRole,
  onSwitchBusiness,
  onCreateBusiness,
  onOpenTests,
  isLandingPageMode,
  setIsLandingPageMode,
}) => {
  const [bizDropdownOpen, setBizDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const isEmployee = userRole === 'employee';

  const tabs: {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    adminOnly?: boolean;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'ingredients', label: 'Ingredients', icon: <Boxes className="w-4 h-4" /> },
    {
      id: 'recipes',
      label: 'Recipe Costing',
      icon: <UtensilsCrossed className="w-4 h-4" />,
      adminOnly: true,
    },
    {
      id: 'profitability',
      label: 'Menu Margins',
      icon: <DollarSign className="w-4 h-4" />,
      adminOnly: true,
    },
    {
      id: 'inventory',
      label: 'Inventory & Stocks',
      icon: <Store className="w-4 h-4" />,
      badge: isEmployee ? 'Staff Access' : undefined,
    },
    {
      id: 'advisor',
      label: 'AI Advisor',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      badge: 'AI',
      adminOnly: true,
    },
    {
      id: 'settings',
      label: 'Business & Plans',
      icon: <Settings className="w-4 h-4" />,
      adminOnly: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#1E232A] text-white border-b border-slate-800 shadow-md">
      {/* Top Banner & Quick Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => {
              setIsLandingPageMode(false);
              setActiveTab('dashboard');
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-sm ring-1 ring-amber-400/30 group-hover:scale-105 transition">
              <Coffee className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-base sm:text-lg text-white">
                  CaféPilot
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
                Know Your Costs. Master Your Margins.
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role Switcher: Admin / Manager vs Employee */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                isEmployee
                  ? 'bg-blue-950/80 border-blue-500/50 text-blue-200'
                  : 'bg-amber-950/80 border-amber-500/50 text-amber-200'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isEmployee ? 'bg-blue-400' : 'bg-amber-400'
                }`}
              ></div>
              <span className="hidden sm:inline">
                {isEmployee ? '👷 Employee (Stocks Only)' : '👑 Admin / Manager'}
              </span>
              <span className="sm:hidden">{isEmployee ? 'Employee' : 'Admin'}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select User Access Role
                </div>

                {/* Manager option */}
                <button
                  onClick={() => {
                    onSwitchRole('admin');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition ${
                    !isEmployee ? 'bg-amber-950/40 text-amber-300 font-bold' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span>👑 Café Manager & Admin</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Full access to settings, bills, rates & margins
                    </div>
                  </div>
                  {!isEmployee && (
                    <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </button>

                {/* Employee option */}
                <button
                  onClick={() => {
                    onSwitchRole('employee');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition ${
                    isEmployee ? 'bg-blue-950/40 text-blue-300 font-bold' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span>👷 Barista / Employee</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Inventory & stocks access only (safeguarded)
                    </div>
                  </div>
                  {isEmployee && (
                    <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Landing vs App Mode Switcher */}
          <button
            onClick={() => setIsLandingPageMode(!isLandingPageMode)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              isLandingPageMode
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {isLandingPageMode ? (
              <>
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Open App Workspace</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">View Public Landing Page</span>
                <span className="sm:hidden">Landing</span>
              </>
            )}
          </button>

          {/* Business Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setBizDropdownOpen(!bizDropdownOpen)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="max-w-[110px] sm:max-w-[150px] truncate">{activeBusiness.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {bizDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Business
                </div>
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSwitchBusiness(b.id);
                      setBizDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition ${
                      b.id === activeBusiness.id ? 'bg-amber-950/40 text-amber-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate">{b.name}</div>
                      <div className="text-[10px] text-slate-400">{b.businessType}</div>
                    </div>
                    {b.id === activeBusiness.id && (
                      <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </button>
                ))}
                <div className="border-t border-slate-800 my-1"></div>
                <button
                  onClick={() => {
                    setBizDropdownOpen(false);
                    onCreateBusiness();
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 text-amber-400 hover:bg-slate-800 font-medium transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create / Register New Café</span>
                </button>
              </div>
            )}
          </div>

          {/* Test suite button */}
          <button
            onClick={onOpenTests}
            title="Run Acceptance Criteria Verification Tests"
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-600/40 text-emerald-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Run Tests</span>
          </button>
        </div>
      </div>

      {/* Main Tab Bar (Visible when in workspace mode) */}
      {!isLandingPageMode && (
        <div className="bg-[#181C22] border-t border-slate-800 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 flex items-center gap-1 py-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isLockedForEmployee = isEmployee && tab.adminOnly;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {isLockedForEmployee ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      🔒 Admin
                    </span>
                  ) : tab.badge ? (
                    <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-500/30 text-amber-300">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
