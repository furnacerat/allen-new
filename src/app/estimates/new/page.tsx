'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { 
  ChevronLeft, 
  ArrowRight,
  User, 
  Briefcase,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { storageService } from '@/lib/storage/storageService';
import { Customer, Job } from '@/domain/types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/context/ToastContext';

export default function NewEstimatePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');

  useEffect(() => {
    setCustomers(storageService.getCustomers());
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      setJobs(storageService.getJobsByCustomer(selectedCustomerId));
    } else {
      setJobs([]);
      setSelectedJobId('');
    }
  }, [selectedCustomerId]);

  const handleCreate = () => {
    if (!selectedCustomerId) {
       showToast('Please select a customer first', 'error');
       return;
    }

    const business = storageService.getSettings();
    const id = uuidv4();
    const estimateNumber = `EST-${1000 + storageService.getEstimates().length + 1}`;
    
    const newEstimate = {
      id,
      estimateNumber,
      customerId: selectedCustomerId,
      jobId: selectedJobId || undefined,
      status: 'draft',
      issueDate: new Date().toISOString().split('T')[0],
      items: [],
      subtotal: 0,
      taxRate: business.taxRate || 0,
      taxTotal: 0,
      total: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveItem('estimates', newEstimate);
    router.push(`/estimates/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Link 
        href="/estimates" 
        className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
      >
        <ChevronLeft size={16} className="mr-1" />
        Back to Estimates
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create Estimate</h1>
        <p className="text-[var(--text-muted)]">Select a customer and an optional project to begin your quote.</p>
      </div>

      <Card className="p-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-bold flex items-center gap-2">
              <User size={16} className="text-[var(--primary)]" />
              1. Select Customer
            </label>
            <select 
              className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">Choose a customer...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.companyName ? `- ${c.companyName}` : ''}</option>
              ))}
            </select>
            {customers.length === 0 && (
              <p className="text-xs text-[var(--warning)] flex items-center gap-1">
                No customers found. <Link href="/customers/new" className="underline font-bold">Add one first</Link>
              </p>
            )}
          </div>

          <div className={`space-y-4 transition-opacity ${!selectedCustomerId ? 'opacity-30 pointer-events-none' : ''}`}>
            <label className="text-sm font-bold flex items-center gap-2">
              <Briefcase size={16} className="text-[var(--primary)]" />
              2. Select Project (Optional)
            </label>
            <select 
              className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="">General Project (Unlinked)</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
            <p className="text-xs text-[var(--text-muted)]">
              Linking to a project helps track estimatated vs actual costs later.
            </p>
          </div>

          <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col gap-4">
             <Button 
                onClick={handleCreate} 
                disabled={!selectedCustomerId}
                className="w-full h-12 text-lg"
             >
                Start Estimate Builder
                <ArrowRight className="ml-2 h-5 w-5" />
             </Button>
             
             <p className="text-center text-xs text-[var(--text-muted)]">
                Or <Link href="/estimates/templates" className="font-bold text-[var(--primary)] hover:underline">Start from a template</Link>
             </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
