import React from 'react';
import { Plus } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Card({ children, title, subtitle, className = '', footer, style }: CardProps) {
  return (
    <div 
      className={`bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] overflow-hidden flex flex-col ${className}`}
      style={style}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
          {title && <h3 className="text-lg font-semibold text-[var(--text-main)]">{title}</h3>}
          {subtitle && <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>}
        </div>
      )}
      <div className="flex-1 p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-[var(--primary-subtle)] border-t border-[var(--border-subtle)]">
          {footer}
        </div>
      )}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-[var(--shadow-sm)]',
    secondary: 'bg-[var(--secondary)] text-white hover:opacity-90',
    outline: 'border border-[var(--border-subtle)] bg-transparent hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)]',
    ghost: 'hover:bg-[var(--primary-subtle)] text-[var(--text-muted)] hover:text-[var(--primary)]',
    danger: 'bg-[var(--danger)] text-white hover:opacity-90',
  };
  
  const sizes = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-11 px-6 text-sm',
    lg: 'h-14 px-8 text-base',
    icon: 'h-10 w-10',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
}

export function Badge({ children, variant = 'neutral', className = '' }: { children: React.ReactNode, variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info', className?: string }) {
  const styles = {
    neutral: 'bg-[var(--bg-app)] text-[var(--text-muted)]',
    success: 'bg-[hsl(150,84%,95%)] text-[var(--success)]',
    warning: 'bg-[hsl(38,92%,95%)] text-[var(--warning)]',
    danger: 'bg-[hsl(0,84%,95%)] text-[var(--danger)]',
    info: 'bg-[var(--primary-subtle)] text-[var(--primary)]',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex items-center gap-1 border-b border-[var(--border-subtle)] mb-6 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative
              ${isActive 
                ? 'text-[var(--primary)]' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--primary-subtle)]/30'}
            `}
          >
            {tab.icon && tab.icon}
            {tab.label}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)] animate-in slide-in-from-left-full duration-300" />
            )}
          </button>
        );
      })}
    </div>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className={`bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full ${maxWidth} overflow-hidden animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-main)]">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[var(--primary-subtle)] rounded-full text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
          >
            <Plus className="rotate-45" size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 bg-[var(--primary-subtle)]/30 border-t border-[var(--border-subtle)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-[var(--radius-md)]'
  };
  
  return (
    <div className={`animate-pulse bg-[var(--border-subtle)] ${variants[variant]} ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12" variant="rectangular" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-1/3 h-5" variant="text" />
          <Skeleton className="w-1/2 h-4" variant="text" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="w-full h-4" variant="text" />
        <Skeleton className="w-4/5 h-4" variant="text" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
