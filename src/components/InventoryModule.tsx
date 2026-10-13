import React, { useState } from 'react';
import {
  Store,
  Plus,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Clock,
  DollarSign,
  PackageCheck,
  X,
  Check,
  Search,
  Filter,
  Coffee,
  UtensilsCrossed,
  Package,
  Printer,
  ShieldCheck,
  UserCheck,
  FileText,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import {
  Ingredient,
  StockMovement,
  MovementType,
  BaseUnitType,
  InventoryDepartment,
  StockTransferSlip,
  UserRole,
  BusinessProfile,
} from '../types';
import { formatPHP } from '../utils/costing';
import { DEPARTMENT_CONFIGS, getIngredientDepartment } from '../utils/inventory';
import { StockTransferModal } from './StockTransferModal';
import { StockTransferPrintable } from './StockTransferPrintable';
import { StockTransfersHistoryModal } from './StockTransfersHistoryModal';

interface InventoryModuleProps {
  ingredients: Ingredient[];
  movements: StockMovement[];
  stockTransfers: StockTransferSlip[];
  business: BusinessProfile;
  userRole: UserRole;
  onLogMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => void;
  onSaveTransfer: (
    transfer: Omit<StockTransferSlip, 'id' | 'createdAt'>
  ) => StockTransferSlip;
  onUpdateIngredientStock: (ingredientId: string, newStock: number, reason: string) => void;
  onSwitchRole?: (role: UserRole) => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  ingredients,
  movements,
  stockTransfers,
  business,
  userRole,
  onLogMovement,
  onSaveTransfer,
  onUpdateIngredientStock,
  onSwitchRole,
}) => {
  // Filters & Tabs
  const [selectedDepartment, setSelectedDepartment] = useState<'all' | InventoryDepartment>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Modals State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [activePrintSlip, setActivePrintSlip] = useState<StockTransferSlip | null>(null);

  // Quick Adjustment Inline State
  const [quickAdjustIng, setQuickAdjustIng] = useState<Ingredient | null>(null);
  const [quickAdjustQty, setQuickAdjustQty] = useState('');
  const [quickAdjustReason, setQuickAdjustReason] = useState('Physical stock recount');

  // Form State for Log Movement Modal
  const [selectedIngredientId, setSelectedIngredientId] = useState(ingredients[0]?.id || '');
  const [movementType, setMovementType] = useState<MovementType>('PURCHASE_RECEIPT');
  const [quantity, setQuantity] = useState<string>('1000');
  const [reason, setReason] = useState<string>('Weekly stock replenishment');
  const [formError, setFormError] = useState('');

  // Selected Ingredient for details in modal
  const targetIng = ingredients.find((i) => i.id === selectedIngredientId) || ingredients[0];

  // Calculate Valuations (Total & Per Department: Cafe, Kitchen, Utility)
  const totalValuation = ingredients.reduce(
    (sum, ing) => sum + Math.max(0, ing.currentStock * ing.effectiveCostPerBaseUnit),
    0
  );

  const cafeValuation = ingredients
    .filter((ing) => getIngredientDepartment(ing) === 'cafe')
    .reduce((sum, ing) => sum + Math.max(0, ing.currentStock * ing.effectiveCostPerBaseUnit), 0);

  const kitchenValuation = ingredients
    .filter((ing) => getIngredientDepartment(ing) === 'kitchen')
    .reduce((sum, ing) => sum + Math.max(0, ing.currentStock * ing.effectiveCostPerBaseUnit), 0);

  const utilityValuation = ingredients
    .filter((ing) => getIngredientDepartment(ing) === 'utility')
    .reduce((sum, ing) => sum + Math.max(0, ing.currentStock * ing.effectiveCostPerBaseUnit), 0);

  const lowStockCount = ingredients.filter(
    (ing) => ing.currentStock <= ing.minStockThreshold
  ).length;

  const handleOpenLogModal = (type: MovementType, ingId?: string) => {
    setMovementType(type);
    if (ingId) setSelectedIngredientId(ingId);
    else if (ingredients.length > 0) setSelectedIngredientId(ingredients[0].id);

    if (type === 'PURCHASE_RECEIPT') {
      setReason('Weekly supplier delivery');
      setQuantity('1000');
    } else if (type === 'WASTE_SPOILAGE') {
      setReason('Pitcher waste / spillage');
      setQuantity('150');
    } else {
      setReason('Physical inventory recount');
      setQuantity(targetIng ? targetIng.currentStock.toString() : '1000');
    }

    setFormError('');
    setIsLogModalOpen(true);
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || qtyNum < 0) {
      setFormError('Please enter a valid non-negative quantity.');
      return;
    }

    if (!targetIng) {
      setFormError('Please select a valid ingredient.');
      return;
    }

    onLogMovement({
      businessId: business.id,
      ingredientId: targetIng.id,
      type: movementType,
      quantity: qtyNum,
      unit: targetIng.baseUnit,
      costAtMovement: targetIng.effectiveCostPerBaseUnit,
      reason: reason.trim() || 'Inventory log entry',
    });

    setIsLogModalOpen(false);
  };

  const handleQuickDelta = (ing: Ingredient, delta: number) => {
    const newStock = Math.max(0, ing.currentStock + delta);
    const sign = delta > 0 ? `+${delta}` : `${delta}`;
    onUpdateIngredientStock(
      ing.id,
      newStock,
      `Quick adjustment (${sign} ${ing.baseUnit}) by ${userRole === 'admin' ? 'Manager' : 'Employee'}`
    );
  };

  const handleOpenQuickAdjust = (ing: Ingredient) => {
    setQuickAdjustIng(ing);
    setQuickAdjustQty(ing.currentStock.toString());
    setQuickAdjustReason('Physical shelf count update');
  };

  const handleSaveQuickAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAdjustIng) return;
    const newCount = parseFloat(quickAdjustQty);
    if (isNaN(newCount) || newCount < 0) return;

    onUpdateIngredientStock(
      quickAdjustIng.id,
      newCount,
      quickAdjustReason.trim() || 'Physical inventory recount'
    );
    setQuickAdjustIng(null);
  };

  // Filtered ingredients
  const filteredIngredients = ingredients.filter((ing) => {
    const dept = getIngredientDepartment(ing);
    const matchesDept = selectedDepartment === 'all' || dept === selectedDepartment;
    const matchesSearch =
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLowStock = !filterLowStockOnly || ing.currentStock <= ing.minStockThreshold;
    return matchesDept && matchesSearch && matchesLowStock;
  });

  const isEmployee = userRole === 'employee';

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Inventory & Station Stocks
            </h1>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                isEmployee
                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}
            >
              {isEmployee ? (
                <>
                  <UserCheck className="w-3 h-3" />
                  <span>Employee Stock Access</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3" />
                  <span>Administrator Access</span>
                </>
              )}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Categorized by Café, Kitchen, and Utility. Dispatch stocks from Stock Room to stations with printable vouchers.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Dispatch Stock to Station Printable Button */}
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Transfer to Bar/Kitchen & Print</span>
          </button>

          {/* Past Slips Archive */}
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-3 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Slips Archive ({stockTransfers.length})</span>
          </button>

          {/* Log Waste */}
          <button
            onClick={() => handleOpenLogModal('WASTE_SPOILAGE')}
            className="px-3 py-2 bg-white border border-stone-300 hover:bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
          >
            <ArrowDownLeft className="w-4 h-4 text-rose-600" />
            <span>Waste</span>
          </button>

          {/* Receive Delivery */}
          <button
            onClick={() => handleOpenLogModal('PURCHASE_RECEIPT')}
            className="px-3 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Receive Stock</span>
          </button>
        </div>
      </div>

      {/* Access Permission Notice Banner */}
      <div
        className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
          isEmployee
            ? 'bg-blue-50/80 border-blue-200 text-blue-950'
            : 'bg-stone-100 border-stone-300/80 text-slate-700'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <Store className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">
              {isEmployee ? 'Employee Access Mode Active: ' : 'Administrator Privilege Mode: '}
            </span>
            {isEmployee ? (
              <span>
                You have authorized access to view inventory and make stock changes (deliveries, waste, counts, and transfers to Bar/Kitchen). Business settings, pricing formulas, and financial profit margins are protected for managers and admins only.
              </span>
            ) : (
              <span>
                Administrator access enabled for managers and admins. You can review overhead valuations, configure employee rates & utility bills, edit recipes, and manage full inventory stock room levels.
              </span>
            )}
          </div>
        </div>

        {onSwitchRole && (
          <button
            onClick={() => onSwitchRole(isEmployee ? 'admin' : 'employee')}
            className="px-2.5 py-1 bg-white border border-stone-300 hover:bg-stone-50 rounded-lg font-bold text-[11px] text-slate-800 shrink-0 shadow-2xs"
          >
            Switch to {isEmployee ? 'Admin / Manager' : 'Employee'} Mode
          </button>
        )}
      </div>

      {/* KPI Cards: Total Valuation + Department Breakdowns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Overall */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Stock Valuation</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {formatPHP(totalValuation)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {ingredients.length} items across all stations
          </div>
        </div>

        {/* Café / Bar Valuation */}
        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-2xs bg-gradient-to-b from-amber-50/30 to-white">
          <div className="flex items-center justify-between text-amber-900 mb-1">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-amber-700" />
              <span>Café & Bar</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
              {ingredients.filter((i) => getIngredientDepartment(i) === 'cafe').length} items
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-950 font-mono">
            {formatPHP(cafeValuation)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Beans, milks, syrups & teas
          </div>
        </div>

        {/* Kitchen Valuation */}
        <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-2xs bg-gradient-to-b from-emerald-50/30 to-white">
          <div className="flex items-center justify-between text-emerald-900 mb-1">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-700" />
              <span>Kitchen & Pastry</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">
              {ingredients.filter((i) => getIngredientDepartment(i) === 'kitchen').length} items
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">
            {formatPHP(kitchenValuation)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Butter, eggs, sourdough & produce
          </div>
        </div>

        {/* Utility Valuation */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs bg-gradient-to-b from-slate-50/50 to-white">
          <div className="flex items-center justify-between text-slate-700 mb-1">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-slate-600" />
              <span>Utility & Supplies</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
              {ingredients.filter((i) => getIngredientDepartment(i) === 'utility').length} items
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {formatPHP(utilityValuation)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Cups, lids, packaging & sanitizers
          </div>
        </div>
      </div>

      {/* Category Tabs: Cafe, Kitchen, Utility */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setSelectedDepartment('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              selectedDepartment === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Inventory ({ingredients.length})
          </button>

          <button
            onClick={() => setSelectedDepartment('cafe')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              selectedDepartment === 'cafe'
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Café & Bar ({ingredients.filter((i) => getIngredientDepartment(i) === 'cafe').length})</span>
          </button>

          <button
            onClick={() => setSelectedDepartment('kitchen')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              selectedDepartment === 'kitchen'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Kitchen ({ingredients.filter((i) => getIngredientDepartment(i) === 'kitchen').length})</span>
          </button>

          <button
            onClick={() => setSelectedDepartment('utility')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
              selectedDepartment === 'utility'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Utility ({ingredients.filter((i) => getIngredientDepartment(i) === 'utility').length})</span>
          </button>
        </div>

        {/* Search & Low Stock Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ingredient or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
            />
          </div>

          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
              filterLowStockOnly
                ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
                : 'bg-white border border-stone-300 text-slate-700 hover:bg-stone-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Low Stock ({lowStockCount})</span>
          </button>
        </div>
      </div>

      {/* Stock Levels Table */}
      <div className="bg-white border border-stone-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#1E232A] text-slate-200 border-b border-stone-700">
              <tr>
                <th className="py-3 px-3.5 font-semibold">Ingredient</th>
                <th className="py-3 px-3 font-semibold">Department</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold text-right">Stock On Hand</th>
                <th className="py-3 px-3 font-semibold text-center">Quick Adjust</th>
                <th className="py-3 px-3 font-semibold text-right">Min Threshold</th>
                <th className="py-3 px-3 font-semibold text-right">Unit Value</th>
                <th className="py-3 px-3 font-semibold text-right">Total Value</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {filteredIngredients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-sans">
                    No ingredients found in this category or search filter.
                  </td>
                </tr>
              ) : (
                filteredIngredients.map((ing) => {
                  const dept = getIngredientDepartment(ing);
                  const deptConfig = DEPARTMENT_CONFIGS[dept];
                  const isLow = ing.currentStock <= ing.minStockThreshold;
                  const itemValue = ing.currentStock * ing.effectiveCostPerBaseUnit;

                  return (
                    <tr key={ing.id} className="hover:bg-stone-50/80 transition">
                      {/* Name */}
                      <td className="py-3 px-3.5 font-sans font-bold text-slate-900">
                        {ing.name}
                      </td>

                      {/* Department Badge */}
                      <td className="py-3 px-3 font-sans">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${deptConfig.badgeBg} ${deptConfig.badgeText}`}
                        >
                          {dept === 'cafe' ? (
                            <Coffee className="w-3 h-3" />
                          ) : dept === 'kitchen' ? (
                            <UtensilsCrossed className="w-3 h-3" />
                          ) : (
                            <Package className="w-3 h-3" />
                          )}
                          <span>{deptConfig.label}</span>
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 font-sans text-slate-500 text-[11px]">
                        {ing.category}
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">
                        {ing.currentStock.toLocaleString()} {ing.baseUnit}
                      </td>

                      {/* Inline Quick Adjust Counter for Employees & Managers */}
                      <td className="py-3 px-3 text-center font-sans">
                        <div className="inline-flex items-center gap-1 bg-stone-100 border border-stone-200 rounded-lg p-0.5">
                          <button
                            onClick={() =>
                              handleQuickDelta(
                                ing,
                                ing.baseUnit === 'pcs' ? -5 : ing.baseUnit === 'g' ? -250 : -500
                              )
                            }
                            className="px-1.5 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-stone-200 rounded transition"
                            title="Subtract stock"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleOpenQuickAdjust(ing)}
                            className="px-2 py-0.5 text-[11px] font-mono font-bold text-slate-800 hover:bg-stone-200 rounded transition"
                            title="Set exact count"
                          >
                            Set
                          </button>
                          <button
                            onClick={() =>
                              handleQuickDelta(
                                ing,
                                ing.baseUnit === 'pcs' ? +5 : ing.baseUnit === 'g' ? +250 : +500
                              )
                            }
                            className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-stone-200 rounded transition"
                            title="Add stock"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Threshold */}
                      <td className="py-3 px-3 text-right text-slate-500">
                        {ing.minStockThreshold.toLocaleString()} {ing.baseUnit}
                      </td>

                      {/* Unit Cost */}
                      <td className="py-3 px-3 text-right text-slate-600">
                        {formatPHP(ing.effectiveCostPerBaseUnit, 3)}/{ing.baseUnit}
                      </td>

                      {/* Total Value */}
                      <td className="py-3 px-3 text-right font-bold text-amber-950">
                        {formatPHP(itemValue)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center font-sans">
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Healthy
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right font-sans">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenLogModal('PURCHASE_RECEIPT', ing.id)}
                            className="px-2 py-1 bg-stone-100 hover:bg-emerald-50 text-emerald-800 rounded-lg text-[11px] font-semibold transition"
                            title="Receive delivery stock"
                          >
                            + Stock
                          </button>
                          <button
                            onClick={() => handleOpenLogModal('WASTE_SPOILAGE', ing.id)}
                            className="px-2 py-1 bg-stone-100 hover:bg-rose-50 text-rose-700 rounded-lg text-[11px] font-semibold transition"
                            title="Log waste or damaged item"
                          >
                            Waste
                          </button>
                          <button
                            onClick={() => handleOpenLogModal('MANUAL_ADJUSTMENT', ing.id)}
                            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-slate-600 rounded-lg text-[11px] font-semibold transition"
                            title="Recount physical inventory"
                          >
                            Recount
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movement Audit Log Section */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-800" />
            <h3 className="font-bold text-slate-900 text-sm">
              Stock Movement Audit Log
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            {movements.length} logged events
          </span>
        </div>

        {movements.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            No stock movements logged yet. Receipts, transfers, and waste entries will appear here.
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {movements.map((m) => {
              const ing = ingredients.find((i) => i.id === m.ingredientId);
              const isAdd = m.type === 'PURCHASE_RECEIPT';
              const isWaste = m.type === 'WASTE_SPOILAGE';
              const isTransfer = m.type === 'STOCK_TRANSFER';

              return (
                <div
                  key={m.id}
                  className="bg-stone-50 border border-stone-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    {isAdd ? (
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    ) : isWaste ? (
                      <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      </span>
                    ) : isTransfer ? (
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
                        <Printer className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </span>
                    )}

                    <div>
                      <div className="font-bold text-slate-900 font-sans">
                        {ing ? ing.name : 'Unknown Ingredient'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        {m.reason}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-black ${
                        isAdd
                          ? 'text-emerald-700'
                          : isWaste
                          ? 'text-rose-700'
                          : isTransfer
                          ? 'text-amber-800'
                          : 'text-slate-900'
                      }`}
                    >
                      {isAdd ? '+' : isWaste || isTransfer ? '-' : '='}
                      {m.quantity} {m.unit}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Movement Modal (Receipt, Spoilage, Recount) */}
      {isLogModalOpen && targetIng && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#FAF8F5] border border-amber-900/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-[#1E232A] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {movementType === 'PURCHASE_RECEIPT'
                    ? 'Receive Stock Delivery'
                    : movementType === 'WASTE_SPOILAGE'
                    ? 'Log Waste / Spoilage'
                    : 'Physical Stock Adjustment'}
                </h3>
                <p className="text-xs text-slate-300">
                  Updates on-hand stock for {targetIng.name}
                </p>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Ingredient select */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ingredient
                </label>
                <select
                  value={selectedIngredientId}
                  onChange={(e) => setSelectedIngredientId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} (Current: {ing.currentStock} {ing.baseUnit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Movement Type */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Action Type
                </label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as MovementType)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
                >
                  <option value="PURCHASE_RECEIPT">Receive Stock (Adds to inventory)</option>
                  <option value="WASTE_SPOILAGE">Waste / Spoilage (Subtracts from inventory)</option>
                  <option value="MANUAL_ADJUSTMENT">Set Exact Stock Count (Overwrite)</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity ({targetIng.baseUnit}) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 font-mono font-bold"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason / Memo
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delivery receipt invoice #1042, Spilled pitcher, etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 bg-white border border-stone-300 rounded-xl text-slate-700 hover:bg-stone-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold shadow-2xs"
                >
                  Confirm Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Set Stock Modal */}
      {quickAdjustIng && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#FAF8F5] border border-amber-900/20 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-[#1E232A] text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Quick Set Stock Count</h3>
                <p className="text-[11px] text-slate-300">{quickAdjustIng.name}</p>
              </div>
              <button
                onClick={() => setQuickAdjustIng(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickAdjust} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Physical Count ({quickAdjustIng.baseUnit})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={quickAdjustQty}
                  onChange={(e) => setQuickAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 font-mono font-bold text-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Note</label>
                <input
                  type="text"
                  value={quickAdjustReason}
                  onChange={(e) => setQuickAdjustReason(e.target.value)}
                  placeholder="e.g. End of shift physical count"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickAdjustIng(null)}
                  className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-bold"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Transfer Requisition Modal */}
      <StockTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        ingredients={ingredients}
        business={business}
        onSaveTransfer={onSaveTransfer}
        onOpenPrintSlip={(slip) => setActivePrintSlip(slip)}
      />

      {/* History of Past Slips Modal */}
      <StockTransfersHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        transfers={stockTransfers}
        business={business}
        onOpenPrintSlip={(slip) => setActivePrintSlip(slip)}
        onOpenNewTransfer={() => setIsTransferModalOpen(true)}
      />

      {/* Printable Sheet Preview Modal */}
      {activePrintSlip && (
        <StockTransferPrintable
          slip={activePrintSlip}
          business={business}
          onClose={() => setActivePrintSlip(null)}
        />
      )}
    </div>
  );
};
