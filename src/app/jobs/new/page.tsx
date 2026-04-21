'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { 
  ChevronLeft, 
  Save, 
  Briefcase, 
  User, 
  MapPin, 
  FileText, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { storageService } from '@/lib/storage/storageService';
import { Customer, JobType, JobStatus } from '@/domain/types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/context/ToastContext';

export default function NewJobPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    type: 'remodel' as JobType,
    siteAddress: '',
    description: '',
    status: 'lead' as JobStatus,
    targetStartDate: '',
    targetCompletionDate: '',
    internalNotes: ''
  });

  useEffect(() => {
    setCustomers(storageService.getCustomers());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) {
        showToast('Please select a customer', 'error');
        return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      const newJob = {
        ...formData,
        id: uuidv4(),
        actualCost: 0,
        contractAmount: 0,
        estimatedCost: 0,
      };
      
      storageService.saveItem('jobs', newJob);
      showToast('Project created successfully', 'success');
      router.push('/jobs');
    }, 600);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Link 
        href="/jobs" 
        className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
      >
        <ChevronLeft size={16} className="mr-1" />
        Back to Jobs
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)]">New Project</h1>
        <Button onClick={handleSubmit} loading={loading} className="hidden md:flex">
          <Save className="mr-2 h-4 w-4" />
          Create Job
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card title="Job Details" subtitle="Core project information.">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <Briefcase size={14} className="text-[var(--primary)]" />
                                Project Title *
                            </label>
                            <input 
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Master Bath Remodel"
                                className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <User size={14} className="text-[var(--primary)]" />
                                    Customer *
                                </label>
                                <select 
                                    required
                                    name="customerId"
                                    value={formData.customerId}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                >
                                    <option value="">Select a customer...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <AlertCircle size={14} className="text-[var(--primary)]" />
                                    Job Type
                                </label>
                                <select 
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                >
                                    <optgroup label="Core Services">
                                        <option value="remodel">Remodel</option>
                                        <option value="flip">Flip</option>
                                        <option value="new_build">New Build</option>
                                        <option value="addition">Addition</option>
                                        <option value="repair">Repair</option>
                                    </optgroup>
                                    <optgroup label="Interior">
                                        <option value="kitchen_remodel">Kitchen Remodel</option>
                                        <option value="bath_remodel">Bathroom Remodel</option>
                                        <option value="basement">Basement Finishing</option>
                                        <option value="flooring">Flooring</option>
                                        <option value="painting">Painting</option>
                                        <option value="drywall">Drywall</option>
                                        <option value="cabinetry">Cabinetry</option>
                                        <option value="tile">Tile Work</option>
                                    </optgroup>
                                    <optgroup label="Trades">
                                        <option value="plumbing">Plumbing</option>
                                        <option value="electrical">Electrical</option>
                                        <option value="hvac">HVAC</option>
                                    </optgroup>
                                    <optgroup label="Exterior & Structural">
                                        <option value="roofing">Roofing</option>
                                        <option value="siding">Siding</option>
                                        <option value="windows">Windows/Doors</option>
                                        <option value="deck_patio">Deck & Patio</option>
                                        <option value="fencing">Fencing</option>
                                        <option value="concrete">Concrete/Driveways</option>
                                        <option value="masonry">Masonry</option>
                                        <option value="landscaping">Landscaping</option>
                                    </optgroup>
                                    <optgroup label="Specialized">
                                        <option value="waterproofing">Waterproofing</option>
                                        <option value="demolition">Demolition</option>
                                        <option value="other">Other Service</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <MapPin size={14} className="text-[var(--primary)]" />
                                Site Address *
                            </label>
                            <input 
                                required
                                name="siteAddress"
                                value={formData.siteAddress}
                                onChange={handleChange}
                                placeholder="Where will the work be performed?"
                                className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            />
                        </div>
                    </div>
                </Card>

                <Card title="Timeline & Notes" subtitle="When does the work start?">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <Calendar size={14} className="text-[var(--primary)]" />
                                    Target Start
                                </label>
                                <input 
                                    type="date"
                                    name="targetStartDate"
                                    value={formData.targetStartDate}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <Calendar size={14} className="text-[var(--primary)]" />
                                    Target Completion
                                </label>
                                <input 
                                    type="date"
                                    name="targetCompletionDate"
                                    value={formData.targetCompletionDate}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <FileText size={14} className="text-[var(--primary)]" />
                                Description
                            </label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                            />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <Card title="Status & Meta">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Current Pipeline Status</label>
                            <select 
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            >
                                <option value="lead">Lead</option>
                                <option value="estimating">Estimating</option>
                                <option value="approved">Approved</option>
                                <option value="in progress">In Progress</option>
                                <option value="on hold">On Hold</option>
                                <option value="completed">Completed</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Internal Admin Notes</label>
                            <textarea 
                                name="internalNotes"
                                value={formData.internalNotes}
                                onChange={handleChange}
                                placeholder="Not visible to customer..."
                                rows={6}
                                className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                            />
                        </div>
                    </div>
                </Card>

                <div className="flex md:hidden px-4">
                    <Button type="submit" loading={loading} className="w-full h-14">
                        <Save className="mr-2 h-5 w-5" />
                        Create Project
                    </Button>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
}
