'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Menu
} from 'lucide-react';

const mobileNavItems = [
  { href: '/', label: 'Dash', icon: LayoutDashboard },
  { href: '/customers', label: 'People', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/estimates', label: 'Estimates', icon: FileText },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[var(--bottom-nav-height)] bg-[var(--bg-card)] border-t border-[var(--border-subtle)] flex items-center justify-around px-2 z-50">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
            }`}
          >
            <item.icon size={22} fill={isActive ? 'var(--primary)' : 'none'} style={{ fillOpacity: 0.1 }} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
          </Link>
        );
      })}
      <Link
        href="/menu"
        className="flex flex-col items-center gap-1 text-[var(--text-muted)] hover:text-[var(--primary)]"
      >
        <Menu size={22} />
        <span className="text-[10px] font-medium uppercase tracking-wider">More</span>
      </Link>
    </nav>
  );
}
