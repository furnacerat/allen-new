'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { 
  ChevronLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  FileText 
} from 'lucide-react';
import Link from 'next/link';
import { storageService } from '@/lib/storage/storageService';
import { v4 as uuidv4 } from 'uuid';

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate slight delay for "premium" feel
    setTimeout(() => {
      const newCustomer = {
        ...formData,
        id: uuidv4(),
      };
      
      storageService.saveItem('customers', newCustomer);
      router.push('/customers');
    }, 600);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link 
        href="/customers" 
        className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
      >
        <ChevronLeft size={16} className="mr-1" />
        Back to Customers
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">New Customer</h1>
        <Button onClick={handleSubmit} loading={loading} className="hidden md:flex">
          <Save className="mr-2 h-4 w-4" />
          Save Customer
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Primary Information" subtitle="Basic contact details for the customer.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <User size={14} className="text-[var(--primary)]" />
                Full Name *
              </label>
              <input 
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Smith"
                className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Building size={14} className="text-[var(--primary)]" />
                Company Name
              </label>
              <input 
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Smith Properties"
                className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Mail size={14} className="text-[var(--primary)]" />
                Email Address
              </label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Phone size={14} className="text-[var(--primary)]" />
                Phone Number
              </label>
              <input 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 000-0000"
                className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
        </Card>

        <Card title="Location & Notes" subtitle="Address and additional context.">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <MapPin size={14} className="text-[var(--primary)]" />
                Billing Address
              </label>
              <input 
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Construction Way, Builder City, ST"
                className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <FileText size={14} className="text-[var(--primary)]" />
                Internal Notes
              </label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any specific details about this client..."
                rows={4}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
              />
            </div>
          </div>
        </Card>

        <div className="flex md:hidden px-4">
          <Button type="submit" loading={loading} className="w-full h-14">
            <Save className="mr-2 h-5 w-5" />
            Save Customer
          </Button>
        </div>
      </form>
    </div>
  );
}
