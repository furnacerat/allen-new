'use client';
import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Save, 
  Undo,
  DollarSign,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { storageService } from '@/lib/storage/storageService';
import { BusinessProfile } from '@/domain/types';
import { useToast } from '@/context/ToastContext';

import { LogoPlaceholder } from '@/components/ui/LogoPlaceholder';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BusinessProfile>({
    businessName: '',
    email: '',
    phone: '',
    address: '',
    licenseNumber: '',
    taxRate: 0,
    laborRate: 0,
    footerNotes: ''
  });

  useEffect(() => {
    const settings = storageService.getSettings();
    if (settings) {
      setFormData(settings);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      storageService.saveSettings(formData);
      setLoading(false);
      showToast('Settings saved successfully', 'success');
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'taxRate' || name === 'laborRate' ? parseFloat(value) || 0 : value 
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Profile</h1>
          <p className="text-[var(--text-muted)]">Configure your company details and document defaults.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <Undo className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSubmit} loading={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Company Identity" subtitle="Basic information used for branding and documents.">
            <div className="flex items-center gap-6 mb-8 p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-subtle)]">
               <LogoPlaceholder name={formData.businessName} size="xl" />
               <div>
                  <h4 className="font-bold text-lg">Business Logo</h4>
                  <p className="text-xs text-[var(--text-muted)]">A letter placeholder is generated automatically based on your business name.</p>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Building size={14} className="text-[var(--primary)]" />
                  Business Name
                </label>
                <input 
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[var(--primary)]" />
                  License Number
                </label>
                <input 
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="e.g. GC-12345678"
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Mail size={14} className="text-[var(--primary)]" />
                  Business Email
                </label>
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </Card>

          <Card title="Rates & Finance" subtitle="Default values used for estimating and invoicing.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <DollarSign size={14} className="text-[var(--primary)]" />
                  Default Labor Rate ($/hr)
                </label>
                <input 
                  type="number"
                  name="laborRate"
                  value={formData.laborRate}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp size={14} className="text-[var(--primary)]" />
                  Tax Rate (%)
                </label>
                <input 
                  type="number"
                  step="0.01"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Contact & Address" className="h-full">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Phone size={14} className="text-[var(--primary)]" />
                  Phone Number
                </label>
                <input 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <MapPin size={14} className="text-[var(--primary)]" />
                  Business Address
                </label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <FileText size={14} className="text-[var(--primary)]" />
                  Document Footer Notes
                </label>
                <textarea 
                  name="footerNotes"
                  value={formData.footerNotes}
                  onChange={handleChange}
                  placeholder="Terms and conditions, thank you messages..."
                  rows={4}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
