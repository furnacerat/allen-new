'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { 
  FileText, 
  Plus, 
  ChevronRight, 
  DollarSign, 
  Clock, 
  Receipt,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { storageService } from '@/lib/storage/storageService';
import { Invoice, InvoiceStatus } from '@/domain/types';

interface InvoicesTabProps {
  jobId: string;
  onCreateInvoice: () => void;
}

export function InvoicesTab({ jobId, onCreateInvoice }: InvoicesTabProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    setInvoices(storageService.getInvoicesByJob(jobId));
  }, [jobId]);

  const getStatusVariant = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'info';
      case 'sent': return 'info';
      case 'overdue': return 'danger';
      default: return 'neutral';
    }
  };

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.total - inv.balanceDue), 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  return (
    <div className="space-y-6">
      {/* Financial Summary for Job */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[var(--bg-card)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Project Total Billed</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold">${totalInvoiced.toLocaleString()}</h3>
            <Receipt className="text-[var(--primary)] opacity-20" size={24} />
          </div>
        </Card>
        <Card className="bg-[var(--bg-card)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Project Payments</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</h3>
            <DollarSign className="text-green-600 opacity-20" size={24} />
          </div>
        </Card>
        <Card className="bg-[var(--bg-card)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Remaining Balance</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-[var(--warning)]">${totalOutstanding.toLocaleString()}</h3>
            <Clock className="text-[var(--warning)] opacity-20" size={24} />
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Project Invoices</h3>
        <Button size="sm" onClick={onCreateInvoice}>
          <Plus className="mr-2 h-4 w-4" />
          Generate New Invoice
        </Button>
      </div>

      <Card className="p-0">
        {invoices.length > 0 ? (
          <div className="divide-y divide-[var(--border-subtle)]">
            {invoices.map((invoice) => (
              <Link 
                key={invoice.id} 
                href={`/invoices/${invoice.id}`}
                className="block hover:bg-[var(--primary-subtle)] transition-colors p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--bg-app)] flex items-center justify-center text-[var(--primary)]">
                       <FileText size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[var(--primary)]">{invoice.invoiceNumber}</span>
                        <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] flex items-center gap-4">
                         <span>Issued: {new Date(invoice.issueDate).toLocaleDateString()}</span>
                         <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                     <div className="text-right">
                        <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest mb-0.5">Total</p>
                        <p className="font-bold">${invoice.total.toLocaleString()}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest mb-0.5">Balance</p>
                        <p className={`font-bold ${invoice.balanceDue > 0 ? 'text-[var(--warning)]' : 'text-green-600'}`}>
                           ${invoice.balanceDue.toLocaleString()}
                        </p>
                     </div>
                     <ChevronRight size={20} className="text-[var(--text-muted)]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-[var(--bg-app)] rounded-full flex items-center justify-center mx-auto text-[var(--text-muted)] opacity-30">
                <Receipt size={32} />
             </div>
             <div>
                <p className="font-bold text-[var(--text-main)]">No invoices generated for this project yet.</p>
                <p className="text-sm text-[var(--text-muted)]">Track project billing and payments by creating your first invoice.</p>
             </div>
             <Button variant="outline" size="sm" onClick={onCreateInvoice}>
                Create Initial Invoice
             </Button>
          </div>
        )}
      </Card>

      <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
         <ArrowUpRight size={20} className="text-blue-600 shrink-0 mt-1" />
         <div className="space-y-1">
            <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Billing Integration</h4>
            <p className="text-xs text-blue-800 leading-relaxed">
               Invoices are linked directly to this project's financials. Recording payments on any linked invoice will automatically reflect in the project's cash flow summary.
            </p>
         </div>
      </div>
    </div>
  );
}
