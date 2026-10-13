export type UnitType = 'g' | 'kg' | 'ml' | 'L' | 'pcs';
export type BaseUnitType = 'g' | 'ml' | 'pcs';

export interface PriceHistoryItem {
  date: string;
  price: number;
  usableQuantity: number;
  effectiveUnitCost: number;
  reason?: string;
}

export type InventoryDepartment = 'cafe' | 'kitchen' | 'utility';
export type UserRole = 'admin' | 'employee';

export interface Ingredient {
  id: string;
  businessId: string;
  name: string;
  department?: InventoryDepartment; // Split inventory by cafe, kitchen, utility
  category: 
    | 'Coffee Beans'
    | 'Dairy & Milks'
    | 'Syrups & Sauces'
    | 'Powders & Teas'
    | 'Toppings & Add-ons'
    | 'Packaging & Disposables'
    | 'Produce & Fruit'
    | 'Other';
  supplierName?: string;
  purchasePrice: number; // in PHP
  purchaseQuantity: number;
  purchaseUnit: UnitType;
  baseUnit: BaseUnitType;
  usableQuantity: number; // in base units
  effectiveCostPerBaseUnit: number; // PHP per base unit
  currentStock: number; // in base units
  minStockThreshold: number; // in base units
  lastUpdated: string;
  notes?: string;
  priceHistory: PriceHistoryItem[];
  isArchived?: boolean;
}

export interface RecipeIngredientItem {
  ingredientId: string;
  quantityUsed: number;
  unit: UnitType;
}

export interface Recipe {
  id: string;
  businessId: string;
  name: string;
  category:
    | 'Espresso-Based'
    | 'Milk Tea & Boba'
    | 'Cold Brew'
    | 'Refreshers & Fruit Teas'
    | 'Blended & Frappes'
    | 'Pastries & Snacks'
    | 'Other';
  size: string; // e.g. "12oz / 360ml", "16oz / 500ml", "22oz / 650ml", "Single"
  ingredients: RecipeIngredientItem[];
  packagingCost: number; // PHP for cup, lid, straw, sleeve, seal
  wastageAllowancePercent: number; // e.g. 2% or 5%
  wastageFixedCost: number; // optional fixed wastage PHP
  sellingPrice: number; // PHP
  includeOverheadCosting?: boolean; // Optional selection to include rent, utilities, and labor in unit costing
  preparationInstructions?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeCostBreakdownItem {
  ingredientId: string;
  ingredientName: string;
  quantityUsed: number;
  unit: UnitType;
  baseQuantity: number;
  baseUnit: BaseUnitType;
  unitCost: number;
  cost: number;
}

export interface OverheadAllocation {
  rentPerCup: number;
  electricityPerCup: number;
  waterPerCup: number;
  laborPerCup: number;
  otherPerCup: number;
  totalOverheadPerCup: number;
}

export interface CalculatedRecipe {
  recipe: Recipe;
  breakdown: RecipeCostBreakdownItem[];
  totalIngredientCost: number;
  packagingCost: number;
  wastageCost: number;
  totalDirectCost: number; // COGS: Ingredients + Packaging + Wastage
  sellingPrice: number;
  grossProfit: number; // Selling Price - Total Direct Cost
  ingredientCostPercentage: number;
  directCostPercentage: number;
  // Overheads and Net Margins
  isOverheadIncluded: boolean;
  overheadAllocation: OverheadAllocation;
  fullyLoadedCost: number; // Total Direct Cost + Total Overhead Per Cup
  netProfit: number; // Selling Price - Fully Loaded Cost
  netProfitPercentage: number; // (Net Profit / Selling Price) * 100
  suggestedPrices: {
    target20: number;
    target25: number;
    target30: number;
    target35: number;
  };
}

export type MovementType =
  | 'PURCHASE_RECEIPT'
  | 'WASTE_SPOILAGE'
  | 'MANUAL_ADJUSTMENT'
  | 'PRODUCTION_BATCH'
  | 'STOCK_TRANSFER';

export interface StockMovement {
  id: string;
  businessId: string;
  ingredientId: string;
  type: MovementType;
  quantity: number; // in base unit
  unit: BaseUnitType;
  costAtMovement?: number;
  reason: string;
  createdAt: string;
}

export interface StockTransferItem {
  ingredientId: string;
  ingredientName: string;
  department: InventoryDepartment;
  quantityTransferred: number;
  unit: string;
  stockRoomBalanceBefore: number;
  stockRoomBalanceAfter: number;
  notes?: string;
}

export interface StockTransferSlip {
  id: string;
  businessId: string;
  slipNumber: string; // e.g. "TRF-2026-0042"
  destination: 'bar' | 'kitchen'; // Bar / Café Station OR Kitchen Station
  requestedBy: string; // e.g. "Barista Mark" or "Chef Ramon"
  dispatchedBy: string; // e.g. "Elena (Stock Custodian)" or Employee Name
  approvedBy?: string; // e.g. "Mico (Manager)"
  shift: 'Morning Opening' | 'Mid-Day Rush' | 'Evening Restock';
  transferDate: string; // ISO date string
  notes?: string;
  items: StockTransferItem[];
  status: 'DISPATCHED' | 'RECEIVED' | 'DRAFT';
  createdAt: string;
}

export interface OverheadSettings {
  includeInCosting: boolean; // Optional selection for costing
  monthlyRent: number; // Monthly shop/stall rent in PHP
  monthlyElectricity: number; // Monthly power bill (Meralco / coop) in PHP
  monthlyWater: number; // Monthly water utility bill in PHP
  monthlyLabor: number; // Monthly staff & barista payroll in PHP
  otherMonthlyOverhead: number; // Maintenance, internet, POS, permits, ice delivery in PHP
  estimatedMonthlyCups: number; // Estimated beverage sales volume per month (e.g. 2,500 cups)
  staffDetails?: {
    baristaCount: number;
    averageMonthlySalary: number;
  };
}

export interface BusinessProfile {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  businessType: 'Specialty Coffee' | 'Milk Tea & Boba' | 'Coffee Stall / Kiosk' | 'Multi-branch Café' | 'Juice & Smoothie Bar';
  currency: 'PHP';
  plan: 'starter' | 'pro' | 'multi_branch';
  targetFoodCostPercent: number; // default 28
  overheadSettings: OverheadSettings;
  createdAt: string;
}
