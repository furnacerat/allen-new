'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { 
  FileText, 
  Search, 
  Plus, 
  User, 
  Calendar, 
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { storageService } from '@/lib/storage/storageService';
import { Estimate, Customer, EstimateStatus } from '@/domain/types';

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<(Estimate & { customerName?: string })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const allEstimates = storageService.getEstimates();
    const customers = storageService.getCustomers();
    
    const enriched = allEstimates.map(est => ({
      ...est,
      customerName: customers.find(c => c.id === est.customerId)?.name || 'Unknown'
    }));
    
    setEstimates(enriched);
  }, []);

  const filteredEstimates = estimates.filter(e => {
    const matchesSearch = e.estimateNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: EstimateStatus) => {
    switch (status) {
      case 'approved': return 'success';
      case 'sent': return 'info';
      case 'draft': return 'neutral';
      case 'rejected': return 'danger';
      case 'converted': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
          <p className="text-[var(--text-muted)]">Create and manage professional quotes for your clients.</p>
        </div>
        <Link href="/estimates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Estimate
          </Button>
        </Link>
      </header>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-[var(--bg-card)] p-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-[var(--shadow-sm)]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text"
            placeholder="Search estimate # or customer..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm pl-10 pr-4 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto text-sm border-l border-[var(--border-subtle)] pl-4">
          <Filter size={18} className="text-[var(--text-muted)]" />
          <select 
            className="bg-transparent border-none text-sm focus:ring-0 h-10 cursor-pointer font-medium"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredEstimates.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-[var(--primary-subtle)] rounded-full flex items-center justify-center text-[var(--primary)] mb-6">
            <FileText size={40} />
          </div>
          <h2 className="text-xl font-semibold">No estimates found</h2>
          <p className="text-[var(--text-muted)] max-w-xs mx-auto mt-2">
            Start bidding on projects by creating your first professional estimate.
          </p>
          <Link href="/estimates/new" className="mt-8">
            <Button>Create First Estimate</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEstimates.map((est) => (
            <Link key={est.id} href={`/estimates/${est.id}`}>
              <Card className="group hover:border-[var(--primary)] transition-all cursor-pointer py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:flex w-12 h-12 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] items-center justify-center shrink-0">
                      <FileText size={24} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg group-hover:text-[var(--primary)] transition-colors">
                          #{est.estimateNumber}
                        </h3>
                        {est.status === 'converted' && <Badge variant="neutral">Converted to Job</Badge>}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-muted)]">
                        <div className="flex items-center gap-1">
                          <User size={14} className="text-[var(--primary)]" />
                          <span>{est.customerName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-[var(--primary)]" />
                          <span>Issued: {new Date(est.issueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-[var(--text-main)]">
                          <DollarSign size={14} className="text-[var(--success)]" />
                          <span>${est.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-none pt-4 md:pt-0">
                    <Badge variant={getStatusVariant(est.status)}>
                      {est.status}
                    </Badge>
                    <div className="text-[var(--text-muted)] md:block hidden">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
