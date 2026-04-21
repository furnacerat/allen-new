'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building, User, Briefcase, FileText, Check, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { storageService } from '@/lib/storage/storageService';
import { Button, Card } from '@/components/ui';
import { useToast } from '@/context/ToastContext';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Allen\'s Contractor\'s',
    description: 'The all-in-one operations platform for construction contractors. Let\'s get your business set up in just a few minutes.',
    icon: Building,
  },
  {
    id: 'company',
    title: 'Set Up Your Business',
    description: 'Add your business name, contact info, and license number. This information appears on all your documents.',
    icon: Building,
  },
  {
    id: 'first-customer',
    title: 'Add Your First Customer',
    description: 'Every project starts with a customer. Add your first client to get started.',
    icon: User,
  },
  {
    id: 'first-job',
    title: 'Create Your First Project',
    description: 'Track your construction projects, estimate costs, and manage leads all in one place.',
    icon: Briefcase,
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Your business is ready to go. Start adding estimates and invoices to grow your contractor business.',
    icon: Check,
  },
];

export function OnboardingFlow() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    businessName: "Allen's Contractor's",
    email: '',
    phone: '',
    address: '',
    licenseNumber: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    jobTitle: '',
    jobAddress: '',
    jobType: 'remodel',
  });

  const currentStep = STEPS[step];

  const handleNext = async () => {
    if (step === STEPS.length - 1) {
      storageService.setOnboardingCompleted(true);
      window.location.href = '/';
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 0) return;
    setStep(step - 1);
  };

  const handleSkip = () => {
    storageService.setOnboardingCompleted(true);
    window.location.href = '/';
  };

  const handleSave = async () => {
    const settings = storageService.getSettings();
    await storageService.saveSettings({
      ...settings,
      businessName: formData.businessName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      licenseNumber: formData.licenseNumber,
    });

    if (formData.customerName) {
      await storageService.saveItem('customers', {
        id: crypto.randomUUID(),
        name: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (formData.jobTitle && formData.customerName) {
      const customers = storageService.getCustomers();
      const customer = customers.find(c => c.name === formData.customerName);
      if (customer) {
        await storageService.saveItem('jobs', {
          id: crypto.randomUUID(),
          customerId: customer.id,
          title: formData.jobTitle,
          type: formData.jobType,
          siteAddress: formData.jobAddress,
          status: 'lead',
          contractAmount: 0,
          estimatedCost: 0,
          actualCost: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    storageService.setOnboardingCompleted(true);
    showToast('Business setup complete!', 'success');
    window.location.href = '/';
  };

  const Icon = currentStep.icon;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="flex justify-end mb-4">
          <button onClick={handleSkip} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1">
            <X size={16} /> Skip Setup
          </button>
        </div>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[var(--primary-subtle)] rounded-2xl flex items-center justify-center text-[var(--primary)] mx-auto mb-4">
              <Icon size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-2">{currentStep.title}</h1>
            <p className="text-[var(--text-muted)]">{currentStep.description}</p>
          </div>

          <div className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="text-sm font-semibold">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full mt-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full mt-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full mt-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold">Business Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full mt-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">License Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="e.g. GC-123456"
                    className="w-full mt-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="text-sm font-semibold">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Who is your first customer?"
                    className="w-full mt-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold">Email (Optional)</label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full mt-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full mt-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className="text-sm font-semibold">Project Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g. Kitchen Remodel"
                    className="w-full mt-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Project Address</label>
                  <input
                    type="text"
                    value={formData.jobAddress}
                    onChange={(e) => setFormData({ ...formData, jobAddress: e.target.value })}
                    className="w-full mt-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Project Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    className="w-full mt-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="remodel">Remodel</option>
                    <option value="repair">Repair</option>
                    <option value="new_build">New Build</option>
                    <option value="addition">Addition</option>
                    <option value="kitchen_remodel">Kitchen Remodel</option>
                    <option value="bath_remodel">Bathroom Remodel</option>
                    <option value="roofing">Roofing</option>
                    <option value="siding">Siding</option>
                    <option value="painting">Painting</option>
                    <option value="flooring">Flooring</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="hvac">HVAC</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-subtle)]">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            {step < STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSave}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-center gap-1 mt-6">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === step ? 'bg-[var(--primary)]' : 'bg-[var(--border-subtle)]'
                }`}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function useOnboardingCheck() {
  return storageService.getOnboardingCompleted();
}