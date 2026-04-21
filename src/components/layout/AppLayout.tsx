'use client';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { storageService } from '@/lib/storage/storageService';
import { OnboardingFlow } from './OnboardingFlow';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [businessName, setBusinessName] = useState("Allen's Contractors");
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const settings = storageService.getSettings();
    if (settings?.businessName) {
      setBusinessName(settings.businessName);
    }
    setOnboardingComplete(storageService.getOnboardingCompleted());
  }, []);

  // Check for theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  if (onboardingComplete === null) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-app)]">
      <KeyboardShortcuts>
        {!onboardingComplete ? (
          <OnboardingFlow />
        ) : (
          <>
            {/* Desktop Sidebar */}
            <Sidebar />
            
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col">
              {/* Mobile Header */}
              <header className="md:hidden flex items-center justify-between px-5 py-4 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] sticky top-0 z-40">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {businessName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-[var(--text-main)]">{businessName}</span>
                </div>
              </header>
              
              {/* Page Content */}
              <div className="flex-1 p-5 md:p-8 lg:p-10 max-w-[1800px] mx-auto w-full animate-in">
                {children}
              </div>
            </main>
            
            {/* Mobile Navigation */}
            <MobileNav />
          </>
        )}
      </KeyboardShortcuts>
    </div>
  );
}