'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, Button, Tabs } from '@/components/ui';
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
  Layers,
  Calculator,
  TrendingUp,
  Download,
  Upload,
  Database
} from 'lucide-react';
import { api } from '@/lib/api';
import { BusinessProfile } from '@/domain/types';
import { useToast } from '@/context/ToastContext';
import { LogoPlaceholder } from '@/components/ui/LogoPlaceholder';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<BusinessProfile>({
    businessName: '',
    email: '',
    phone: '',
    address: '',
    licenseNumber: '',
    taxRate: 0,
    laborRate: 0,
    defaultLaborMarkup: 0,
    defaultMaterialMarkup: 0,
    footerNotes: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await api.settings.get();
    if (settings) {
      setFormData({
        ...settings,
        defaultLaborMarkup: settings.defaultLaborMarkup || 0,
        defaultMaterialMarkup: settings.defaultMaterialMarkup || 0
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await api.settings.update(formData);
    setLoading(false);
    showToast('Settings saved successfully', 'success');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['taxRate', 'laborRate', 'defaultLaborMarkup', 'defaultMaterialMarkup'].includes(name);
    setFormData(prev => ({ 
      ...prev, 
      [name]: isNumeric ? parseFloat(value) || 0 : value 
    }));
  };

  const handleExportBackup = () => {
    setIsExporting(true);
    try {
      const dataStr = localStorage.getItem('allens_contractors_data');
      if (!dataStr) {
        showToast('No data to export', 'error');
        return;
      }
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `allens_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup exported successfully', 'success');
    } catch (e) {
      showToast('Failed to export backup', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        JSON.parse(json); // Validate JSON format
        if (confirm('WARNING: This will completely OVERWRITE your current data with the backup. Are you sure?')) {
          localStorage.setItem('allens_contractors_data', json);
          showToast('Backup restored. Reloading app...', 'success');
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (err) {
        showToast('Invalid backup file. Must be valid JSON.', 'error');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'company', label: 'Company Details', icon: <Building size={16} /> },
    { id: 'defaults', label: 'Rates & Defaults', icon: <DollarSign size={16} /> },
    { id: 'data', label: 'Data Management', icon: <Database size={16} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-[var(--text-muted)]">Manage your business profile, operational defaults, and backups.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => loadSettings()}>
            <Undo className="mr-2 h-4 w-4" />
            Discard Active Edits
          </Button>
          <Button size="sm" onClick={handleSubmit} loading={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save Profile Changes
          </Button>
        </div>
      </header>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'company' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Company Identity" subtitle="Basic information used for branding and documents.">
              <div className="flex items-center gap-6 mb-8 p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-subtle)]">
                 <LogoPlaceholder name={formData.businessName || 'Your Business'} size="xl" />
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
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all focus:border-transparent"
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
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all focus:border-transparent"
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
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all focus:border-transparent"
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Contact & Address" className="h-full border-[var(--border-subtle)]">
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
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all focus:border-transparent"
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
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'defaults' && (
        <Card title="Rates & Finance" subtitle="Default values used automatically for new estimating and invoicing workflows.">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 pt-4">
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
                className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all focus:border-transparent"
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
                className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Layers size={14} className="text-[var(--primary)]" />
                Labor Markup (%)
              </label>
              <input 
                type="number"
                name="defaultLaborMarkup"
                value={formData.defaultLaborMarkup}
                onChange={handleChange}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Calculator size={14} className="text-[var(--primary)]" />
                Material Markup (%)
              </label>
              <input 
                type="number"
                name="defaultMaterialMarkup"
                value={formData.defaultMaterialMarkup}
                onChange={handleChange}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all focus:border-transparent"
              />
            </div>
          </div>
          <div className="space-y-2 pt-6 border-t border-[var(--border-subtle)]">
            <label className="text-sm font-semibold flex items-center gap-2">
              <FileText size={14} className="text-[var(--primary)]" />
              Document Footer Notes Default
            </label>
            <textarea 
              name="footerNotes"
              value={formData.footerNotes}
              onChange={handleChange}
              placeholder="Terms and conditions, thank you messages, payment instructions..."
              rows={4}
              className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all focus:border-transparent resize-none"
            />
            <p className="text-xs text-[var(--text-muted)] italic">This text will be automatically appended to the bottom of all generated estimates and invoices.</p>
          </div>
        </Card>
      )}

      {activeTab === 'data' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-indigo-100 bg-indigo-50/30">
             <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                   <Download size={24} />
                </div>
                <h3 className="text-lg font-bold">Export Backup JSON</h3>
                <p className="text-sm text-[var(--text-muted)]">
                   Download a complete snapshot of your database including all customers, active projects, estimates, and financial records. Useful for securing manual backups.
                </p>
                <Button onClick={handleExportBackup} loading={isExporting} className="w-full mt-4">
                   Download Full Backup
                </Button>
             </div>
          </Card>
          
          <Card className="border-red-100 bg-red-50/30">
             <div className="space-y-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                   <Upload size={24} />
                </div>
                <h3 className="text-lg font-bold text-red-800">Restore Backup</h3>
                <p className="text-sm text-red-700 opacity-80">
                   <strong>DANGER:</strong> Uploading a JSON backup will completely overwrite your current database. Any current work not in the backup file will be lost immediately.
                </p>
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImportBackup}
                />
                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => fileInputRef.current?.click()}
                >
                   Select Backup File to Restore
                </Button>
             </div>
          </Card>
        </div>
      )}

    </div>
  );
}
