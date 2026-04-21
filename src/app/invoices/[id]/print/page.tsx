'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Invoice, Customer, BusinessProfile, Payment } from '@/domain/types';
import { Button } from '@/components/ui';
import { Printer } from 'lucide-react';
import { PrintLayout } from '@/components/layout/PrintLayout';

export default function InvoicePrintPage() {
  const { id } = useParams();
  const [data, setData] = useState<{
    invoice: Invoice;
    customer: Customer;
    business: BusinessProfile;
    payments: Payment[];
  } | null>(null);

  useEffect(() => {
    if (id) {
      Promise.all([
        api.invoices.getWithContext(id as string),
        api.settings.get()
      ]).then(([invoiceData, business]) => {
        if (invoiceData && business) {
          setData({
            invoice: invoiceData as Invoice,
            customer: invoiceData.customer,
            business,
            payments: invoiceData.payments || []
          });
          
          setTimeout(() => {
            // window.print();
          }, 1000);
        }
      });
    }
  }, [id]);

  if (!data) return <div className="p-10 text-center">Loading Invoice Print View...</div>;

  const { invoice, customer, business, payments } = data;

  return (
    <>
      <PrintLayout
        business={business}
        documentTitle="Invoice"
        documentId={invoice.invoiceNumber}
        referenceDate={invoice.issueDate}
        footerNotesOverride={invoice.customerNotes}
      >
        {/* Bill To & Details */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">Bill To</h3>
            <div className="space-y-1">
               <p className="text-xl font-bold">{customer.name}</p>
               {customer.companyName && <p className="text-sm font-medium">{customer.companyName}</p>}
               <p className="text-sm">{customer.address}</p>
               <p className="text-sm">{customer.phone}</p>
               <p className="text-sm">{customer.email}</p>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-sm space-y-4">
             <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-black uppercase text-gray-400 mb-1">Issue Date</p>
                  <p className="font-bold">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-black uppercase text-gray-400 mb-1">Due Date</p>
                  <p className="font-bold">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-black uppercase text-gray-400 mb-1">Estimate Ref</p>
                  <p className="font-bold">{invoice.estimateId ? 'Linked' : 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="font-black uppercase text-gray-400 mb-1">Balance Due</p>
                  <p className="text-xl font-black text-red-600">${invoice.balanceDue.toLocaleString()}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse mb-10">
          <thead>
            <tr className="bg-black text-white text-[10px] font-black uppercase tracking-widest text-left">
              <th className="p-3">Description</th>
              <th className="p-3 text-center">Qty</th>
              <th className="p-3 text-right">Unit Price</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {invoice.items.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-3 border-b border-gray-100">
                  <p className="font-bold">{item.name}</p>
                  {item.description && <p className="text-xs text-gray-500 mt-1 max-w-sm">{item.description}</p>}
                </td>
                <td className="p-3 border-b border-gray-100 text-center font-medium">
                  {item.quantity} {item.unit}
                </td>
                <td className="p-3 border-b border-gray-100 text-right font-medium">
                  ${item.unitPrice.toLocaleString()}
                </td>
                <td className="p-3 border-b border-gray-100 text-right font-bold">
                  ${item.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
             <tr>
                <td colSpan={2} className="p-3"></td>
                <td className="p-3 text-right text-xs font-black uppercase text-gray-400">Subtotal</td>
                <td className="p-3 text-right font-bold border-b border-gray-100">${invoice.subtotal.toLocaleString()}</td>
             </tr>
             <tr>
                <td colSpan={2} className="p-3"></td>
                <td className="p-3 text-right text-xs font-black uppercase text-gray-400">Tax ({invoice.taxRate}%)</td>
                <td className="p-3 text-right font-bold border-b border-gray-100">${invoice.taxTotal.toLocaleString()}</td>
             </tr>
             <tr className="bg-black text-white">
                <td colSpan={2} className="p-3"></td>
                <td className="p-3 text-right text-xs font-black uppercase">Grand Total</td>
                <td className="p-3 text-right text-xl font-black">${invoice.total.toLocaleString()}</td>
             </tr>
          </tfoot>
        </table>

        {/* Payment History on Invoice */}
        {payments.length > 0 && (
          <div className="mb-10 page-break-inside-avoid">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 border-b pb-1">Payment Activity</h3>
            <div className="space-y-2">
               {payments.map(p => (
                 <div key={p.id} className="flex justify-between text-xs py-2 border-b border-gray-50 border-dotted">
                    <div>
                       <span className="font-bold uppercase">{p.method} Payment</span>
                       <span className="text-gray-400 mx-2">|</span>
                       <span>{new Date(p.date).toLocaleDateString()}</span>
                       {p.referenceNumber && <span className="text-gray-400 ml-2 italic">({p.referenceNumber})</span>}
                    </div>
                    <div className="font-bold text-green-600">
                       - ${p.amount.toLocaleString()}
                    </div>
                 </div>
               ))}
               <div className="flex justify-between text-sm py-4 border-t-2 border-black font-black uppercase">
                  <span>Total Payments Received</span>
                  <span>${(invoice.total - invoice.balanceDue).toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-lg py-4 bg-gray-100 px-4 mt-2 font-black uppercase">
                  <span>Remaining Balance Due</span>
                  <span className="text-red-600">${invoice.balanceDue.toLocaleString()}</span>
               </div>
            </div>
          </div>
        )}
      </PrintLayout>

      {/* Print Overlay Controls */}
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
