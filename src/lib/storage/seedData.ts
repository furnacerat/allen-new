import { StorageSchema } from '@/domain/types';
import { v4 as uuidv4 } from 'uuid';

export const seedData: StorageSchema = {
  customers: [
    {
      id: uuidv4(),
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
      id: uuidv4(),
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
      id: uuidv4(),
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
      id: uuidv4(),
      customerId: '', // Placeholder
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
  settings: {
    businessName: "Allen's Contractor's",
    address: "742 Evergreen Terrace, Springfield",
    phone: "(555) 012-3456",
    email: "office@allens.contractors",
    licenseNumber: "GC-882299",
    taxRate: 0.08,
    laborRate: 75,
    footerNotes: "Thank you for your business! All quotes are valid for 30 days."
  }
};
