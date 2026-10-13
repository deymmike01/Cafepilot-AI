import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Boxes,
  UtensilsCrossed,
  Layers,
  Percent,
  CheckCircle2,
  Info,
  Sliders,
  Building,
  Zap,
  Droplets,
  Users,
  Target,
  CheckSquare,
  Square,
} from 'lucide-react';
import { CalculatedRecipe, Ingredient, BusinessProfile } from '../types';
import { formatPHP, formatPercent } from '../utils/costing';
import { NavTab } from './Navbar';

interface DashboardProps {
  recipes: CalculatedRecipe[];
  ingredients: Ingredient[];
  business: BusinessProfile;
  setActiveTab: (tab: NavTab) => void;
  onOpenNewRecipe: () => void;
  onOpenNewIngredient: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  recipes,
  ingredients,
  business,
  setActiveTab,
  onOpenNewRecipe,
  onOpenNewIngredient,
}) => {
  const [targetCostSim, setTargetCostSim] = useState<number>(25);
  const [costingMode, setCostingMode] = useState<'direct' | 'loaded'>(
    business.overheadSettings?.includeInCosting ? 'loaded' : 'direct'
  );

  // Derived metrics
  const totalRecipes = recipes.length;
  const totalIngredients = ingredients.length;

  const totalDirectCostSum = recipes.reduce((acc, r) => acc + r.totalDirectCost, 0);
  const totalLoadedCostSum = recipes.reduce((acc, r) => acc + r.fullyLoadedCost, 0);
  const totalIngredientCostSum = recipes.reduce((acc, r) => acc + r.totalIngredientCost, 0);
  const totalSellingPriceSum = recipes.reduce((acc, r) => acc + r.sellingPrice, 0);

  const avgDirectCostPercent =
    totalSellingPriceSum > 0 ? (totalDirectCostSum / totalSellingPriceSum) * 100 : 0;
  const avgLoadedCostPercent =
    totalSellingPriceSum > 0 ? (totalLoadedCostSum / totalSellingPriceSum) * 100 : 0;
  const avgIngredientCostPercent =
    totalSellingPriceSum > 0 ? (totalIngredientCostSum / totalSellingPriceSum) * 100 : 0;

  // Sorting based on active costing mode
  const sortedByProfit = [...recipes].sort((a, b) =>
    costingMode === 'loaded' ? b.netProfit - a.netProfit : b.grossProfit - a.grossProfit
  );
  const sortedByCost = [...recipes].sort((a, b) =>
    costingMode === 'loaded' ? b.fullyLoadedCost - a.fullyLoadedCost : b.totalDirectCost - a.totalDirectCost
  );

  const highestProfitDrink = sortedByProfit[0];
  const lowestProfitDrink = sortedByProfit[sortedByProfit.length - 1];
  const mostExpensiveToProduce = sortedByCost[0];

  // Overhead & Break-even calculations
  const overhead = business.overheadSettings;
  const totalMonthlyFixed =
    overhead.monthlyRent +
    overhead.monthlyElectricity +
    overhead.monthlyWater +
    overhead.monthlyLabor +
    overhead.otherMonthlyOverhead;
  const overheadPerCup = totalMonthlyFixed / Math.max(1, overhead.estimatedMonthlyCups);
  const avgGrossProfit =
    recipes.length > 0
      ? recipes.reduce((sum, r) => sum + r.grossProfit, 0) / recipes.length
      : 1;
  const breakEvenCupsPerMonth =
    avgGrossProfit > 0 ? Math.ceil(totalMonthlyFixed / avgGrossProfit) : 0;
  const breakEvenCupsPerDay = Math.ceil(breakEvenCupsPerMonth / 30);

  // Price changes feed
  const recentlyIncreasedIngredients = ingredients.filter(
    (ing) =>
      ing.priceHistory &&
      ing.priceHistory.length > 1 &&
      ing.priceHistory[ing.priceHistory.length - 1].price >
        ing.priceHistory[ing.priceHistory.length - 2].price
  );

  // Empty state handling
  if (totalRecipes === 0 && totalIngredients === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Welcome to {business.name}!
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto mb-8">
          You haven't added any ingredients or recipes yet. Let's calculate your beverage costs
          and discover your true gross profit margins.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onOpenNewIngredient}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Boxes className="w-4 h-4" />
            <span>Add Your First Ingredient</span>
          </button>
          <button
            onClick={onOpenNewRecipe}
            className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Create a Recipe</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Menu Profitability Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time recipe cost breakdowns and margins for <span className="font-semibold text-amber-900">{business.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('advisor')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ask CaféPilot Advisor</span>
          </button>
          <button
            onClick={onOpenNewRecipe}
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-800" />
            <span>New Recipe</span>
          </button>
        </div>
      </div>

      {/* Costing Selection Mode Toggle Banner */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900">
              Optional Costing Selection: {costingMode === 'loaded' ? 'Overheads Included (Loaded)' : 'Direct Costing Only (Gross Margin)'}
            </span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              costingMode === 'loaded' ? 'bg-amber-800 text-white' : 'bg-stone-200 text-slate-700'
            }`}>
              {costingMode === 'loaded' ? 'Loaded' : 'Direct COGS'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {costingMode === 'loaded'
              ? `Loaded view includes rent (₱${overhead.monthlyRent.toLocaleString()}), electricity (₱${overhead.monthlyElectricity.toLocaleString()}), water (₱${overhead.monthlyWater.toLocaleString()}), and staff rates (₱${overhead.monthlyLabor.toLocaleString()}) allocated at +${formatPHP(overheadPerCup)}/cup.`
              : 'Direct view evaluates ingredient and packaging costs only (gross margins). Operating overheads are shown below as an informational breakdown.'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 bg-stone-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setCostingMode('direct')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              costingMode === 'direct'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Direct Cost Only
          </button>
          <button
            onClick={() => setCostingMode('loaded')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              costingMode === 'loaded'
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Loaded with Overheads
          </button>
        </div>
      </div>

      {/* Core KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Saved Recipes */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Active Recipes</span>
            <Layers className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalRecipes}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>from {totalIngredients} ingredients</span>
          </div>
        </div>

        {/* Avg Cost % */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">
              {costingMode === 'loaded' ? 'Avg Loaded Cost %' : 'Avg Ingredient Cost %'}
            </span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatPercent(costingMode === 'loaded' ? avgLoadedCostPercent : avgIngredientCostPercent)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {costingMode === 'loaded' ? 'Target: < 50% loaded' : 'Benchmark: 20% – 28% direct'}
          </div>
        </div>

        {/* Avg Direct / Net Margin */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">
              {costingMode === 'loaded' ? 'Avg Net Operating Margin' : 'Avg Direct Cost %'}
            </span>
            <DollarSign className="w-4 h-4 text-amber-800" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {costingMode === 'loaded'
              ? formatPercent(100 - avgLoadedCostPercent)
              : formatPercent(avgDirectCostPercent)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {costingMode === 'loaded' ? 'Net profit after all fixed overheads' : 'Includes cup, lid, straw & waste'}
          </div>
        </div>

        {/* Highest Profit Drink */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">
              {costingMode === 'loaded' ? 'Top Net Profit Drink' : 'Top Gross Profit Drink'}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-black text-slate-900 truncate">
            {highestProfitDrink ? highestProfitDrink.recipe.name : '—'}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {highestProfitDrink
              ? costingMode === 'loaded'
                ? `${formatPHP(highestProfitDrink.netProfit)} net margin`
                : `${formatPHP(highestProfitDrink.grossProfit)} cash profit`
              : '—'}
          </div>
        </div>
      </div>

      {/* Row 2: Highlights: Lowest Margin Drink, Most Expensive to Make, Recent Price Increases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lowest Profit Drink Alert */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md">
                Review Priority
              </span>
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Lowest Cash Margin Drink
            </h3>
            {lowestProfitDrink ? (
              <div className="mt-2 space-y-1">
                <p className="font-extrabold text-base text-slate-900">
                  {lowestProfitDrink.recipe.name}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    ({lowestProfitDrink.recipe.size})
                  </span>
                </p>
                <div className="text-xs text-slate-600 grid grid-cols-2 gap-1 pt-1 font-mono">
                  <div>Price: <span className="font-semibold text-slate-900">{formatPHP(lowestProfitDrink.sellingPrice)}</span></div>
                  <div>Direct Cost: <span className="font-semibold text-rose-700">{formatPHP(lowestProfitDrink.totalDirectCost)}</span></div>
                  <div>Gross Profit: <span className="font-bold text-slate-900">{formatPHP(lowestProfitDrink.grossProfit)}</span></div>
                  <div>Cost Ratio: <span className="font-bold text-rose-700">{formatPercent(lowestProfitDrink.directCostPercentage)}</span></div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-2">No recipes yet.</p>
            )}
          </div>
          <button
            onClick={() => setActiveTab('profitability')}
            className="mt-3 text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1"
          >
            <span>Analyze in Menu Margins table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Most Expensive Drink to Produce */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                Production Cost
              </span>
              <UtensilsCrossed className="w-4 h-4 text-amber-700" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Highest Cost to Produce
            </h3>
            {mostExpensiveToProduce ? (
              <div className="mt-2 space-y-1">
                <p className="font-extrabold text-base text-slate-900">
                  {mostExpensiveToProduce.recipe.name}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    ({mostExpensiveToProduce.recipe.size})
                  </span>
                </p>
                <div className="text-xs text-slate-600 grid grid-cols-2 gap-1 pt-1 font-mono">
                  <div>Cost Basis: <span className="font-bold text-slate-900">{formatPHP(mostExpensiveToProduce.totalDirectCost)}</span></div>
                  <div>Packaging: <span className="font-semibold text-slate-700">{formatPHP(mostExpensiveToProduce.packagingCost)}</span></div>
                  <div>Selling Price: <span className="font-semibold text-slate-900">{formatPHP(mostExpensiveToProduce.sellingPrice)}</span></div>
                  <div>Gross Margin: <span className="font-bold text-emerald-700">{formatPercent(100 - mostExpensiveToProduce.directCostPercentage)}</span></div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-2">No recipes yet.</p>
            )}
          </div>
          <button
            onClick={() => setActiveTab('recipes')}
            className="mt-3 text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1"
          >
            <span>View Recipe Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ingredient Price Increase Watchlist */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                Price Watchlist
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Supplier Price Changes
            </h3>
            {recentlyIncreasedIngredients.length > 0 ? (
              <div className="mt-2 space-y-2">
                {recentlyIncreasedIngredients.slice(0, 2).map((ing) => {
                  const last = ing.priceHistory[ing.priceHistory.length - 1];
                  const prev = ing.priceHistory[ing.priceHistory.length - 2];
                  const diff = last.price - prev.price;
                  const pct = ((diff / prev.price) * 100).toFixed(1);
                  return (
                    <div key={ing.id} className="text-xs bg-stone-50 p-2 rounded-lg border border-stone-200">
                      <div className="font-semibold text-slate-900 truncate">{ing.name}</div>
                      <div className="text-[11px] text-rose-700 font-medium">
                        {formatPHP(prev.price)} ➔ {formatPHP(last.price)} (+{pct}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-3">
                No recent supplier price hikes detected. All recipe margins remain stable.
              </p>
            )}
          </div>
          <button
            onClick={() => setActiveTab('ingredients')}
            className="mt-3 text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1"
          >
            <span>Manage Ingredients Database</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Operating Overheads, Utility Bills & Break-Even Volume Widget */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-800" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Operating Overheads, Bills & Break-Even Benchmark
              </h3>
              <p className="text-xs text-slate-500">
                Fixed monthly café expenses allocated per cup based on {overhead.estimatedMonthlyCups.toLocaleString()} estimated monthly cups.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('settings')}
              className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              Configure Rates & Bills
            </button>
            <button
              onClick={() => setActiveTab('profitability')}
              className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold transition"
            >
              View Net Margins
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-xs font-mono">
          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" /> Stall / Café Rent
            </div>
            <div className="font-black text-slate-900 mt-1 text-sm">
              ₱{overhead.monthlyRent.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-sans mt-0.5">
              {formatPHP(overhead.monthlyRent / Math.max(1, overhead.estimatedMonthlyCups))}/cup
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-600" /> Electricity (Meralco/Coop)
            </div>
            <div className="font-black text-slate-900 mt-1 text-sm">
              ₱{overhead.monthlyElectricity.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-sans mt-0.5">
              {formatPHP(overhead.monthlyElectricity / Math.max(1, overhead.estimatedMonthlyCups))}/cup
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-600" /> Water Utility Bill
            </div>
            <div className="font-black text-slate-900 mt-1 text-sm">
              ₱{overhead.monthlyWater.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-sans mt-0.5">
              {formatPHP(overhead.monthlyWater / Math.max(1, overhead.estimatedMonthlyCups))}/cup
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-600" /> Staff Rates & Payroll
            </div>
            <div className="font-black text-slate-900 mt-1 text-sm">
              ₱{overhead.monthlyLabor.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-sans mt-0.5">
              {formatPHP(overhead.monthlyLabor / Math.max(1, overhead.estimatedMonthlyCups))}/cup
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <div className="text-[10px] text-slate-500 font-sans">Total Fixed Monthly</div>
            <div className="font-black text-slate-950 mt-1 text-sm">
              ₱{totalMonthlyFixed.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-800 font-sans font-bold mt-0.5">
              +{formatPHP(overheadPerCup)}/cup
            </div>
          </div>

          <div className="bg-amber-100/90 p-3 rounded-xl border border-amber-300 flex flex-col justify-center">
            <div className="text-[10px] font-bold text-amber-950 uppercase font-sans flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-amber-800" /> Break-Even Target
            </div>
            <div className="font-black text-amber-950 mt-1 text-sm">
              {breakEvenCupsPerMonth.toLocaleString()} cups/mo
            </div>
            <div className="text-[10px] text-amber-900 font-sans font-bold mt-0.5">
              ~{breakEvenCupsPerDay} cups / day
            </div>
          </div>
        </div>
      </div>

      {/* Target Margin & Suggested Selling Price Calculator Tool */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-800" />
              <h3 className="font-bold text-slate-900 text-base">
                Interactive Target Cost & Suggested Pricing Tool
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your target food cost percentage to immediately see suggested retail prices for your menu.
            </p>
          </div>

          {/* Target percentage selector */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl self-start sm:self-auto">
            {[20, 25, 28, 30, 35].map((pct) => (
              <button
                key={pct}
                onClick={() => setTargetCostSim(pct)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  targetCostSim === pct
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-slate-500">
                <th className="pb-2 font-semibold">Drink Name</th>
                <th className="pb-2 font-semibold">Size</th>
                <th className="pb-2 font-semibold">Total Direct Cost</th>
                <th className="pb-2 font-semibold">Current Price</th>
                <th className="pb-2 font-semibold">Current Cost %</th>
                <th className="pb-2 font-semibold text-amber-900">
                  Suggested Price @ {targetCostSim}%
                </th>
                <th className="pb-2 font-semibold">Price Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recipes.slice(0, 5).map((r) => {
                const suggested = r.totalDirectCost / (targetCostSim / 100);
                const diff = suggested - r.sellingPrice;
                return (
                  <tr key={r.recipe.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-2.5 font-bold text-slate-900">{r.recipe.name}</td>
                    <td className="py-2.5 text-slate-500 font-mono">{r.recipe.size}</td>
                    <td className="py-2.5 font-mono text-slate-700">{formatPHP(r.totalDirectCost)}</td>
                    <td className="py-2.5 font-mono font-semibold text-slate-900">
                      {formatPHP(r.sellingPrice)}
                    </td>
                    <td className="py-2.5 font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          r.directCostPercentage > 30
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {formatPercent(r.directCostPercentage)}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono font-bold text-amber-900 text-sm">
                      {formatPHP(suggested)}
                    </td>
                    <td className="py-2.5 font-mono">
                      {Math.abs(diff) < 0.5 ? (
                        <span className="text-slate-400">On target</span>
                      ) : diff > 0 ? (
                        <span className="text-amber-700 font-semibold">
                          +{formatPHP(diff)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">
                          {formatPHP(diff)} (above target)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-[11px] text-slate-500 border-t border-stone-100 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            Formula: <code>Suggested Selling Price = Total Direct Cost ÷ Target %</code>.
          </span>
          <button
            onClick={() => setActiveTab('profitability')}
            className="text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View complete menu matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
