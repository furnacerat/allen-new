'use client';
import React from 'react';
import { Plus, X, Info } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// PREMIUM UI COMPONENTS - Allen's Contractor's Design System
// ═══════════════════════════════════════════════════════════════

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  footer?: React.ReactNode;
  style?: React.CSSProperties;
  hover?: boolean;
  padding?: boolean;
}

export function Card({ 
  children, 
  title, 
  subtitle, 
  className = '', 
  footer, 
  style,
  hover = false,
  padding = true
}: CardProps) {
  return (
    <div 
      className={`
        bg-[var(--bg-card)] 
        border border-[var(--border-subtle)] 
        rounded-[var(--radius-xl)] 
        shadow-[var(--shadow-card)] 
        overflow-hidden 
        flex flex-col 
        transition-all duration-200
        ${hover ? 'hover:shadow-[var(--shadow-md)] hover:border-[var(--border-default)]' : ''}
        ${className}
      `}
      style={style}
    >
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
          {title && (
            <h3 className="text-lg font-semibold text-[var(--text-main)] tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={padding ? 'flex-1 p-6' : 'flex-1'}>
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

// ═══════════════════════════════════════════════════════════════
// BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════

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
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center 
    rounded-[var(--radius-lg)] 
    font-medium 
    transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]
    disabled:opacity-50 disabled:pointer-events-none
    active:scale-[0.98]
  `;
  
  const variants = {
    primary: `
      bg-[var(--primary)] 
      text-white 
      hover:bg-[var(--primary-hover)]
      shadow-[var(--shadow-sm)]
      hover:shadow-[var(--shadow-md)]
    `,
    secondary: `
      bg-[var(--secondary)] 
      text-white 
      hover:bg-[var(--secondary-hover)]
      shadow-[var(--shadow-sm)]
    `,
    outline: `
      border border-[var(--border-subtle)] 
      bg-transparent 
      hover:bg-[var(--primary-subtle)] 
      hover:text-[var(--primary)]
      hover:border-[var(--primary)]
    `,
    ghost: `
      bg-transparent 
      text-[var(--text-secondary)] 
      hover:bg-[var(--primary-subtle)] 
      hover:text-[var(--primary)]
    `,
    danger: `
      bg-[var(--danger)] 
      bg-[var(--danger)]
      text-white 
      hover:opacity-90
    `,
  };
  
  const sizes = {
    sm: 'h-9 px-4 text-sm gap-2',
    md: 'h-11 px-5 text-base gap-2',
    lg: 'h-12 px-6 text-base gap-2',
    icon: 'h-11 w-11',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'lead' | 'active';

interface BadgeProps {
  children: React.ReactNode; 
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const badgeStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-[var(--bg-app)] text-[var(--text-tertiary)]',
  success: 'bg-[var(--success-subtle)] text-[var(--success)]',
  warning: 'bg-[var(--warning-subtle)] text-[var(--warning)]',
  danger: 'bg-[var(--danger-subtle)] text-[var(--danger)]',
  info: 'bg-[var(--primary-subtle)] text-[var(--primary)]',
  lead: 'bg-slate-100 text-slate-600',
  active: 'bg-emerald-100 text-emerald-700',
};

export function Badge({ children, variant = 'neutral', className = '', dot }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1.5
      px-2.5 py-1 
      rounded-full 
      text-xs font-semibold 
      tracking-wide
      ${badgeStyles[variant]} 
      ${className}
    `}>
      {dot && (
        <span className={`
          w-1.5 h-1.5 
          rounded-full 
          ${variant === 'success' ? 'bg-[var(--success)]' : ''}
          ${variant === 'warning' ? 'bg-[var(--warning)]' : ''}
          ${variant === 'danger' ? 'bg-[var(--danger)]' : ''}
          ${variant === 'info' ? 'bg-[var(--primary)]' : ''}
          ${variant === 'neutral' ? 'bg-[var(--text-muted)]' : ''}
        `} />
      )}
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// TABS COMPONENT
// ═══════════════════════════════════════════════════════════════

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex items-center gap-1 border-b border-[var(--border-subtle)] mb-8 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 
              px-5 py-3 
              text-sm font-medium 
              transition-all duration-150
              relative
              whitespace-nowrap
              ${isActive 
                ? 'text-[var(--primary)]' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--primary-subtle)]/50'
              }
            `}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`
                px-1.5 py-0.5 
                rounded-full 
                text-xs
                ${isActive ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border-subtle)]'}
              `}>
                {tab.count}
              </span>
            )}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-lg' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
      
      {/* Modal */}
      <div 
        className={`
          relative
          bg-[var(--bg-card)] 
          border border-[var(--border-subtle)] 
          rounded-[var(--radius-xl)] 
          shadow-[var(--shadow-xl)] 
          w-full ${maxWidth} 
          overflow-hidden 
          animate-in scale-in-95 duration-200
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[var(--text-main)]">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--primary-subtle)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-[var(--bg-app)] border-t border-[var(--border-subtle)] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// INPUT COMPONENT
// ═══════════════════════════════════════════════════════

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full 
            h-12 
            px-4 
            bg-[var(--bg-app)] 
            border border-[var(--border-subtle)] 
            rounded-[var(--radius-lg)] 
            text-[var(--text-main)] 
            placeholder:text-[var(--text-muted)]
            transition-all duration-150
            focus:outline-none 
            focus:border-[var(--primary)] 
            focus:ring-2 focus:ring-[var(--primary-subtle)]
            disabled:opacity-50
            ${icon ? 'pl-11' : ''}
            ${error ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger-subtle)]' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-[var(--danger)]">{error}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE COMPONENT
// ═══════════════════════════════════════════════════════════════

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      {icon && (
        <div className="w-16 h-16 bg-[var(--primary-subtle)] rounded-2xl flex items-center justify-center text-[var(--primary)] mb-6">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-[var(--text-main)] mb-2">{title}</h3>
      {description && (
        <p className="text-[var(--text-muted)] text-center max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SKELETON LOADING COMPONENTS
// ═══════════════════════════════════════════════════════════════

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded-[var(--radius-sm)]',
    circular: 'rounded-full',
    rectangular: 'rounded-[var(--radius-md)]'
  };
  
  return (
    <div className={`animate-pulse bg-[var(--border-subtle)] ${variants[variant]} ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12" variant="rectangular" />
        <div className="flex-1 space-y-3">
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

// ═══════════════════════════════════════════════════════════════
// PAGE HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 ${className}`}>
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">{title}</h1>
        {description && (
          <p className="text-[var(--text-muted)] mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION COMPONENT
// ═══════════════════════════════════════════════════════════════

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export function Section({ children, className = '' }: SectionProps) {
  return <div className={`space-y-6 ${className}`}>{children}</div>;
}