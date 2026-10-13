import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Printer,
  Coffee,
  UtensilsCrossed,
  Package,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Store,
  Layers,
} from 'lucide-react';
import {
  Ingredient,
  StockTransferSlip,
  StockTransferItem,
  InventoryDepartment,
  BusinessProfile,
} from '../types';
import { DEPARTMENT_CONFIGS, getIngredientDepartment, generateSlipNumber } from '../utils/inventory';

interface StockTransferModalProps {
  ingredients: Ingredient[];
  business: BusinessProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveTransfer: (
    transfer: Omit<StockTransferSlip, 'id' | 'createdAt'>
  ) => StockTransferSlip;
  onOpenPrintSlip: (slip: StockTransferSlip) => void;
}

interface DraftItem {
  ingredientId: string;
  quantityTransferred: string;
  notes?: string;
}

export const StockTransferModal: React.FC<StockTransferModalProps> = ({
  ingredients,
  business,
  isOpen,
  onClose,
  onSaveTransfer,
  onOpenPrintSlip,
}) => {
  const [destination, setDestination] = useState<'bar' | 'kitchen'>('bar');
  const [shift, setShift] = useState<'Morning Opening' | 'Mid-Day Rush' | 'Evening Restock'>(
    'Morning Opening'
  );
  const [requestedBy, setRequestedBy] = useState('Barista On Duty');
  const [dispatchedBy, setDispatchedBy] = useState('Stock Custodian');
  const [notes, setNotes] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<'all' | InventoryDepartment>('all');
  const [formError, setFormError] = useState('');

  // Selected Items to Transfer
  const [draftItems, setDraftItems] = useState<DraftItem[]>([
    {
      ingredientId: ingredients[0]?.id || '',
      quantityTransferred: '1000',
      notes: '',
    },
  ]);

  if (!isOpen) return null;

  // Filter available ingredients
  const filteredIngredients = ingredients.filter((ing) => {
    if (departmentFilter === 'all') return true;
    return getIngredientDepartment(ing) === departmentFilter;
  });

  const handleAddItem = () => {
    const available = filteredIngredients.find(
      (ing) => !draftItems.some((d) => d.ingredientId === ing.id)
    ) || ingredients[0];

    if (!available) return;

    setDraftItems((prev) => [
      ...prev,
      {
        ingredientId: available.id,
        quantityTransferred: available.baseUnit === 'pcs' ? '20' : '1000',
        notes: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setDraftItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof DraftItem, value: string) => {
    setDraftItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Quick Preset for Destination
  const handleApplyPreset = (dest: 'bar' | 'kitchen') => {
    setDestination(dest);
    setRequestedBy(dest === 'bar' ? 'Barista On Duty' : 'Chef / Line Cook');

    // Pick top items matching the department
    const matching = ingredients
      .filter((ing) => {
        const dept = getIngredientDepartment(ing);
        if (dest === 'bar') return dept === 'cafe' || dept === 'utility';
        return dept === 'kitchen' || dept === 'utility';
      })
      .slice(0, 4);

    if (matching.length > 0) {
      setDraftItems(
        matching.map((ing) => ({
          ingredientId: ing.id,
          quantityTransferred:
            ing.baseUnit === 'pcs'
              ? '50'
              : ing.baseUnit === 'g'
              ? '1000'
              : '2000',
          notes: 'Standard shift allocation',
        }))
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (draftItems.length === 0) {
      setFormError('Please add at least one stock item to transfer.');
      return;
    }

    const compiledItems: StockTransferItem[] = [];

    for (const draft of draftItems) {
      const ing = ingredients.find((i) => i.id === draft.ingredientId);
      if (!ing) continue;

      const qty = parseFloat(draft.quantityTransferred);
      if (isNaN(qty) || qty <= 0) {
        setFormError(`Please specify a valid transfer quantity for ${ing.name}.`);
        return;
      }

      if (qty > ing.currentStock) {
        setFormError(
          `Insufficient stock for "${ing.name}". Stock Room only has ${ing.currentStock} ${ing.baseUnit}, cannot transfer ${qty} ${ing.baseUnit}.`
        );
        return;
      }

      compiledItems.push({
        ingredientId: ing.id,
        ingredientName: ing.name,
        department: getIngredientDepartment(ing),
        quantityTransferred: qty,
        unit: ing.baseUnit,
        stockRoomBalanceBefore: ing.currentStock,
        stockRoomBalanceAfter: Math.max(0, ing.currentStock - qty),
        notes: draft.notes,
      });
    }

    const slipNumber = generateSlipNumber(destination === 'bar' ? 'TRF-BAR' : 'TRF-KIT');

    const createdSlip = onSaveTransfer({
      businessId: business.id,
      slipNumber,
      destination,
      requestedBy: requestedBy.trim() || (destination === 'bar' ? 'Barista on Duty' : 'Kitchen Staff'),
      dispatchedBy: dispatchedBy.trim() || 'Stock Custodian',
      approvedBy: `${business.ownerName} (Manager)`,
      shift,
      transferDate: new Date().toISOString(),
      notes: notes.trim(),
      items: compiledItems,
      status: 'DISPATCHED',
    });

    onClose();
    // Directly open printable slip for immediate printing!
    onOpenPrintSlip(createdSlip);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-amber-900/20 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#1E232A] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">New Stock Transfer & Printable Slip</h3>
              <p className="text-xs text-slate-300">
                Dispatch items from Central Stock Room to Bar or Kitchen with print voucher
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* Destination Selector */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">
              1. Transfer Destination Station *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleApplyPreset('bar')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                  destination === 'bar'
                    ? 'bg-amber-50/80 border-amber-700 text-slate-900 shadow-2xs ring-1 ring-amber-700'
                    : 'bg-white border-stone-300 text-slate-600 hover:bg-stone-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-800 text-white flex items-center justify-center shrink-0">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Bar / Café Station</div>
                  <div className="text-[11px] text-slate-500">
                    Coffee beans, fresh milks, syrups, teas & cold cup packaging
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('kitchen')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                  destination === 'kitchen'
                    ? 'bg-emerald-50/80 border-emerald-700 text-slate-900 shadow-2xs ring-1 ring-emerald-700'
                    : 'bg-white border-stone-300 text-slate-600 hover:bg-stone-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Kitchen & Pastry Station</div>
                  <div className="text-[11px] text-slate-500">
                    Baking butter, farm eggs, sourdough bread, fruit produce & pantry food
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Shift, Requisitioner, Custodian */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-100/70 p-3.5 rounded-xl border border-stone-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shift / Timing</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-slate-900"
              >
                <option value="Morning Opening">Morning Opening</option>
                <option value="Mid-Day Rush">Mid-Day Rush</option>
                <option value="Evening Restock">Evening Restock</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Requested By (Receiver)</label>
              <input
                type="text"
                required
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                placeholder="e.g. Marco (Barista)"
                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dispatched By (Custodian)</label>
              <input
                type="text"
                required
                value={dispatchedBy}
                onChange={(e) => setDispatchedBy(e.target.value)}
                placeholder="e.g. Elena (Stock Room)"
                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Transfer Items Table */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="font-bold text-slate-900">
                2. Items to Transfer from Stock Room ({draftItems.length})
              </label>

              {/* Department Filter for adding */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500 mr-1">Filter list:</span>
                {(['all', 'cafe', 'kitchen', 'utility'] as const).map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setDepartmentFilter(dept)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                      departmentFilter === dept
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-stone-300 text-slate-600 hover:bg-stone-100'
                    }`}
                  >
                    {dept === 'all' ? 'All' : DEPARTMENT_CONFIGS[dept].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-stone-300 rounded-xl overflow-hidden bg-white">
              <div className="divide-y divide-stone-200">
                {draftItems.map((item, idx) => {
                  const target = ingredients.find((i) => i.id === item.ingredientId);
                  const dept = target ? getIngredientDepartment(target) : 'cafe';
                  const deptConfig = DEPARTMENT_CONFIGS[dept];
                  const qtyNum = parseFloat(item.quantityTransferred) || 0;
                  const remaining = target ? target.currentStock - qtyNum : 0;
                  const isInsufficient = target ? qtyNum > target.currentStock : false;

                  return (
                    <div key={idx} className="p-3 bg-stone-50/40 hover:bg-stone-50 flex flex-col sm:flex-row sm:items-center gap-2.5">
                      {/* Ingredient selector */}
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${deptConfig.badgeBg} ${deptConfig.badgeText}`}>
                            {deptConfig.label}
                          </span>
                          {target && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              In Stock Room: <strong>{target.currentStock.toLocaleString()} {target.baseUnit}</strong>
                            </span>
                          )}
                        </div>
                        <select
                          value={item.ingredientId}
                          onChange={(e) => handleItemChange(idx, 'ingredientId', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-slate-900 font-medium"
                        >
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} ({ing.currentStock} {ing.baseUnit})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity input */}
                      <div className="w-full sm:w-32">
                        <label className="block text-[10px] text-slate-500 mb-0.5">
                          Transfer Qty ({target?.baseUnit})
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0.1"
                          required
                          value={item.quantityTransferred}
                          onChange={(e) => handleItemChange(idx, 'quantityTransferred', e.target.value)}
                          className={`w-full px-2.5 py-1.5 bg-white border rounded-lg font-mono font-bold text-xs ${
                            isInsufficient
                              ? 'border-rose-500 text-rose-800 bg-rose-50'
                              : 'border-stone-300 text-slate-900'
                          }`}
                        />
                      </div>

                      {/* Remaining balance preview */}
                      <div className="w-full sm:w-28 text-right sm:text-right">
                        <div className="text-[10px] text-slate-400">Bal. After:</div>
                        <div className={`font-mono font-bold text-xs ${
                          remaining < 0 ? 'text-rose-700' : 'text-slate-800'
                        }`}>
                          {remaining.toLocaleString()} {target?.baseUnit}
                        </div>
                      </div>

                      {/* Delete item button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={draftItems.length === 1}
                        className="p-1.5 text-stone-400 hover:text-rose-600 disabled:opacity-30 rounded-lg hover:bg-stone-100 transition self-end sm:self-center"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add item button */}
              <div className="p-2.5 bg-stone-100/70 border-t border-stone-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-700" />
                  <span>Add Another Item</span>
                </button>
                <span className="text-[11px] text-slate-500">
                  Deducts automatically from central stock room upon confirmation.
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Dispatch Instructions / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Ensure cold milk is stored immediately in under-counter bar fridge"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-slate-900"
            />
          </div>

          {/* Submit & Print Preview action buttons */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-stone-300 rounded-xl text-slate-700 hover:bg-stone-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold flex items-center gap-2 shadow-2xs transition"
            >
              <Printer className="w-4 h-4 text-amber-200" />
              <span>Confirm & Generate Printable Slip</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
