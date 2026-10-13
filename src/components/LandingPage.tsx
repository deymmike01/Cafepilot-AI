import React, { useState } from 'react';
import {
  Coffee,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Boxes,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  ChevronDown,
  Info,
  Layers,
  Store,
} from 'lucide-react';
import { formatPHP, formatPercent } from '../utils/costing';

interface LandingPageProps {
  onLaunchApp: () => void;
  onOpenTests: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  onOpenTests,
}) => {
  // Interactive Live Demo Calculator State (matches user brief's exact Test 2 & 3 scenario!)
  const [demoEspressoQty, setDemoEspressoQty] = useState(36);
  const [demoEspressoCost, setDemoEspressoCost] = useState(0.30);
  const [demoMilkQty, setDemoMilkQty] = useState(200);
  const [demoMilkCost, setDemoMilkCost] = useState(0.10);
  const [demoSyrupQty, setDemoSyrupQty] = useState(20);
  const [demoSyrupCost, setDemoSyrupCost] = useState(0.15);
  const [demoPackagingCost, setDemoPackagingCost] = useState(7.00);
  const [demoSellingPrice, setDemoSellingPrice] = useState(140.00);

  // Deterministic Demo Calculations
  const calcEspresso = demoEspressoQty * demoEspressoCost;
  const calcMilk = demoMilkQty * demoMilkCost;
  const calcSyrup = demoSyrupQty * demoSyrupCost;
  const calcTotalIngredients = calcEspresso + calcMilk + calcSyrup;
  const calcTotalDirect = calcTotalIngredients + demoPackagingCost;
  const calcGrossProfit = demoSellingPrice - calcTotalDirect;
  const calcIngPercent = demoSellingPrice > 0 ? (calcTotalIngredients / demoSellingPrice) * 100 : 0;
  const calcDirectPercent = demoSellingPrice > 0 ? (calcTotalDirect / demoSellingPrice) * 100 : 0;

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Does CaféPilot AI work for milk tea, fruit tea, and juice bars?',
      a: 'Yes! CaféPilot is built for any beverage operation. It supports metric units (milliliters, grams, pieces) and allows you to cost boba pearls, popping pearls, syrups, fruit syrups, tea bags, Assam tea concentrate, and disposable cups/sealing film.',
    },
    {
      q: 'Does gross profit mean my drink is profitable overall?',
      a: 'No. This is a critical accounting distinction: Gross Profit equals Selling Price minus Total Direct Recipe & Packaging Costs. It does NOT deduct fixed operating expenses such as café stall rent, barista salaries, power, ice supplier fees, and local BIR taxes. Your gross profit is the contribution margin that pays for these overheads.',
    },
    {
      q: 'Can I use CaféPilot on my smartphone behind the bar?',
      a: 'Yes. CaféPilot AI is designed mobile-first. You can input ingredients, check costs, adjust prices, and log inventory receipts directly on any Android or iPhone web browser with zero horizontal scroll issues.',
    },
    {
      q: 'What happens when my supplier increases milk or coffee bean prices?',
      a: 'Every recipe that contains that ingredient recalculates automatically in real time. You will immediately see which drinks dropped below your target profit margin.',
    },
    {
      q: 'Do I need paid API keys to use the costing and inventory tools?',
      a: 'No! All recipe mathematical calculations, inventory tracking, and margin matrices operate entirely through deterministic application logic with zero external paid API requirements. The AI Menu Advisor connects to Gemini when configured or seamlessly provides built-in deterministic business analysis if offline.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 selection:bg-amber-800 selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-amber-950 text-amber-200 text-xs py-2 px-4 text-center font-medium border-b border-amber-900/60">
        <span className="font-bold text-amber-300 mr-2">🇵🇭 Made for Philippine Beverage Businesses:</span>
        Independent Coffee Shops, Milk Tea Kiosks, and Neighborhood Drink Stalls
      </div>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold tracking-wide">
            <Coffee className="w-3.5 h-3.5 text-amber-800" />
            <span>CaféPilot AI • Know Your Costs. Master Your Margins.</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Know the Real Cost of Every Drink You Sell.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            CaféPilot AI helps independent cafés, coffee stalls, and beverage shops calculate exact recipe costs, understand menu margins, and make smarter pricing decisions in Philippine Pesos (₱).
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition"
            >
              <span>Launch Free Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenTests}
              className="w-full sm:w-auto px-5 py-3.5 bg-white border border-stone-300 hover:bg-stone-50 text-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-2xs transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Verify Mathematical Accuracy (8 Tests)</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free Tier Ready
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Metric & PHP Currency
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mobile-First UI
            </span>
          </div>
        </div>
      </section>

      {/* The Problem & The Solution */}
      <section className="bg-white border-y border-stone-200/90 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
              The Reality of Running a Beverage Business
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Why Beverage Margins Disappear
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Most independent shop owners price their menu by looking at nearby competitors, unaware that supplier price increases and uncosted packaging are secretly eating their profits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-base">Unaccounted Packaging & Spillage</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cups, dome lids, kraft sleeves, and straws often cost ₱6 to ₱9 per serving. Ignoring packaging distorts your true cost basis by over 15%.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-base">Unnoticed Supplier Price Hikes</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When fresh milk goes from ₱90 to ₱105 per carton or syrup suppliers add delivery surcharges, margins compress quietly without spreadsheet alerts.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-base">The Solution: Dynamic Costing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                CaféPilot AI links every ingredient to every recipe. Update a price once, and every drink margin recalculates immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Calculator (Section 11 Test 2 & 3 scenario!) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-[#1E232A] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-stone-800 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold mb-3 border border-amber-500/30">
              Interactive Recipe Costing Simulation
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Test the Deterministic Recipe Calculator Live
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Adjust portions or ingredient unit costs below. Calculations use pure deterministic mathematics — never language model estimates.
            </p>
            <div className="mt-2 text-[11px] text-amber-400 font-mono">
              *Illustrative values for demonstration purposes.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-4 text-xs font-mono">
              {/* Espresso */}
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 flex items-center justify-between gap-3">
                <div className="font-sans">
                  <div className="font-bold text-white">Espresso Dose</div>
                  <div className="text-[11px] text-slate-400">@ ₱{demoEspressoCost.toFixed(2)}/ml</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={demoEspressoQty}
                    onChange={(e) => setDemoEspressoQty(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-right font-bold text-amber-300"
                  />
                  <span className="text-slate-400 font-sans">ml</span>
                  <span className="w-16 text-right font-bold text-white">{formatPHP(calcEspresso)}</span>
                </div>
              </div>

              {/* Milk */}
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 flex items-center justify-between gap-3">
                <div className="font-sans">
                  <div className="font-bold text-white">Fresh Whole Milk</div>
                  <div className="text-[11px] text-slate-400">@ ₱{demoMilkCost.toFixed(2)}/ml</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={demoMilkQty}
                    onChange={(e) => setDemoMilkQty(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-right font-bold text-amber-300"
                  />
                  <span className="text-slate-400 font-sans">ml</span>
                  <span className="w-16 text-right font-bold text-white">{formatPHP(calcMilk)}</span>
                </div>
              </div>

              {/* Syrup */}
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 flex items-center justify-between gap-3">
                <div className="font-sans">
                  <div className="font-bold text-white">Vanilla Syrup</div>
                  <div className="text-[11px] text-slate-400">@ ₱{demoSyrupCost.toFixed(2)}/ml</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={demoSyrupQty}
                    onChange={(e) => setDemoSyrupQty(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-right font-bold text-amber-300"
                  />
                  <span className="text-slate-400 font-sans">ml</span>
                  <span className="w-16 text-right font-bold text-white">{formatPHP(calcSyrup)}</span>
                </div>
              </div>

              {/* Packaging */}
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 flex items-center justify-between gap-3">
                <div className="font-sans">
                  <div className="font-bold text-white">Packaging Cost</div>
                  <div className="text-[11px] text-slate-400">16oz Cup + Lid + Straw</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={demoPackagingCost}
                    onChange={(e) => setDemoPackagingCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-right font-bold text-amber-300"
                  />
                  <span className="text-slate-400 font-sans">₱</span>
                  <span className="w-16 text-right font-bold text-white">{formatPHP(demoPackagingCost)}</span>
                </div>
              </div>

              {/* Selling price */}
              <div className="bg-amber-950/40 p-3.5 rounded-xl border border-amber-600/40 flex items-center justify-between gap-3">
                <div className="font-sans">
                  <div className="font-bold text-amber-300">Retail Selling Price</div>
                  <div className="text-[11px] text-amber-200/70">Customer menu price</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-300">₱</span>
                  <input
                    type="number"
                    value={demoSellingPrice}
                    onChange={(e) => setDemoSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-20 px-2 py-1 bg-slate-900 border border-amber-500 rounded text-right font-bold text-amber-300 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Live Evaluated Results Panel */}
            <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4 font-mono">
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-sans">
                  Deterministic Financial Output
                </span>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Sum of Ingredients:</span>
                  <span className="font-bold text-white">{formatPHP(calcTotalIngredients)}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Packaging Allowance:</span>
                  <span className="font-bold text-white">{formatPHP(demoPackagingCost)}</span>
                </div>

                <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-xs font-bold text-rose-400">
                  <span>Total Direct Cost:</span>
                  <span className="text-sm font-black">{formatPHP(calcTotalDirect)}</span>
                </div>

                <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-sm font-black text-emerald-400">
                  <span>Gross Profit per Cup:</span>
                  <span className="text-lg">{formatPHP(calcGrossProfit)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block font-sans">Ing-Cost %</span>
                    <span className="font-bold text-white text-xs">{formatPercent(calcIngPercent)}</span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block font-sans">Direct-Cost %</span>
                    <span className="font-bold text-amber-300 text-xs">{formatPercent(calcDirectPercent)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onLaunchApp}
                className="w-full py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition"
              >
                <span>Save This Recipe in Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="bg-white border-y border-stone-200/90 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
              Simple 3-Step Operations Workflow
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              How CaféPilot AI Works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-2xs font-extrabold text-lg">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-base">Record Raw Ingredients</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log purchase prices, carton volumes, and usable yields (accounting for dial-in coffee purge and syrup cling).
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-2xs font-extrabold text-lg">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-base">Assemble Dynamic Recipes</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Combine ingredients dynamically with cup and lid packaging to calculate total direct cost per drink.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-2xs font-extrabold text-lg">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-base">Audit Margins & AI Advice</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                View your sortable menu margin matrix, benchmark suggested pricing, and consult CaféPilot Advisor for strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SaaS Subscription Architecture & Plans */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
            Subscription SaaS Architecture
          </h2>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
            Transparent Pricing Built for Micro-Cafés
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            No bloated enterprise software fees. Scalable tiers designed for the Philippine coffee and beverage market.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Single Stall / Kiosk
              </span>
              <h4 className="text-xl font-black text-slate-900 mt-1">STARTER</h4>
              <div className="mt-3 text-3xl font-black text-slate-900 font-mono">
                ₱299<span className="text-xs font-normal text-slate-500 font-sans">/mo</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Essential costing formulas for pop-ups, mobile carts, and starter coffee kiosks.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Full Recipe Costing Calculator
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Ingredient Database & Yields
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Menu Profitability Dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> CSV Spreadsheets Export
                </li>
              </ul>
            </div>
            <button
              onClick={onLaunchApp}
              className="mt-6 w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold rounded-xl text-xs transition"
            >
              Start Free Trial
            </button>
          </div>

          {/* Pro */}
          <div className="bg-white border-2 border-amber-800 rounded-3xl p-6 shadow-md flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 bg-amber-800 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
              Most Popular
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Independent Specialty Café
              </span>
              <h4 className="text-xl font-black text-slate-900 mt-1">PRO</h4>
              <div className="mt-3 text-3xl font-black text-slate-900 font-mono">
                ₱599<span className="text-xs font-normal text-slate-500 font-sans">/mo</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Complete menu intelligence, stock monitoring, and AI recommendations.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Everything in Starter
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Advanced Menu Sensitivity Analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> On-Hand Inventory Tracking & Waste
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> CaféPilot AI Advisor
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Price Spike Sensitivity Simulator
                </li>
              </ul>
            </div>
            <button
              onClick={onLaunchApp}
              className="mt-6 w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs transition shadow-2xs"
            >
              Launch Pro Workspace
            </button>
          </div>

          {/* Multi-Branch */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Growing Café Chain
              </span>
              <h4 className="text-xl font-black text-slate-900 mt-1">MULTI-BRANCH</h4>
              <div className="mt-3 text-3xl font-black text-slate-900 font-mono">
                ₱1,499<span className="text-xs font-normal text-slate-500 font-sans">/mo</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                For café brands operating 2 or more branches with consolidated oversight.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Everything in Pro
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Multi-Branch Consolidated Reporting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Branch Price Comparisons
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Multi-Account Data Partitioning
                </li>
              </ul>
            </div>
            <button
              onClick={onLaunchApp}
              className="mt-6 w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold rounded-xl text-xs transition"
            >
              Contact for Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="bg-white border-y border-stone-200/90 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
              Frequently Asked Questions
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Clear Answers for Business Owners
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-stone-200 rounded-2xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:bg-stone-50 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-amber-800' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-stone-100 bg-stone-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Footer */}
      <footer className="bg-[#1E232A] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-800 flex items-center justify-center mx-auto text-amber-100 shadow-md">
            <Coffee className="w-6 h-6" />
          </div>

          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Take Control of Your Beverage Margins Today.
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Stop guessing drink costs. Calculate accurate recipe margins, manage ingredients, and make confident pricing decisions.
          </p>

          <div className="pt-2">
            <button
              onClick={onLaunchApp}
              className="px-8 py-3.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-lg transition"
            >
              Open CaféPilot AI Workspace
            </button>
          </div>

          <div className="border-t border-slate-800 pt-8 mt-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>© 2026 CaféPilot AI. All rights reserved.</span>
            <span>Tagline: Know Your Costs. Master Your Margins.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
