import { storageService } from '../storage/storageService';
import { Customer, Job, Invoice, Estimate, Payment, JobExpense, BusinessProfile } from '@/domain/types';

// Simulate network latency (0ms for now, can increase for testing skeletons)
const LATENCY = 0;

const delay = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), LATENCY);
  });
};

export const api = {
  customers: {
    list: () => delay(storageService.getCustomers()),
    get: (id: string) => delay(storageService.getItem('customers', id) as Customer),
    create: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newCustomer = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return delay(storageService.saveItem('customers', newCustomer) as Customer);
    },
    update: (id: string, data: Partial<Customer>) => delay(storageService.saveItem('customers', { id, ...data }) as Customer),
    delete: (id: string) => {
      storageService.removeItem('customers', id);
      return delay(true);
    }
  },

  jobs: {
    list: () => delay(storageService.getJobs()),
    get: (id: string) => delay(storageService.getItem('jobs', id) as Job),
    getWithCustomer: (id: string) => delay(storageService.getJobWithCustomer(id)),
    create: (data: any) => delay(storageService.saveItem('jobs', data)),
    update: (id: string, data: Partial<Job>) => delay(storageService.saveItem('jobs', { id, ...data }) as Job),
  },

  invoices: {
    list: () => delay(storageService.getCollection('invoices') as Invoice[]),
    get: (id: string) => delay(storageService.getItem('invoices', id) as Invoice),
    getWithContext: (id: string) => delay(storageService.getInvoiceWithContext(id)),
    create: (data: any) => delay(storageService.saveItem('invoices', data)),
    update: (id: string, data: Partial<Invoice>) => delay(storageService.saveItem('invoices', { id, ...data }) as Invoice),
  },

  estimates: {
    list: () => delay(storageService.getCollection('estimates') as Estimate[]),
    get: (id: string) => delay(storageService.getItem('estimates', id) as Estimate),
    getWithContext: (id: string) => delay(storageService.getEstimateWithContext(id)),
    create: (data: any) => delay(storageService.saveItem('estimates', data)),
  },
  
  settings: {
    get: () => delay(storageService.getSettings()),
    update: (data: BusinessProfile) => {
      storageService.saveSettings(data);
      return delay(data);
    }
  },

  search: {
    global: async (query: string) => {
      const lowerQuery = query.toLowerCase();
      const customers = storageService.getCustomers();
      const jobs = storageService.getJobs();
      const invoices = storageService.getCollection('invoices') as Invoice[];
      const estimates = storageService.getCollection('estimates') as Estimate[];

      const results: { type: string; id: string; title: string; subtitle: string; url: string }[] = [];

      customers.forEach(c => {
        if (c.name.toLowerCase().includes(lowerQuery) || c.companyName?.toLowerCase().includes(lowerQuery)) {
          results.push({ type: 'customer', id: c.id, title: c.name, subtitle: c.companyName || 'Customer', url: `/customers/${c.id}` });
        }
      });

      jobs.forEach(j => {
        if (j.title.toLowerCase().includes(lowerQuery) || j.siteAddress.toLowerCase().includes(lowerQuery)) {
          results.push({ type: 'job', id: j.id, title: j.title, subtitle: `Project • ${j.status}`, url: `/jobs/${j.id}` });
        }
      });

      invoices.forEach(i => {
        if (i.invoiceNumber.toLowerCase().includes(lowerQuery)) {
          results.push({ type: 'invoice', id: i.id, title: i.invoiceNumber, subtitle: `Invoice • Total: $${i.total.toLocaleString()}`, url: `/invoices/${i.id}` });
        }
      });

      estimates.forEach(e => {
        if (e.estimateNumber.toLowerCase().includes(lowerQuery) || e.scopeSummary?.toLowerCase().includes(lowerQuery)) {
          results.push({ type: 'estimate', id: e.id, title: e.estimateNumber, subtitle: `Estimate • Total: $${e.total.toLocaleString()}`, url: `/estimates/${e.id}` });
        }
      });

      return delay(results);
    }
  }
};
