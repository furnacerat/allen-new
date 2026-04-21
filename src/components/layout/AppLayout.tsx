'use client';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { KeyboardShortcuts } from './KeyboardShortcuts';

import { LogoPlaceholder } from '@/components/ui/LogoPlaceholder';
import { storageService } from '@/lib/storage/storageService';
import { useEffect, useState } from 'react';
import { OnboardingFlow, useOnboardingCheck } from './OnboardingFlow';

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

  if (onboardingComplete === null) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-app)]">
      <KeyboardShortcuts>
        {!onboardingComplete ? (
          <OnboardingFlow />
        ) : (
          <>
            <Sidebar />
            <main className="flex-1 flex flex-col pb-[calc(var(--bottom-nav-height)+40px)] md:pb-0">
              <header className="md:hidden flex items-center justify-between px-6 h-[var(--header-height)] bg-[var(--bg-card)] border-b border-[var(--border-subtle)] sticky top-0 z-40">
                <span className="text-lg font-bold text-[var(--primary)]">{businessName}</span>
                <LogoPlaceholder name={businessName} size="sm" />
              </header>
              <div className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                {children}
              </div>
            </main>
            <MobileNav />
          </>
        )}
      </KeyboardShortcuts>
    </div>
  );
}
