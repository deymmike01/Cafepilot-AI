import React from 'react';
import { Printer, X, Check, Building2, Calendar, Clock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { StockTransferSlip, BusinessProfile } from '../types';
import { DEPARTMENT_CONFIGS } from '../utils/inventory';

interface StockTransferPrintableProps {
  slip: StockTransferSlip;
  business: BusinessProfile;
  onClose: () => void;
}

export const StockTransferPrintable: React.FC<StockTransferPrintableProps> = ({
  slip,
  business,
  onClose,
}) => {
  const isBar = slip.destination === 'bar';
  const destinationTitle = isBar ? 'BAR / CAFÉ STATION' : 'KITCHEN STATION';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto flex flex-col max-h-[96vh]">
        {/* Top Control Bar (Hidden when printing via CSS @media print) */}
        <div className="no-print bg-[#1E232A] text-white px-5 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <div>
              <h3 className="font-bold text-sm">Stock Transfer Requisition Slip</h3>
              <p className="text-[11px] text-slate-400">
                Official voucher for stock dispatched from Stock Room to {isBar ? 'Bar Station' : 'Kitchen Station'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper Content */}
        <div className="printable-sheet flex-1 p-6 sm:p-8 overflow-y-auto bg-white text-slate-900 font-sans text-xs">
          {/* Slip Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-amber-800 uppercase">
                  {business.businessType} Official Requisition
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {business.name}
                </h1>
                <p className="text-[11px] text-slate-600">
                  Central Stock Room & Station Inventory Transfer Voucher
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-slate-900 text-white px-3 py-1 rounded-lg font-mono font-bold text-xs tracking-wider">
                  {slip.slipNumber}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Status: <span className="font-bold text-emerald-700">{slip.status}</span>
                </div>
              </div>
            </div>

            {/* Transfer Routing Banner */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 uppercase text-[10px] w-20">Origin:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  📦 Central Stock Room
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 uppercase text-[10px] w-20">Destination:</span>
                <span className={`font-black flex items-center gap-1 px-2 py-0.5 rounded ${
                  isBar ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {isBar ? '☕ ' : '🍳 '}{destinationTitle}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 uppercase text-[10px] w-20">Date / Shift:</span>
                <span className="font-mono text-slate-800">
                  {new Date(slip.transferDate).toLocaleDateString()} — {slip.shift}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 uppercase text-[10px] w-20">Requested By:</span>
                <span className="font-semibold text-slate-800">
                  {slip.requestedBy || 'Station Staff'}
                </span>
              </div>
            </div>

            {slip.notes && (
              <div className="mt-2 text-[11px] text-slate-600 italic">
                <span className="font-bold not-italic">Notes / Memo:</span> {slip.notes}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Dispatched Inventory Items
            </h2>
            <div className="border border-stone-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 border-b border-stone-300 font-bold text-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center">#</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Prior Bal.</th>
                    <th className="py-2.5 px-3 text-right font-black bg-amber-50/80">Qty Dispatched</th>
                    <th className="py-2.5 px-3 text-right">Remaining Bal.</th>
                    <th className="py-2.5 px-3 text-center w-16">Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-mono">
                  {slip.items.map((item, idx) => {
                    const dept = DEPARTMENT_CONFIGS[item.department] || DEPARTMENT_CONFIGS.cafe;
                    return (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className="py-2 px-3 text-center text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-sans font-bold text-slate-900">
                          <div>{item.ingredientName}</div>
                          {item.notes && (
                            <div className="text-[10px] text-slate-500 italic font-normal">
                              {item.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 font-sans">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${dept.badgeBg} ${dept.badgeText}`}>
                            {dept.label}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-500">
                          {item.stockRoomBalanceBefore.toLocaleString()} {item.unit}
                        </td>
                        <td className="py-2 px-3 text-right font-black text-amber-950 text-sm bg-amber-50/60">
                          {item.quantityTransferred.toLocaleString()} {item.unit}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-slate-700">
                          {item.stockRoomBalanceAfter.toLocaleString()} {item.unit}
                        </td>
                        <td className="py-2 px-3 text-center font-sans">
                          <div className="w-5 h-5 mx-auto border-2 border-slate-400 rounded flex items-center justify-center text-slate-400 text-xs">
                            ✓
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 px-1">
              <span>Total items on this voucher: {slip.items.length} line items</span>
              <span className="font-mono">Time: {new Date(slip.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Official Verification & Sign-offs */}
          <div className="border-t-2 border-stone-300 pt-5 mt-6">
            <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-4">
              Chain of Custody & Verification Sign-Off
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              {/* Dispatched */}
              <div className="border border-stone-300 rounded-xl p-3 bg-stone-50/50">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  1. Dispatched From Stock Room
                </div>
                <div className="mt-6 border-b border-stone-400 pb-1 font-semibold text-slate-900 text-xs">
                  {slip.dispatchedBy || 'Stock Custodian / Employee'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Custodian Signature & Date</div>
              </div>

              {/* Received */}
              <div className="border border-stone-300 rounded-xl p-3 bg-stone-50/50">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  2. Received At Station
                </div>
                <div className="mt-6 border-b border-stone-400 pb-1 font-semibold text-slate-900 text-xs">
                  {slip.requestedBy || (isBar ? 'Barista on Duty' : 'Chef on Duty')}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Station Receiver Signature & Date</div>
              </div>

              {/* Authorized */}
              <div className="border border-stone-300 rounded-xl p-3 bg-stone-50/50">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  3. Verified & Approved
                </div>
                <div className="mt-6 border-b border-stone-400 pb-1 font-semibold text-slate-900 text-xs">
                  {slip.approvedBy || `${business.ownerName} (Manager)`}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Store Manager / Admin Approval</div>
              </div>
            </div>

            <div className="mt-6 text-center text-[10px] text-slate-400 border-t border-stone-200 pt-3">
              Generated by CaféPilot AI Inventory & Costing Suite • Retain yellow copy at station, file white copy with Stock Custodian
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="no-print bg-stone-50 border-t border-stone-200 px-6 py-3 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500">
            Tip: Press <strong>Print Slip / PDF</strong> to print directly or save as PDF without page chrome.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-stone-300 rounded-xl text-slate-700 hover:bg-stone-100 font-medium transition"
            >
              Close Preview
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Requisition Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
