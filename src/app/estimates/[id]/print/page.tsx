'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { storageService } from '@/lib/storage/storageService';
import { Estimate, Customer, BusinessProfile } from '@/domain/types';
import { LogoPlaceholder } from '@/components/ui/LogoPlaceholder';

export default function EstimatePrintPage() {
  const { id } = useParams();
  const [estimate, setEstimate] = useState<(Estimate & { customer?: Customer }) | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    if (id) {
      const data = storageService.getEstimateWithContext(id as string);
      if (data) setEstimate(data);
      setProfile(storageService.getSettings());
    }
  }, [id]);

  useEffect(() => {
    if (estimate && profile) {
      // Auto-trigger print dialog after a short delay to ensure rendering
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [estimate, profile]);

  if (!estimate || !profile) return <div className="p-10 text-center">Loading estimate document...</div>;

  return (
    <div className="bg-white min-h-screen p-0 md:p-10 text-black">
      {/* Print Controls (Hidden on Print) */}
      <div className="mb-8 flex justify-center print:hidden">
         <button 
           onClick={() => window.print()}
           className="bg-[var(--primary)] text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:opacity-90 transition-all"
         >
           Print Document
         </button>
      </div>

      <div className="max-w-[800px] mx-auto border border-gray-100 p-8 md:p-12 shadow-sm print:border-0 print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-4">
            <LogoPlaceholder name={profile.businessName} size="xl" className="rounded-xl" />
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">{profile.businessName}</h1>
              <div className="text-sm text-gray-500 space-y-0.5">
                <p>{profile.address}</p>
                <p>{profile.phone} | {profile.email}</p>
                {profile.licenseNumber && <p>License: {profile.licenseNumber}</p>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-light text-gray-400 mb-2">ESTIMATE</h2>
            <div className="text-sm space-y-1">
              <p><span className="font-bold">Number:</span> #{estimate.estimateNumber}</p>
              <p><span className="font-bold">Date:</span> {new Date(estimate.issueDate).toLocaleDateString()}</p>
              {estimate.expiryDate && <p><span className="font-bold">Expires:</span> {new Date(estimate.expiryDate).toLocaleDateString()}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12 pb-8 border-b border-gray-100">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Estimate For</h3>
            <div className="space-y-1">
              <p className="font-bold text-lg">{estimate.customer?.name}</p>
              {estimate.customer?.companyName && <p className="text-gray-600">{estimate.customer.companyName}</p>}
              <p className="text-gray-500 whitespace-pre-wrap">{estimate.customer?.address}</p>
              <p className="text-gray-500">{estimate.customer?.phone}</p>
            </div>
          </div>
          {estimate.scopeSummary && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Project Scope</h3>
              <p className="text-sm text-gray-600 leading-relaxed italic border-l-2 border-gray-100 pl-4">
                {estimate.scopeSummary}
              </p>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="mb-12">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-black text-[10px] font-bold uppercase tracking-widest">
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 text-center w-20">Qty</th>
                <th className="py-3 px-2 text-right w-32">Unit Price</th>
                <th className="py-3 px-2 text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {estimate.items.map((item) => (
                <tr key={item.id} className="break-inside-avoid">
                  <td className="py-4 px-2">
                    <p className="font-bold text-sm">{item.name}</p>
                    {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                  </td>
                  <td className="py-4 px-2 text-center text-sm">{item.quantity} <span className="text-[10px] text-gray-400">{item.unit}</span></td>
                  <td className="py-4 px-2 text-right text-sm">${(item.unitCost * (1 + item.markup/100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-4 px-2 text-right font-bold text-sm">
                    ${(item.quantity * item.unitCost * (1 + item.markup/100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold">${estimate.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax ({estimate.taxRate}%)</span>
              <span className="font-semibold">${estimate.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="pt-3 border-t-2 border-black flex justify-between items-end">
              <span className="font-bold text-lg">Total</span>
              <span className="font-black text-2xl">${estimate.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="grid grid-cols-1 gap-8 pt-12 border-t border-gray-100">
          {estimate.customerNotes && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Notes</h3>
              <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap">{estimate.customerNotes}</p>
            </div>
          )}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Terms & Conditions</h3>
            <p className="text-[10px] text-gray-400 leading-relaxed whitespace-pre-wrap italic">
              {estimate.termsConditions || profile.footerNotes || "All quotes are valid for 30 days. Work will begin once the deposit is received."}
            </p>
          </div>
        </div>
        
        <div className="mt-20 text-center text-[10px] text-gray-300 font-medium uppercase tracking-widest">
           Generated by Allen's Contractor's Platform
        </div>
      </div>
    </div>
  );
}
