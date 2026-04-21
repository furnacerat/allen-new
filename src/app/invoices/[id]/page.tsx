'use client';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge, Modal } from '@/components/ui';
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  Trash2, 
  FileText, 
  Printer, 
  DollarSign, 
  CreditCard, 
  Clock, 
  Calendar,
  Layers,
  History,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { storageService } from '@/lib/storage/storageService';
import { 
  Invoice, 
  Customer, 
  Job, 
  InvoiceLineItem, 
  Payment,
  InvoiceStatus
} from '@/domain/types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/context/ToastContext';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [invoice, setInvoice] = useState<(Invoice & { customer?: Customer; job?: Job | null; payments: Payment[] }) | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    method: 'check' as Payment['method'],
    referenceNumber: '',
    notes: ''
  });

  useEffect(() => {
    if (id && id !== 'new') {
       loadInvoice();
    }
  }, [id]);

  const loadInvoice = () => {
    const data = storageService.getInvoiceWithContext(id as string);
    if (data) {
       setInvoice(data);
       setPaymentData(prev => ({ ...prev, amount: data.balanceDue }));
    } else {
       router.push('/invoices');
    }
  };

  const updateInvoice = (updates: Partial<Invoice>) => {
    if (!invoice) return;
    const updated = { ...invoice, ...updates };
    setInvoice(updated as any);
  };

  const calculateTotals = (items: InvoiceLineItem[]) => {
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const taxTotal = subtotal * (invoice?.taxRate || 0) / 100;
    const total = subtotal + taxTotal;
    const paidAmount = invoice?.payments.reduce((sum, p) => sum + p.amount, 0) || 0;
    return { subtotal, taxTotal, total, balanceDue: total - paidAmount };
  };

  const handleAddItem = () => {
    const newItem: InvoiceLineItem = {
      id: uuidv4(),
      name: '',
      description: '',
      quantity: 1,
      unit: 'ea',
      unitPrice: 0,
      taxable: true,
      total: 0
    };
    const updatedItems = [...(invoice?.items || []), newItem];
    const totals = calculateTotals(updatedItems);
    updateInvoice({ items: updatedItems, ...totals });
  };

  const handleUpdateItem = (itemId: string, updates: Partial<InvoiceLineItem>) => {
    const updatedItems = invoice?.items.map(item => {
      if (item.id === itemId) return { ...item, ...updates, total: (updates.quantity ?? item.quantity) * (updates.unitPrice ?? item.unitPrice) };
      return item;
    }) || [];
    
    const totals = calculateTotals(updatedItems);
    updateInvoice({ items: updatedItems, ...totals });
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = invoice?.items.filter(item => item.id !== itemId) || [];
    const totals = calculateTotals(updatedItems);
    updateInvoice({ items: updatedItems, ...totals });
  };

  const handleSave = () => {
    if (!invoice) return;
    setLoading(true);
    
    // Auto-update status based on balance
    let status = invoice.status;
    if (status !== 'void' && status !== 'draft') {
       if (invoice.balanceDue <= 0) status = 'paid';
       else if (invoice.balanceDue < invoice.total) status = 'partial';
       else status = 'sent';
    }

    const updatedInvoice = { ...invoice, status };
    
    setTimeout(() => {
      storageService.saveItem('invoices', updatedInvoice);
      setLoading(false);
      showToast('Invoice saved successfully', 'success');
      loadInvoice();
    }, 500);
  };

  const handleRecordPayment = () => {
    if (!invoice || paymentData.amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    const newPayment: Payment = {
      id: uuidv4(),
      invoiceId: invoice.id,
      jobId: invoice.jobId,
      customerId: invoice.customerId,
      amount: paymentData.amount,
      date: paymentData.date,
      method: paymentData.method,
      referenceNumber: paymentData.referenceNumber,
      notes: paymentData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveItem('payments', newPayment);
    
    // Update invoice balance and status
    const newPaidTotal = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + newPayment.amount;
    const newBalance = invoice.total - newPaidTotal;
    let newStatus: InvoiceStatus = 'partial';
    if (newBalance <= 0) newStatus = 'paid';

    storageService.saveItem('invoices', { 
       ...invoice, 
       balanceDue: newBalance, 
       status: newStatus 
    });

    showToast('Payment recorded successfully', 'success');
    setIsPaymentModalOpen(false);
    loadInvoice();
  };

  const handleDeleteInvoice = () => {
    storageService.removeItem('invoices', invoice!.id);
    showToast('Invoice deleted', 'success');
    router.push('/invoices');
  };

  if (!invoice) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Link 
            href="/invoices" 
            className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-2"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Invoices
          </Link>
          <div className="flex items-center gap-2">
             <span className="text-3xl font-bold tracking-tight text-[var(--primary)]">#</span>
             <input 
                className="text-3xl font-bold tracking-tight bg-transparent border-none focus:ring-0 w-48 p-0"
                value={invoice.invoiceNumber}
                onChange={(e) => updateInvoice({ invoiceNumber: e.target.value })}
             />
             <Badge variant={
               invoice.status === 'paid' ? 'success' : 
               invoice.status === 'overdue' ? 'danger' : 
               invoice.status === 'partial' ? 'info' : 'neutral'
             }>{invoice.status}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
             <div className="flex items-center gap-1.5 underline decoration-dotted">
                <Link href={`/customers/${invoice.customerId}`}>{invoice.customer?.name}</Link>
             </div>
             {invoice.job && (
               <div className="flex items-center gap-1.5 border-l border-[var(--border-subtle)] pl-4">
                  <Link href={`/jobs/${invoice.jobId}`} className="hover:text-[var(--primary)]">{invoice.job.title}</Link>
               </div>
             )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
           <Button variant="outline" size="sm" onClick={() => setIsPaymentModalOpen(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Record Payment
           </Button>
           <Button variant="outline" size="sm" onClick={() => router.push(`/invoices/${invoice.id}/print`)}>
              <Printer className="mr-2 h-4 w-4" />
              Print Invoice
           </Button>
           <Button size="sm" onClick={handleSave} loading={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save Invoice
           </Button>
           <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => setIsDeleteModalOpen(true)}>
              <Trash2 className="h-4 w-4" />
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
           {/* Line Items Card */}
           <Card className="overflow-visible">
              <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
                 <h3 className="font-bold text-lg flex items-center gap-2">
                    <Layers size={18} className="text-[var(--primary)]" />
                    Invoice Line Items
                 </h3>
                 <Button variant="outline" size="sm" onClick={handleAddItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                 </Button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--bg-app)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                       <tr>
                          <th className="px-6 py-3 min-w-[200px]">Item & Description</th>
                          <th className="px-4 py-3 w-24 text-center">Qty</th>
                          <th className="px-4 py-3 w-24 text-center">Unit</th>
                          <th className="px-4 py-3 w-32 text-right">Price ($)</th>
                          <th className="px-4 py-3 w-32 text-right">Total</th>
                          <th className="px-4 py-3 w-10"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                       {invoice.items.map((item) => (
                         <tr key={item.id} className="group hover:bg-[var(--primary-subtle)] transition-colors">
                            <td className="px-6 py-4">
                               <input 
                                  className="w-full bg-transparent font-semibold focus:outline-none mb-1 text-sm"
                                  placeholder="Item name..."
                                  value={item.name}
                                  onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                               />
                               <textarea 
                                  className="w-full bg-transparent text-xs text-[var(--text-muted)] focus:outline-none resize-none"
                                  placeholder="Add details..."
                                  rows={1}
                                  value={item.description}
                                  onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                               />
                            </td>
                            <td className="px-4 py-4">
                               <input 
                                  type="number"
                                  className="mx-auto w-16 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded px-1.5 py-1 text-xs text-center focus:outline-none"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                               />
                            </td>
                            <td className="px-4 py-4">
                               <input 
                                  className="mx-auto w-16 bg-transparent text-[10px] uppercase text-center focus:outline-none"
                                  value={item.unit}
                                  onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value })}
                               />
                            </td>
                            <td className="px-4 py-4">
                               <input 
                                  type="number"
                                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs text-right focus:outline-none"
                                  value={item.unitPrice}
                                  onChange={(e) => handleUpdateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                               />
                            </td>
                            <td className="px-4 py-4 text-right">
                               <span className="text-sm font-bold">
                                  ${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </td>
                            <td className="px-4 py-4">
                               <button onClick={() => handleRemoveItem(item.id)} className="text-gray-300 hover:text-[var(--danger)]">
                                  <Trash2 size={16} />
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>

           {/* Payment History */}
           <Card title="Payment History" subtitle="Recent transactions for this invoice.">
              <div className="space-y-4">
                 {invoice.payments.length > 0 ? (
                    <div className="divide-y divide-[var(--border-subtle)]">
                       {invoice.payments.map((payment) => (
                         <div key={payment.id} className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                                  <CheckCircle size={20} />
                               </div>
                               <div>
                                  <p className="font-bold text-sm text-capitalize">{payment.method} Payment</p>
                                  <p className="text-xs text-[var(--text-muted)]">{new Date(payment.date).toLocaleDateString()} • {payment.referenceNumber || 'No ref'}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="font-bold text-[var(--primary)]">+ ${payment.amount.toLocaleString()}</p>
                               {payment.notes && <p className="text-[10px] text-[var(--text-muted)] italic max-w-[150px] truncate">{payment.notes}</p>}
                            </div>
                         </div>
                       ))}
                    </div>
                 ) : (
                    <div className="py-10 text-center text-[var(--text-muted)] text-sm italic">
                       No payments recorded for this invoice.
                    </div>
                 )}
              </div>
           </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-8">
           <Card title="Financial Summary" className="sticky top-24">
              <div className="space-y-6">
                 <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                       <span className="text-[var(--text-muted)]">Subtotal</span>
                       <span className="font-semibold">${invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-[var(--text-muted)]">Tax ({invoice.taxRate}%)</span>
                       <span className="font-semibold">${invoice.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between items-end">
                       <span className="font-bold text-lg">Total</span>
                       <span className="font-bold text-2xl text-[var(--primary)]">${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-[var(--border-subtle)] space-y-4">
                    <div className="flex flex-col gap-2 p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-subtle)]">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Balance Due</span>
                       <span className={`text-3xl font-black ${invoice.balanceDue > 0 ? 'text-[var(--warning)]' : 'text-green-600'}`}>
                          ${invoice.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </span>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-[var(--border-subtle)] space-y-4 text-xs font-medium">
                    <div className="space-y-1">
                       <span className="text-[var(--text-muted)]">Issue Date</span>
                       <input type="date" className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold" value={invoice.issueDate} onChange={e => updateInvoice({issueDate: e.target.value})} />
                    </div>
                    <div className="space-y-1 pt-2">
                       <span className="text-[var(--text-muted)]">Due Date</span>
                       <input type="date" className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold" value={invoice.dueDate} onChange={e => updateInvoice({dueDate: e.target.value})} />
                    </div>
                 </div>
              </div>
           </Card>

           <Card title="Notes">
              <div className="space-y-4">
                 <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Customer Visible</span>
                    <textarea 
                       className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs focus:ring-1 focus:ring-[var(--primary)] outline-none" 
                       rows={3}
                       value={invoice.customerNotes}
                       onChange={e => updateInvoice({customerNotes: e.target.value})}
                       placeholder="Payment terms, special instructions..."
                    />
                 </div>
              </div>
           </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        title="Record Payment"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment}>Save Payment</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-green-700">Remaining Balance</p>
                <p className="text-2xl font-black text-green-800">${invoice.balanceDue.toLocaleString()}</p>
             </div>
             <CreditCard className="text-green-600 opacity-30" size={40} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Amount Received ($)</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-bold"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({...paymentData, amount: parseFloat(e.target.value) || 0})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Payment Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none"
                value={paymentData.date}
                onChange={(e) => setPaymentData({...paymentData, date: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Method</label>
              <select 
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none text-capitalize"
                value={paymentData.method}
                onChange={(e) => setPaymentData({...paymentData, method: e.target.value as any})}
              >
                <option value="check">Check</option>
                <option value="bank_transfer">ACH / Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Reference / Check #</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none"
              value={paymentData.referenceNumber}
              onChange={(e) => setPaymentData({...paymentData, referenceNumber: e.target.value})}
              placeholder="e.g. Check #1234"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Internal Notes</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none"
              value={paymentData.notes}
              onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
            />
          </div>
        </div>
      </Modal>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteInvoice}
        title="Delete Invoice?"
        message={`Are you sure you want to delete invoice ${invoice.invoiceNumber}? This will not delete any associated payments record in the system but will remove the invoice link.`}
      />
    </div>
  );
}
