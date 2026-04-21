'use client';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './index';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] max-w-md w-full rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--border-subtle)] overflow-hidden scale-in-center animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          <p className="text-[var(--text-muted)] text-sm mb-8 leading-relaxed">
            {message}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant={variant === 'danger' ? 'danger' : 'primary'} 
              className="flex-1" 
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
