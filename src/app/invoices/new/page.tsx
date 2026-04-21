'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { ChevronLeft, User, ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { storageService } from '@/lib/storage/storageService';
import { Customer, Invoice } from '@/domain/types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/context/ToastContext';

export default function NewInvoicePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  useEffect(() => {
    setCustomers(storageService.getCustomers());
  }, []);

  const handleCreate = () => {
    if (!selectedCustomerId) {
      showToast('Please select a customer', 'error');
      return;
    }

    const newInvoice: Invoice = {
      id: uuidv4(),
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: selectedCustomerId,
      status: 'draft',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [],
      subtotal: 0,
      taxRate: 0,
      taxTotal: 0,
      total: 0,
      balanceDue: 0,
      customerNotes: 'Please pay within 14 days.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveItem('invoices', newInvoice);
    router.push(`/invoices/${newInvoice.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="space-y-1">
        <Link 
          href="/invoices" 
          className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-2"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Invoices
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
        <p className="text-[var(--text-muted)]">Select a customer to begin a new invoice.</p>
      </header>

      <Card>
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Select Customer</label>
            <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
               <select 
                 className="w-full pl-10 pr-4 py-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none appearance-none"
                 value={selectedCustomerId}
                 onChange={(e) => setSelectedCustomerId(e.target.value)}
               >
                 <option value="">Choose a customer...</option>
                 {customers.map(c => (
                   <option key={c.id} value={c.id}>{c.name} {c.companyName ? `(${c.companyName})` : ''}</option>
                 ))}
               </select>
            </div>
          </div>
          
          <div className="pt-4 flex gap-4">
             <Button variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
             <Button className="flex-1" onClick={handleCreate}>
                Continue to Items
                <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
          </div>
        </div>
      </Card>
      
      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start gap-4">
         <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <FileText size={20} />
         </div>
         <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wider">Pro Tip</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
               You can also generate invoices directly from an **Estimate** or an **Active Job** to automatically pull in project details and amounts.
            </p>
         </div>
      </div>
    </div>
  );
}
