import { UnitType, BaseUnitType } from '../types';

export interface ConversionResult {
  success: boolean;
  baseQuantity: number;
  baseUnit: BaseUnitType;
  error?: string;
}

/**
 * Converts a quantity from its input unit to the target base measurement unit.
 * Strictly adheres to compatible conversions:
 * - Mass: kg -> g (x1000), g -> g (x1)
 * - Volume: L -> ml (x1000), ml -> ml (x1)
 * - Count: pcs -> pcs (x1)
 * Rejects incompatible cross-category conversions (e.g., grams to milliliters) without density.
 */
export function convertToBaseUnit(
  quantity: number,
  fromUnit: UnitType,
  targetBaseUnit: BaseUnitType
): ConversionResult {
  if (quantity < 0 || isNaN(quantity)) {
    return {
      success: false,
      baseQuantity: 0,
      baseUnit: targetBaseUnit,
      error: 'Quantity cannot be negative or invalid.',
    };
  }

  // Weight / Mass
  if (targetBaseUnit === 'g') {
    if (fromUnit === 'g') {
      return { success: true, baseQuantity: quantity, baseUnit: 'g' };
    }
    if (fromUnit === 'kg') {
      return { success: true, baseQuantity: quantity * 1000, baseUnit: 'g' };
    }
    return {
      success: false,
      baseQuantity: 0,
      baseUnit: 'g',
      error: `Incompatible units: Cannot automatically convert volume/count (${fromUnit}) into mass (grams).`,
    };
  }

  // Volume
  if (targetBaseUnit === 'ml') {
    if (fromUnit === 'ml') {
      return { success: true, baseQuantity: quantity, baseUnit: 'ml' };
    }
    if (fromUnit === 'L') {
      return { success: true, baseQuantity: quantity * 1000, baseUnit: 'ml' };
    }
    return {
      success: false,
      baseQuantity: 0,
      baseUnit: 'ml',
      error: `Incompatible units: Cannot automatically convert mass/count (${fromUnit}) into volume (milliliters).`,
    };
  }

  // Pieces / Count
  if (targetBaseUnit === 'pcs') {
    if (fromUnit === 'pcs') {
      return { success: true, baseQuantity: quantity, baseUnit: 'pcs' };
    }
    return {
      success: false,
      baseQuantity: 0,
      baseUnit: 'pcs',
      error: `Incompatible units: Cannot convert mass/volume (${fromUnit}) into discrete pieces (pcs).`,
    };
  }

  return {
    success: false,
    baseQuantity: 0,
    baseUnit: targetBaseUnit,
    error: `Unsupported unit pair: ${fromUnit} to ${targetBaseUnit}`,
  };
}

/**
 * Returns supported input units for a given base unit.
 */
export function getCompatibleUnits(baseUnit: BaseUnitType): UnitType[] {
  switch (baseUnit) {
    case 'g':
      return ['g', 'kg'];
    case 'ml':
      return ['ml', 'L'];
    case 'pcs':
      return ['pcs'];
    default:
      return ['g', 'ml', 'pcs'];
  }
}

/**
 * Determine the default base unit for a given purchase unit.
 */
export function getDefaultBaseUnit(purchaseUnit: UnitType): BaseUnitType {
  if (purchaseUnit === 'kg' || purchaseUnit === 'g') return 'g';
  if (purchaseUnit === 'L' || purchaseUnit === 'ml') return 'ml';
  return 'pcs';
}
