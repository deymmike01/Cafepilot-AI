import React, { useState } from 'react';
import {
  X,
  Printer,
  Calendar,
  Coffee,
  UtensilsCrossed,
  Filter,
  ArrowRight,
  Search,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { StockTransferSlip, BusinessProfile } from '../types';

interface StockTransfersHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfers: StockTransferSlip[];
  business: BusinessProfile;
  onOpenPrintSlip: (slip: StockTransferSlip) => void;
  onOpenNewTransfer: () => void;
}

export const StockTransfersHistoryModal: React.FC<StockTransfersHistoryModalProps> = ({
  isOpen,
  onClose,
  transfers,
  business,
  onOpenPrintSlip,
  onOpenNewTransfer,
}) => {
  const [filterDestination, setFilterDestination] = useState<'all' | 'bar' | 'kitchen'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = transfers.filter((t) => {
    const matchesDest = filterDestination === 'all' || t.destination === filterDestination;
    const matchesSearch =
      t.slipNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.items.some((i) => i.ingredientName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDest && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-amber-900/20 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#1E232A] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Stock Transfer Slips Archive</h3>
              <p className="text-xs text-slate-300">
                Printable requisitions dispatched from Central Stock Room to Bar & Kitchen
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

        {/* Toolbar */}
        <div className="p-4 bg-stone-100 border-b border-stone-200 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0 text-xs">
          {/* Destination tabs */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setFilterDestination('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                filterDestination === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-stone-300 text-slate-600 hover:bg-stone-50'
              }`}
            >
              All Slips ({transfers.length})
            </button>
            <button
              onClick={() => setFilterDestination('bar')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                filterDestination === 'bar'
                  ? 'bg-amber-800 text-white'
                  : 'bg-white border border-stone-300 text-slate-600 hover:bg-stone-50'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Bar Station ({transfers.filter((t) => t.destination === 'bar').length})</span>
            </button>
            <button
              onClick={() => setFilterDestination('kitchen')}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                filterDestination === 'kitchen'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-white border border-stone-300 text-slate-600 hover:bg-stone-50'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Kitchen Station ({transfers.filter((t) => t.destination === 'kitchen').length})</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenNewTransfer();
            }}
            className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-2xs self-end sm:self-auto"
          >
            <span>+ Create New Transfer</span>
          </button>
        </div>

        {/* Slips List */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <FileText className="w-10 h-10 mx-auto mb-2 text-stone-300" />
              <p>No transfer slips found matching your filter.</p>
            </div>
          ) : (
            filtered.map((slip) => {
              const isBar = slip.destination === 'bar';
              return (
                <div
                  key={slip.id}
                  className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs hover:border-amber-700/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {slip.slipNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                          isBar
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {isBar ? <Coffee className="w-3 h-3" /> : <UtensilsCrossed className="w-3 h-3" />}
                        {isBar ? 'Bar / Café Station' : 'Kitchen Station'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {slip.shift}
                      </span>
                    </div>

                    <div className="text-slate-600 text-[11px]">
                      <span>Dispatched by <strong>{slip.dispatchedBy}</strong> to <strong>{slip.requestedBy}</strong></span>
                      <span className="mx-2">•</span>
                      <span>{new Date(slip.transferDate).toLocaleDateString()}</span>
                    </div>

                    {/* Preview of transferred items */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {slip.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-stone-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono"
                        >
                          {item.ingredientName} ({item.quantityTransferred} {item.unit})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onOpenPrintSlip(slip)}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-300" />
                      <span>Print Voucher</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-end shrink-0 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-stone-300 rounded-xl text-slate-700 hover:bg-stone-50 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
