'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { 
  ChevronLeft, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Briefcase, 
  Edit, 
  Trash2, 
  Plus,
  ArrowUpRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { storageService } from '@/lib/storage/storageService';
import { Customer, Job } from '@/domain/types';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useToast } from '@/context/ToastContext';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const custData = storageService.getItem('customers', id as string) as Customer;
      if (custData) {
        setCustomer(custData);
        setJobs(storageService.getJobsByCustomer(id as string));
      }
    }
  }, [id]);

  const handleDelete = () => {
    storageService.removeItem('customers', id as string);
    showToast('Customer deleted successfully', 'success');
    router.push('/customers');
  };

  if (!customer) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link 
            href="/customers" 
            className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-2"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Customers
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--secondary)] text-white flex items-center justify-center font-bold text-xl">
              {customer.name[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
              {customer.companyName && <p className="text-[var(--text-muted)]">{customer.companyName}</p>}
            </div>
            <Badge variant="success" className="ml-2">Active Client</Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => setIsDeleteModalOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card title="Contact Details">
             <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Phone</span>
                  <div className="flex items-center gap-2 font-medium">
                    <Phone size={14} className="text-[var(--primary)]" />
                    {customer.phone || 'Not provided'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Email</span>
                  <div className="flex items-center gap-2 font-medium truncate">
                    <Mail size={14} className="text-[var(--primary)]" />
                    {customer.email || 'Not provided'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Billing Address</span>
                  <div className="flex items-start gap-2 font-medium">
                    <MapPin size={14} className="text-[var(--primary)] mt-1" />
                    <span>{customer.address || 'Not provided'}</span>
                  </div>
                </div>
             </div>
          </Card>

          <Card title="Quick Stats">
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-sm text-[var(--text-muted)]">Total Jobs</span>
                   <span className="font-bold">{jobs.length}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm text-[var(--text-muted)]">Active Jobs</span>
                   <span className="font-bold">{jobs.filter(j => j.status === 'in progress').length}</span>
                </div>
                <div className="pt-4 border-t border-[var(--border-subtle)] space-y-1">
                   <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Customer Since</span>
                   <p className="text-sm">{new Date(customer.createdAt).toLocaleDateString()}</p>
                </div>
             </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Briefcase className="text-[var(--primary)]" />
              Project Portfolio
            </h2>
            <Link href={`/jobs/new?customerId=${customer.id}`}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </Link>
          </div>

          {jobs.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-[var(--bg-app)] rounded-full flex items-center justify-center text-[var(--text-muted)] mb-4">
                <Briefcase size={32} />
              </div>
              <h3 className="font-semibold text-lg">No projects yet</h3>
              <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto mt-2">
                This customer doesn't have any jobs associated with them yet.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <Card className="hover:border-[var(--primary)] transition-all cursor-pointer h-full flex flex-col group">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold group-hover:text-[var(--primary)] transition-colors">{job.title}</h4>
                      <Badge variant="info" className="scale-90">{job.status}</Badge>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <MapPin size={12} className="text-[var(--primary)]" />
                        <span className="line-clamp-1">{job.siteAddress}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <TrendingUp size={12} className="text-[var(--primary)]" />
                        <span>Contract: ${job.contractAmount.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[var(--primary)] group-hover:gap-2 transition-all">
                      <span>View Project Details</span>
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <Card title="Notes & Context">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-xl">
                 <FileText size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm leading-relaxed text-[var(--text-main)] italic">
                  {customer.notes || "No additional notes for this customer."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Customer Profile?"
        message={`Are you sure you want to delete "${customer.name}"? This will permanently remove their contact info and history. Associated jobs will remain but become unlinked.`}
      />
    </div>
  );
}
