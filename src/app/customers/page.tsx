'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge, ListSkeleton } from '@/components/ui';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { storageService } from '@/lib/storage/storageService';
import { Customer } from '@/domain/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCustomers(storageService.getCustomers());
    setIsLoading(false);
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-9 w-40 bg-[var(--border-subtle)] rounded animate-pulse" />
            <div className="h-5 w-56 bg-[var(--border-subtle)] rounded animate-pulse" />
          </div>
        </div>
        <div className="h-12 bg-[var(--border-subtle)] rounded animate-pulse" />
        <ListSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-[var(--text-muted)]">Manage your client directory and contact info.</p>
        </div>
        <Link href="/customers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </Link>
      </header>

      <div className="flex items-center gap-4 bg-[var(--bg-card)] p-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-[var(--shadow-sm)]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text"
            placeholder="Search customers by name, email, or company..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm pl-10 pr-4 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="hidden md:flex">Filter</Button>
      </div>

      {filteredCustomers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-[var(--primary-subtle)] rounded-full flex items-center justify-center text-[var(--primary)] mb-6">
            <Users size={40} />
          </div>
          <h2 className="text-xl font-semibold">No customers found</h2>
          <p className="text-[var(--text-muted)] max-w-xs mx-auto mt-2">
            {searchQuery ? "We couldn't find any customers matching your search." : "Your customer list is currently empty. Add your first client to get started."}
          </p>
          {!searchQuery && (
            <Link href="/customers/new" className="mt-8">
              <Button>Create Customer Profile</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="group hover:border-[var(--primary)] transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--secondary)] text-white flex items-center justify-center font-bold text-lg">
                    {customer.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-[var(--primary)] transition-colors line-clamp-1">{customer.name}</h3>
                    {customer.companyName && <p className="text-xs text-[var(--text-muted)]">{customer.companyName}</p>}
                  </div>
                </div>
                <button className="text-[var(--text-muted)] hover:text-[var(--primary)] p-1">
                  <MoreVertical size={20} />
                </button>
              </div>
              
              <div className="space-y-3 mt-6 pt-6 border-t border-[var(--border-subtle)]">
                {customer.phone && (
                  <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    <Phone size={16} className="text-[var(--primary)]" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    <Mail size={16} className="text-[var(--primary)]" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    <MapPin size={16} className="text-[var(--primary)]" />
                    <span className="line-clamp-1">{customer.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Profile
                </Button>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ExternalLink size={18} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
