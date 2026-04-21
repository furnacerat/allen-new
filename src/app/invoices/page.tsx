'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge, ListSkeleton } from '@/components/ui';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  DollarSign, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { storageService } from '@/lib/storage/storageService';
import { Invoice, InvoiceStatus, Customer } from '@/domain/types';

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState<(Invoice & { customerName: string })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const allInvoices = storageService.getCollection('invoices') as Invoice[];
    const customers = storageService.getCollection('customers') as Customer[];
    
    const enriched = allInvoices.map(inv => ({
      ...inv,
      customerName: customers.find(c => c.id === inv.customerId)?.name || 'Unknown Customer'
    }));

    setInvoices(enriched);
    setIsLoading(false);
  }, []);

  const getStatusVariant = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'info';
      case 'sent': return 'info';
      case 'overdue': return 'danger';
      case 'void': return 'neutral';
      case 'draft': return 'neutral';
      default: return 'neutral';
    }
  };

  // KPIs
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.total - inv.balanceDue), 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-9 w-32 bg-[var(--border-subtle)] rounded animate-pulse" />
            <div className="h-5 w-56 bg-[var(--border-subtle)] rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-[var(--border-subtle)] rounded-lg animate-pulse" />
          ))}
        </div>
        <ListSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-[var(--text-muted)]">Manage customer billing and track payment progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/invoices/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </Link>
        </div>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-b-4 border-b-[var(--primary)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Total Receivables</p>
              <h3 className="text-2xl font-bold">${totalInvoiced.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>
        </Card>
        <Card className="border-b-4 border-b-[var(--success)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Total Collected</p>
              <h3 className="text-2xl font-bold">${totalPaid.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </Card>
        <Card className="border-b-4 border-b-[var(--warning)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Outstanding</p>
              <h3 className="text-2xl font-bold">${totalOutstanding.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <Clock size={20} />
            </div>
          </div>
        </Card>
        <Card className="border-b-4 border-b-[var(--danger)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Overdue Count</p>
              <h3 className="text-2xl font-bold">{overdueInvoices}</h3>
            </div>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <AlertCircle size={20} />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Search invoices or customers..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter size={16} className="text-[var(--text-muted)] mr-2 shrink-0" />
          {['all', 'draft', 'sent', 'partial', 'paid', 'overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 ${
                statusFilter === status 
                ? 'bg-[var(--primary)] text-white' 
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--primary-subtle)]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-app)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="group hover:bg-[var(--primary-subtle)] transition-colors cursor-pointer" onClick={() => window.location.href = `/invoices/${invoice.id}`}>
                  <td className="px-6 py-4 font-mono font-bold text-[var(--primary)]">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{invoice.customerName}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)] uppercase">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)] uppercase">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} />
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-sm">
                    ${invoice.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">
                    <span className={invoice.balanceDue > 0 ? 'text-[var(--warning)]' : 'text-green-600'}>
                      ${invoice.balanceDue.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight size={18} className="text-[var(--text-muted)] transition-transform group-hover:translate-x-1" />
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-[var(--text-muted)] italic">
                    <div className="flex flex-col items-center gap-3">
                      <FileText size={40} className="opacity-20" />
                      <p>No invoices found matching your criteria.</p>
                      <Link href="/invoices/new">
                        <Button variant="ghost" size="sm">Create your first invoice</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
