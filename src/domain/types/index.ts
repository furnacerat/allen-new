export type JobStatus = 'lead' | 'estimating' | 'approved' | 'in progress' | 'on hold' | 'completed' | 'archived';

export type JobType = 
  | 'remodel' | 'flip' | 'new_build' | 'addition' | 'repair' 
  | 'kitchen_remodel' | 'bath_remodel' | 'basement' | 'plumbing' 
  | 'electrical' | 'hvac' | 'roofing' | 'siding' | 'painting' 
  | 'flooring' | 'deck_patio' | 'landscaping' | 'windows' 
  | 'drywall' | 'fencing' | 'concrete' | 'demolition' | 'masonry' 
  | 'waterproofing' | 'cabinetry' | 'tile' | 'other';

export type EstimateStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'converted';
export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'void';

export type LineItemType = 'labor' | 'material' | 'subcontractor' | 'equipment' | 'misc';

export interface Customer {
  id: string;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'lead';
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  customerId: string;
  title: string;
  type: JobType;
  siteAddress: string;
  description?: string;
  status: JobStatus;
  contractAmount: number;
  estimatedCost: number;
  actualCost: number;
  targetStartDate?: string;
  targetCompletionDate?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateLineItem {
  id: string;
  name: string;
  description?: string;
  type: LineItemType;
  quantity: number;
  unit: string; // e.g. 'hr', 'sqft', 'ea'
  unitCost: number;
  markup: number; // percentage (e.g. 20 for 20%)
  taxable: boolean;
  total: number;
}

export interface Estimate {
  id: string;
  estimateNumber: string;
  customerId: string;
  jobId?: string; // Optional link to a pre-existing job/lead
  status: EstimateStatus;
  issueDate: string;
  expiryDate?: string;
  scopeSummary?: string;
  internalNotes?: string;
  customerNotes?: string;
  termsConditions?: string;
  items: EstimateLineItem[];
  subtotal: number;
  taxRate: number; // percentage
  taxTotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateTemplate {
  id: string;
  name: string;
  description?: string;
  items: EstimateLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface EstimateAssembly {
  id: string;
  name: string;
  description?: string;
  items: EstimateLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfile {
  businessName: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  taxRate: number;
  laborRate: number;
  defaultLaborMarkup: number; // percentage
  defaultMaterialMarkup: number; // percentage
  footerNotes?: string;
}

export interface SavedView {
  id: string;
  name: string;
  page: 'customers' | 'jobs' | 'invoices' | 'estimates';
  filters: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  createdAt: string;
  updatedAt: string;
}

export interface StorageSchema {
  customers: Customer[];
  jobs: Job[];
  estimates: Estimate[];
  estimateTemplates: EstimateTemplate[];
  estimateAssemblies: EstimateAssembly[];
  settings: BusinessProfile;
  expenses: JobExpense[];
  invoices: Invoice[];
  payments: Payment[];
  materials: ProjectMaterial[];
  laborEntries: LaborEntry[];
  changeOrders: ChangeOrder[];
  jobNotes: JobNote[];
  jobProgress: JobProgress[];
  savedViews: SavedView[];
  viewedItems: { id: string; type: string; name: string; url: string; viewedAt: string }[];
  onboardingCompleted: boolean;
}

export interface ProjectMaterial {
  id: string;
  jobId: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  actualCost: number;
  status: 'needed' | 'ordered' | 'purchased' | 'received';
  vendor?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LaborEntry {
  id: string;
  jobId: string;
  date: string;
  workerName: string;
  laborType: string;
  hours: number;
  hourlyCost: number;
  billableRate?: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobExpense {
  id: string;
  jobId: string;
  date: string;
  category: 'subcontractor' | 'equipment' | 'material' | 'permit' | 'other';
  vendor: string;
  amount: number;
  paymentMethod?: string;
  receiptPlaceholder?: string; // For URL
  receiptPhoto?: string; // For Base64 or local path
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeOrder {
  id: string;
  jobId: string;
  title: string;
  description: string;
  amountChange: number;
  status: 'pending' | 'approved' | 'rejected' | 'void';
  createdAt: string;
  updatedAt: string;
}

export interface JobNote {
  id: string;
  jobId: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobProgress {
  id: string;
  jobId: string;
  date: string;
  content: string;
  statusUpdate?: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxable: boolean;
  total: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  jobId?: string;
  customerId: string;
  amount: number;
  date: string;
  method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other';
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-1001
  customerId: string;
  jobId?: string;
  estimateId?: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxTotal: number;
  total: number;
  balanceDue: number;
  customerNotes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}
