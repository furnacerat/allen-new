'use client';
import React from 'react';

interface LogoPlaceholderProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LogoPlaceholder({ name, size = 'md', className = '' }: LogoPlaceholderProps) {
  const initial = name ? name.charAt(0).toUpperCase() : 'A';
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-20 h-20 text-3xl'
  };

  return (
    <div 
      className={`
        bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]
        text-white font-bold flex items-center justify-center 
        rounded-2xl shadow-[var(--shadow-sm)]
        ${sizeClasses[size]} 
        ${className}
      `}
    >
      {initial}
    </div>
  );
}
