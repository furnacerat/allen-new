'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText,
  Receipt,
  Calendar,
  Settings,
  Plus
} from 'lucide-react';

const mobileNavItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/estimates', label: 'Estimates', icon: FileText },
  { href: '/invoices', label: 'Invoices', icon: Receipt },
];

const bottomNavItems = [
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-[var(--header-height)] bg-[var(--bg-card)] border-b border-[var(--border-subtle)] flex items-center justify-between px-4 z-40">
        <Link href="/" className="text-lg font-bold text-[var(--primary)]">
          AC
        </Link>
        <Link 
          href="/jobs/new"
          className="w-9 h-9 bg-[var(--primary)] text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <Plus size={20} />
        </Link>
      </header>

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-subtle)] flex items-center justify-around px-2 py-2 z-50 safe-area-bottom">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-150
                ${isActive 
                  ? 'text-[var(--primary)]' 
                  : 'text-[var(--text-muted)]'
                }
              `}
            >
              <div className={`
                p-1.5 rounded-lg transition-all duration-150
                ${isActive ? 'bg-[var(--primary-subtle)]' : ''}
              `}>
                <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Floating Action Button Area - Used by QuickAddMenu */}
      <style jsx>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
      `}</style>
    </>
  );
}