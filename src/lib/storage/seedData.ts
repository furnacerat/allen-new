import { StorageSchema } from '@/domain/types';
import { v4 as uuidv4 } from 'uuid';

const customerId1 = uuidv4();
const customerId2 = uuidv4();
const customerId3 = uuidv4();
const jobId1 = uuidv4();

export const seedData: StorageSchema = {
  customers: [
    {
      id: customerId1,
      name: 'Michael Scott',
      companyName: 'Dunder Mifflin Paper Co.',
      email: 'michael.scott@dundermifflin.com',
      phone: '(555) 123-4567',
      address: '1725 Slough Avenue, Scranton, PA',
      notes: 'Focus on paper storage additions.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: customerId2,
      name: 'Pam Beesly',
      companyName: 'Beesly Designs',
      email: 'pam.b@office.com',
      phone: '(555) 987-6543',
      address: '42 Wallaby Way, Sydney',
      notes: 'Art studio renovation project.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: customerId3,
      name: 'Dwight Schrute',
      companyName: 'Schrute Farms',
      email: 'dwight@schrute-farms.com',
      phone: '(555) 246-8135',
      address: 'Beet Barn Road, Honesdale, PA',
      notes: 'Irrigation system and barn repair.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  jobs: [
    {
      id: jobId1,
      customerId: customerId1,
      title: 'Kitchen Remodel',
      siteAddress: '123 Main St',
      type: 'remodel',
      contractAmount: 15000,
      estimatedCost: 8000,
      actualCost: 2000,
      status: 'in progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
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
    address: "742 Evergreen Terrace, Springfield",
    phone: "(555) 012-3456",
    email: "office@allens.contractors",
    licenseNumber: "GC-882299",
    taxRate: 0.08,
    laborRate: 75,
    defaultLaborMarkup: 20,
    defaultMaterialMarkup: 25,
    footerNotes: "Thank you for your business! All quotes are valid for 30 days."
  }
};
