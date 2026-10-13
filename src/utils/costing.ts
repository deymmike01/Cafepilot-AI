import {
  Ingredient,
  Recipe,
  CalculatedRecipe,
  RecipeCostBreakdownItem,
  OverheadSettings,
  OverheadAllocation,
  UnitType,
  BaseUnitType,
} from '../types';
import { convertToBaseUnit } from './units';

/**
 * Calculate effective cost per base unit (e.g. ₱ per ml or ₱ per gram).
 * Formula: Purchase price ÷ Usable purchase quantity (in base units)
 */
export function calculateEffectiveUnitCost(
  purchasePrice: number,
  usableQuantityInBaseUnits: number
): number {
  if (usableQuantityInBaseUnits <= 0 || purchasePrice <= 0 || isNaN(purchasePrice) || isNaN(usableQuantityInBaseUnits)) {
    return 0;
  }
  return purchasePrice / usableQuantityInBaseUnits;
}

/**
 * Calculates deterministic recipe costing, gross profit margins, and optional operating overheads.
 * Strictly implements the formulas specified in the product specification:
 * - Ingredient unit cost = Purchase price ÷ Usable purchase quantity
 * - Ingredient cost per recipe = Ingredient quantity used × Ingredient unit cost
 * - Total direct cost per serving = Sum of ingredient costs + Packaging cost + Wastage cost
 * - Gross profit per serving = Selling price − Total direct cost per serving
 * - Ingredient-cost percentage = (Total ingredient cost ÷ Selling price) × 100
 * - Direct-cost percentage = (Total direct cost per serving ÷ Selling price) × 100
 * - Overhead Allocation Per Cup = (Monthly Rent + Electricity + Water + Labor + Other) ÷ Estimated Monthly Cups
 * - Fully-Loaded Cost = Total direct cost + Allocated overhead
 * - Net Profit Per Cup = Selling price − Fully-Loaded Cost
 */
export function calculateRecipeCost(
  recipe: Recipe,
  ingredientsMap: Map<string, Ingredient>,
  overheadSettings?: OverheadSettings
): CalculatedRecipe {
  const breakdown: RecipeCostBreakdownItem[] = [];
  let totalIngredientCost = 0;

  for (const item of recipe.ingredients) {
    const ingredient = ingredientsMap.get(item.ingredientId);
    if (!ingredient) {
      // If ingredient was removed or not found, preserve item with 0 cost
      breakdown.push({
        ingredientId: item.ingredientId,
        ingredientName: 'Unknown / Deleted Ingredient',
        quantityUsed: item.quantityUsed,
        unit: item.unit,
        baseQuantity: item.quantityUsed,
        baseUnit: 'g',
        unitCost: 0,
        cost: 0,
      });
      continue;
    }

    const conversion = convertToBaseUnit(item.quantityUsed, item.unit, ingredient.baseUnit);
    const baseQuantity = conversion.success ? conversion.baseQuantity : item.quantityUsed;
    const unitCost = ingredient.effectiveCostPerBaseUnit;
    const cost = baseQuantity * unitCost;

    totalIngredientCost += cost;

    breakdown.push({
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      quantityUsed: item.quantityUsed,
      unit: item.unit,
      baseQuantity,
      baseUnit: ingredient.baseUnit,
      unitCost,
      cost,
    });
  }

  // Wastage calculations
  const wastageAllowancePercent = Math.max(0, recipe.wastageAllowancePercent || 0);
  const wastageFixedCost = Math.max(0, recipe.wastageFixedCost || 0);
  const wastageCost = (totalIngredientCost * (wastageAllowancePercent / 100)) + wastageFixedCost;

  const packagingCost = Math.max(0, recipe.packagingCost || 0);
  const totalDirectCost = totalIngredientCost + packagingCost + wastageCost;
  const sellingPrice = Math.max(0, recipe.sellingPrice || 0);
  const grossProfit = sellingPrice - totalDirectCost;

  const ingredientCostPercentage =
    sellingPrice > 0 ? (totalIngredientCost / sellingPrice) * 100 : 0;

  const directCostPercentage =
    sellingPrice > 0 ? (totalDirectCost / sellingPrice) * 100 : 0;

  // Operating Overheads Calculation
  const monthlyRent = Math.max(0, overheadSettings?.monthlyRent || 0);
  const monthlyElectricity = Math.max(0, overheadSettings?.monthlyElectricity || 0);
  const monthlyWater = Math.max(0, overheadSettings?.monthlyWater || 0);
  const monthlyLabor = Math.max(0, overheadSettings?.monthlyLabor || 0);
  const otherMonthlyOverhead = Math.max(0, overheadSettings?.otherMonthlyOverhead || 0);
  const estimatedMonthlyCups = Math.max(1, overheadSettings?.estimatedMonthlyCups || 2500);

  const rentPerCup = monthlyRent / estimatedMonthlyCups;
  const electricityPerCup = monthlyElectricity / estimatedMonthlyCups;
  const waterPerCup = monthlyWater / estimatedMonthlyCups;
  const laborPerCup = monthlyLabor / estimatedMonthlyCups;
  const otherPerCup = otherMonthlyOverhead / estimatedMonthlyCups;
  const totalOverheadPerCup = rentPerCup + electricityPerCup + waterPerCup + laborPerCup + otherPerCup;

  const overheadAllocation: OverheadAllocation = {
    rentPerCup,
    electricityPerCup,
    waterPerCup,
    laborPerCup,
    otherPerCup,
    totalOverheadPerCup,
  };

  // Optional selection for overhead costing
  // If explicitly specified on the recipe, use that; otherwise fall back to business overhead setting
  const isOverheadIncluded =
    recipe.includeOverheadCosting !== undefined
      ? recipe.includeOverheadCosting
      : (overheadSettings?.includeInCosting ?? false);

  const fullyLoadedCost = totalDirectCost + totalOverheadPerCup;
  const netProfit = sellingPrice - fullyLoadedCost;
  const netProfitPercentage = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;

  // Suggested selling prices (Target cost % pricing)
  // If overhead is active, cost basis includes allocated overhead
  const costBasis = isOverheadIncluded ? fullyLoadedCost : totalDirectCost;

  const calculateSuggestedPrice = (targetPercent: number) => {
    if (targetPercent <= 0) return 0;
    return costBasis / (targetPercent / 100);
  };

  const suggestedPrices = {
    target20: calculateSuggestedPrice(20),
    target25: calculateSuggestedPrice(25),
    target30: calculateSuggestedPrice(30),
    target35: calculateSuggestedPrice(35),
  };

  return {
    recipe,
    breakdown,
    totalIngredientCost,
    packagingCost,
    wastageCost,
    totalDirectCost,
    sellingPrice,
    grossProfit,
    ingredientCostPercentage,
    directCostPercentage,
    isOverheadIncluded,
    overheadAllocation,
    fullyLoadedCost,
    netProfit,
    netProfitPercentage,
    suggestedPrices,
  };
}

/**
 * Format currency in Philippine Pesos (₱)
 */
export function formatPHP(value: number, decimals: number = 2): string {
  if (isNaN(value)) return '₱0.00';
  return `₱${value.toLocaleString('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
  if (isNaN(value)) return '0.00%';
  return `${value.toFixed(decimals)}%`;
}
