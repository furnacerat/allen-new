import { StorageSchema, Customer, Job, BusinessProfile, Estimate, EstimateTemplate, EstimateAssembly } from '@/domain/types';
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
  settings: {
    businessName: "Allen's Contractor's",
    taxRate: 0,
    laborRate: 0,
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
  }
};
