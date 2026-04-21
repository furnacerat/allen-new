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
  Calendar,
  Sun,
  Moon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { storageService } from '@/lib/storage/storageService';
import { LogoPlaceholder } from '@/components/ui/LogoPlaceholder';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/jobs', label: 'Projects', icon: Briefcase },
  { href: '/estimates', label: 'Estimates', icon: FileText },
  { href: '/invoices', label: 'Invoices', icon: Receipt },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/reports', label: 'Reports', icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [businessName, setBusinessName] = useState("AC");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const settings = storageService.getSettings();
    if (settings?.businessName) {
      setBusinessName(settings.businessName);
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    const newTheme = darkMode ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <aside 
      className={`
        hidden md:flex flex-col 
        bg-[var(--bg-card)] 
        border-r border-[var(--border-subtle)] 
        transition-all duration-300 
        ${collapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]'}
      `}
      style={{ height: '100vh', position: 'sticky', top: 0 }}
    >
      {/* Header */}
      <div className={`p-5 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white font-bold">
              {businessName.charAt(0).toUpperCase()}
            </div>
            <span className="text-lg font-bold tracking-tight text-[var(--text-main)] whitespace-nowrap">
              {businessName}
            </span>
          </div>
        ) : (
          <div className="w-9 h-9 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white font-bold">
            {businessName.charAt(0).toUpperCase()}
          </div>
        )}
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-[var(--primary-subtle)] text-[var(--text-muted)] transition-colors"
          >
            <ChevronLeft size={18} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      
      {collapsed && (
        <div className="flex justify-center pb-3">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-[var(--primary-subtle)] text-[var(--text-muted)] transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 
                px-3 py-2.5 rounded-xl 
                transition-all duration-150
                ${isActive 
                  ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-sm)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)]'
                }
              `}
            >
              <item.icon size={19} strokeWidth={isActive ? 2 : 1.5} />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--border-subtle)] space-y-1">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)] transition-colors w-full"
        >
          {darkMode ? <Sun size={19} strokeWidth={1.5} /> : <Moon size={19} strokeWidth={1.5} />}
          {!collapsed && <span className="font-medium text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        
        {/* Settings */}
        <Link
          href="/settings"
          className={`
            flex items-center gap-3 
            px-3 py-2.5 rounded-xl 
            transition-colors
            ${pathname === '/settings' 
              ? 'bg-[var(--primary)] text-white' 
              : 'text-[var(--text-secondary)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)]'
            }
          `}
        >
          <Settings size={19} strokeWidth={1.5} />
          {!collapsed && <span className="font-medium text-sm">Settings</span>}
        </Link>
      </div>
    </aside>
  );
}