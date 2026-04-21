export type JobStatus = 'lead' | 'estimating' | 'approved' | 'in progress' | 'on hold' | 'completed' | 'archived';

export type JobType = 
  | 'remodel' | 'flip' | 'new_build' | 'addition' | 'repair' 
  | 'kitchen_remodel' | 'bath_remodel' | 'basement' | 'plumbing' 
  | 'electrical' | 'hvac' | 'roofing' | 'siding' | 'painting' 
  | 'flooring' | 'deck_patio' | 'landscaping' | 'windows' 
  | 'drywall' | 'fencing' | 'concrete' | 'demolition' | 'masonry' 
  | 'waterproofing' | 'cabinetry' | 'tile' | 'other';

export type EstimateStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'converted';

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
  footerNotes?: string;
}

export interface StorageSchema {
  customers: Customer[];
  jobs: Job[];
  estimates: Estimate[];
  estimateTemplates: EstimateTemplate[];
  estimateAssemblies: EstimateAssembly[];
  settings: BusinessProfile;
  expenses: any[];
  invoices: any[];
}
