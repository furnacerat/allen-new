import React from 'react';

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
