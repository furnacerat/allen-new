'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { 
  ChevronLeft, 
  MapPin, 
  User, 
  Clock, 
  Calendar, 
  FileText, 
  Edit, 
  Trash2,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { storageService } from '@/lib/storage/storageService';
import { Job, Customer, JobStatus } from '@/domain/types';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useToast } from '@/context/ToastContext';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [job, setJob] = useState<(Job & { customer?: Customer }) | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const data = storageService.getJobWithCustomer(id as string);
      setJob(data);
    }
  }, [id]);

  const handleDelete = () => {
    storageService.removeItem('jobs', id as string);
    showToast('Project deleted successfully', 'success');
    router.push('/jobs');
  };

  const getStatusVariant = (status?: JobStatus) => {
    if (!status) return 'neutral';
    switch (status) {
      case 'in progress': return 'success';
      case 'lead': case 'estimating': return 'info';
      case 'approved': return 'info';
      case 'on hold': return 'warning';
      case 'completed': return 'neutral';
      case 'archived': return 'neutral';
      default: return 'neutral';
    }
  };

  if (!job) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link 
            href="/jobs" 
            className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-2"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Jobs
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
            <MapPin size={14} />
            <span>{job.siteAddress}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Job
          </Button>
          <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => setIsDeleteModalOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card title="Project Overview">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Job Type</span>
                  <p className="font-semibold text-capitalize">{job.type}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Pipeline Status</span>
                  <p className="font-semibold text-capitalize">{job.status}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Target Start</span>
                  <div className="flex items-center gap-2 font-semibold">
                    <Calendar size={16} className="text-[var(--primary)]" />
                    {job.targetStartDate || 'Not set'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Target Completion</span>
                  <div className="flex items-center gap-2 font-semibold">
                    <Calendar size={16} className="text-[var(--primary)]" />
                    {job.targetCompletionDate || 'Not set'}
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-[var(--border-subtle)] space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Description</span>
                <p className="text-sm leading-relaxed text-[var(--text-main)] whitespace-pre-wrap">
                  {job.description || 'No description provided for this project.'}
                </p>
              </div>

              {job.internalNotes && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                    <FileText size={14} />
                    Internal Admin Notes
                  </div>
                  <p className="text-sm text-amber-800 italic">
                    {job.internalNotes}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Project Activity Placeholder">
            <div className="py-20 text-center space-y-4">
               <div className="w-16 h-16 bg-[var(--bg-app)] rounded-full flex items-center justify-center mx-auto text-[var(--text-muted)] opacity-30">
                  <Clock size={32} />
               </div>
               <p className="text-sm text-[var(--text-muted)]">Project activity logging will be available in Phase 2.</p>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title="Customer Information" footer={
            <Link href={`/customers/${job.customerId}`}>
              <Button variant="ghost" size="sm" className="w-full">Go to Customer Profile</Button>
            </Link>
          }>
            {job.customer ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--secondary)] text-white flex items-center justify-center font-bold text-xl">
                    {job.customer.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{job.customer.name}</h4>
                    {job.customer.companyName && <p className="text-xs text-[var(--text-muted)]">{job.customer.companyName}</p>}
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                   {job.customer.phone && (
                     <div className="flex items-center gap-3 text-sm">
                       <Phone size={16} className="text-[var(--primary)]" />
                       <span className="font-medium">{job.customer.phone}</span>
                     </div>
                   )}
                   {job.customer.email && (
                     <div className="flex items-center gap-3 text-sm">
                       <Mail size={16} className="text-[var(--primary)]" />
                       <span className="font-medium truncate">{job.customer.email}</span>
                     </div>
                   )}
                   <Button variant="outline" size="sm" className="w-full mt-2">
                     <ExternalLink size={14} className="mr-2" />
                     Contact Details
                   </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--danger)]">Customer data missing.</p>
            )}
          </Card>

          <Card title="Metadata">
             <div className="space-y-4 text-xs font-medium">
                <div className="flex justify-between">
                   <span className="text-[var(--text-muted)]">Project ID</span>
                   <span className="bg-[var(--bg-app)] px-1.5 py-0.5 rounded font-mono">{job.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-[var(--text-muted)]">Created</span>
                   <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-[var(--text-muted)]">Last Updated</span>
                   <span>{new Date(job.updatedAt).toLocaleDateString()}</span>
                </div>
             </div>
          </Card>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project?"
        message={`Are you sure you want to delete "${job.title}"? This action cannot be undone and all associated data will be lost.`}
      />
    </div>
  );
}
