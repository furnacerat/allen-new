'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, ArrowRight, User, Briefcase, FileText, Receipt, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { storageService } from '@/lib/storage/storageService';
import { Badge } from '@/components/ui';

const TYPE_FILTERS = [
  { id: 'all', label: 'All', icon: null },
  { id: 'customer', label: 'Customers', icon: User },
  { id: 'job', label: 'Projects', icon: Briefcase },
  { id: 'estimate', label: 'Estimates', icon: FileText },
  { id: 'invoice', label: 'Invoices', icon: Receipt },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setTypeFilter('all');
      setRecentItems(storageService.getViewedItems(5));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      const data = await api.search.global(query);
      const filtered = typeFilter === 'all' ? data : data.filter((r: any) => r.type === typeFilter);
      setResults(filtered);
      setIsLoading(false);
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [query, typeFilter]);

  const handleSelect = (url: string, item?: { id: string; type: string; name: string }) => {
    if (item) {
      storageService.addViewedItem({
        id: item.id,
        type: item.type,
        name: item.name,
        url
      });
    }
    setIsOpen(false);
    router.push(url);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed left-1/2 top-[15%] -translate-x-1/2 w-full max-w-2xl bg-[var(--bg-app)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] z-50 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center px-4 py-4 border-b border-[var(--border-subtle)]">
          <Search className="text-[var(--text-muted)] mr-3 shrink-0" size={24} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-xl outline-none placeholder-[var(--text-muted)]"
            placeholder="Search projects, customers, invoices..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading && <Loader2 className="animate-spin text-[var(--primary)] shrink-0" size={20} />}
          <div className="ml-3 text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-card)] px-2 py-1 rounded border border-[var(--border-subtle)]">ESC</div>
        </div>

        <div className="flex items-center gap-1 px-2 py-2 border-b border-[var(--border-subtle)] overflow-x-auto">
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setTypeFilter(filter.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                typeFilter === filter.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-muted)] hover:bg-[var(--primary-subtle)]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query && results.length === 0 && !isLoading && (
            <div className="py-12 text-center text-[var(--text-muted)]">
              No results found for "{query}"
            </div>
          )}

          {!query && recentItems.length > 0 && (
            <div className="px-4 py-4">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1">
                <Clock size={12} /> Recent
              </p>
              <div className="space-y-1">
                {recentItems.map((item, idx) => (
                  <button
                    key={`${item.type}-${item.id}-${idx}`}
                    onClick={() => handleSelect(item.url, item)}
                    className="w-full flex items-center justify-between p-3 px-4 text-left hover:bg-[var(--primary-subtle)] rounded-xl transition-colors group"
                  >
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{item.type}</p>
                    </div>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {!query && (
            <div className="px-4 py-4">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Quick Actions</p>
              <div className="space-y-1">
                <button onClick={() => handleSelect('/jobs/new')} className="w-full flex items-center p-3 text-left hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)] rounded-xl transition-colors group">
                  <span className="flex-1 font-medium">Create New Project</span>
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button onClick={() => handleSelect('/customers/new')} className="w-full flex items-center p-3 text-left hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)] rounded-xl transition-colors group">
                  <span className="flex-1 font-medium">Add Customer</span>
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button onClick={() => handleSelect('/estimates/new')} className="w-full flex items-center p-3 text-left hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)] rounded-xl transition-colors group">
                  <span className="flex-1 font-medium">New Estimate</span>
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button onClick={() => handleSelect('/invoices/new')} className="w-full flex items-center p-3 text-left hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)] rounded-xl transition-colors group">
                  <span className="flex-1 font-medium">New Invoice</span>
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-1">
              <p className="px-4 py-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Search Results</p>
              {results.map((result, idx) => (
                <button
                  key={`${result.type}-${result.id}-${idx}`}
                  onClick={() => handleSelect(result.url, { id: result.id, type: result.type, name: result.title })}
                  className="w-full flex items-center justify-between p-3 px-4 text-left hover:bg-[var(--primary-subtle)] rounded-xl transition-colors group"
                >
                  <div>
                    <p className="font-bold">{result.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">{result.subtitle}</p>
                  </div>
                  <Badge variant="neutral" className="capitalize text-[10px] bg-[var(--bg-card)] group-hover:bg-white">
                    {result.type}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
