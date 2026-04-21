import { StorageSchema, Customer, Job, BusinessProfile } from '@/domain/types';
import { seedData } from './seedData';

const STORAGE_KEY = 'allens_contractors_data';

const DEFAULT_DATA: StorageSchema = {
  customers: [],
  jobs: [],
  estimates: [],
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
      this.saveData(seedData);
      return seedData;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse storage data', e);
      return seedData;
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
      items.push({ ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    this.saveData(data);
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
  }
};
