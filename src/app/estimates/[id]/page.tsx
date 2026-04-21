'use client';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  Trash2, 
  Calculator, 
  User, 
  Briefcase,
  Layers,
  FileText,
  Clock,
  Printer,
  Copy,
  CheckCircle,
  XCircle,
  Send
} from 'lucide-react';
import Link from 'next/link';
import { storageService } from '@/lib/storage/storageService';
import { 
  Estimate, 
  Customer, 
  Job, 
  EstimateLineItem, 
  LineItemType,
  EstimateStatus,
  Invoice
} from '@/domain/types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/context/ToastContext';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

export default function EstimateBuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [estimate, setEstimate] = useState<(Estimate & { customer?: Customer; job?: Job | null }) | null>(null);
  const [customerJobs, setCustomerJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
       const data = storageService.getEstimateWithContext(id as string);
       if (data) {
          setEstimate(data);
          setCustomerJobs(storageService.getJobsByCustomer(data.customerId));
       }
    }
  }, [id]);

  const updateEstimate = (updates: Partial<Estimate>) => {
    if (!estimate) return;
    const updated = { ...estimate, ...updates };
    setEstimate(updated as any);
  };

  const calculateTotals = (items: EstimateLineItem[]) => {
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitCost * (1 + item.markup / 100)), 0);
    const taxTotal = subtotal * (estimate?.taxRate || 0) / 100;
    const total = subtotal + taxTotal;
    return { subtotal, taxTotal, total };
  };

  const handleAddItem = () => {
    const profile = storageService.getSettings();
    const newItem: EstimateLineItem = {
      id: uuidv4(),
      name: '',
      description: '',
      type: 'material',
      quantity: 1,
      unit: 'ea',
      unitCost: 0,
      markup: profile.defaultMaterialMarkup || 20,
      taxable: true,
      total: 0
    };
    const updatedItems = [...(estimate?.items || []), newItem];
    const { subtotal, taxTotal, total } = calculateTotals(updatedItems);
    updateEstimate({ items: updatedItems, subtotal, taxTotal, total });
  };

  const handleUpdateItem = (itemId: string, updates: Partial<EstimateLineItem>) => {
    const profile = storageService.getSettings();
    const updatedItems = estimate?.items.map(item => {
      if (item.id === itemId) {
        const newItem = { ...item, ...updates };
        // If type changed and markup wasn't manually touched in this update
        if (updates.type && !updates.markup) {
           if (updates.type === 'labor') newItem.markup = profile.defaultLaborMarkup || 20;
           if (updates.type === 'material') newItem.markup = profile.defaultMaterialMarkup || 15;
        }
        return newItem;
      }
      return item;
    }) || [];
    
    const { subtotal, taxTotal, total } = calculateTotals(updatedItems);
    updateEstimate({ items: updatedItems, subtotal, taxTotal, total });
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = estimate?.items.filter(item => item.id !== itemId) || [];
    const { subtotal, taxTotal, total } = calculateTotals(updatedItems);
    updateEstimate({ items: updatedItems, subtotal, taxTotal, total });
  };

  const handleSave = () => {
    if (!estimate) return;
    setLoading(true);
    setTimeout(() => {
      storageService.saveItem('estimates', estimate);
      setLoading(false);
      showToast('Estimate saved successfully', 'success');
    }, 500);
  };

  const handleStatusChange = (newStatus: EstimateStatus) => {
    updateEstimate({ status: newStatus });
    storageService.saveItem('estimates', { ...estimate, status: newStatus });
    showToast(`Status updated to ${newStatus}`, 'success');
  };

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

  const handleConvertToJob = () => {
    if (!estimate) return;
    
    // Check if job already exists
    let jobId = estimate.jobId;
    
    if (!jobId) {
      // Create a new job from estimate
      const newJob: Job = {
        id: uuidv4(),
        customerId: estimate.customerId,
        title: `Project: ${estimate.scopeSummary?.slice(0, 30) || estimate.estimateNumber}`,
        type: 'remodel', // Default
        siteAddress: '', // To be filled by user
        status: 'lead',
        contractAmount: estimate.total,
        estimatedCost: estimate.items.reduce((a, b) => a + (b.quantity * b.unitCost), 0),
        actualCost: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      storageService.saveItem('jobs', newJob);
      jobId = newJob.id;
    } else {
      // Update existing job amounts
      const existingJob = storageService.getItem('jobs', jobId) as Job;
      if (existingJob) {
        storageService.saveItem('jobs', {
          ...existingJob,
          contractAmount: estimate.total,
          estimatedCost: estimate.items.reduce((a, b) => a + (b.quantity * b.unitCost), 0)
        });
      }
    }

    // Mark estimate as converted
    const updatedStatus: EstimateStatus = 'converted';
    storageService.saveItem('estimates', { ...estimate, status: updatedStatus, jobId });
    setEstimate({ ...estimate, status: updatedStatus, jobId } as any);
    
    showToast('Converted to Job successfully!', 'success');
    router.push(`/jobs/${jobId}`);
  };
  const handleSaveTemplate = () => {
    if (!estimate) return;
    const templateName = prompt('Enter a name for this template:', `Template: ${estimate.scopeSummary?.slice(0, 20) || estimate.estimateNumber}`);
    if (!templateName) return;

    const newTemplate = {
      id: uuidv4(),
      name: templateName,
      description: estimate.scopeSummary,
      items: estimate.items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveItem('estimateTemplates', newTemplate);
    showToast('Estimate saved as reusable template!', 'success');
  };

  const handleConvertToInvoice = () => {
    if (!estimate) return;
    
    // Create new invoice from estimate
    const newInvoice: Invoice = {
      id: uuidv4(),
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: estimate.customerId,
      jobId: estimate.jobId,
      estimateId: estimate.id,
      status: 'draft',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days default
      items: estimate.items.map(item => ({
        id: uuidv4(),
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitCost * (1 + item.markup / 100),
        taxable: item.taxable,
        total: item.total
      })),
      subtotal: estimate.subtotal,
      taxRate: estimate.taxRate,
      taxTotal: estimate.taxTotal,
      total: estimate.total,
      balanceDue: estimate.total,
      customerNotes: estimate.customerNotes,
      internalNotes: `Generated from estimate ${estimate.estimateNumber}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveItem('invoices', newInvoice);
    
    // Optional: mark estimate as converted or add a link
    showToast('Invoice generated successfully!', 'success');
    router.push(`/invoices/${newInvoice.id}`);
  };
   
  if (!estimate) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Link 
            href="/estimates" 
            className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-2"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Estimates
          </Link>
          <div className="flex items-center gap-2">
             <span className="text-3xl font-bold tracking-tight text-[var(--primary)]">#</span>
             <input 
                className="text-3xl font-bold tracking-tight bg-transparent border-none focus:ring-0 w-48 p-0"
                value={estimate.estimateNumber}
                onChange={(e) => updateEstimate({ estimateNumber: e.target.value })}
                placeholder="Number..."
             />
             <Badge variant={getStatusVariant(estimate.status)}>{estimate.status}</Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
             <div className="flex items-center gap-1.5">
                <User size={14} className="text-[var(--primary)]" />
                <span>{estimate.customer?.name}</span>
             </div>
             <div className="flex items-center gap-1.5 border-l border-[var(--border-subtle)] pl-4">
                <Briefcase size={14} className="text-[var(--primary)]" />
                <select 
                  className="bg-transparent border-none text-xs font-semibold focus:ring-0 cursor-pointer p-0 h-auto"
                  value={estimate.jobId || ''}
                  onChange={(e) => updateEstimate({ jobId: e.target.value || undefined })}
                >
                  <option value="">No Linked Project (Lead)</option>
                  {customerJobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
             </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
           <Button variant="outline" size="sm" onClick={handleConvertToInvoice}>
              <FileText className="mr-2 h-4 w-4" />
              Create Invoice
           </Button>
           <Button variant="outline" size="sm" onClick={handleSaveTemplate}>
              <Copy className="mr-2 h-4 w-4" />
              Save as Template
           </Button>
           <Button variant="outline" size="sm" onClick={() => router.push(`/estimates/${estimate.id}/print`)}>
              <Printer className="mr-2 h-4 w-4" />
              Print / PDF
           </Button>
           <Button size="sm" onClick={handleSave} loading={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
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
                    Estimate Line Items
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
                          <th className="px-4 py-3 w-32">Type</th>
                          <th className="px-4 py-3 w-24 text-center">Qty / Unit</th>
                          <th className="px-4 py-3 w-32 text-right">Cost ($)</th>
                          <th className="px-4 py-3 w-24 text-center">Markup %</th>
                          <th className="px-4 py-3 w-32 text-right">Total</th>
                          <th className="px-4 py-3 w-10"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                       {estimate.items.map((item) => (
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
                               <select 
                                  className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer w-full text-capitalize"
                                  value={item.type}
                                  onChange={(e) => handleUpdateItem(item.id, { type: e.target.value as LineItemType })}
                               >
                                  <option value="labor">Labor</option>
                                  <option value="material">Material</option>
                                  <option value="subcontractor">Sub</option>
                                  <option value="equipment">Equip</option>
                                  <option value="misc">Misc</option>
                               </select>
                            </td>
                            <td className="px-4 py-4">
                               <div className="flex items-center gap-1">
                                  <input 
                                     type="number"
                                     className="w-12 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded px-1.5 py-1 text-xs text-center focus:outline-none"
                                     value={item.quantity}
                                     onChange={(e) => handleUpdateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                                  />
                                  <input 
                                     className="w-10 bg-transparent text-[10px] uppercase text-center focus:outline-none"
                                     placeholder="Unit"
                                     value={item.unit}
                                     onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value })}
                                  />
                               </div>
                            </td>
                            <td className="px-4 py-4">
                               <input 
                                  type="number"
                                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs text-right focus:outline-none"
                                  value={item.unitCost}
                                  onChange={(e) => handleUpdateItem(item.id, { unitCost: parseFloat(e.target.value) || 0 })}
                               />
                            </td>
                            <td className="px-4 py-4">
                               <input 
                                  type="number"
                                  className="w-16 mx-auto bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded px-1.5 py-1 text-xs text-center focus:outline-none"
                                  value={item.markup}
                                  onChange={(e) => handleUpdateItem(item.id, { markup: parseFloat(e.target.value) || 0 })}
                               />
                            </td>
                            <td className="px-4 py-4 text-right">
                               <span className="text-sm font-bold">
                                  ${(item.quantity * item.unitCost * (1 + item.markup / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                               </span>
                            </td>
                            <td className="px-4 py-4">
                               <button 
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-gray-300 hover:text-[var(--danger)] transition-colors"
                               >
                                  <Trash2 size={16} />
                               </button>
                            </td>
                         </tr>
                       ))}
                       {estimate.items.length === 0 && (
                         <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-[var(--text-muted)] italic text-sm">
                               No line items added yet. Click "Add Item" to begin.
                            </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card title="Customer Notes & Terms" subtitle="Visible to the client.">
                 <div className="space-y-4">
                    <textarea 
                       className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                       placeholder="Summary of scope..."
                       rows={4}
                       value={estimate.scopeSummary}
                       onChange={(e) => updateEstimate({ scopeSummary: e.target.value })}
                    />
                    <textarea 
                       className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                       placeholder="Custom notes for the customer..."
                       rows={3}
                       value={estimate.customerNotes}
                       onChange={(e) => updateEstimate({ customerNotes: e.target.value })}
                    />
                 </div>
              </Card>
              <Card title="Internal Admin Information" subtitle="Strictly for internal records.">
                 <div className="space-y-4 font-medium text-sm">
                    <div className="flex justify-between items-center bg-[var(--bg-app)] p-3 rounded-xl border border-[var(--border-subtle)]">
                       <span className="text-[var(--text-muted)]">Margin Analysis</span>
                       <Badge variant="success">
                          {estimate.subtotal > 0 
                             ? `${( (estimate.subtotal - estimate.items.reduce((a, b) => a + (b.quantity * b.unitCost), 0)) / estimate.subtotal * 100).toFixed(1)}% Margin`
                             : '0% Margin'
                          }
                       </Badge>
                    </div>
                    <textarea 
                       className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                       placeholder="Private job notes..."
                       rows={6}
                       value={estimate.internalNotes}
                       onChange={(e) => updateEstimate({ internalNotes: e.target.value })}
                    />
                 </div>
              </Card>
           </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-8">
           <Card title="Estimate Summary" className="sticky top-24">
              <div className="space-y-6">
                 <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                       <span className="text-[var(--text-muted)]">Subtotal</span>
                       <span className="font-semibold">${estimate.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-[var(--text-muted)]">Tax ({estimate.taxRate}%)</span>
                       <span className="font-semibold">${estimate.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between items-end">
                       <span className="font-bold text-lg">Total</span>
                       <span className="font-bold text-2xl text-[var(--primary)]">${estimate.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-[var(--border-subtle)] space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Workflow Actions</label>
                    <div className="grid grid-cols-1 gap-2">
                       {estimate.status === 'draft' && (
                         <Button variant="outline" className="w-full justify-start h-11" onClick={() => handleStatusChange('sent')}>
                            <Send className="mr-3 h-4 w-4 text-[var(--info)]" />
                            Mark as Sent
                         </Button>
                       )}
                       {estimate.status === 'sent' && (
                         <>
                           <Button variant="outline" className="w-full justify-start h-11" onClick={() => handleStatusChange('approved')}>
                              <CheckCircle className="mr-3 h-4 w-4 text-[var(--success)]" />
                              Approve Estimate
                           </Button>
                           <Button variant="outline" className="w-full justify-start h-11 text-[var(--danger)]" onClick={() => handleStatusChange('rejected')}>
                              <XCircle className="mr-3 h-4 w-4" />
                              Reject Estimate
                           </Button>
                         </>
                       )}
                       {estimate.status === 'approved' && (
                         <Button className="w-full h-12 bg-[var(--success)] hover:bg-[hsl(150,84%,35%)]" onClick={handleConvertToJob}>
                            Convert to Active Job
                         </Button>
                       )}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-[var(--border-subtle)] space-y-4">
                    <div className="space-y-1">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Issue Date</span>
                       <input 
                         type="date"
                         className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded px-3 py-2 text-sm focus:outline-none"
                         value={estimate.issueDate}
                         onChange={(e) => updateEstimate({ issueDate: e.target.value })}
                       />
                    </div>
                 </div>
              </div>
           </Card>

           <Card title="Admin Context">
              <div className="space-y-2 text-xs text-[var(--text-muted)]">
                 <p>Created: {new Date(estimate.createdAt).toLocaleString()}</p>
                 <p>Updated: {new Date(estimate.updatedAt).toLocaleString()}</p>
                 <p className="pt-2 font-mono opacity-50">UID: {estimate.id.slice(0, 8)}</p>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
