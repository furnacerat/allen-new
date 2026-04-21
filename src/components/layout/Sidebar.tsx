'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Receipt, 
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { storageService } from '@/lib/storage/storageService';
import { LogoPlaceholder } from '@/components/ui/LogoPlaceholder';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/estimates', label: 'Estimates', icon: FileText },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/reports', label: 'Reports', icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [businessName, setBusinessName] = useState("Allen's Contractors");

  useEffect(() => {
    const settings = storageService.getSettings();
    if (settings?.businessName) {
      setBusinessName(settings.businessName);
    }
  }, []);

  return (
    <aside 
      className={`hidden md:flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-card)] transition-all duration-300 ${collapsed ? 'w-20' : 'w-[var(--sidebar-width)]'}`}
      style={{ height: '100vh', position: 'sticky', top: 0 }}
    >
      <div className={`p-6 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <LogoPlaceholder name={businessName} size="sm" />
            <span className="text-lg font-bold tracking-tight text-[var(--primary)] whitespace-nowrap">
              {businessName}
            </span>
          </div>
        ) : (
          <LogoPlaceholder name={businessName} size="sm" />
        )}
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-[var(--primary-subtle)] text-[var(--text-muted)] ml-2"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>
      {collapsed && (
        <div className="flex justify-center pb-4">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-[var(--primary-subtle)] text-[var(--text-muted)]"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-[var(--primary)] text-white' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)]'
              }`}
            >
              <item.icon size={20} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border-subtle)]">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--primary-subtle)] transition-colors ${pathname === '/settings' ? 'bg-[var(--primary-subtle)] text-[var(--primary)]' : ''}`}
        >
          <Settings size={20} />
          {!collapsed && <span className="font-medium">Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
