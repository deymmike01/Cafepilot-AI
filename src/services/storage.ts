import {
  Ingredient,
  Recipe,
  StockMovement,
  BusinessProfile,
  OverheadSettings,
  CalculatedRecipe,
  StockTransferSlip,
  StockTransferItem,
  UserRole,
  InventoryDepartment,
} from '../types';
import { calculateEffectiveUnitCost, calculateRecipeCost } from '../utils/costing';

const STORAGE_KEYS = {
  BUSINESSES: 'cafepilot_businesses_v1',
  ACTIVE_BUSINESS_ID: 'cafepilot_active_business_v1',
  INGREDIENTS: 'cafepilot_ingredients_v1',
  RECIPES: 'cafepilot_recipes_v1',
  MOVEMENTS: 'cafepilot_movements_v1',
  STOCK_TRANSFERS: 'cafepilot_stock_transfers_v1',
  USER_ROLE: 'cafepilot_user_role_v1',
};

// Initial Seed Business Profiles
export const SEED_BUSINESSES: BusinessProfile[] = [
  {
    id: 'biz_kape_isla',
    name: 'Kape Isla Specialty Coffee',
    ownerName: 'Mico Santos',
    email: 'mico@kapeisla.ph',
    businessType: 'Specialty Coffee',
    currency: 'PHP',
    plan: 'pro',
    targetFoodCostPercent: 28,
    overheadSettings: {
      includeInCosting: false, // Optional selection for costing
      monthlyRent: 15000, // ₱15,000 / month
      monthlyElectricity: 8500, // ₱8,500 / month (espresso machine, grinder, AC)
      monthlyWater: 1200, // ₱1,200 / month
      monthlyLabor: 26000, // ₱26,000 / month (2 baristas @ ₱13,000)
      otherMonthlyOverhead: 2500, // ₱2,500 / month (POS, internet, ice delivery)
      estimatedMonthlyCups: 2500, // 2,500 cups / month (~83 cups/day)
      staffDetails: {
        baristaCount: 2,
        averageMonthlySalary: 13000,
      },
    },
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'biz_boba_bloom',
    name: 'Boba & Brew Kiosk',
    ownerName: 'Alyssa Chen',
    email: 'alyssa@bobabrew.ph',
    businessType: 'Milk Tea & Boba',
    currency: 'PHP',
    plan: 'starter',
    targetFoodCostPercent: 25,
    overheadSettings: {
      includeInCosting: false,
      monthlyRent: 8000, // ₱8,000 / month kiosk space
      monthlyElectricity: 4500, // ₱4,500 / month
      monthlyWater: 800, // ₱800 / month
      monthlyLabor: 14000, // ₱14,000 / month (1 staff)
      otherMonthlyOverhead: 1500, // ₱1,500 / month
      estimatedMonthlyCups: 1800, // 1,800 cups / month (~60 cups/day)
      staffDetails: {
        baristaCount: 1,
        averageMonthlySalary: 14000,
      },
    },
    createdAt: '2026-02-01T08:00:00.000Z',
  },
];

// Seed Ingredients for Kape Isla (Café, Kitchen, and Utility categories)
export const SEED_INGREDIENTS_KAPE_ISLA: Ingredient[] = [
  // --- CAFÉ & BAR STATION ---
  {
    id: 'ing_fresh_milk_std',
    businessId: 'biz_kape_isla',
    name: 'Fresh Whole Milk (1L)',
    department: 'cafe',
    category: 'Dairy & Milks',
    supplierName: 'Dairy Gold PH',
    purchasePrice: 100, // Matches TEST 1: ₱100 for 1000ml -> ₱0.10/ml
    purchaseQuantity: 1000,
    purchaseUnit: 'ml',
    baseUnit: 'ml',
    usableQuantity: 1000,
    effectiveCostPerBaseUnit: 0.10, // ₱0.10 / ml
    currentStock: 12000, // 12,000 ml on hand
    minStockThreshold: 4000,
    lastUpdated: '2026-10-10T10:00:00.000Z',
    notes: 'Standard 1L carton, zero wastage expected in normal pitcher transfer.',
    priceHistory: [
      {
        date: '2026-09-01T08:00:00.000Z',
        price: 90,
        usableQuantity: 1000,
        effectiveUnitCost: 0.09,
        reason: 'Initial supplier contract',
      },
      {
        date: '2026-10-10T10:00:00.000Z',
        price: 100,
        usableQuantity: 1000,
        effectiveUnitCost: 0.10,
        reason: 'Dairy fuel surcharge price adjustment (+11.1%)',
      },
    ],
  },
  {
    id: 'ing_espresso_beans',
    businessId: 'biz_kape_isla',
    name: 'Single Origin Arabica Beans (Espresso)',
    department: 'cafe',
    category: 'Coffee Beans',
    supplierName: 'Benguet Highland Roasters',
    purchasePrice: 300, // 1000g for ₱300 -> ₱0.30 per g
    purchaseQuantity: 1000,
    purchaseUnit: 'g',
    baseUnit: 'g',
    usableQuantity: 1000,
    effectiveCostPerBaseUnit: 0.30,
    currentStock: 8500,
    minStockThreshold: 2000,
    lastUpdated: '2026-10-05T09:00:00.000Z',
    notes: 'Medium roast, notes of dark chocolate and brown sugar.',
    priceHistory: [
      {
        date: '2026-10-05T09:00:00.000Z',
        price: 300,
        usableQuantity: 1000,
        effectiveUnitCost: 0.30,
        reason: 'Harvest batch purchase',
      },
    ],
  },
  {
    id: 'ing_vanilla_syrup',
    businessId: 'biz_kape_isla',
    name: 'Artisan Vanilla Syrup (750ml)',
    department: 'cafe',
    category: 'Syrups & Sauces',
    supplierName: 'Flavors Craft Manila',
    purchasePrice: 112.50, // 750ml for ₱112.50 -> ₱0.15/ml
    purchaseQuantity: 750,
    purchaseUnit: 'ml',
    baseUnit: 'ml',
    usableQuantity: 750,
    effectiveCostPerBaseUnit: 0.15,
    currentStock: 2250,
    minStockThreshold: 750,
    lastUpdated: '2026-10-01T12:00:00.000Z',
    notes: 'Pure cane sugar and natural vanilla bean extract.',
    priceHistory: [
      {
        date: '2026-10-01T12:00:00.000Z',
        price: 112.50,
        usableQuantity: 750,
        effectiveUnitCost: 0.15,
        reason: 'Direct distributor bulk price',
      },
    ],
  },
  {
    id: 'ing_oat_milk',
    businessId: 'biz_kape_isla',
    name: 'Barista Oat Milk (1L)',
    department: 'cafe',
    category: 'Dairy & Milks',
    supplierName: 'Oat Supply Co.',
    purchasePrice: 180,
    purchaseQuantity: 1000,
    purchaseUnit: 'ml',
    baseUnit: 'ml',
    usableQuantity: 1000,
    effectiveCostPerBaseUnit: 0.18,
    currentStock: 6000,
    minStockThreshold: 3000,
    lastUpdated: '2026-10-08T11:00:00.000Z',
    notes: 'Steams creamy microfoam without curdling.',
    priceHistory: [
      {
        date: '2026-10-08T11:00:00.000Z',
        price: 180,
        usableQuantity: 1000,
        effectiveUnitCost: 0.18,
      },
    ],
  },
  {
    id: 'ing_caramel_sauce',
    businessId: 'biz_kape_isla',
    name: 'Sea Salt Caramel Sauce (1kg)',
    department: 'cafe',
    category: 'Syrups & Sauces',
    supplierName: 'Gourmet Treats PH',
    purchasePrice: 420,
    purchaseQuantity: 1000,
    purchaseUnit: 'g',
    baseUnit: 'g',
    usableQuantity: 960,
    effectiveCostPerBaseUnit: 420 / 960,
    currentStock: 1920,
    minStockThreshold: 500,
    lastUpdated: '2026-09-25T16:00:00.000Z',
    notes: 'Thick drizzle sauce, calculate 4% container cling wastage.',
    priceHistory: [
      {
        date: '2026-09-25T16:00:00.000Z',
        price: 420,
        usableQuantity: 960,
        effectiveUnitCost: 420 / 960,
      },
    ],
  },
  {
    id: 'ing_uji_matcha',
    businessId: 'biz_kape_isla',
    name: 'Ceremonial Uji Matcha Powder (500g)',
    department: 'cafe',
    category: 'Powders & Teas',
    supplierName: 'Kyoto Tea Imports',
    purchasePrice: 1200,
    purchaseQuantity: 500,
    purchaseUnit: 'g',
    baseUnit: 'g',
    usableQuantity: 500,
    effectiveCostPerBaseUnit: 2.40,
    currentStock: 1500,
    minStockThreshold: 500,
    lastUpdated: '2026-10-02T10:00:00.000Z',
    notes: 'First-harvest stone-ground Japanese green tea powder.',
    priceHistory: [
      {
        date: '2026-10-02T10:00:00.000Z',
        price: 1200,
        usableQuantity: 500,
        effectiveUnitCost: 2.40,
      },
    ],
  },

  // --- KITCHEN & PASTRY STATION ---
  {
    id: 'ing_pastry_butter',
    businessId: 'biz_kape_isla',
    name: 'Pure Unsalted Baking Butter (1kg)',
    department: 'kitchen',
    category: 'Dairy & Milks',
    supplierName: 'Anchor Food Professional',
    purchasePrice: 380,
    purchaseQuantity: 1000,
    purchaseUnit: 'g',
    baseUnit: 'g',
    usableQuantity: 1000,
    effectiveCostPerBaseUnit: 0.38,
    currentStock: 4500,
    minStockThreshold: 2000,
    lastUpdated: '2026-10-09T08:00:00.000Z',
    notes: '82% butterfat for croissants, cookies, and grilled sourdough toast.',
    priceHistory: [
      {
        date: '2026-10-09T08:00:00.000Z',
        price: 380,
        usableQuantity: 1000,
        effectiveUnitCost: 0.38,
      },
    ],
  },
  {
    id: 'ing_farm_eggs',
    businessId: 'biz_kape_isla',
    name: 'Farm Fresh Grade-A Eggs (Tray of 30)',
    department: 'kitchen',
    category: 'Produce & Fruit',
    supplierName: 'Batangas Poultry Direct',
    purchasePrice: 240,
    purchaseQuantity: 30,
    purchaseUnit: 'pcs',
    baseUnit: 'pcs',
    usableQuantity: 30,
    effectiveCostPerBaseUnit: 8.00,
    currentStock: 90,
    minStockThreshold: 30,
    lastUpdated: '2026-10-10T09:00:00.000Z',
    notes: 'Antibiotic-free brown eggs for breakfast brioche sandwiches & baking.',
    priceHistory: [
      {
        date: '2026-10-10T09:00:00.000Z',
        price: 240,
        usableQuantity: 30,
        effectiveUnitCost: 8.00,
      },
    ],
  },
  {
    id: 'ing_artisan_sourdough',
    businessId: 'biz_kape_isla',
    name: 'Artisan Sourdough Loaf (Pre-sliced 12pcs)',
    department: 'kitchen',
    category: 'Other',
    supplierName: 'Wildflour Artisan Commissary',
    purchasePrice: 180,
    purchaseQuantity: 12,
    purchaseUnit: 'pcs',
    baseUnit: 'pcs',
    usableQuantity: 12,
    effectiveCostPerBaseUnit: 15.00,
    currentStock: 36,
    minStockThreshold: 12,
    lastUpdated: '2026-10-11T07:00:00.000Z',
    notes: 'Slow-fermented country sourdough loaf for melt sandwiches & avocado toast.',
    priceHistory: [
      {
        date: '2026-10-11T07:00:00.000Z',
        price: 180,
        usableQuantity: 12,
        effectiveUnitCost: 15.00,
      },
    ],
  },
  {
    id: 'ing_fresh_strawberries',
    businessId: 'biz_kape_isla',
    name: 'Fresh Highland Strawberries (1kg)',
    department: 'kitchen',
    category: 'Produce & Fruit',
    supplierName: 'La Trinidad Berry Cooperative',
    purchasePrice: 320,
    purchaseQuantity: 1000,
    purchaseUnit: 'g',
    baseUnit: 'g',
    usableQuantity: 880, // 12% hull and soft spot trimming
    effectiveCostPerBaseUnit: 320 / 880,
    currentStock: 2640,
    minStockThreshold: 880,
    lastUpdated: '2026-10-08T14:00:00.000Z',
    notes: 'Fresh fruit for strawberry shortcake cups, waffle toppings & fruit preserves.',
    priceHistory: [
      {
        date: '2026-10-08T14:00:00.000Z',
        price: 320,
        usableQuantity: 880,
        effectiveUnitCost: 320 / 880,
      },
    ],
  },

  // --- UTILITY & PACKAGING STATION ---
  {
    id: 'ing_packaging_16oz',
    businessId: 'biz_kape_isla',
    name: '16oz Cold Cup Set (Cup + Dome Lid + Straw)',
    department: 'utility',
    category: 'Packaging & Disposables',
    supplierName: 'EcoPack Bulacan',
    purchasePrice: 350,
    purchaseQuantity: 50,
    purchaseUnit: 'pcs',
    baseUnit: 'pcs',
    usableQuantity: 50,
    effectiveCostPerBaseUnit: 7.00, // ₱7.00 per cup set (Matches TEST 2)
    currentStock: 280,
    minStockThreshold: 100,
    lastUpdated: '2026-09-20T14:00:00.000Z',
    notes: 'Recyclable PET cup, tight snap lid, compostable kraft straw.',
    priceHistory: [
      {
        date: '2026-09-20T14:00:00.000Z',
        price: 350,
        usableQuantity: 50,
        effectiveUnitCost: 7.00,
      },
    ],
  },
  {
    id: 'ing_hot_cup_12oz',
    businessId: 'biz_kape_isla',
    name: '12oz Insulated Hot Cups + Sipper Lids (50pcs)',
    department: 'utility',
    category: 'Packaging & Disposables',
    supplierName: 'EcoPack Bulacan',
    purchasePrice: 300,
    purchaseQuantity: 50,
    purchaseUnit: 'pcs',
    baseUnit: 'pcs',
    usableQuantity: 50,
    effectiveCostPerBaseUnit: 6.00,
    currentStock: 250,
    minStockThreshold: 100,
    lastUpdated: '2026-09-22T10:00:00.000Z',
    notes: 'Double-walled ripple cup, heat barrier, no sleeve required.',
    priceHistory: [
      {
        date: '2026-09-22T10:00:00.000Z',
        price: 300,
        usableQuantity: 50,
        effectiveUnitCost: 6.00,
      },
    ],
  },
  {
    id: 'ing_kraft_carriers',
    businessId: 'biz_kape_isla',
    name: 'Heavy-Duty 2-Cup Kraft Takeout Carriers (50pcs)',
    department: 'utility',
    category: 'Packaging & Disposables',
    supplierName: 'PaperCraft Manila',
    purchasePrice: 175,
    purchaseQuantity: 50,
    purchaseUnit: 'pcs',
    baseUnit: 'pcs',
    usableQuantity: 50,
    effectiveCostPerBaseUnit: 3.50,
    currentStock: 150,
    minStockThreshold: 50,
    lastUpdated: '2026-09-28T11:00:00.000Z',
    notes: 'Sturdy fold-up takeaway drink holder for delivery orders.',
    priceHistory: [
      {
        date: '2026-09-28T11:00:00.000Z',
        price: 175,
        usableQuantity: 50,
        effectiveUnitCost: 3.50,
      },
    ],
  },
  {
    id: 'ing_sanitizer_kitchen',
    businessId: 'biz_kape_isla',
    name: 'Food-Contact Surface Sanitizer (1L Spray)',
    department: 'utility',
    category: 'Other',
    supplierName: 'HygienePro PH',
    purchasePrice: 220,
    purchaseQuantity: 1000,
    purchaseUnit: 'ml',
    baseUnit: 'ml',
    usableQuantity: 1000,
    effectiveCostPerBaseUnit: 0.22,
    currentStock: 3000,
    minStockThreshold: 1000,
    lastUpdated: '2026-10-01T09:00:00.000Z',
    notes: 'No-rinse food prep surface antibacterial sanitizer for bar & kitchen counters.',
    priceHistory: [
      {
        date: '2026-10-01T09:00:00.000Z',
        price: 220,
        usableQuantity: 1000,
        effectiveUnitCost: 0.22,
      },
    ],
  },
];

// Initial Seed Stock Transfers (Central Stock Room -> Bar / Kitchen)
export const SEED_STOCK_TRANSFERS: StockTransferSlip[] = [
  {
    id: 'trf_seed_01',
    businessId: 'biz_kape_isla',
    slipNumber: 'TRF-20261012-1081',
    destination: 'bar',
    requestedBy: 'Marco (Lead Barista)',
    dispatchedBy: 'Elena (Stock Custodian)',
    approvedBy: 'Mico Santos (Manager)',
    shift: 'Morning Opening',
    transferDate: new Date().toISOString(),
    notes: 'Morning coffee bar station stock replenishment from central stock room.',
    status: 'DISPATCHED',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    items: [
      {
        ingredientId: 'ing_espresso_beans',
        ingredientName: 'Single Origin Arabica Beans (Espresso)',
        department: 'cafe',
        quantityTransferred: 2000,
        unit: 'g',
        stockRoomBalanceBefore: 10500,
        stockRoomBalanceAfter: 8500,
        notes: '2 sealed 1kg foil bags',
      },
      {
        ingredientId: 'ing_fresh_milk_std',
        ingredientName: 'Fresh Whole Milk (1L)',
        department: 'cafe',
        quantityTransferred: 4000,
        unit: 'ml',
        stockRoomBalanceBefore: 16000,
        stockRoomBalanceAfter: 12000,
        notes: '4 fresh 1L cartons',
      },
      {
        ingredientId: 'ing_packaging_16oz',
        ingredientName: '16oz Cold Cup Set (Cup + Dome Lid + Straw)',
        department: 'utility',
        quantityTransferred: 100,
        unit: 'pcs',
        stockRoomBalanceBefore: 380,
        stockRoomBalanceAfter: 280,
        notes: '2 sealed sleeves of 50pcs',
      },
    ],
  },
  {
    id: 'trf_seed_02',
    businessId: 'biz_kape_isla',
    slipNumber: 'TRF-20261012-2044',
    destination: 'kitchen',
    requestedBy: 'Chef Ramon',
    dispatchedBy: 'Elena (Stock Custodian)',
    approvedBy: 'Mico Santos (Manager)',
    shift: 'Morning Opening',
    transferDate: new Date().toISOString(),
    notes: 'Bakery & hot sandwich station daily prep supplies requisition.',
    status: 'DISPATCHED',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    items: [
      {
        ingredientId: 'ing_pastry_butter',
        ingredientName: 'Pure Unsalted Baking Butter (1kg)',
        department: 'kitchen',
        quantityTransferred: 1000,
        unit: 'g',
        stockRoomBalanceBefore: 5500,
        stockRoomBalanceAfter: 4500,
        notes: '1 block chilled unsalted butter',
      },
      {
        ingredientId: 'ing_farm_eggs',
        ingredientName: 'Farm Fresh Grade-A Eggs (Tray of 30)',
        department: 'kitchen',
        quantityTransferred: 30,
        unit: 'pcs',
        stockRoomBalanceBefore: 120,
        stockRoomBalanceAfter: 90,
        notes: '1 full carton tray',
      },
      {
        ingredientId: 'ing_artisan_sourdough',
        ingredientName: 'Artisan Sourdough Loaf (Pre-sliced 12pcs)',
        department: 'kitchen',
        quantityTransferred: 12,
        unit: 'pcs',
        stockRoomBalanceBefore: 48,
        stockRoomBalanceAfter: 36,
        notes: '1 fresh loaf sliced',
      },
    ],
  },
];

// Seed Recipes for Kape Isla (Contains the exact TEST 2 & TEST 3 values!)
export const SEED_RECIPES_KAPE_ISLA: Recipe[] = [
  {
    id: 'rec_iced_latte_16oz',
    businessId: 'biz_kape_isla',
    name: 'Iced Vanilla Latte',
    category: 'Espresso-Based',
    size: '16oz / 500ml',
    ingredients: [
      {
        ingredientId: 'ing_espresso_beans',
        quantityUsed: 36, // 36g/ml @ ₱0.30 = ₱10.80
        unit: 'g',
      },
      {
        ingredientId: 'ing_fresh_milk_std',
        quantityUsed: 200, // 200ml @ ₱0.10 = ₱20.00
        unit: 'ml',
      },
      {
        ingredientId: 'ing_vanilla_syrup',
        quantityUsed: 20, // 20ml @ ₱0.15 = ₱3.00
        unit: 'ml',
      },
    ],
    packagingCost: 7.00, // Packaging = ₱7.00
    wastageAllowancePercent: 0,
    wastageFixedCost: 0,
    sellingPrice: 140.00, // Selling price = ₱140.00
    preparationInstructions: '1. Pump 20ml vanilla syrup into 16oz cup.\n2. Add 150g ice cubes.\n3. Pour 200ml fresh milk.\n4. Pull double espresso shot (36g) and float on top.\n5. Cap with dome lid and serve with paper straw.',
    createdAt: '2026-09-22T10:00:00.000Z',
    updatedAt: '2026-10-10T10:00:00.000Z',
  },
  {
    id: 'rec_iced_oat_latte',
    businessId: 'biz_kape_isla',
    name: 'Iced Oat Latte',
    category: 'Espresso-Based',
    size: '16oz / 500ml',
    ingredients: [
      {
        ingredientId: 'ing_espresso_beans',
        quantityUsed: 36, // ₱10.80
        unit: 'g',
      },
      {
        ingredientId: 'ing_oat_milk',
        quantityUsed: 200, // 200ml @ ₱0.18 = ₱36.00
        unit: 'ml',
      },
    ],
    packagingCost: 7.00,
    wastageAllowancePercent: 0,
    wastageFixedCost: 0,
    sellingPrice: 175.00,
    preparationInstructions: '1. Fill cup with ice.\n2. Pour 200ml barista oat milk.\n3. Float double shot espresso.\n4. Lid and serve.',
    createdAt: '2026-09-25T11:00:00.000Z',
    updatedAt: '2026-10-08T11:00:00.000Z',
  },
  {
    id: 'rec_caramel_macchiato_16oz',
    businessId: 'biz_kape_isla',
    name: 'Caramel Macchiato',
    category: 'Espresso-Based',
    size: '16oz / 500ml',
    ingredients: [
      {
        ingredientId: 'ing_espresso_beans',
        quantityUsed: 36, // ₱10.80
        unit: 'g',
      },
      {
        ingredientId: 'ing_fresh_milk_std',
        quantityUsed: 180, // 180ml @ ₱0.10 = ₱18.00
        unit: 'ml',
      },
      {
        ingredientId: 'ing_vanilla_syrup',
        quantityUsed: 15, // 15ml @ ₱0.15 = ₱2.25
        unit: 'ml',
      },
      {
        ingredientId: 'ing_caramel_sauce',
        quantityUsed: 25, // 25g @ ₱0.4375 = ₱10.94
        unit: 'g',
      },
    ],
    packagingCost: 7.00,
    wastageAllowancePercent: 2, // 2% prep allowance
    wastageFixedCost: 0,
    sellingPrice: 165.00,
    preparationInstructions: 'Vanilla syrup at bottom, cold milk, ice, espresso float, crosshatch caramel drizzle on top.',
    createdAt: '2026-09-28T14:00:00.000Z',
    updatedAt: '2026-10-10T10:00:00.000Z',
  },
];

export class StorageService {
  private static isClient(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // --- Businesses ---
  static getBusinesses(): BusinessProfile[] {
    if (!this.isClient()) return SEED_BUSINESSES;
    const stored = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(SEED_BUSINESSES));
      return SEED_BUSINESSES;
    }
    try {
      const parsed = JSON.parse(stored) as BusinessProfile[];
      return parsed.map((b) => ({
        ...b,
        overheadSettings: b.overheadSettings || {
          includeInCosting: false,
          monthlyRent: 15000,
          monthlyElectricity: 8500,
          monthlyWater: 1200,
          monthlyLabor: 26000,
          otherMonthlyOverhead: 2500,
          estimatedMonthlyCups: 2500,
          staffDetails: { baristaCount: 2, averageMonthlySalary: 13000 },
        },
      }));
    } catch {
      return SEED_BUSINESSES;
    }
  }

  static saveBusinesses(businesses: BusinessProfile[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
  }

  static getActiveBusinessId(): string {
    if (!this.isClient()) return SEED_BUSINESSES[0].id;
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_BUSINESS_ID);
    if (stored) return stored;
    const defaultId = SEED_BUSINESSES[0].id;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BUSINESS_ID, defaultId);
    return defaultId;
  }

  static setActiveBusinessId(id: string): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BUSINESS_ID, id);
  }

  static getActiveBusiness(): BusinessProfile {
    const list = this.getBusinesses();
    const activeId = this.getActiveBusinessId();
    const found = list.find((b) => b.id === activeId);
    return found || list[0] || SEED_BUSINESSES[0];
  }

  static updateActiveBusiness(profile: Partial<BusinessProfile>): BusinessProfile {
    const list = this.getBusinesses();
    const activeId = this.getActiveBusinessId();
    const updated = list.map((b) => {
      if (b.id === activeId) {
        return {
          ...b,
          ...profile,
          overheadSettings: profile.overheadSettings
            ? { ...b.overheadSettings, ...profile.overheadSettings }
            : b.overheadSettings,
        };
      }
      return b;
    });
    this.saveBusinesses(updated);
    return this.getActiveBusiness();
  }

  static createBusiness(
    profile: Omit<BusinessProfile, 'id' | 'createdAt' | 'overheadSettings'> & {
      overheadSettings?: OverheadSettings;
    }
  ): BusinessProfile {
    const defaultOverhead = {
      includeInCosting: false,
      monthlyRent: 15000,
      monthlyElectricity: 8500,
      monthlyWater: 1200,
      monthlyLabor: 26000,
      otherMonthlyOverhead: 2500,
      estimatedMonthlyCups: 2500,
      staffDetails: { baristaCount: 2, averageMonthlySalary: 13000 },
    };

    const newBiz: BusinessProfile = {
      ...profile,
      overheadSettings: profile.overheadSettings || defaultOverhead,
      id: `biz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    const list = this.getBusinesses();
    list.push(newBiz);
    this.saveBusinesses(list);
    this.setActiveBusinessId(newBiz.id);
    return newBiz;
  }

  // --- Ingredients (Isolated by active business) ---
  static getAllIngredients(): Ingredient[] {
    if (!this.isClient()) return SEED_INGREDIENTS_KAPE_ISLA;
    const stored = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(SEED_INGREDIENTS_KAPE_ISLA));
      return SEED_INGREDIENTS_KAPE_ISLA;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return SEED_INGREDIENTS_KAPE_ISLA;
    }
  }

  static getActiveIngredients(): Ingredient[] {
    const activeId = this.getActiveBusinessId();
    return this.getAllIngredients().filter((item) => item.businessId === activeId);
  }

  static saveAllIngredients(ingredients: Ingredient[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
  }

  static saveIngredient(ingredient: Ingredient): void {
    const all = this.getAllIngredients();
    const existingIndex = all.findIndex((i) => i.id === ingredient.id);
    if (existingIndex >= 0) {
      all[existingIndex] = ingredient;
    } else {
      all.push(ingredient);
    }
    this.saveAllIngredients(all);
  }

  static deleteIngredient(ingredientId: string): void {
    const all = this.getAllIngredients();
    const filtered = all.filter((i) => i.id !== ingredientId);
    this.saveAllIngredients(filtered);
  }

  // --- Recipes (Isolated by active business) ---
  static getAllRecipes(): Recipe[] {
    if (!this.isClient()) return SEED_RECIPES_KAPE_ISLA;
    const stored = localStorage.getItem(STORAGE_KEYS.RECIPES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(SEED_RECIPES_KAPE_ISLA));
      return SEED_RECIPES_KAPE_ISLA;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return SEED_RECIPES_KAPE_ISLA;
    }
  }

  static getActiveRecipes(): Recipe[] {
    const activeId = this.getActiveBusinessId();
    return this.getAllRecipes().filter((r) => r.businessId === activeId);
  }

  static saveAllRecipes(recipes: Recipe[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  }

  static saveRecipe(recipe: Recipe): void {
    const all = this.getAllRecipes();
    const existingIndex = all.findIndex((r) => r.id === recipe.id);
    if (existingIndex >= 0) {
      all[existingIndex] = recipe;
    } else {
      all.push(recipe);
    }
    this.saveAllRecipes(all);
  }

  static deleteRecipe(recipeId: string): void {
    const all = this.getAllRecipes();
    const filtered = all.filter((r) => r.id !== recipeId);
    this.saveAllRecipes(filtered);
  }

  // --- Stock Movements / Inventory ---
  static getAllMovements(): StockMovement[] {
    if (!this.isClient()) return [];
    const stored = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static getActiveMovements(): StockMovement[] {
    const activeId = this.getActiveBusinessId();
    return this.getAllMovements().filter((m) => m.businessId === activeId);
  }

  static recordMovement(movement: Omit<StockMovement, 'id' | 'createdAt'>): StockMovement {
    const newMovement: StockMovement = {
      ...movement,
      id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    const all = this.getAllMovements();
    all.unshift(newMovement);
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(all));
    }

    // Update ingredient stock
    const ingredients = this.getAllIngredients();
    const target = ingredients.find((i) => i.id === movement.ingredientId);
    if (target) {
      if (movement.type === 'PURCHASE_RECEIPT') {
        target.currentStock += movement.quantity;
      } else if (movement.type === 'WASTE_SPOILAGE' || movement.type === 'PRODUCTION_BATCH') {
        target.currentStock = Math.max(0, target.currentStock - movement.quantity);
      } else if (movement.type === 'MANUAL_ADJUSTMENT') {
        target.currentStock = movement.quantity;
      }
      this.saveIngredient(target);
    }

    return newMovement;
  }

  // --- User Access & Role Mode ---
  static getUserRole(): UserRole {
    if (!this.isClient()) return 'admin';
    const stored = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    if (stored === 'employee' || stored === 'admin') {
      return stored as UserRole;
    }
    return 'admin';
  }

  static setUserRole(role: UserRole): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  }

  // --- Stock Transfers & Requisitions (Stock Room -> Bar / Kitchen) ---
  static getAllStockTransfers(): StockTransferSlip[] {
    if (!this.isClient()) return SEED_STOCK_TRANSFERS;
    const stored = localStorage.getItem(STORAGE_KEYS.STOCK_TRANSFERS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.STOCK_TRANSFERS, JSON.stringify(SEED_STOCK_TRANSFERS));
      return SEED_STOCK_TRANSFERS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return SEED_STOCK_TRANSFERS;
    }
  }

  static getActiveStockTransfers(): StockTransferSlip[] {
    const activeId = this.getActiveBusinessId();
    return this.getAllStockTransfers().filter((t) => t.businessId === activeId);
  }

  static saveStockTransfer(slip: StockTransferSlip): void {
    const all = this.getAllStockTransfers();
    const existingIndex = all.findIndex((t) => t.id === slip.id);
    if (existingIndex >= 0) {
      all[existingIndex] = slip;
    } else {
      all.unshift(slip);
    }
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.STOCK_TRANSFERS, JSON.stringify(all));
    }
  }

  static recordStockTransferAndDeduct(
    data: Omit<StockTransferSlip, 'id' | 'createdAt'>
  ): StockTransferSlip {
    const newSlip: StockTransferSlip = {
      ...data,
      id: `trf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    // Save slip
    this.saveStockTransfer(newSlip);

    // Deduct each item from stock room and log movement
    const ingredients = this.getAllIngredients();
    const destinationLabel =
      data.destination === 'bar' ? 'Bar / Café Station' : 'Kitchen Station';

    data.items.forEach((item) => {
      const target = ingredients.find((i) => i.id === item.ingredientId);
      if (target) {
        target.currentStock = Math.max(0, target.currentStock - item.quantityTransferred);
        target.lastUpdated = new Date().toISOString();
        this.saveIngredient(target);

        // Record individual movement entry
        this.recordMovement({
          businessId: data.businessId,
          ingredientId: target.id,
          type: 'STOCK_TRANSFER',
          quantity: item.quantityTransferred,
          unit: target.baseUnit,
          costAtMovement: target.effectiveCostPerBaseUnit,
          reason: `Stock Room Transfer to ${destinationLabel} (Slip #${data.slipNumber})`,
        });
      }
    });

    return newSlip;
  }

  // --- Reset & Backup ---
  static resetToDefaults(): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(SEED_BUSINESSES));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BUSINESS_ID, SEED_BUSINESSES[0].id);
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(SEED_INGREDIENTS_KAPE_ISLA));
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(SEED_RECIPES_KAPE_ISLA));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.STOCK_TRANSFERS, JSON.stringify(SEED_STOCK_TRANSFERS));
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, 'admin');
  }

  static exportFullBackup(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      businesses: this.getBusinesses(),
      ingredients: this.getAllIngredients(),
      recipes: this.getAllRecipes(),
      movements: this.getAllMovements(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importFullBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.ingredients || !parsed.recipes) {
        return { success: false, message: 'Invalid backup format. Missing ingredients or recipes.' };
      }
      if (this.isClient()) {
        if (parsed.businesses) localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(parsed.businesses));
        localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(parsed.ingredients));
        localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(parsed.recipes));
        if (parsed.movements) localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(parsed.movements));
      }
      return { success: true, message: 'Backup successfully imported.' };
    } catch (err: any) {
      return { success: false, message: `Import failed: ${err.message}` };
    }
  }
}
