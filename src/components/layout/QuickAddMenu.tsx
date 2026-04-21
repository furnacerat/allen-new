'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, User, Briefcase, FileText, Receipt, Search } from 'lucide-react';

interface QuickAddMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function QuickAddMenu({ isOpen, onToggle }: QuickAddMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const handleNavigate = (path: string) => {
    router.push(path);
    onToggle();
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-lg hover:bg-[var(--primary-hover)] transition-all flex items-center justify-center z-40"
      >
        <Plus size={28} />
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" />
      <div ref={menuRef} className="fixed bottom-20 right-6 w-72 bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] z-50 overflow-hidden animate-in slide-in-from-bottom-full duration-200">
        <div className="p-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Quick Add</h3>
            <button onClick={onToggle} className="p-1 hover:bg-[var(--primary-subtle)] rounded-full">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="p-2 space-y-1">
          <button
            onClick={() => handleNavigate('/customers/new')}
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-[var(--primary-subtle)] rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-[var(--primary-subtle)] rounded-xl flex items-center justify-center text-[var(--primary)]">
              <User size={20} />
            </div>
            <div>
              <p className="font-medium">New Customer</p>
              <p className="text-xs text-[var(--text-muted)]">Add a new client</p>
            </div>
          </button>
          <button
            onClick={() => handleNavigate('/jobs/new')}
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-[var(--primary-subtle)] rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-[var(--primary-subtle)] rounded-xl flex items-center justify-center text-[var(--primary)]">
              <Briefcase size={20} />
            </div>
            <div>
              <p className="font-medium">New Project</p>
              <p className="text-xs text-[var(--text-muted)]">Start a new job</p>
            </div>
          </button>
          <button
            onClick={() => handleNavigate('/estimates/new')}
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-[var(--primary-subtle)] rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-[var(--primary-subtle)] rounded-xl flex items-center justify-center text-[var(--primary)]">
              <FileText size={20} />
            </div>
            <div>
              <p className="font-medium">New Estimate</p>
              <p className="text-xs text-[var(--text-muted)]">Create a quote</p>
            </div>
          </button>
          <button
            onClick={() => handleNavigate('/invoices/new')}
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-[var(--primary-subtle)] rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-[var(--primary-subtle)] rounded-xl flex items-center justify-center text-[var(--primary)]">
              <Receipt size={20} />
            </div>
            <div>
              <p className="font-medium">New Invoice</p>
              <p className="text-xs text-[var(--text-muted)]">Bill a customer</p>
            </div>
          </button>
        </div>
        <div className="p-2 border-t border-[var(--border-subtle)]">
          <button
            onClick={() => handleNavigate('/')}
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-[var(--primary-subtle)] rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-[var(--bg-app)] rounded-xl flex items-center justify-center text-[var(--text-muted)]">
              <Search size={20} />
            </div>
            <div>
              <p className="font-medium">Search Everything</p>
              <p className="text-xs text-[var(--text-muted)]">Cmd+K</p>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}