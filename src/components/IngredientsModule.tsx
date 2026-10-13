import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  History,
  AlertTriangle,
  ArrowUpDown,
  Check,
  X,
  Clock,
  Sparkles,
  Info,
  Coffee,
  UtensilsCrossed,
  Package,
  ShieldAlert,
} from 'lucide-react';
import {
  Ingredient,
  UnitType,
  BaseUnitType,
  PriceHistoryItem,
  InventoryDepartment,
  UserRole,
} from '../types';
import { calculateEffectiveUnitCost, formatPHP } from '../utils/costing';
import { convertToBaseUnit, getDefaultBaseUnit } from '../utils/units';
import { DEPARTMENT_CONFIGS, getIngredientDepartment } from '../utils/inventory';

interface IngredientsModuleProps {
  ingredients: Ingredient[];
  onSaveIngredient: (ingredient: Ingredient) => void;
  onDeleteIngredient: (id: string) => void;
  activeBusinessId: string;
  userRole?: UserRole;
}

export const IngredientsModule: React.FC<IngredientsModuleProps> = ({
  ingredients,
  onSaveIngredient,
  onDeleteIngredient,
  activeBusinessId,
  userRole = 'admin',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<'all' | InventoryDepartment>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyModalIngredient, setHistoryModalIngredient] = useState<Ingredient | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState<InventoryDepartment>('cafe');
  const [category, setCategory] = useState<Ingredient['category']>('Dairy & Milks');
  const [supplierName, setSupplierName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<string>('100');
  const [purchaseQuantity, setPurchaseQuantity] = useState<string>('1000');
  const [purchaseUnit, setPurchaseUnit] = useState<UnitType>('ml');
  const [baseUnit, setBaseUnit] = useState<BaseUnitType>('ml');
  const [usableQuantity, setUsableQuantity] = useState<string>('1000');
  const [currentStock, setCurrentStock] = useState<string>('5000');
  const [minStockThreshold, setMinStockThreshold] = useState<string>('1000');
  const [notes, setNotes] = useState('');
  const [priceChangeReason, setPriceChangeReason] = useState('');
  const [formError, setFormError] = useState('');

  const categories: Ingredient['category'][] = [
    'Dairy & Milks',
    'Coffee Beans',
    'Syrups & Sauces',
    'Powders & Teas',
    'Toppings & Add-ons',
    'Packaging & Disposables',
    'Produce & Fruit',
    'Other',
  ];

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setDepartment('cafe');
    setCategory('Dairy & Milks');
    setSupplierName('');
    setPurchasePrice('100');
    setPurchaseQuantity('1000');
    setPurchaseUnit('ml');
    setBaseUnit('ml');
    setUsableQuantity('1000');
    setCurrentStock('5000');
    setMinStockThreshold('1000');
    setNotes('');
    setPriceChangeReason('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (ing: Ingredient) => {
    setEditingId(ing.id);
    setName(ing.name);
    setDepartment(getIngredientDepartment(ing));
    setCategory(ing.category);
    setSupplierName(ing.supplierName || '');
    setPurchasePrice(ing.purchasePrice.toString());
    setPurchaseQuantity(ing.purchaseQuantity.toString());
    setPurchaseUnit(ing.purchaseUnit);
    setBaseUnit(ing.baseUnit);
    setUsableQuantity(ing.usableQuantity.toString());
    setCurrentStock(ing.currentStock.toString());
    setMinStockThreshold(ing.minStockThreshold.toString());
    setNotes(ing.notes || '');
    setPriceChangeReason('');
    setFormError('');
    setIsModalOpen(true);
  };

  // When purchase unit changes, automatically set default base unit
  const handlePurchaseUnitChange = (u: UnitType) => {
    setPurchaseUnit(u);
    const def = getDefaultBaseUnit(u);
    setBaseUnit(def);

    // Auto-update usable quantity in base units
    const qtyNum = parseFloat(purchaseQuantity) || 1;
    const conv = convertToBaseUnit(qtyNum, u, def);
    if (conv.success) {
      setUsableQuantity(conv.baseQuantity.toString());
    }
  };

  // Calculate live preview unit cost in form
  const parsedPrice = parseFloat(purchasePrice) || 0;
  const parsedUsable = parseFloat(usableQuantity) || 0;
  const liveUnitCost = calculateEffectiveUnitCost(parsedPrice, parsedUsable);

  // Form submit handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Ingredient name is required.');
      return;
    }
    if (parsedPrice <= 0) {
      setFormError('Purchase price must be greater than ₱0.00.');
      return;
    }
    if (parsedUsable <= 0) {
      setFormError('Usable quantity must be greater than 0.');
      return;
    }

    const conversionCheck = convertToBaseUnit(parseFloat(purchaseQuantity) || 0, purchaseUnit, baseUnit);
    if (!conversionCheck.success) {
      setFormError(conversionCheck.error || 'Incompatible units selected.');
      return;
    }

    const existing = ingredients.find((i) => i.id === editingId);
    let history: PriceHistoryItem[] = existing ? [...existing.priceHistory] : [];

    // Track price change if editing and price or usable qty changed
    if (existing) {
      const priceChanged =
        existing.purchasePrice !== parsedPrice ||
        existing.usableQuantity !== parsedUsable ||
        existing.effectiveCostPerBaseUnit !== liveUnitCost;

      if (priceChanged) {
        history.push({
          date: new Date().toISOString(),
          price: parsedPrice,
          usableQuantity: parsedUsable,
          effectiveUnitCost: liveUnitCost,
          reason: priceChangeReason.trim() || 'Direct cost revision',
        });
      }
    } else {
      // New ingredient
      history.push({
        date: new Date().toISOString(),
        price: parsedPrice,
        usableQuantity: parsedUsable,
        effectiveUnitCost: liveUnitCost,
        reason: 'Initial entry',
      });
    }

    const savedIngredient: Ingredient = {
      id: editingId || `ing_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      businessId: activeBusinessId,
      name: name.trim(),
      department,
      category,
      supplierName: supplierName.trim() || undefined,
      purchasePrice: parsedPrice,
      purchaseQuantity: parseFloat(purchaseQuantity) || 1,
      purchaseUnit,
      baseUnit,
      usableQuantity: parsedUsable,
      effectiveCostPerBaseUnit: liveUnitCost,
      currentStock: parseFloat(currentStock) || 0,
      minStockThreshold: parseFloat(minStockThreshold) || 0,
      lastUpdated: new Date().toISOString(),
      notes: notes.trim() || undefined,
      priceHistory: history,
    };

    onSaveIngredient(savedIngredient);
    setIsModalOpen(false);
  };

  // Filtered ingredients
  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch =
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ing.supplierName && ing.supplierName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || ing.category === selectedCategory;
    const dept = getIngredientDepartment(ing);
    const matchesDept = selectedDepartmentFilter === 'all' || dept === selectedDepartmentFilter;
    return matchesSearch && matchesCat && matchesDept;
  });

  const isEmployee = userRole === 'employee';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Ingredient Database & Pricing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define raw materials, purchase packaging, and precise unit costs in Philippine Pesos (₱).
          </p>
        </div>
        {!isEmployee ? (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Ingredient</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-900 font-bold text-xs flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-700" />
            <span>Employee View (Pricing Locked)</span>
          </div>
        )}
      </div>

      {/* Employee Mode Notice */}
      {isEmployee && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Staff Access Safeguard: </span>
            Employee access is limited to viewing and managing inventory on hand. Modifying base purchase contract costs and deleting ingredients requires Administrator / Manager privileges. Stock adjustments and station requisitions can be made in the <strong>Inventory & Stocks</strong> module.
          </div>
        </div>
      )}

      {/* Recalculation Notice */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-950">
        <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Dynamic Cascading Updates: </span>
          When an ingredient's purchase price changes, all recipes utilizing it are automatically recalculated across the entire app.
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ingredient by name or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-amber-800 text-white'
                : 'bg-white border border-stone-300 text-slate-700 hover:bg-stone-50'
            }`}
          >
            All Categories ({ingredients.length})
          </button>
          {categories.map((cat) => {
            const count = ingredients.filter((i) => i.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-amber-800 text-white'
                    : 'bg-white border border-stone-300 text-slate-700 hover:bg-stone-50'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Ingredients Grid / Table */}
      {filteredIngredients.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
          <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No ingredients found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? 'No ingredients match your search query.'
              : 'Start by adding ingredients your café uses regularly (e.g. coffee beans, fresh milk, syrups).'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-amber-800 text-white rounded-xl text-xs font-semibold"
          >
            Add Ingredient
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIngredients.map((ing) => {
            const hasRecentPriceChange = ing.priceHistory.length > 1;
            return (
              <div
                key={ing.id}
                className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs hover:border-amber-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                            getIngredientDepartment(ing) === 'cafe'
                              ? 'bg-amber-100 text-amber-900 border-amber-200'
                              : getIngredientDepartment(ing) === 'kitchen'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}
                        >
                          {getIngredientDepartment(ing) === 'cafe' ? (
                            <Coffee className="w-3 h-3" />
                          ) : getIngredientDepartment(ing) === 'kitchen' ? (
                            <UtensilsCrossed className="w-3 h-3" />
                          ) : (
                            <Package className="w-3 h-3" />
                          )}
                          <span>
                            {getIngredientDepartment(ing) === 'cafe'
                              ? 'Café & Bar'
                              : getIngredientDepartment(ing) === 'kitchen'
                              ? 'Kitchen'
                              : 'Utility'}
                          </span>
                        </span>

                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                          {ing.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{ing.name}</h3>
                    </div>
                    {hasRecentPriceChange && (
                      <button
                        onClick={() => setHistoryModalIngredient(ing)}
                        title="View price history"
                        className="p-1 rounded-md text-amber-700 hover:bg-amber-50"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {ing.supplierName && (
                    <div className="text-[11px] text-slate-500 mb-3">
                      Supplier: <span className="font-medium text-slate-700">{ing.supplierName}</span>
                    </div>
                  )}

                  {/* Pricing Breakdown Card */}
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Purchase:</span>
                      <span className="font-semibold text-slate-900">
                        {formatPHP(ing.purchasePrice)} / {ing.purchaseQuantity} {ing.purchaseUnit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Usable Yield:</span>
                      <span className="text-slate-800 font-medium">
                        {ing.usableQuantity} {ing.baseUnit}
                      </span>
                    </div>

                    <div className="border-t border-stone-200/60 pt-1.5 flex items-center justify-between">
                      <span className="font-bold text-amber-900">Effective Unit Cost:</span>
                      <span className="font-black text-amber-950 text-sm">
                        {formatPHP(ing.effectiveCostPerBaseUnit, 4)} / {ing.baseUnit}
                      </span>
                    </div>
                  </div>

                  {/* Stock level info */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <div>
                      Stock: <span className="font-semibold text-slate-800">{ing.currentStock} {ing.baseUnit}</span>
                    </div>
                    {ing.currentStock <= ing.minStockThreshold && (
                      <span className="text-rose-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Updated {new Date(ing.lastUpdated).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(ing)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-amber-900 hover:bg-stone-100 transition"
                      title={isEmployee ? 'View ingredient details' : 'Edit ingredient'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!isEmployee && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${ing.name}? This will affect any recipes using it.`)) {
                            onDeleteIngredient(ing.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition"
                        title="Delete ingredient (Admin only)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Ingredient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-amber-900/20 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6">
            <div className="bg-[#1E232A] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingId ? 'Edit Ingredient & Costing' : 'New Ingredient Entry'}
                </h3>
                <p className="text-xs text-slate-300">
                  Calculates accurate effective unit cost per gram, milliliter, or piece
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name, Station Department & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ingredient Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fresh Whole Milk (1L)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Station Department *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as InventoryDepartment)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                  >
                    <option value="cafe">☕ Café & Bar</option>
                    <option value="kitchen">🍳 Kitchen & Pastry</option>
                    <option value="utility">📦 Utility & Supplies</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subcategory</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Supplier */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supplier Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dairy Gold Manila / Local Market"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                />
              </div>

              {/* Purchase Details */}
              <div className="bg-stone-100/70 p-3.5 rounded-xl border border-stone-200 space-y-3">
                <span className="font-bold text-slate-900 block">Purchase Packaging & Invoicing</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">Price (₱ PHP) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="100.00"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Purchase Qty *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="1000"
                      value={purchaseQuantity}
                      onChange={(e) => {
                        setPurchaseQuantity(e.target.value);
                        // Auto-sync usable quantity in base units
                        const qtyNum = parseFloat(e.target.value) || 0;
                        const conv = convertToBaseUnit(qtyNum, purchaseUnit, baseUnit);
                        if (conv.success) {
                          setUsableQuantity(conv.baseQuantity.toString());
                        }
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Unit *</label>
                    <select
                      value={purchaseUnit}
                      onChange={(e) => handlePurchaseUnitChange(e.target.value as UnitType)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-slate-900 font-mono"
                    >
                      <option value="ml">ml (milliliter)</option>
                      <option value="L">L (liter)</option>
                      <option value="g">g (gram)</option>
                      <option value="kg">kg (kilogram)</option>
                      <option value="pcs">pcs (pieces)</option>
                    </select>
                  </div>
                </div>

                {/* Usable Yield & Base Unit */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200">
                  <div>
                    <label className="block text-slate-600 mb-1">
                      Usable Qty (after prep/waste) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="1000"
                      value={usableQuantity}
                      onChange={(e) => setUsableQuantity(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-slate-900 font-mono"
                    />
                    <span className="text-[10px] text-slate-500">
                      e.g. 950g usable for beans (50g dial-in loss)
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Base Recipe Unit</label>
                    <input
                      type="text"
                      disabled
                      value={baseUnit}
                      className="w-full px-2.5 py-1.5 bg-stone-200/60 border border-stone-300 rounded-lg text-slate-700 font-mono"
                    />
                    <span className="text-[10px] text-slate-500">Derived from purchase unit</span>
                  </div>
                </div>
              </div>

              {/* Real-time calculated unit cost preview */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                    Calculated Effective Unit Cost
                  </span>
                  <div className="text-base font-extrabold text-amber-950 font-mono">
                    {formatPHP(liveUnitCost, 4)} / {baseUnit}
                  </div>
                </div>
                <div className="text-right text-[11px] text-amber-800">
                  <div>Formula:</div>
                  <code className="text-[10px]">{formatPHP(parsedPrice)} ÷ {parsedUsable} {baseUnit}</code>
                </div>
              </div>

              {/* Price change reason if editing */}
              {editingId && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Price Revision Reason (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Supplier fuel surcharge, Seasonal adjustment"
                    value={priceChangeReason}
                    onChange={(e) => setPriceChangeReason(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
                  />
                </div>
              )}

              {/* Stock settings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Current Stock ({baseUnit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Low Stock Alert ({baseUnit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={minStockThreshold}
                    onChange={(e) => setMinStockThreshold(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Storage instructions, brand specifications, or supplier contact..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-stone-300 rounded-xl text-slate-700 hover:bg-stone-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold shadow-2xs"
                >
                  {editingId ? 'Save Changes' : 'Create Ingredient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Price History Modal */}
      {historyModalIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#FAF8F5] border border-amber-900/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#1E232A] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Price History Log</h3>
                <p className="text-xs text-slate-300">{historyModalIngredient.name}</p>
              </div>
              <button
                onClick={() => setHistoryModalIngredient(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {historyModalIngredient.priceHistory.map((h, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-stone-200 rounded-xl p-3 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 font-mono">
                      {formatPHP(h.price)} ➔ {formatPHP(h.effectiveUnitCost, 4)} / {historyModalIngredient.baseUnit}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {h.reason || 'Price adjustment'}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {new Date(h.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-stone-100 border-t border-stone-200 text-right">
              <button
                onClick={() => setHistoryModalIngredient(null)}
                className="px-4 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
