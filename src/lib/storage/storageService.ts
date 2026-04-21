import { StorageSchema, Customer, Job, BusinessProfile, Estimate, EstimateTemplate, EstimateAssembly, Invoice, Payment, SavedView } from '@/domain/types';
import { seedData } from './seedData';

const STORAGE_KEY = 'allens_contractors_data';

const DEFAULT_DATA: StorageSchema = {
  customers: [],
  jobs: [],
  estimates: [],
  estimateTemplates: [],
  estimateAssemblies: [],
  expenses: [],
  invoices: [],
  payments: [],
  materials: [],
  laborEntries: [],
  changeOrders: [],
  jobNotes: [],
  jobProgress: [],
  savedViews: [],
  viewedItems: [],
  onboardingCompleted: false,
  settings: {
    businessName: "Allen's Contractor's",
    taxRate: 0,
    laborRate: 0,
    defaultLaborMarkup: 20,
    defaultMaterialMarkup: 15,
    licenseNumber: '',
    address: '',
    phone: '',
    email: '',
    footerNotes: ''
  },
};

export const storageService = {
  getData(): StorageSchema {
    if (typeof window === 'undefined') return DEFAULT_DATA;
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      this.saveData(seedData as unknown as StorageSchema);
      return seedData as unknown as StorageSchema;
    }
    try {
      const parsed = JSON.parse(data);
      // Ensure new collections exist for backward compatibility
      return {
        ...DEFAULT_DATA,
        ...parsed,
        estimates: parsed.estimates || [],
        estimateTemplates: parsed.estimateTemplates || [],
        estimateAssemblies: parsed.estimateAssemblies || [],
        materials: parsed.materials || [],
        laborEntries: parsed.laborEntries || [],
        changeOrders: parsed.changeOrders || [],
        jobNotes: parsed.jobNotes || [],
        jobProgress: parsed.jobProgress || [],
        expenses: parsed.expenses || [],
        invoices: parsed.invoices || [],
        payments: parsed.payments || [],
        savedViews: parsed.savedViews || [],
        viewedItems: parsed.viewedItems || [],
        onboardingCompleted: parsed.onboardingCompleted ?? false,
      };
    } catch (e) {
      console.error('Failed to parse storage data', e);
      return seedData as unknown as StorageSchema;
    }
  },

  saveData(data: StorageSchema): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // Generic CRUD helpers
  getCollection<K extends keyof Omit<StorageSchema, 'settings'>>(collection: K) {
    return this.getData()[collection];
  },

  getItem<K extends keyof Omit<StorageSchema, 'settings'>>(collection: K, id: string) {
    const items = this.getCollection(collection) as any[];
    return items.find((item) => item.id === id);
  },

  saveItem<K extends keyof Omit<StorageSchema, 'settings'>>(collection: K, item: any) {
    const data = this.getData();
    const items = data[collection] as any[];
    const index = items.findIndex((i) => i.id === item.id);

    if (index !== -1) {
      items[index] = { ...items[index], ...item, updatedAt: new Date().toISOString() };
    } else {
      items.push({ 
        ...item, 
        createdAt: item.createdAt || new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      });
    }

    this.saveData(data);
    return item;
  },

  removeItem<K extends keyof Omit<StorageSchema, 'settings'>>(collection: K, id: string) {
    const data = this.getData();
    const items = data[collection] as any[];
    data[collection] = items.filter((i) => i.id !== id) as any;
    this.saveData(data);
  },

  // Specific shortcuts
  getCustomers: () => storageService.getCollection('customers') as Customer[],
  getJobs: () => storageService.getCollection('jobs') as Job[],
  getEstimates: () => storageService.getCollection('estimates') as Estimate[],
  getTemplates: () => storageService.getCollection('estimateTemplates') as EstimateTemplate[],
  getAssemblies: () => storageService.getCollection('estimateAssemblies') as EstimateAssembly[],
  getSettings: () => storageService.getData().settings as BusinessProfile,
  
  saveSettings(settings: BusinessProfile) {
    const data = this.getData();
    data.settings = settings;
    this.saveData(data);
  },

  getJobWithCustomer(jobId: string) {
    const job = this.getItem('jobs', jobId) as Job;
    if (!job) return null;
    const customer = this.getItem('customers', job.customerId) as Customer;
    return { ...job, customer };
  },

  getJobsByCustomer(customerId: string) {
    const jobs = this.getJobs();
    return jobs.filter(j => j.customerId === customerId);
  },

  getEstimateWithContext(estimateId: string) {
    const estimate = this.getItem('estimates', estimateId) as Estimate;
    if (!estimate) return null;
    const customer = this.getItem('customers', estimate.customerId) as Customer;
    const job = estimate.jobId ? this.getItem('jobs', estimate.jobId) as Job : null;
    return { ...estimate, customer, job };
  },

  getInvoicesByJob(jobId: string) {
    const invoices = this.getCollection('invoices') as Invoice[];
    return invoices.filter(i => i.jobId === jobId);
  },

  getInvoicesByCustomer(customerId: string) {
    const invoices = this.getCollection('invoices') as Invoice[];
    return invoices.filter(i => i.customerId === customerId);
  },

  getPaymentsByInvoice(invoiceId: string) {
    const payments = this.getCollection('payments') as Payment[];
    return payments.filter(p => p.invoiceId === invoiceId);
  },

  getInvoiceWithContext(invoiceId: string) {
    const invoice = this.getItem('invoices', invoiceId) as Invoice;
    if (!invoice) return null;
    const customer = this.getItem('customers', invoice.customerId) as Customer;
    const job = invoice.jobId ? this.getItem('jobs', invoice.jobId) as Job : null;
    const payments = this.getPaymentsByInvoice(invoiceId);
    return { ...invoice, customer, job, payments };
  },

  getSavedViews(page?: string) {
    const views = this.getCollection('savedViews') as any[];
    return page ? views.filter(v => v.page === page) : views;
  },

  saveSavedView(view: Omit<SavedView, 'id' | 'createdAt' | 'updatedAt'>) {
    const newView: SavedView = {
      ...view,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.saveItem('savedViews', newView);
  },

  deleteSavedView(id: string) {
    this.removeItem('savedViews', id);
  },

  getViewedItems(limit = 10) {
    const items = this.getData().viewedItems || [];
    return items.sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()).slice(0, limit);
  },

  addViewedItem(item: { id: string; type: string; name: string; url: string }) {
    const data = this.getData();
    const existing = data.viewedItems || [];
    const filtered = existing.filter(i => !(i.id === item.id && i.type === item.type));
    data.viewedItems = [{ ...item, viewedAt: new Date().toISOString() }, ...filtered].slice(0, 20);
    this.saveData(data);
  },

  getOnboardingCompleted() {
    return this.getData().onboardingCompleted;
  },

  setOnboardingCompleted(completed: boolean) {
    const data = this.getData();
    data.onboardingCompleted = completed;
    this.saveData(data);
  }
};
