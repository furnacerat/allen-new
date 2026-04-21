'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CommandPalette } from './CommandPalette';
import { QuickAddMenu } from './QuickAddMenu';

interface KeyboardShortcutsProps {
  children: React.ReactNode;
}

export function KeyboardShortcuts({ children }: KeyboardShortcutsProps) {
  const router = useRouter();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      return;
    }

    if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setShowShortcuts(true);
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      setQuickAddOpen(true);
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === '1') {
      e.preventDefault();
      router.push('/');
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === '2') {
      e.preventDefault();
      router.push('/customers');
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === '3') {
      e.preventDefault();
      router.push('/jobs');
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === '4') {
      e.preventDefault();
      router.push('/estimates');
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === '5') {
      e.preventDefault();
      router.push('/invoices');
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === ',') {
      e.preventDefault();
      router.push('/settings');
      return;
    }

    if (e.key === 'Escape') {
      setShowShortcuts(false);
    }
  }, [router]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {children}
      <CommandPalette />
      <QuickAddMenu isOpen={quickAddOpen} onToggle={() => setQuickAddOpen(!quickAddOpen)} />
      
      {showShortcuts && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" 
            onClick={() => setShowShortcuts(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] z-50 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
                <button 
                  onClick={() => setShowShortcuts(false)}
                  className="p-2 hover:bg-[var(--primary-subtle)] rounded-lg text-[var(--text-muted)]"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Global</h3>
                <div className="space-y-2">
                  <ShortcutRow shortcut="Cmd + K" description="Open search" />
                  <ShortcutRow shortcut="Cmd + N" description="Quick add menu" />
                  <ShortcutRow shortcut="?" description="Show keyboard shortcuts" />
                  <ShortcutRow shortcut="Esc" description="Close modals / Search" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Navigation</h3>
                <div className="space-y-2">
                  <ShortcutRow shortcut="Cmd + 1" description="Go to Dashboard" />
                  <ShortcutRow shortcut="Cmd + 2" description="Go to Customers" />
                  <ShortcutRow shortcut="Cmd + 3" description="Go to Projects" />
                  <ShortcutRow shortcut="Cmd + 4" description="Go to Estimates" />
                  <ShortcutRow shortcut="Cmd + 5" description="Go to Invoices" />
                  <ShortcutRow shortcut="Cmd + ," description="Go to Settings" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function ShortcutRow({ shortcut, description }: { shortcut: string; description: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{description}</span>
      <kbd className="px-2 py-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded text-xs font-mono">
        {shortcut}
      </kbd>
    </div>
  );
}