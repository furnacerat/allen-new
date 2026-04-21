export type JobStatus = 'lead' | 'estimating' | 'approved' | 'in progress' | 'on hold' | 'completed' | 'archived';
export type JobType = 
  | 'remodel' | 'flip' | 'new_build' | 'addition' | 'repair' 
  | 'kitchen_remodel' | 'bath_remodel' | 'basement' | 'plumbing' 
  | 'electrical' | 'hvac' | 'roofing' | 'siding' | 'painting' 
  | 'flooring' | 'deck_patio' | 'landscaping' | 'windows' 
  | 'drywall' | 'fencing' | 'concrete' | 'demolition' | 'masonry' 
  | 'waterproofing' | 'cabinetry' | 'tile' | 'other';
export type TaskStatus = 'open' | 'in_progress' | 'blocked' | 'done';
export type ExpenseCategory = 'materials' | 'permits' | 'dump_fees' | 'fuel' | 'rental' | 'subcontractor' | 'equipment' | 'misc';
export type PaymentSource = 'company_card' | 'cash' | 'check' | 'finance' | 'credit' | 'other';
export type InvoiceType = 'deposit' | 'progress' | 'final' | 'change_order';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue';
export type PaymentMethod = 'cash' | 'check' | 'ach' | 'card' | 'other';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

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
  settings: BusinessProfile;
  // Prepared for future phases
  estimates: any[];
  expenses: any[];
  invoices: any[];
}

export interface AuditMetadata {
  createdAt: string;
  updatedAt: string;
}
