import { CalculatedRecipe, Ingredient, BusinessProfile } from '../types';
import { formatPHP, formatPercent } from '../utils/costing';

export interface AdvisorResponse {
  answer: string;
  isAiPowered: boolean;
  modelName: string;
  timestamp: string;
  calculatedMetrics?: {
    totalRecipes: number;
    avgIngredientCostPercent: number;
    avgDirectCostPercent: number;
    lowestMarginDrink?: string;
    highestMarginDrink?: string;
  };
}

/**
 * Generate deterministic business analysis based strictly on the user's active recipes and ingredients.
 * Used when offline or when GEMINI_API_KEY is not configured, guaranteed never to hallucinate figures.
 */
export function generateDeterministicAdvice(
  prompt: string,
  recipes: CalculatedRecipe[],
  ingredients: Ingredient[],
  business: BusinessProfile
): string {
  const p = prompt.toLowerCase();

  if (recipes.length === 0) {
    return `### 📋 No Active Recipes Found\n\nYou currently have 0 recipes saved in **${business.name}**.\n\nTo run financial analysis and margin recommendations:\n1. Add your raw ingredients in the **Ingredients Database**.\n2. Create your drinks in the **Recipe Cost Calculator**.\n\nOnce added, I will automatically calculate your exact unit costs and gross profit margins.`;
  }

  // Calculate high-level stats
  const totalDirectCosts = recipes.reduce((sum, r) => sum + r.totalDirectCost, 0);
  const totalSellingPrices = recipes.reduce((sum, r) => sum + r.sellingPrice, 0);
  const avgDirectCostPercent =
    totalSellingPrices > 0 ? (totalDirectCosts / totalSellingPrices) * 100 : 0;

  const sortedByProfit = [...recipes].sort((a, b) => b.grossProfit - a.grossProfit);
  const sortedByCostPercent = [...recipes].sort(
    (a, b) => b.directCostPercentage - a.directCostPercentage
  );
  const lowestProfit = sortedByProfit[sortedByProfit.length - 1];
  const highestProfit = sortedByProfit[0];
  const highestCostPercent = sortedByCostPercent[0];

  // Operating Overheads, Rent, Utility Bills & Staff Rates Inquiry
  if (
    p.includes('overhead') ||
    p.includes('rent') ||
    p.includes('electric') ||
    p.includes('water') ||
    p.includes('bill') ||
    p.includes('labor') ||
    p.includes('employee') ||
    p.includes('staff') ||
    p.includes('break-even') ||
    p.includes('breakeven')
  ) {
    const o = business.overheadSettings;
    const totFixed = o.monthlyRent + o.monthlyElectricity + o.monthlyWater + o.monthlyLabor + o.otherMonthlyOverhead;
    const cups = Math.max(1, o.estimatedMonthlyCups);
    const rentPerCup = o.monthlyRent / cups;
    const elecPerCup = o.monthlyElectricity / cups;
    const waterPerCup = o.monthlyWater / cups;
    const laborPerCup = o.monthlyLabor / cups;
    const totalPerCup = totFixed / cups;
    const avgGross = recipes.length > 0 ? recipes.reduce((sum, r) => sum + r.grossProfit, 0) / recipes.length : 1;
    const beCups = avgGross > 0 ? Math.ceil(totFixed / avgGross) : 0;
    const beDaily = Math.ceil(beCups / 30);

    return `### 🏢 Operating Overheads, Bills & Employee Rates for ${business.name}

#### Monthly Fixed Expenses Breakdown:
- **Shop / Stall Rent:** **${formatPHP(o.monthlyRent)}** / month (${formatPHP(rentPerCup)}/cup)
- **Electricity Bill (Espresso, AC & Chillers):** **${formatPHP(o.monthlyElectricity)}** / month (${formatPHP(elecPerCup)}/cup)
- **Water Utility Bill:** **${formatPHP(o.monthlyWater)}** / month (${formatPHP(waterPerCup)}/cup)
- **Employee Rates & Staff Payroll:** **${formatPHP(o.monthlyLabor)}** / month (${formatPHP(laborPerCup)}/cup)
  *(Staff: ${o.staffDetails?.baristaCount ?? 2} workers @ ${formatPHP(o.staffDetails?.averageMonthlySalary ?? 13000)}/mo avg)*
- **Other Overheads (POS, WiFi, Ice, Permits):** **${formatPHP(o.otherMonthlyOverhead)}** / month
- **Total Fixed Monthly Expenses:** **${formatPHP(totFixed)}** / month

#### Allocated Overhead Per Cup:
At your volume target of **${cups.toLocaleString()} cups/month** (~${Math.round(cups / 30)} cups/day):
- **Total Overhead Allocated:** **+${formatPHP(totalPerCup)} per drink sold**

#### 🎯 Daily & Monthly Break-Even Target:
- Based on your menu average gross profit of **${formatPHP(avgGross)}/cup**:
  - **${beCups.toLocaleString()} cups per month**
  - **${beDaily} cups per day**
  must be sold to cover rent, utilities, and employee payroll before you reach net operating profit.

#### 💡 Costing Mode Advice:
- **Direct Costing Only:** Best for day-to-day recipe testing and ingredient wastage audits.
- **Fully-Loaded Costing:** Recommended when setting retail prices to ensure every cup carries its fair share (+${formatPHP(totalPerCup)}) toward rent and bills.`;
  }

  // Milk price increase simulation
  if (p.includes('milk') && (p.includes('increase') || p.includes('10%') || p.includes('price'))) {
    const milkIngredients = ingredients.filter((i) =>
      i.name.toLowerCase().includes('milk') || i.category === 'Dairy & Milks'
    );
    if (milkIngredients.length === 0) {
      return `### 🥛 Dairy Price Sensitivity Analysis\n\nNo dairy or milk ingredients were detected in your database. If you use milk, ensure it is categorized under "Dairy & Milks".`;
    }

    let affectedCount = 0;
    const impactList: string[] = [];

    recipes.forEach((r) => {
      const milkItems = r.breakdown.filter((item) =>
        milkIngredients.some((m) => m.id === item.ingredientId)
      );
      if (milkItems.length > 0) {
        affectedCount++;
        const currentMilkCost = milkItems.reduce((acc, curr) => acc + curr.cost, 0);
        const addedCostAt10 = currentMilkCost * 0.10;
        const newProfit = r.grossProfit - addedCostAt10;
        const newMarginPercent = ((r.totalDirectCost + addedCostAt10) / r.sellingPrice) * 100;
        impactList.push(
          `- **${r.recipe.name} (${r.recipe.size})**: Milk cost rises by ${formatPHP(addedCostAt10)}/cup. Gross profit drops from ${formatPHP(r.grossProfit)} to **${formatPHP(newProfit)}** (Direct cost moves to ${formatPercent(newMarginPercent)}).`
        );
      }
    });

    return `### 🥛 10% Dairy Price Increase Impact Analysis

A **+10% increase** in your milk supplier prices affects **${affectedCount} of ${recipes.length}** active recipes on your menu:

${impactList.join('\n')}

#### 💡 Actionable Recommendations:
1. **Calibrate Milk Steaming Pitchers:** Standardize milk volume to reduce pitcher waste (usually 15-20ml discarded per milk-based drink).
2. **Review Cup Sizing:** If offering a 16oz standard, evaluate a 12oz size with higher coffee-to-milk ratio to preserve margins.
3. **Menu Repricing:** Consider increasing retail price by ₱5.00 to ₱10.00 to absorb the dairy supplier increase while maintaining gross margins.

*Note: Calculations reflect gross profit before overheads (rent, labor, electricity).*`;
  }

  // Which drinks have lowest gross profit or highest cost percentage
  if (p.includes('lowest') || p.includes('review') || p.includes('worst') || p.includes('margin')) {
    const lowMarginDrinks = recipes.filter((r) => r.directCostPercentage > 30);

    return `### ⚠️ Menu Margin Review & Priority Checklist

Based on your current recorded ingredient prices and selling prices:

#### 1. Drink with Lowest Cash Gross Profit:
- **${lowestProfit.recipe.name} (${lowestProfit.recipe.size})**
  - Selling Price: **${formatPHP(lowestProfit.sellingPrice)}**
  - Total Direct Cost: **${formatPHP(lowestProfit.totalDirectCost)}**
  - Gross Profit: **${formatPHP(lowestProfit.grossProfit)}** (Direct Cost: **${formatPercent(lowestProfit.directCostPercentage)}**)

#### 2. Drink with Highest Direct Cost Percentage:
- **${highestCostPercent.recipe.name} (${highestCostPercent.recipe.size})**
  - Direct Cost: **${formatPercent(highestCostPercent.directCostPercentage)}** of retail price.
  - Target Industry Benchmark for Beverage: **25% – 28%**.

${
  lowMarginDrinks.length > 0
    ? `#### Recipes Exceeding 30% Direct Cost Threshold (${lowMarginDrinks.length}):\n` +
      lowMarginDrinks
        .map(
          (r) =>
            `- **${r.recipe.name} (${r.recipe.size})**: Direct cost is ${formatPercent(r.directCostPercentage)} (${formatPHP(r.totalDirectCost)} cost / ${formatPHP(r.sellingPrice)} retail)`
        )
        .join('\n')
    : `✅ Excellent! None of your recipes currently exceed a 30% direct cost ratio.`
}

#### 📋 Recommendation:
Review the ingredient breakdown for **${highestCostPercent.recipe.name}**. Check whether packaging costs (₱${highestCostPercent.packagingCost.toFixed(2)}) or specialty dairy/syrup is driving up cost basis.`;
  }

  // Which ingredients affect the largest number of recipes
  if (p.includes('ingredient') && (p.includes('largest') || p.includes('most') || p.includes('affect'))) {
    const usageCount: Record<string, { count: number; name: string }> = {};

    recipes.forEach((r) => {
      r.recipe.ingredients.forEach((item) => {
        const ing = ingredients.find((i) => i.id === item.ingredientId);
        const name = ing ? ing.name : 'Unknown';
        if (!usageCount[item.ingredientId]) {
          usageCount[item.ingredientId] = { count: 0, name };
        }
        usageCount[item.ingredientId].count++;
      });
    });

    const sortedUsage = Object.values(usageCount).sort((a, b) => b.count - a.count);

    return `### 📊 Cross-Menu Ingredient Vulnerability Analysis

The ingredients that appear across the greatest number of your drinks:

${sortedUsage.map((u, i) => `${i + 1}. **${u.name}** — used in **${u.count}** recipes (${Math.round((u.count / recipes.length) * 100)}% of your menu)`).join('\n')}

#### 💡 Strategy Insight:
Ingredients at the top of this list represent your **primary supplier risk**. A price increase on **${sortedUsage[0]?.name || 'primary dairy'}** will compress your overall café profit faster than any specialty syrup. Prioritize negotiating volume discounts or bulk purchasing for these items.`;
  }

  // Selling price recommendations
  if (p.includes('25%') || p.includes('target') || p.includes('selling price') || p.includes('pricing')) {
    return `### 🎯 Target 25% Ingredient-Cost Pricing Matrix

To hit a healthy **25% Ingredient-Cost Percentage** (a standard benchmark for Philippine independent coffee shops and tea kiosks), here are your suggested retail prices:

${recipes
  .map((r) => {
    const suggested = r.suggestedPrices.target25;
    const diff = suggested - r.sellingPrice;
    const diffText = diff > 0 ? `(increase by +${formatPHP(diff)})` : `(currently priced above target)`;
    return `- **${r.recipe.name} (${r.recipe.size})**: Current Price: **${formatPHP(r.sellingPrice)}** ➔ Suggested: **${formatPHP(suggested)}** ${diffText}`;
  })
  .join('\n')}

*Important: Suggested pricing is calculated strictly from direct recipe costs. Operating expenses (stall rental, baristas, electricity, ice supplier, local permits) must be covered by your overall volume.*`;
  }

  // New concepts from existing inventory
  if (p.includes('concept') || p.includes('new') || p.includes('idea')) {
    const pantryNames = ingredients.map((i) => i.name).slice(0, 8).join(', ');
    return `### 💡 High-Margin Beverage Concepts Using Your Current Pantry

Based on ingredients currently in your database (${pantryNames}):

1. **Spanish Sea Salt Latte (High Margin Signature)**
   - Uses: Espresso base + Fresh Milk + Sweetened Condensed Milk + Pinch of Sea Salt.
   - *Why it works:* High perceived value in the Philippine specialty coffee market, allows a ₱150–₱170 price point with a direct cost typically under ₱45.00.

2. **Iced Brown Sugar Cinnamon Cold Foam**
   - Uses: Espresso or Cold Brew base + Vanilla Syrup + Frothed Milk Float with Brown Sugar dusting.
   - *Why it works:* Utilizes low-cost existing syrups to create a visual layered drink that commands a premium upcharge.

3. **Dirty Matcha / Matcha Espresso Fusion**
   - Uses: Matcha powder + Fresh Milk + Single Shot Espresso.
   - *Why it works:* Appeals to both tea and coffee drinkers, uses zero new SKU purchases, and typically commands a ₱165+ retail price.`;
  }

  // General Summary
  return `### ☕ CaféPilot Overview & Health Check for ${business.name}

Here is a summary of your current beverage costing data:

- **Total Recipes Saved:** ${recipes.length}
- **Average Menu Direct Cost:** **${formatPercent(avgDirectCostPercent)}**
- **Highest Gross Profit Drink:** **${highestProfit?.recipe.name}** (${formatPHP(highestProfit?.grossProfit)} per cup)
- **Lowest Gross Profit Drink:** **${lowestProfit?.recipe.name}** (${formatPHP(lowestProfit?.grossProfit)} per cup)
- **Top Direct Cost % Drink:** **${highestCostPercent?.recipe.name}** (${formatPercent(highestCostPercent?.directCostPercentage)})

#### Quick Questions You Can Ask Me:
- *"What happens to my margins if milk prices increase by 10%?"*
- *"Which recipes should I review first?"*
- *"What selling price gives me a 25% target cost?"*
- *"Which ingredients affect the largest number of recipes?"*
- *"Suggest new beverage concepts using my current ingredients."*

*(Reminder: Gross profit calculations exclude fixed operating overheads such as rent and labor).*`;
}

/**
 * Ask CaféPilot Advisor. First tries server-side Gemini 3.8 Flash, with deterministic fallback.
 */
export async function askCafePilotAdvisor(
  prompt: string,
  recipes: CalculatedRecipe[],
  ingredients: Ingredient[],
  business: BusinessProfile
): Promise<AdvisorResponse> {
  const timestamp = new Date().toISOString();

  // Prepare context payload
  const context = {
    businessName: business.name,
    businessType: business.businessType,
    currency: business.currency,
    targetFoodCostPercent: business.targetFoodCostPercent,
    ingredientsCount: ingredients.length,
    recipesCount: recipes.length,
    recipes: recipes.map((r) => ({
      name: r.recipe.name,
      size: r.recipe.size,
      category: r.recipe.category,
      sellingPrice: r.sellingPrice,
      totalIngredientCost: r.totalIngredientCost,
      packagingCost: r.packagingCost,
      totalDirectCost: r.totalDirectCost,
      grossProfit: r.grossProfit,
      ingredientCostPercentage: Number(r.ingredientCostPercentage.toFixed(2)),
      directCostPercentage: Number(r.directCostPercentage.toFixed(2)),
      breakdown: r.breakdown.map((b) => ({
        ingredient: b.ingredientName,
        used: `${b.quantityUsed} ${b.unit}`,
        cost: Number(b.cost.toFixed(2)),
      })),
    })),
    ingredients: ingredients.map((i) => ({
      name: i.name,
      category: i.category,
      purchasePrice: i.purchasePrice,
      purchaseQty: `${i.purchaseQuantity} ${i.purchaseUnit}`,
      effectiveUnitCost: `${i.effectiveCostPerBaseUnit.toFixed(4)} / ${i.baseUnit}`,
      currentStock: `${i.currentStock} ${i.baseUnit}`,
    })),
    overheadSettings: {
      includeInCosting: business.overheadSettings.includeInCosting,
      monthlyRent: business.overheadSettings.monthlyRent,
      monthlyElectricity: business.overheadSettings.monthlyElectricity,
      monthlyWater: business.overheadSettings.monthlyWater,
      monthlyLabor: business.overheadSettings.monthlyLabor,
      otherMonthlyOverhead: business.overheadSettings.otherMonthlyOverhead,
      estimatedMonthlyCups: business.overheadSettings.estimatedMonthlyCups,
      staffDetails: business.overheadSettings.staffDetails,
    },
  };

  try {
    const res = await fetch('/api/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.text) {
        return {
          answer: data.text,
          isAiPowered: true,
          modelName: 'Gemini 3.8 Flash',
          timestamp,
        };
      }
    }
  } catch (error) {
    console.warn('Backend advisor endpoint unavailable, using rule-based engine:', error);
  }

  // Fallback to deterministic expert logic
  const answer = generateDeterministicAdvice(prompt, recipes, ingredients, business);
  return {
    answer,
    isAiPowered: false,
    modelName: 'Deterministic Rule Engine',
    timestamp,
  };
}
