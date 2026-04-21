'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  FileText, 
  Edit, 
  Trash2,
  Phone,
  Mail,
  ExternalLink,
  LayoutDashboard,
  DollarSign,
  Package,
  Users,
  CreditCard,
  FileEdit,
  MessageSquare,
  Printer,
  Receipt
} from 'lucide-react';
import Link from 'next/link';
import { storageService } from '@/lib/storage/storageService';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useToast } from '@/context/ToastContext';
import { Tabs } from '@/components/ui';
import { MaterialsTab } from '@/components/jobs/MaterialsTab';
import { LaborTab } from '@/components/jobs/LaborTab';
import { ExpensesTab } from '@/components/jobs/ExpensesTab';
import { ChangeOrdersTab } from '@/components/jobs/ChangeOrdersTab';
import { FinancialsTab } from '@/components/jobs/FinancialsTab';
import { NotesTab } from '@/components/jobs/NotesTab';
import { InvoicesTab } from '@/components/jobs/InvoicesTab';
import { JobReport } from '@/components/jobs/JobReport';
import { Job, Customer, JobStatus, ProjectMaterial, LaborEntry, JobExpense, ChangeOrder, Invoice } from '@/domain/types';
import { v4 as uuidv4 } from 'uuid';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [job, setJob] = useState<(Job & { customer?: Customer }) | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Report Data
  const [reportData, setReportData] = useState<{
    materials: ProjectMaterial[];
    labor: LaborEntry[];
    expenses: JobExpense[];
    changeOrders: ChangeOrder[];
  }>({
    materials: [],
    labor: [],
    expenses: [],
    changeOrders: []
  });

  useEffect(() => {
    if (id) {
      const data = storageService.getJobWithCustomer(id as string);
      setJob(data);

      // Load all related data for reports/calculations
      const allMaterials = storageService.getCollection('materials') as ProjectMaterial[];
      const allLabor = storageService.getCollection('laborEntries') as LaborEntry[];
      const allExpenses = storageService.getCollection('expenses') as JobExpense[];
      const allOrders = storageService.getCollection('changeOrders') as ChangeOrder[];

      setReportData({
        materials: allMaterials.filter(m => m.jobId === id),
        labor: allLabor.filter(l => l.jobId === id),
        expenses: allExpenses.filter(e => e.jobId === id),
        changeOrders: allOrders.filter(o => o.jobId === id)
      });
    }
  }, [id, activeTab]); // Reload when tab changes to ensure fresh data for print

  const handleCreateInvoice = () => {
    if (!job) return;

    const newInvoice: Invoice = {
      id: uuidv4(),
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: job.customerId,
      jobId: job.id,
      status: 'draft',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [
        {
          id: uuidv4(),
          name: `Progress Billing: ${job.title}`,
          description: `Billing for ${job.title} per contract terms.`,
          quantity: 1,
          unit: 'ea',
          unitPrice: job.contractAmount,
          taxable: true,
          total: job.contractAmount
        }
      ],
      subtotal: job.contractAmount,
      taxRate: 0,
      taxTotal: 0,
      total: job.contractAmount,
      balanceDue: job.contractAmount,
      customerNotes: 'Thank you for your business.',
      internalNotes: `Generated from project ${job.title}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveItem('invoices', newInvoice);
    showToast('Draft invoice created!', 'success');
    router.push(`/invoices/${newInvoice.id}`);
  };

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { id: 'financials', label: 'Financials', icon: <DollarSign size={16} /> },
    { id: 'materials', label: 'Materials', icon: <Package size={16} /> },
    { id: 'labor', label: 'Labor', icon: <Users size={16} /> },
    { id: 'expenses', label: 'Expenses', icon: <CreditCard size={16} /> },
    { id: 'change-orders', label: 'Change Orders', icon: <FileEdit size={16} /> },
    { id: 'invoices', label: 'Invoices & Payments', icon: <Receipt size={16} /> },
    { id: 'notes', label: 'Notes & Activity', icon: <MessageSquare size={16} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link 
            href="/jobs" 
            className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-1"
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCreateInvoice}>
            <FileText className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Job
          </Button>
          <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => setIsDeleteModalOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
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
      )}

      {activeTab === 'financials' && (
        <FinancialsTab jobId={job.id} />
      )}

      {activeTab === 'materials' && (
        <MaterialsTab jobId={job.id} />
      )}

      {activeTab === 'labor' && (
        <LaborTab jobId={job.id} />
      )}

      {activeTab === 'expenses' && (
        <ExpensesTab jobId={job.id} />
      )}

      {activeTab === 'change-orders' && (
        <ChangeOrdersTab jobId={job.id} />
      )}

      {activeTab === 'invoices' && (
        <InvoicesTab jobId={job.id} onCreateInvoice={handleCreateInvoice} />
      )}

      {activeTab === 'notes' && (
        <NotesTab jobId={job.id} />
      )}

      {activeTab !== 'overview' && activeTab !== 'materials' && activeTab !== 'labor' && activeTab !== 'expenses' && activeTab !== 'change-orders' && activeTab !== 'financials' && activeTab !== 'notes' && activeTab !== 'invoices' && (
        <Card>
          <div className="py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-[var(--bg-app)] rounded-full flex items-center justify-center mx-auto text-[var(--text-muted)] opacity-30">
                {tabs.find(t => t.id === activeTab)?.icon}
             </div>
             <p className="text-sm text-[var(--text-muted)]">
               {tabs.find(t => t.id === activeTab)?.label} tracking will be available in the next step.
             </p>
          </div>
        </Card>
      )}

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project?"
        message={`Are you sure you want to delete "${job.title}"? This action cannot be undone and all associated data will be lost.`}
      />

      {job && (
        <JobReport 
          job={job}
          materials={reportData.materials}
          labor={reportData.labor}
          expenses={reportData.expenses}
          changeOrders={reportData.changeOrders}
        />
      )}
    </div>
  );
}
