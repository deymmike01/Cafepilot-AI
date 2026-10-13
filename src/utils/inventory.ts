import { Ingredient, InventoryDepartment } from '../types';

export interface DepartmentMeta {
  id: InventoryDepartment;
  label: string;
  stationName: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
}

export const DEPARTMENT_CONFIGS: Record<InventoryDepartment, DepartmentMeta> = {
  cafe: {
    id: 'cafe',
    label: 'Café & Bar',
    stationName: 'Bar / Café Station',
    description: 'Espresso beans, specialty syrups, fresh & plant milks, teas, matcha & boba',
    color: 'amber',
    badgeBg: 'bg-amber-100 border-amber-200',
    badgeText: 'text-amber-900',
    iconName: 'Coffee',
  },
  kitchen: {
    id: 'kitchen',
    label: 'Kitchen & Pastry',
    stationName: 'Kitchen Station',
    description: 'Baking butter, fresh eggs, produce & fruits, flour, sourdough & sandwich ingredients',
    color: 'emerald',
    badgeBg: 'bg-emerald-100 border-emerald-200',
    badgeText: 'text-emerald-900',
    iconName: 'UtensilsCrossed',
  },
  utility: {
    id: 'utility',
    label: 'Utility & Supplies',
    stationName: 'Station Supplies & Utility',
    description: 'Cold & hot cups, dome lids, kraft straws, paper bags, napkins, sanitizers & cleaning',
    color: 'slate',
    badgeBg: 'bg-slate-100 border-slate-300',
    badgeText: 'text-slate-800',
    iconName: 'Package',
  },
};

export function getIngredientDepartment(ingredient: Ingredient): InventoryDepartment {
  if (ingredient.department) {
    return ingredient.department;
  }

  const name = ingredient.name.toLowerCase();
  const category = ingredient.category;

  // Utility detection
  if (
    category === 'Packaging & Disposables' ||
    name.includes('cup') ||
    name.includes('lid') ||
    name.includes('straw') ||
    name.includes('sleeve') ||
    name.includes('napkin') ||
    name.includes('carrier') ||
    name.includes('bag') ||
    name.includes('wrapper') ||
    name.includes('sanitizer') ||
    name.includes('soap') ||
    name.includes('bleach') ||
    name.includes('detergent') ||
    name.includes('tissue') ||
    name.includes('gloves')
  ) {
    return 'utility';
  }

  // Kitchen detection
  if (
    category === 'Produce & Fruit' ||
    name.includes('butter') ||
    name.includes('egg') ||
    name.includes('flour') ||
    name.includes('bread') ||
    name.includes('sourdough') ||
    name.includes('cheese') ||
    name.includes('bacon') ||
    name.includes('ham') ||
    name.includes('chicken') ||
    name.includes('beef') ||
    name.includes('vegetable') ||
    name.includes('salad') ||
    name.includes('berry') ||
    name.includes('pastry') ||
    name.includes('croissant') ||
    name.includes('cream cheese') ||
    name.includes('yeast') ||
    name.includes('oil')
  ) {
    return 'kitchen';
  }

  // Default to cafe (beverage, coffee, syrup, dairy, tea)
  return 'cafe';
}

export function generateSlipNumber(prefix = 'TRF'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomSuffix}`;
}
