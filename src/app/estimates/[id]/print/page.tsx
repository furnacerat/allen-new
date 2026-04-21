'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Estimate, Customer, BusinessProfile } from '@/domain/types';
import { PrintLayout } from '@/components/layout/PrintLayout';
import { Button } from '@/components/ui';
import { Printer } from 'lucide-react';

export default function EstimatePrintPage() {
  const { id } = useParams();
  const [estimate, setEstimate] = useState<(Estimate & { customer?: Customer }) | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    if (id) {
      Promise.all([
        api.estimates.getWithContext(id as string),
        api.settings.get()
      ]).then(([data, settings]) => {
        if (data && settings) {
          setEstimate(data);
          setProfile(settings);
          
          setTimeout(() => {
            // window.print();
          }, 1000);
        }
      });
    }
  }, [id]);

  if (!estimate || !profile) return <div className="p-10 text-center">Loading estimate document...</div>;

  return (
    <>
      <PrintLayout
        business={profile}
        documentTitle="Estimate"
        documentId={estimate.estimateNumber}
        referenceDate={estimate.issueDate}
        footerNotesOverride={estimate.termsConditions || profile.footerNotes || "All quotes are valid for 30 days. Work will begin once the deposit is received."}
      >
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

        {estimate.customerNotes && (
          <div className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Internal Notes</h3>
            <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap">{estimate.customerNotes}</p>
          </div>
        )}
      </PrintLayout>
      
      {/* Print Controls (Hidden on Print) */}
      <div className="fixed bottom-8 right-8 print:hidden flex gap-3 z-50">
         <Button variant="outline" onClick={() => window.close()} className="bg-white">
            Close Preview
         </Button>
         <Button onClick={() => window.print()} className="shadow-2xl">
            <Printer className="mr-2 h-4 w-4" />
            Start Printing
         </Button>
      </div>
    </>
  );
}
