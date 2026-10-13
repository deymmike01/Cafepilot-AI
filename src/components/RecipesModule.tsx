import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Search,
  Percent,
  DollarSign,
  AlertCircle,
  Check,
  X,
  FileText,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  Filter,
  Building,
  Zap,
  Droplets,
  Users,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  Recipe,
  Ingredient,
  CalculatedRecipe,
  RecipeIngredientItem,
  UnitType,
  BusinessProfile,
} from '../types';
import { calculateRecipeCost, formatPHP, formatPercent } from '../utils/costing';
import { getCompatibleUnits } from '../utils/units';

interface RecipesModuleProps {
  recipes: CalculatedRecipe[];
  ingredients: Ingredient[];
  business: BusinessProfile;
  onSaveRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipeId: string) => void;
  activeBusinessId: string;
}

export const RecipesModule: React.FC<RecipesModuleProps> = ({
  recipes,
  ingredients,
  business,
  onSaveRecipe,
  onDeleteRecipe,
  activeBusinessId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'profit-desc' | 'cost-asc' | 'cost-desc' | 'newest'>('name-asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsRecipe, setDetailsRecipe] = useState<CalculatedRecipe | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Recipe['category']>('Espresso-Based');
  const [size, setSize] = useState('16oz / 500ml');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientItem[]>([
    { ingredientId: ingredients[0]?.id || '', quantityUsed: 1, unit: ingredients[0]?.baseUnit || 'g' },
  ]);
  const [packagingCost, setPackagingCost] = useState<string>('7.00');
  const [wastageAllowancePercent, setWastageAllowancePercent] = useState<string>('0');
  const [wastageFixedCost, setWastageFixedCost] = useState<string>('0');
  const [sellingPrice, setSellingPrice] = useState<string>('140.00');
  const [includeOverheadCosting, setIncludeOverheadCosting] = useState<boolean>(
    business.overheadSettings?.includeInCosting ?? false
  );
  const [preparationInstructions, setPreparationInstructions] = useState('');
  const [formError, setFormError] = useState('');

  const categories: Recipe['category'][] = [
    'Espresso-Based',
    'Milk Tea & Boba',
    'Cold Brew',
    'Refreshers & Fruit Teas',
    'Blended & Frappes',
    'Pastries & Snacks',
    'Other',
  ];

  const standardSizes = [
    '8oz / 240ml',
    '12oz / 360ml',
    '16oz / 500ml',
    '22oz / 650ml',
    'Single Shot (30ml)',
    'Standard Regular',
  ];

  // Map of ingredients for fast lookup
  const ingredientsMap = new Map<string, Ingredient>(ingredients.map((i) => [i.id, i]));

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setCategory('Espresso-Based');
    setSize('16oz / 500ml');
    setRecipeIngredients(
      ingredients.length > 0
        ? [{ ingredientId: ingredients[0].id, quantityUsed: 200, unit: ingredients[0].baseUnit }]
        : []
    );
    setPackagingCost('7.00');
    setWastageAllowancePercent('0');
    setWastageFixedCost('0');
    setSellingPrice('140.00');
    setIncludeOverheadCosting(business.overheadSettings?.includeInCosting ?? false);
    setPreparationInstructions('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (rec: Recipe) => {
    setEditingId(rec.id);
    setName(rec.name);
    setCategory(rec.category);
    setSize(rec.size);
    setRecipeIngredients([...rec.ingredients]);
    setPackagingCost(rec.packagingCost.toString());
    setWastageAllowancePercent(rec.wastageAllowancePercent.toString());
    setWastageFixedCost(rec.wastageFixedCost.toString());
    setSellingPrice(rec.sellingPrice.toString());
    setIncludeOverheadCosting(
      rec.includeOverheadCosting ?? business.overheadSettings?.includeInCosting ?? false
    );
    setPreparationInstructions(rec.preparationInstructions || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Duplicate recipe handler (creates a copy ready for sizing or variant tweak)
  const handleDuplicate = (rec: Recipe) => {
    setEditingId(null);
    setName(`${rec.name} (Copy)`);
    setCategory(rec.category);
    setSize(rec.size);
    setRecipeIngredients([...rec.ingredients]);
    setPackagingCost(rec.packagingCost.toString());
    setWastageAllowancePercent(rec.wastageAllowancePercent.toString());
    setWastageFixedCost(rec.wastageFixedCost.toString());
    setSellingPrice(rec.sellingPrice.toString());
    setIncludeOverheadCosting(
      rec.includeOverheadCosting ?? business.overheadSettings?.includeInCosting ?? false
    );
    setPreparationInstructions(rec.preparationInstructions || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Add row to dynamic ingredient list
  const handleAddIngredientRow = () => {
    if (ingredients.length === 0) return;
    const defaultIng = ingredients[0];
    setRecipeIngredients([
      ...recipeIngredients,
      {
        ingredientId: defaultIng.id,
        quantityUsed: 1,
        unit: defaultIng.baseUnit,
      },
    ]);
  };

  // Remove row
  const handleRemoveIngredientRow = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  // Update ingredient in row
  const handleIngredientRowChange = (
    index: number,
    field: keyof RecipeIngredientItem,
    value: any
  ) => {
    const updated = [...recipeIngredients];
    if (field === 'ingredientId') {
      const selectedIng = ingredientsMap.get(value);
      updated[index] = {
        ...updated[index],
        ingredientId: value,
        unit: selectedIng ? selectedIng.baseUnit : 'g',
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setRecipeIngredients(updated);
  };

  // Live calculation of current form state
  const tempRecipe: Recipe = {
    id: editingId || 'temp',
    businessId: activeBusinessId,
    name: name || 'Draft Drink',
    category,
    size,
    ingredients: recipeIngredients,
    packagingCost: Math.max(0, parseFloat(packagingCost) || 0),
    wastageAllowancePercent: Math.max(0, parseFloat(wastageAllowancePercent) || 0),
    wastageFixedCost: Math.max(0, parseFloat(wastageFixedCost) || 0),
    sellingPrice: Math.max(0, parseFloat(sellingPrice) || 0),
    includeOverheadCosting,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const liveCalculated = calculateRecipeCost(tempRecipe, ingredientsMap, business.overheadSettings);

  // Form submit handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Drink recipe name is required.');
      return;
    }
    if (recipeIngredients.length === 0) {
      setFormError('Please add at least one ingredient to the recipe.');
      return;
    }
    if (parseFloat(sellingPrice) < 0) {
      setFormError('Selling price cannot be negative.');
      return;
    }

    const savedRecipe: Recipe = {
      id: editingId || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      businessId: activeBusinessId,
      name: name.trim(),
      category,
      size: size.trim(),
      ingredients: recipeIngredients.map((item) => ({
        ...item,
        quantityUsed: Math.max(0, Number(item.quantityUsed) || 0),
      })),
      packagingCost: Math.max(0, parseFloat(packagingCost) || 0),
      wastageAllowancePercent: Math.max(0, parseFloat(wastageAllowancePercent) || 0),
      wastageFixedCost: Math.max(0, parseFloat(wastageFixedCost) || 0),
      sellingPrice: Math.max(0, parseFloat(sellingPrice) || 0),
      includeOverheadCosting,
      preparationInstructions: preparationInstructions.trim() || undefined,
      createdAt: editingId
        ? recipes.find((r) => r.recipe.id === editingId)?.recipe.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveRecipe(savedRecipe);
    setIsModalOpen(false);
  };

  // Filtered and sorted recipes
  const cleanQuery = searchQuery.trim().toLowerCase();
  const filteredRecipes = recipes
    .filter((r) => {
      // Check drink name and size
      const nameMatch = r.recipe.name.toLowerCase().includes(cleanQuery);
      const sizeMatch = r.recipe.size.toLowerCase().includes(cleanQuery);
      const catMatch = r.recipe.category.toLowerCase().includes(cleanQuery);

      // Check ingredient names used in this recipe
      const ingredientMatch = r.breakdown.some((item) =>
        item.ingredientName.toLowerCase().includes(cleanQuery)
      );

      const matchesSearch = !cleanQuery || nameMatch || sizeMatch || catMatch || ingredientMatch;
      const matchesCategory = selectedCategory === 'all' || r.recipe.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.recipe.name.localeCompare(b.recipe.name);
      }
      if (sortBy === 'profit-desc') {
        return b.grossProfit - a.grossProfit;
      }
      if (sortBy === 'cost-asc') {
        return a.directCostPercentage - b.directCostPercentage;
      }
      if (sortBy === 'cost-desc') {
        return b.totalDirectCost - a.totalDirectCost;
      }
      if (sortBy === 'newest') {
        return new Date(b.recipe.createdAt).getTime() - new Date(a.recipe.createdAt).getTime();
      }
      return 0;
    });

  const isFilteringActive = searchQuery.trim() !== '' || selectedCategory !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Recipe Cost Calculator & Sizing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Build dynamic drink recipes, include packaging and waste, and calculate deterministic gross profit.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Recipe</span>
        </button>
      </div>

      {/* Enhanced Search & Category Filter Controls */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Text Search Input */}
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by drink name, size (e.g. 16oz), or ingredient (e.g. milk, oat, syrup)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-stone-200"
                title="Clear search text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown (Mobile-friendly & quick select) */}
          <div className="md:col-span-3">
            <div className="relative">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 focus:bg-white transition"
              >
                <option value="all">All Categories ({recipes.length})</option>
                {categories.map((cat) => {
                  const count = recipes.filter((r) => r.recipe.category === cat).length;
                  return (
                    <option key={cat} value={cat}>
                      {cat} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-2">
            <div className="relative">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-8 pr-2 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 focus:bg-white transition"
                title="Sort recipe list"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="profit-desc">Highest Cash Profit (₱)</option>
                <option value="cost-asc">Best Margin % (Lowest Cost)</option>
                <option value="cost-desc">Highest Cost to Produce</option>
                <option value="newest">Newest Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills Bar (Horizontal scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none border-t border-stone-100">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'bg-stone-100 hover:bg-stone-200/70 text-slate-700'
            }`}
          >
            <span>All Categories</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedCategory === 'all' ? 'bg-amber-950/40 text-amber-100' : 'bg-stone-200 text-slate-600'
              }`}
            >
              {recipes.length}
            </span>
          </button>
          {categories.map((cat) => {
            const count = recipes.filter((r) => r.recipe.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'bg-stone-100 hover:bg-stone-200/70 text-slate-700'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-amber-950/40 text-amber-100' : 'bg-stone-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Summary & Quick Reset Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-stone-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Showing <strong className="text-slate-900 font-bold">{filteredRecipes.length}</strong> of{' '}
              <strong className="text-slate-900 font-bold">{recipes.length}</strong> recipes
            </span>
            {searchQuery && (
              <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-mono text-[11px] flex items-center gap-1">
                Keyword: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-amber-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-amber-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {isFilteringActive && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Recipe Cards List / Empty State */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          {recipes.length === 0 ? (
            <>
              <h3 className="font-bold text-slate-800 text-base">No recipes created yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Build your beverage menu to uncover exact direct costs, packaging overhead, and gross margins.
              </p>
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold transition"
              >
                Create Your First Recipe
              </button>
            </>
          ) : (
            <>
              <h3 className="font-bold text-slate-800 text-base">No recipes match your filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                No recipes found matching {searchQuery ? `"${searchQuery}"` : ''}{' '}
                {selectedCategory !== 'all' ? `in category "${selectedCategory}"` : ''}. Try another keyword or clear your filters.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Show All Recipes ({recipes.length})</span>
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((calc) => {
            const isHealthyMargin = calc.directCostPercentage <= 28;
            const isWarningMargin = calc.directCostPercentage > 35;

            return (
              <div
                key={calc.recipe.id}
                className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs hover:border-amber-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 mr-1.5">
                        {calc.recipe.category}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-slate-500">
                        {calc.recipe.size}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base mt-1">
                        {calc.recipe.name}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isWarningMargin
                          ? 'bg-rose-100 text-rose-800'
                          : isHealthyMargin
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {formatPercent(calc.directCostPercentage)} cost
                    </span>
                  </div>

                  {/* Financial Metrics Summary */}
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 mt-2 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Ingredients ({calc.breakdown.length}):</span>
                      <span className="font-semibold text-slate-900">
                        {formatPHP(calc.totalIngredientCost)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Packaging:</span>
                      <span className="text-slate-800 font-medium">
                        {formatPHP(calc.packagingCost)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700 font-bold border-t border-stone-200/60 pt-1">
                      <span>Total Direct Cost (COGS):</span>
                      <span className="text-rose-800">
                        {formatPHP(calc.totalDirectCost)}
                      </span>
                    </div>

                    {/* Operating Overheads Itemized & Toggle Line */}
                    <div className="bg-white/80 p-2 rounded-lg border border-stone-200/80 space-y-1.5 font-sans">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                          <Building className="w-3 h-3 text-amber-800" /> Overheads (Rent, Bills & Labor):
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          +{formatPHP(calc.overheadAllocation.totalOverheadPerCup)}
                        </span>
                      </div>

                      {/* Itemized Mini Pills: Rent, Power, Water, Staff */}
                      <div className="grid grid-cols-4 gap-1 text-[9px] text-center font-mono">
                        <div className="bg-stone-50 p-1 rounded border border-stone-100" title="Shop / Stall Rent">
                          <span className="text-slate-400 block font-sans">Rent</span>
                          <span className="font-bold text-slate-800">{formatPHP(calc.overheadAllocation.rentPerCup)}</span>
                        </div>
                        <div className="bg-stone-50 p-1 rounded border border-stone-100" title="Electricity (Meralco/Coop)">
                          <span className="text-slate-400 block font-sans">Power</span>
                          <span className="font-bold text-slate-800">{formatPHP(calc.overheadAllocation.electricityPerCup)}</span>
                        </div>
                        <div className="bg-stone-50 p-1 rounded border border-stone-100" title="Water Bill">
                          <span className="text-slate-400 block font-sans">Water</span>
                          <span className="font-bold text-slate-800">{formatPHP(calc.overheadAllocation.waterPerCup)}</span>
                        </div>
                        <div className="bg-stone-50 p-1 rounded border border-stone-100" title="Staff Payroll / Rates">
                          <span className="text-slate-400 block font-sans">Staff</span>
                          <span className="font-bold text-slate-800">{formatPHP(calc.overheadAllocation.laborPerCup)}</span>
                        </div>
                      </div>

                      {/* Optional Selection Toggle right on the card */}
                      <button
                        type="button"
                        onClick={() =>
                          onSaveRecipe({
                            ...calc.recipe,
                            includeOverheadCosting: !calc.isOverheadIncluded,
                          })
                        }
                        className={`w-full py-1 px-2 rounded-md text-[10px] font-bold flex items-center justify-between transition ${
                          calc.isOverheadIncluded
                            ? 'bg-amber-100/80 text-amber-950 border border-amber-300'
                            : 'bg-stone-100 text-slate-600 hover:bg-stone-200 border border-stone-200'
                        }`}
                        title="Click to toggle whether overheads are included in this recipe's unit cost calculation"
                      >
                        <span className="flex items-center gap-1 font-sans">
                          {calc.isOverheadIncluded ? (
                            <CheckSquare className="w-3 h-3 text-amber-800" />
                          ) : (
                            <Square className="w-3 h-3 text-slate-400" />
                          )}
                          Costing Mode:
                        </span>
                        <span className="font-mono">
                          {calc.isOverheadIncluded ? 'Overheads Included (Loaded)' : 'Direct Cost Only (Click to Load)'}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-slate-900 font-extrabold border-t border-stone-200/60 pt-1">
                      <span>Selling Price:</span>
                      <span className="text-slate-950 text-sm">
                        {formatPHP(calc.sellingPrice)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-emerald-800 font-extrabold border-t border-stone-200/60 pt-1">
                      <span>Gross Profit:</span>
                      <span className="text-emerald-900 text-sm">
                        {formatPHP(calc.grossProfit)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold pt-0.5">
                      <span className="text-slate-600 font-sans">Net Profit (Loaded):</span>
                      <span className={calc.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {formatPHP(calc.netProfit)} ({formatPercent(calc.netProfitPercentage)})
                      </span>
                    </div>
                  </div>

                  {/* Ingredient pills preview */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {calc.breakdown.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md truncate max-w-[130px]"
                      >
                        {item.quantityUsed}{item.unit} {item.ingredientName}
                      </span>
                    ))}
                    {calc.breakdown.length > 3 && (
                      <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-md">
                        +{calc.breakdown.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => setDetailsRecipe(calc)}
                    className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1"
                  >
                    <span>View Card</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(calc.recipe)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-900 hover:bg-stone-100 transition"
                      title="Duplicate as variant"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(calc.recipe)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-900 hover:bg-stone-100 transition"
                      title="Edit recipe"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete recipe "${calc.recipe.name}"?`)) {
                          onDeleteRecipe(calc.recipe.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition"
                      title="Delete recipe"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recipe Builder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-amber-900/20 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
            <div className="bg-[#1E232A] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingId ? 'Edit Drink Recipe' : 'Dynamic Recipe Builder & Costing'}
                </h3>
                <p className="text-xs text-slate-300">
                  Add ingredients, packaging, and verify gross margin percentages live
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
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Recipe Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Drink Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Iced Vanilla Latte"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Drink Size</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder="e.g. 16oz / 500ml"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Ingredients Builder Section */}
              <div className="bg-stone-100/70 p-4 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Recipe Ingredients (Dynamic Cost Calculation)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-medium flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Ingredient</span>
                  </button>
                </div>

                {recipeIngredients.length === 0 ? (
                  <p className="text-slate-500 py-3 text-center">
                    No ingredients added yet. Click "+ Add Ingredient" above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recipeIngredients.map((row, idx) => {
                      const selectedIng = ingredientsMap.get(row.ingredientId);
                      const unitCost = selectedIng ? selectedIng.effectiveCostPerBaseUnit : 0;
                      const rowCost = (Number(row.quantityUsed) || 0) * unitCost;
                      const compatibleUnits = selectedIng
                        ? getCompatibleUnits(selectedIng.baseUnit)
                        : ['g', 'ml', 'pcs'];

                      return (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-white p-2.5 rounded-xl border border-stone-200"
                        >
                          <div className="flex-1 w-full sm:w-auto">
                            <select
                              value={row.ingredientId}
                              onChange={(e) =>
                                handleIngredientRowChange(idx, 'ingredientId', e.target.value)
                              }
                              className="w-full px-2 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-slate-900"
                            >
                              {ingredients.map((ing) => (
                                <option key={ing.id} value={ing.id}>
                                  {ing.name} ({formatPHP(ing.effectiveCostPerBaseUnit, 3)}/{ing.baseUnit})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-1 w-full sm:w-auto">
                            <input
                              type="number"
                              step="any"
                              min="0"
                              placeholder="Qty"
                              value={row.quantityUsed}
                              onChange={(e) =>
                                handleIngredientRowChange(
                                  idx,
                                  'quantityUsed',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 px-2 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-slate-900 font-mono text-right"
                            />

                            <select
                              value={row.unit}
                              onChange={(e) =>
                                handleIngredientRowChange(idx, 'unit', e.target.value as UnitType)
                              }
                              className="w-16 px-1.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-slate-900 font-mono"
                            >
                              {compatibleUnits.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>

                            <div className="w-24 text-right font-mono font-bold text-amber-950 px-1">
                              {formatPHP(rowCost)}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveIngredientRow(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Packaging, Wastage, and Selling Price */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Packaging Cost (₱) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="7.00"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-slate-900 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Cup, lid, straw, sleeve</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Prep Waste Allowance %
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="0"
                    value={wastageAllowancePercent}
                    onChange={(e) => setWastageAllowancePercent(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-slate-900 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Optional % on ingredients</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Selling Price (₱) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="140.00"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-400 rounded-lg text-slate-900 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500">Retail customer price</span>
                </div>

                <div className="bg-amber-100/60 p-2.5 rounded-lg flex flex-col justify-center">
                  <span className="text-[10px] font-bold uppercase text-amber-900">
                    Gross Profit
                  </span>
                  <div className="font-black text-amber-950 font-mono text-base">
                    {formatPHP(liveCalculated.grossProfit)}
                  </div>
                  <span className="text-[10px] text-amber-800">
                    {formatPercent(liveCalculated.directCostPercentage)} Direct Cost
                  </span>
                </div>
              </div>

              {/* Operating Overheads Card (Optional Costing Selection) */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-amber-800 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 text-xs">
                        Operating Overheads & Utilities (Rent, Water, Electricity, Labor)
                      </span>
                      <p className="text-[10px] text-slate-500">
                        Monthly fixed expenses allocated per serving based on {business.overheadSettings.estimatedMonthlyCups.toLocaleString()} estimated monthly cups.
                      </p>
                    </div>
                  </div>

                  {/* Optional Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIncludeOverheadCosting(!includeOverheadCosting)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
                      includeOverheadCosting
                        ? 'bg-amber-800 text-white shadow-2xs'
                        : 'bg-white border border-stone-300 text-slate-700 hover:bg-stone-100'
                    }`}
                  >
                    {includeOverheadCosting ? (
                      <>
                        <CheckSquare className="w-4 h-4 text-amber-300" />
                        <span>Overheads Included (Loaded)</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4 text-slate-400" />
                        <span>Direct Cost Only (Click to Load)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Overhead Itemized Breakdown Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                  <div className="bg-white p-2 rounded-xl border border-stone-200">
                    <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" /> Rent
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {formatPHP(liveCalculated.overheadAllocation.rentPerCup)}
                      <span className="text-[9px] font-normal text-slate-400">/cup</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-sans truncate">
                      ₱{business.overheadSettings.monthlyRent.toLocaleString()}/mo
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-stone-200">
                    <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-600" /> Electricity
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {formatPHP(liveCalculated.overheadAllocation.electricityPerCup)}
                      <span className="text-[9px] font-normal text-slate-400">/cup</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-sans truncate">
                      ₱{business.overheadSettings.monthlyElectricity.toLocaleString()}/mo
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-stone-200">
                    <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-cyan-600" /> Water Bill
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {formatPHP(liveCalculated.overheadAllocation.waterPerCup)}
                      <span className="text-[9px] font-normal text-slate-400">/cup</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-sans truncate">
                      ₱{business.overheadSettings.monthlyWater.toLocaleString()}/mo
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-stone-200">
                    <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                      <Users className="w-3 h-3 text-indigo-600" /> Staff Rates
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {formatPHP(liveCalculated.overheadAllocation.laborPerCup)}
                      <span className="text-[9px] font-normal text-slate-400">/cup</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-sans truncate">
                      ₱{business.overheadSettings.monthlyLabor.toLocaleString()}/mo
                    </div>
                  </div>

                  <div className="bg-amber-100/70 p-2 rounded-xl border border-amber-200 col-span-2 sm:col-span-1">
                    <div className="text-[10px] font-bold uppercase text-amber-900 font-sans">
                      Total Overhead
                    </div>
                    <div className="font-black text-amber-950 mt-0.5 text-sm">
                      {formatPHP(liveCalculated.overheadAllocation.totalOverheadPerCup)}
                    </div>
                    <div className="text-[9px] text-amber-800 font-sans">
                      allocated per cup
                    </div>
                  </div>
                </div>

                {/* Dual Margin Comparison in Modal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-sans font-bold text-slate-600 block">
                        Gross Profit (Direct COGS)
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {formatPHP(liveCalculated.grossProfit)}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 bg-stone-100 px-2 py-0.5 rounded-md">
                      {formatPercent(100 - liveCalculated.directCostPercentage)} Margin
                    </span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      includeOverheadCosting
                        ? 'bg-emerald-50 border-emerald-300'
                        : 'bg-stone-100/70 border-stone-200'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-sans font-bold text-slate-600 block">
                        Net Operating Profit {includeOverheadCosting ? '(Loaded in Costing)' : '(Optional Preview)'}
                      </span>
                      <span
                        className={`text-sm font-black ${
                          liveCalculated.netProfit >= 0 ? 'text-emerald-800' : 'text-rose-700'
                        }`}
                      >
                        {formatPHP(liveCalculated.netProfit)}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {formatPercent(liveCalculated.netProfitPercentage)} Net Margin
                    </span>
                  </div>
                </div>
              </div>

              {/* Suggested Pricing Grid based on Cost Basis */}
              <div className="bg-white border border-stone-200 rounded-xl p-3">
                <span className="font-bold text-slate-900 block mb-1">
                  {includeOverheadCosting
                    ? 'Fully-Loaded (Direct Cost + Overheads) Suggested Pricing'
                    : 'Ingredient & Direct-Cost Based Suggested Pricing'}
                </span>
                <p className="text-[11px] text-slate-500 mb-2">
                  {includeOverheadCosting
                    ? `*Calculated with rent (${formatPHP(liveCalculated.overheadAllocation.rentPerCup)}), power (${formatPHP(liveCalculated.overheadAllocation.electricityPerCup)}), water (${formatPHP(liveCalculated.overheadAllocation.waterPerCup)}), and staff rates (${formatPHP(liveCalculated.overheadAllocation.laborPerCup)}) included in cost basis.`
                    : '*Based on direct recipe costs only (does not include fixed rent, power, or labor).'}
                </p>
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <div className="text-[10px] text-slate-500">Target 20%</div>
                    <div className="font-bold text-slate-900">{formatPHP(liveCalculated.suggestedPrices.target20)}</div>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <div className="text-[10px] text-slate-500">Target 25%</div>
                    <div className="font-bold text-amber-900">{formatPHP(liveCalculated.suggestedPrices.target25)}</div>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <div className="text-[10px] text-slate-500">Target 30%</div>
                    <div className="font-bold text-slate-900">{formatPHP(liveCalculated.suggestedPrices.target30)}</div>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <div className="text-[10px] text-slate-500">Target 35%</div>
                    <div className="font-bold text-slate-900">{formatPHP(liveCalculated.suggestedPrices.target35)}</div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Preparation Instructions (Barista Steps)
                </label>
                <textarea
                  rows={2}
                  placeholder="1. Dose and tamp 18g espresso.\n2. Steam 200ml milk to 60°C microfoam.\n3. Pour with latte art."
                  value={preparationInstructions}
                  onChange={(e) => setPreparationInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
                />
              </div>

              {/* Action buttons */}
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
                  {editingId ? 'Save Recipe Changes' : 'Save New Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recipe Details View Modal */}
      {detailsRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-amber-900/20 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6">
            <div className="bg-[#1E232A] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {detailsRecipe.recipe.category}
                </span>
                <h3 className="font-extrabold text-base sm:text-lg">
                  {detailsRecipe.recipe.name} ({detailsRecipe.recipe.size})
                </h3>
              </div>
              <button
                onClick={() => setDetailsRecipe(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Ingredient Breakdown Table */}
              <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left">
                  <thead className="bg-stone-100 text-slate-600 border-b border-stone-200">
                    <tr>
                      <th className="p-2.5 font-semibold">Ingredient</th>
                      <th className="p-2.5 font-semibold">Portion</th>
                      <th className="p-2.5 font-semibold">Effective Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono">
                    {detailsRecipe.breakdown.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 text-slate-900 font-sans font-medium">
                          {item.ingredientName}
                        </td>
                        <td className="p-2.5 text-slate-600">
                          {item.quantityUsed} {item.unit}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {formatPHP(item.cost)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-stone-50/80 font-bold">
                      <td colSpan={2} className="p-2.5 text-slate-700 font-sans">
                        Packaging (Cup, Lid, Straw)
                      </td>
                      <td className="p-2.5 text-slate-900 font-mono">
                        {formatPHP(detailsRecipe.packagingCost)}
                      </td>
                    </tr>
                    <tr className="bg-amber-50/60 font-black text-amber-950">
                      <td colSpan={2} className="p-2.5 font-sans">
                        Total Direct Cost Per Serving (COGS)
                      </td>
                      <td className="p-2.5 font-mono">
                        {formatPHP(detailsRecipe.totalDirectCost)}
                      </td>
                    </tr>

                    {/* Operating Overheads Breakdown */}
                    <tr className="bg-stone-100 font-bold text-slate-800">
                      <td colSpan={2} className="p-2.5 font-sans">
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-amber-800" />
                          Allocated Operating Overheads (Rent, Bills & Labor)
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-amber-900">
                        +{formatPHP(detailsRecipe.overheadAllocation.totalOverheadPerCup)}
                      </td>
                    </tr>
                    <tr className="text-slate-600 text-[11px]">
                      <td className="p-2 pl-4">Shop Rent Allocation</td>
                      <td className="p-2">₱{business.overheadSettings.monthlyRent.toLocaleString()}/mo</td>
                      <td className="p-2 font-mono text-slate-800">
                        {formatPHP(detailsRecipe.overheadAllocation.rentPerCup)}
                      </td>
                    </tr>
                    <tr className="text-slate-600 text-[11px]">
                      <td className="p-2 pl-4">Electricity Bill (Machine & AC)</td>
                      <td className="p-2">₱{business.overheadSettings.monthlyElectricity.toLocaleString()}/mo</td>
                      <td className="p-2 font-mono text-slate-800">
                        {formatPHP(detailsRecipe.overheadAllocation.electricityPerCup)}
                      </td>
                    </tr>
                    <tr className="text-slate-600 text-[11px]">
                      <td className="p-2 pl-4">Water Utility Bill</td>
                      <td className="p-2">₱{business.overheadSettings.monthlyWater.toLocaleString()}/mo</td>
                      <td className="p-2 font-mono text-slate-800">
                        {formatPHP(detailsRecipe.overheadAllocation.waterPerCup)}
                      </td>
                    </tr>
                    <tr className="text-slate-600 text-[11px]">
                      <td className="p-2 pl-4">Barista & Staff Payroll</td>
                      <td className="p-2">₱{business.overheadSettings.monthlyLabor.toLocaleString()}/mo</td>
                      <td className="p-2 font-mono text-slate-800">
                        {formatPHP(detailsRecipe.overheadAllocation.laborPerCup)}
                      </td>
                    </tr>
                    <tr className="bg-stone-200/90 font-black text-slate-900 border-t border-stone-300">
                      <td colSpan={2} className="p-2.5 font-sans">
                        Fully-Loaded Cost (Direct + Overheads)
                      </td>
                      <td className="p-2.5 font-mono text-rose-900">
                        {formatPHP(detailsRecipe.fullyLoadedCost)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financial Margin KPI banner: Gross vs Net */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-slate-500 font-sans block">Selling Price</span>
                  <span className="font-extrabold text-sm text-slate-950">
                    {formatPHP(detailsRecipe.sellingPrice)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-slate-500 font-sans block">Direct Cost</span>
                  <span className="font-extrabold text-sm text-rose-800">
                    {formatPHP(detailsRecipe.totalDirectCost)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-slate-500 font-sans block">Gross Profit</span>
                  <span className="font-extrabold text-sm text-emerald-800">
                    {formatPHP(detailsRecipe.grossProfit)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-sans">
                    {formatPercent(100 - detailsRecipe.directCostPercentage)}
                  </span>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-sans font-bold block">
                    Net Operating Profit
                  </span>
                  <span className={`font-extrabold text-sm ${
                    detailsRecipe.netProfit >= 0 ? 'text-emerald-900' : 'text-rose-700'
                  }`}>
                    {formatPHP(detailsRecipe.netProfit)}
                  </span>
                  <span className="text-[10px] text-emerald-700 block font-sans">
                    {formatPercent(detailsRecipe.netProfitPercentage)} Net
                  </span>
                </div>
              </div>

              {/* Instructions */}
              {detailsRecipe.recipe.preparationInstructions && (
                <div className="bg-stone-100/70 p-3 rounded-xl border border-stone-200">
                  <span className="font-bold text-slate-800 block mb-1">
                    Preparation Steps:
                  </span>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                    {detailsRecipe.recipe.preparationInstructions}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  const target = detailsRecipe.recipe;
                  setDetailsRecipe(null);
                  handleDuplicate(target);
                }}
                className="px-3.5 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-stone-50"
              >
                Duplicate Recipe
              </button>
              <button
                onClick={() => setDetailsRecipe(null)}
                className="px-4 py-1.5 bg-amber-800 text-white rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
