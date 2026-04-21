'use client';
import { Card, Button, Badge, PageHeader, EmptyState } from '@/components/ui';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Plus,
  ArrowUpRight,
  MapPin,
  Clock,
  ChevronRight,
  FileText,
  Receipt,
  BarChart3,
  Calendar,
  Sparkles
} from 'lucide-react';
import { storageService } from '@/lib/storage/storageService';
import { useEffect, useState } from 'react';
import { Job, Customer, BusinessProfile } from '@/domain/types';
import Link from 'next/link';
import { reportService } from '@/lib/reports/reportService';

export default function Dashboard() {
  const [data, setData] = useState<{
    jobs: Job[],
    customers: Customer[],
    settings: BusinessProfile
  } | null>(null);

  const [businessHealth, setBusinessHealth] = useState<any>(null);

  useEffect(() => {
    setData({
      jobs: storageService.getJobs(),
      customers: storageService.getCustomers(),
      settings: storageService.getSettings()
    });
    setBusinessHealth(reportService.getBusinessKPIs());
  }, []);

  if (!data) return null;

  const { jobs, customers, settings } = data;

  const activeProjects = jobs.filter(j => j.status === 'in progress').length;
  const totalRevenue = businessHealth?.grossProfit || 0;

  const kpis = [
    { 
      label: 'Total', 
      title: 'Customers', 
      value: customers.length, 
      icon: Users, 
      color: 'var(--primary)',
      bg: 'var(--primary-subtle)'
    },
    { 
      label: 'Active', 
      title: 'Projects', 
      value: activeProjects, 
      icon: Briefcase, 
      color: 'var(--success)',
      bg: 'var(--success-subtle)'
    },
    { 
      label: 'Revenue', 
      title: 'Gross Profit', 
      value: `$${(totalRevenue / 1000).toFixed(1)}k`, 
      icon: TrendingUp, 
      color: 'var(--info)',
      bg: 'var(--info-bg)'
    },
    { 
      label: 'Current', 
      title: 'Avg Margin', 
      value: `${businessHealth?.avgMargin || 0}%`, 
      icon: ArrowUpRight, 
      color: 'var(--warning)',
      bg: 'var(--warning-subtle)'
    },
  ];

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  return (
    <div className="space-y-8 animate-in">
      {/* Page Header */}
      <PageHeader
        title={`${getTimeGreeting()}, ${settings.businessName.split("'")[0]}`}
        description="Here's what's happening with your business today."
        action={
          <Link href="/jobs/new">
            <Button>
              <Plus size={18} />
              New Project
            </Button>
          </Link>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {kpis.map((kpi, idx) => (
          <Card 
            key={kpi.title} 
            className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-default"
            hover
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  {kpi.label}
                </p>
                <div className="text-2xl lg:text-3xl font-bold text-[var(--text-main)] tracking-tight">
                  {kpi.value}
                </div>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">{kpi.title}</p>
              </div>
              <div 
                className="p-2.5 lg:p-3 rounded-xl"
                style={{ backgroundColor: kpi.bg, color: kpi.color }}
              >
                <kpi.icon size={20} strokeWidth={2} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Projects - Takes 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--text-main)]">Recent Projects</h2>
            <Link href="/jobs" className="text-sm font-medium text-[var(--primary)] hover:underline">
              View All
            </Link>
          </div>
          
          {recentJobs.length === 0 ? (
            <Card className="py-12">
              <EmptyState
                icon={<Briefcase size={32} />}
                title="No projects yet"
                description="Create your first project to start tracking jobs and estimating costs."
                action={
                  <Link href="/jobs/new">
                    <Button>Create First Project</Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            <Card className="p-0" padding={false}>
              <div className="divide-y divide-[var(--border-subtle)]">
                {recentJobs.map((job) => (
                  <Link 
                    key={job.id} 
                    href={`/jobs/${job.id}`} 
                    className="flex items-center justify-between p-4 lg:p-5 hover:bg-[var(--primary-subtle)] transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center shrink-0">
                        <Briefcase size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-[var(--text-main)] truncate">{job.title}</div>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {job.siteAddress || 'No address'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(job.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={job.status === 'in progress' ? 'success' : job.status === 'lead' ? 'lead' : 'info'}>
                        {job.status}
                      </Badge>
                      <ChevronRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - Takes 1/3 width */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card title="Quick Actions" subtitle="Start new work">
            <div className="space-y-2">
              <Link href="/customers/new">
                <Button variant="outline" className="w-full justify-start h-11">
                  <Users size={18} />
                  <span className="ml-2">Add Customer</span>
                </Button>
              </Link>
              <Link href="/jobs/new">
                <Button variant="outline" className="w-full justify-start h-11">
                  <Briefcase size={18} />
                  <span className="ml-2">New Project</span>
                </Button>
              </Link>
              <Link href="/estimates/new">
                <Button variant="outline" className="w-full justify-start h-11">
                  <FileText size={18} />
                  <span className="ml-2">Create Estimate</span>
                </Button>
              </Link>
              <Link href="/invoices/new">
                <Button variant="outline" className="w-full justify-start h-11">
                  <Receipt size={18} />
                  <span className="ml-2">Send Invoice</span>
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className="w-full justify-start h-11">
                  <BarChart3 size={18} />
                  <span className="ml-2">Reports</span>
                </Button>
              </Link>
            </div>
          </Card>

          {/* Upcoming */}
          <Card title="Upcoming Starts">
            <div className="space-y-3">
              {jobs.filter(j => j.targetStartDate).slice(0, 3).map(job => (
                <div key={job.id} className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-lg bg-[var(--primary-subtle)] flex flex-col items-center justify-center text-[var(--primary)] shrink-0">
                    <span className="text-[9px] font-bold uppercase">
                      {new Date(job.targetStartDate!).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-sm font-bold leading-none">
                      {new Date(job.targetStartDate!).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-[var(--text-main)] truncate">{job.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">Start Date</p>
                  </div>
                </div>
              ))}
              {jobs.filter(j => j.targetStartDate).length === 0 && (
                <p className="text-sm text-[var(--text-muted)] text-center py-4">No upcoming starts scheduled.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}