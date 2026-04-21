'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { 
  Briefcase, 
  Search, 
  Plus, 
  MapPin, 
  User, 
  Clock, 
  ChevronRight,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { storageService } from '@/lib/storage/storageService';
import { Job, Customer, JobStatus } from '@/domain/types';

export default function JobsPage() {
  const [jobs, setJobs] = useState<(Job & { customerName?: string })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const allJobs = storageService.getJobs();
    const customers = storageService.getCustomers();
    
    const enrichedJobs = allJobs.map(job => ({
      ...job,
      customerName: customers.find(c => c.id === job.customerId)?.name || 'Unknown'
    }));
    
    setJobs(enrichedJobs);
  }, []);

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          j.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          j.siteAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: JobStatus) => {
    switch (status) {
      case 'in progress': return 'success';
      case 'lead': case 'estimating': return 'info';
      case 'approved': return 'info';
      case 'on hold': return 'warning';
      case 'completed': return 'neutral';
      case 'archived': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs & Projects</h1>
          <p className="text-[var(--text-muted)]">Track all your active and upcoming construction projects.</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </header>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-[var(--bg-card)] p-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-[var(--shadow-sm)]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text"
            placeholder="Search jobs, customers, or addresses..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm pl-10 pr-4 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-[var(--text-muted)]" />
          <select 
            className="bg-transparent border-none text-sm focus:ring-0 h-10 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="lead">Lead</option>
            <option value="estimating">Estimating</option>
            <option value="approved">Approved</option>
            <option value="in progress">In Progress</option>
            <option value="on hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-[var(--primary-subtle)] rounded-full flex items-center justify-center text-[var(--primary)] mb-6">
            <Briefcase size={40} />
          </div>
          <h2 className="text-xl font-semibold">No jobs found</h2>
          <p className="text-[var(--text-muted)] max-w-xs mx-auto mt-2">
            {searchQuery ? "We couldn't find any projects matching your search." : "You haven't added any jobs yet. Start by creating a project for a customer."}
          </p>
          {!searchQuery && (
            <Link href="/jobs/new" className="mt-8">
              <Button>Create First Job</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="group hover:border-[var(--primary)] transition-all cursor-pointer py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:flex w-12 h-12 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] items-center justify-center shrink-0">
                      <Briefcase size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg group-hover:text-[var(--primary)] transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-muted)]">
                        <div className="flex items-center gap-1">
                          <User size={14} className="text-[var(--primary)]" />
                          <span>{job.customerName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-[var(--primary)]" />
                          <span>{job.siteAddress}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-[var(--primary)]" />
                          <span>Target: {job.targetStartDate || 'TBD'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-none pt-4 md:pt-0">
                    <Badge variant={getStatusVariant(job.status)}>
                      {job.status}
                    </Badge>
                    <div className="text-[var(--text-muted)] md:block hidden">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
