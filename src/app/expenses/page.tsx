'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight,
  DollarSign,
  Calendar,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';
import { storageService } from '@/lib/storage/storageService';
import { JobExpense } from '@/domain/types';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<JobExpense[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    setExpenses(storageService.getCollection('expenses') as JobExpense[]);
  }, []);

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-[var(--text-muted)]">Track job-related expenses and costs.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-b-4 border-b-[var(--primary)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Total Expenses</p>
              <h3 className="text-2xl font-bold">${totalExpenses.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-xl">
              <Receipt size={20} />
            </div>
          </div>
        </Card>
        <Card className="border-b-4 border-b-[var(--danger)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">This Month</p>
              <h3 className="text-2xl font-bold">$0</h3>
            </div>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <TrendingDown size={20} />
            </div>
          </div>
        </Card>
        <Card className="border-b-4 border-b-[var(--warning)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Pending Receipts</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-[var(--bg-card)] p-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-[var(--shadow-sm)]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text"
            placeholder="Search expenses..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm pl-10 pr-4 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-[var(--text-muted)]" />
          <select 
            className="bg-transparent border-none text-sm focus:ring-0 h-10 cursor-pointer"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="subcontractor">Subcontractor</option>
            <option value="material">Material</option>
            <option value="equipment">Equipment</option>
            <option value="permit">Permit</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-[var(--primary-subtle)] rounded-full flex items-center justify-center text-[var(--primary)] mb-6">
            <Receipt size={40} />
          </div>
          <h2 className="text-xl font-semibold">No expenses found</h2>
          <p className="text-[var(--text-muted)] max-w-xs mx-auto mt-2">
            Start tracking job-related expenses by adding your first entry.
          </p>
          <Button className="mt-8">Add First Expense</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id} className="hover:border-[var(--primary)] transition-all cursor-pointer py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex w-12 h-12 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] items-center justify-center shrink-0">
                    <Receipt size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">{expense.vendor}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-muted)]">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-[var(--primary)]" />
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                      <Badge variant="neutral">{expense.category}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-none pt-4 md:pt-0">
                  <span className="font-bold text-lg">${expense.amount.toLocaleString()}</span>
                  <ChevronRight size={20} className="text-[var(--text-muted)]" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}