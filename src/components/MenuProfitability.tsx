import React, { useState } from 'react';
import {
  DollarSign,
  ArrowUpDown,
  Download,
  Search,
  Filter,
  Sparkles,
  Info,
  TrendingUp,
  TrendingDown,
  Sliders,
  Building,
  Zap,
  Droplets,
  Users,
  Target,
} from 'lucide-react';
import { CalculatedRecipe, BusinessProfile } from '../types';
import { formatPHP, formatPercent } from '../utils/costing';

interface MenuProfitabilityProps {
  recipes: CalculatedRecipe[];
  business: BusinessProfile;
  onSelectRecipe?: (recipe: CalculatedRecipe) => void;
}

type SortField =
  | 'name'
  | 'sellingPrice'
  | 'totalIngredientCost'
  | 'packagingCost'
  | 'totalDirectCost'
  | 'grossProfit'
  | 'fullyLoadedCost'
  | 'netProfit'
  | 'ingredientCostPercentage'
  | 'directCostPercentage'
  | 'netProfitPercentage';

export const MenuProfitability: React.FC<MenuProfitabilityProps> = ({
  recipes,
  business,
  onSelectRecipe,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [costingViewMode, setCostingViewMode] = useState<'gross' | 'net'>('gross');
  const [sortField, setSortField] = useState<SortField>('grossProfit');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [marginFilter, setMarginFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [targetCostSim, setTargetCostSim] = useState<number>(25);

  const overhead = business.overheadSettings;
  const totalMonthlyFixedExpenses =
    overhead.monthlyRent +
    overhead.monthlyElectricity +
    overhead.monthlyWater +
    overhead.monthlyLabor +
    overhead.otherMonthlyOverhead;
  const overheadPerCup = totalMonthlyFixedExpenses / Math.max(1, overhead.estimatedMonthlyCups);

  // Average Gross Margin across recipes
  const avgGrossProfit =
    recipes.length > 0
      ? recipes.reduce((sum, r) => sum + r.grossProfit, 0) / recipes.length
      : 1;

  // Monthly Break-Even Cup Sales Volume
  const breakEvenCupsPerMonth =
    avgGrossProfit > 0 ? Math.ceil(totalMonthlyFixedExpenses / avgGrossProfit) : 0;
  const breakEvenCupsPerDay = Math.ceil(breakEvenCupsPerMonth / 30);

  // Sorting logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'name');
    }
  };

  // Filtered and sorted list
  const filteredRecipes = recipes
    .filter((r) => {
      const matchesSearch =
        r.recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.recipe.size.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || r.recipe.category === selectedCategory;

      let matchesMargin = true;
      if (marginFilter === 'high') {
        matchesMargin = r.directCostPercentage <= 25;
      } else if (marginFilter === 'medium') {
        matchesMargin = r.directCostPercentage > 25 && r.directCostPercentage <= 32;
      } else if (marginFilter === 'low') {
        matchesMargin = r.directCostPercentage > 32;
      }

      return matchesSearch && matchesCategory && matchesMargin;
    })
    .sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === 'name') {
        valA = a.recipe.name.toLowerCase();
        valB = b.recipe.name.toLowerCase();
      } else {
        valA = a[sortField];
        valB = b[sortField];
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Drink Name',
      'Category',
      'Size',
      'Selling Price (PHP)',
      'Ingredient Cost (PHP)',
      'Packaging Cost (PHP)',
      'Total Direct Cost (PHP)',
      'Allocated Overhead (PHP)',
      'Fully-Loaded Cost (PHP)',
      'Gross Profit (PHP)',
      'Net Profit (PHP)',
      'Direct-Cost %',
      'Net Margin %',
      `Suggested Price @ ${targetCostSim}% (PHP)`,
    ];

    const rows = filteredRecipes.map((r) => [
      `"${r.recipe.name}"`,
      `"${r.recipe.category}"`,
      `"${r.recipe.size}"`,
      r.sellingPrice.toFixed(2),
      r.totalIngredientCost.toFixed(2),
      r.packagingCost.toFixed(2),
      r.totalDirectCost.toFixed(2),
      r.overheadAllocation.totalOverheadPerCup.toFixed(2),
      r.fullyLoadedCost.toFixed(2),
      r.grossProfit.toFixed(2),
      r.netProfit.toFixed(2),
      r.directCostPercentage.toFixed(2) + '%',
      r.netProfitPercentage.toFixed(2) + '%',
      (costingViewMode === 'net'
        ? r.fullyLoadedCost / (targetCostSim / 100)
        : r.totalDirectCost / (targetCostSim / 100)
      ).toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cafepilot_margins_${costingViewMode}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Menu Profitability & Margins Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Audit every drink on your menu: direct costs, operating overheads (rent, bills, labor), and net profits.
          </p>
        </div>

        {/* View Mode & Export */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Costing View Toggle: Gross vs Net */}
          <div className="flex items-center bg-stone-200/80 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                setCostingViewMode('gross');
                setSortField('grossProfit');
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                costingViewMode === 'gross'
                  ? 'bg-amber-800 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Direct Costs (Gross Margin)
            </button>
            <button
              onClick={() => {
                setCostingViewMode('net');
                setSortField('netProfit');
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                costingViewMode === 'net'
                  ? 'bg-amber-800 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Fully-Loaded (Net Margin)
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Overheads & Break-Even Operational Banner */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-800" />
            <h3 className="font-bold text-slate-900 text-xs">
              Operating Overheads & Monthly Break-Even Benchmark ({business.name})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Allocated across {overhead.estimatedMonthlyCups.toLocaleString()} estimated monthly cups
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono">
          <div className="bg-white p-2 rounded-xl border border-stone-200">
            <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-400" /> Stall/Shop Rent
            </div>
            <div className="font-bold text-slate-900 mt-0.5">
              ₱{overhead.monthlyRent.toLocaleString()}
            </div>
            <div className="text-[9px] text-slate-400 font-sans">
              {formatPHP(overhead.monthlyRent / Math.max(1, overhead.estimatedMonthlyCups))}/cup
            </div>
          </div>

          <div className="bg-white p-2 rounded-xl border border-stone-200">
            <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-600" /> Electricity Bill
            </div>
            <div className="font-bold text-slate-900 mt-0.5">
              ₱{overhead.monthlyElectricity.toLocaleString()}
            </div>
            <div className="text-[9px] text-slate-400 font-sans">
              {formatPHP(overhead.monthlyElectricity / Math.max(1, overhead.estimatedMonthlyCups))}/cup
            </div>
          </div>

          <div className="bg-white p-2 rounded-xl border border-stone-200">
            <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-600" /> Water Utility
            </div>
            <div className="font-bold text-slate-900 mt-0.5">
              ₱{overhead.monthlyWater.toLocaleString()}
            </div>
            <div className="text-[9px] text-slate-400 font-sans">
              {formatPHP(overhead.monthlyWater / Math.max(1, overhead.estimatedMonthlyCups))}/cup
            </div>
          </div>

          <div className="bg-white p-2 rounded-xl border border-stone-200">
            <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
              <Users className="w-3 h-3 text-indigo-600" /> Staff Rates & Payroll
            </div>
            <div className="font-bold text-slate-900 mt-0.5">
              ₱{overhead.monthlyLabor.toLocaleString()}
            </div>
            <div className="text-[9px] text-slate-400 font-sans">
              {formatPHP(overhead.monthlyLabor / Math.max(1, overhead.estimatedMonthlyCups))}/cup
            </div>
          </div>

          <div className="bg-white p-2 rounded-xl border border-stone-200">
            <div className="text-[10px] text-slate-500 font-sans">Total Fixed Monthly</div>
            <div className="font-black text-slate-950 mt-0.5">
              ₱{totalMonthlyFixedExpenses.toLocaleString()}
            </div>
            <div className="text-[9px] text-amber-800 font-sans font-bold">
              +{formatPHP(overheadPerCup)}/cup
            </div>
          </div>

          <div className="bg-amber-100/80 p-2 rounded-xl border border-amber-300 flex flex-col justify-center">
            <div className="text-[10px] font-bold text-amber-950 uppercase font-sans flex items-center gap-1">
              <Target className="w-3 h-3 text-amber-800" /> Break-Even Sales
            </div>
            <div className="font-black text-amber-950 mt-0.5 text-sm">
              {breakEvenCupsPerMonth.toLocaleString()} cups/mo
            </div>
            <div className="text-[10px] text-amber-900 font-sans font-semibold">
              (~{breakEvenCupsPerDay} cups / day)
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search drinks or sizes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
          >
            <option value="all">All Menu Categories</option>
            <option value="Espresso-Based">Espresso-Based</option>
            <option value="Milk Tea & Boba">Milk Tea & Boba</option>
            <option value="Cold Brew">Cold Brew</option>
            <option value="Refreshers & Fruit Teas">Refreshers & Fruit Teas</option>
            <option value="Blended & Frappes">Blended & Frappes</option>
            <option value="Pastries & Snacks">Pastries & Snacks</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Margins:</span>
          {(['all', 'high', 'medium', 'low'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setMarginFilter(lvl)}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg capitalize transition ${
                marginFilter === lvl
                  ? 'bg-amber-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Target Margin Simulator Bar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-800 shrink-0" />
          <div>
            <span className="font-bold text-slate-900 text-xs">
              Suggested Retail Price Benchmark:
            </span>
            <span className="text-slate-500 text-xs ml-1">
              Currently benchmarking against a <strong>{targetCostSim}% {costingViewMode === 'net' ? 'fully-loaded' : 'direct'} cost target</strong>.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto">
          {[20, 25, 28, 30, 35].map((pct) => (
            <button
              key={pct}
              onClick={() => setTargetCostSim(pct)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                targetCostSim === pct
                  ? 'bg-amber-800 text-white'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Profitability Table */}
      <div className="bg-white border border-stone-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#1E232A] text-slate-200 border-b border-stone-700 select-none">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-3.5 font-semibold cursor-pointer hover:text-amber-300"
                >
                  <div className="flex items-center gap-1">
                    <span>Drink Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold text-slate-400">Size</th>
                <th
                  onClick={() => handleSort('sellingPrice')}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-amber-300 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Selling Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {costingViewMode === 'gross' ? (
                  <>
                    <th
                      onClick={() => handleSort('totalIngredientCost')}
                      className="py-3 px-3 font-semibold cursor-pointer hover:text-amber-300 text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Ingredient Cost</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('packagingCost')}
                      className="py-3 px-3 font-semibold cursor-pointer hover:text-amber-300 text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Packaging</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('totalDirectCost')}
                      className="py-3 px-3 font-semibold cursor-pointer hover:text-amber-300 text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Total Direct Cost</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('grossProfit')}
                      className="py-3 px-3.5 font-semibold cursor-pointer hover:text-amber-300 text-right bg-stone-800/60"
                    >
                      <div className="flex items-center justify-end gap-1 text-emerald-300">
                        <span>Gross Profit</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('directCostPercentage')}
                      className="py-3 px-3 font-semibold cursor-pointer hover:text-amber-300 text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Direct-Cost %</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  </>
                ) : (
                  <>
                    <th
                      onClick={() => handleSort('totalDirectCost')}
                      className="py-3 px-3 font-semibold cursor-pointer hover:text-amber-300 text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Direct COGS</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-3 font-semibold text-right text-amber-200">
                      Overhead (Rent/Bills/Labor)
                    </th>
                    <th
                      onClick={() => handleSort('fullyLoadedCost')}
                      className="py-3 px-3 font-semibold cursor-pointer hover:text-amber-300 text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Fully-Loaded Cost</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('netProfit')}
                      className="py-3 px-3.5 font-semibold cursor-pointer hover:text-amber-300 text-right bg-stone-800/60"
                    >
                      <div className="flex items-center justify-end gap-1 text-emerald-300">
                        <span>Net Operating Profit</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('netProfitPercentage')}
                      className="py-3 px-3 font-semibold cursor-pointer hover:text-amber-300 text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Net Margin %</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  </>
                )}

                <th className="py-3 px-3.5 font-semibold text-right text-amber-300">
                  Suggested @ {targetCostSim}%
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {filteredRecipes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-sans">
                    No recipes match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredRecipes.map((r) => {
                  const suggested =
                    costingViewMode === 'net'
                      ? r.fullyLoadedCost / (targetCostSim / 100)
                      : r.totalDirectCost / (targetCostSim / 100);
                  const isWarning = r.directCostPercentage > 32;
                  const isGreat = r.directCostPercentage <= 25;

                  return (
                    <tr
                      key={r.recipe.id}
                      onClick={() => onSelectRecipe && onSelectRecipe(r)}
                      className="hover:bg-stone-50/80 transition cursor-pointer"
                    >
                      <td className="py-3 px-3.5 font-sans font-bold text-slate-900">
                        {r.recipe.name}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {r.recipe.size}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-950 font-mono">
                        {formatPHP(r.sellingPrice)}
                      </td>

                      {costingViewMode === 'gross' ? (
                        <>
                          <td className="py-3 px-3 text-right text-slate-700 font-mono">
                            {formatPHP(r.totalIngredientCost)}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-600 font-mono">
                            {formatPHP(r.packagingCost)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-rose-800 font-mono">
                            {formatPHP(r.totalDirectCost)}
                          </td>
                          <td className="py-3 px-3.5 text-right font-black text-emerald-800 bg-stone-50/60 font-mono text-sm">
                            {formatPHP(r.grossProfit)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                isWarning
                                  ? 'bg-rose-100 text-rose-800'
                                  : isGreat
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {formatPercent(r.directCostPercentage)}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-3 text-right text-slate-700 font-mono">
                            {formatPHP(r.totalDirectCost)}
                          </td>
                          <td className="py-3 px-3 text-right text-amber-900 font-mono">
                            +{formatPHP(r.overheadAllocation.totalOverheadPerCup)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-rose-900 font-mono">
                            {formatPHP(r.fullyLoadedCost)}
                          </td>
                          <td className="py-3 px-3.5 text-right font-black text-emerald-800 bg-stone-50/60 font-mono text-sm">
                            {formatPHP(r.netProfit)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                r.netProfitPercentage < 15
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {formatPercent(r.netProfitPercentage)}
                            </span>
                          </td>
                        </>
                      )}

                      <td className="py-3 px-3.5 text-right font-bold text-amber-900 font-mono">
                        {formatPHP(suggested)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
