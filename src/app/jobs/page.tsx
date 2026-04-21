'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge, ListSkeleton, PageHeader, EmptyState } from '@/components/ui';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const allJobs = storageService.getJobs();
    const customers = storageService.getCustomers();
    
    const enrichedJobs = allJobs.map(job => ({
      ...job,
      customerName: customers.find(c => c.id === job.customerId)?.name || 'Unknown'
    }));
    
    setJobs(enrichedJobs);
    setIsLoading(false);
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

  if (isLoading) {
  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-9 w-32 bg-[var(--border-subtle)] rounded animate-pulse" />
          <div className="h-5 w-56 bg-[var(--border-subtle)] rounded animate-pulse" />
        </div>
      </div>
      <div className="h-12 bg-[var(--border-subtle)] rounded animate-pulse" />
      <ListSkeleton count={4} />
    </div>
  );
}

return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Projects"
        description="Track all your active and upcoming construction projects."
        action={
          <Link href="/jobs/new">
            <Button>
              <Plus size={18} />
              New Project
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col md:flex-row items-center gap-4 bg-[var(--bg-card)] p-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text"
            placeholder="Search jobs, customers, or addresses..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm pl-10 pr-4 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-[var(--text-muted)]" />
          <select 
            className="bg-transparent border-none text-sm focus:ring-0 h-11 cursor-pointer"
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
        <Card className="py-12">
          <EmptyState
            icon={<Briefcase size={32} />}
            title={searchQuery ? "No projects found" : "No projects yet"}
            description={searchQuery ? "We couldn't find any projects matching your search." : "Start by creating your first project for a customer."}
            action={
              !searchQuery && (
                <Link href="/jobs/new">
                  <Button>Create First Project</Button>
                </Link>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" hover padding={false}>
                <div className="flex items-center justify-between p-4 lg:p-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="hidden sm:flex w-11 h-11 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] items-center justify-center shrink-0">
                      <Briefcase size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-muted)] mt-1">
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {job.customerName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {job.siteAddress}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {job.targetStartDate || 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={getStatusVariant(job.status)}>
                      {job.status}
                    </Badge>
                    <ChevronRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
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