'use client';
import { Card, Button, Badge } from '@/components/ui';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  AlertCircle,
  Plus,
  ArrowUpRight,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  FileText,
  Receipt,
  BarChart3
} from 'lucide-react';
import { storageService } from '@/lib/storage/storageService';
import { useEffect, useState } from 'react';
import { Job, Customer, BusinessProfile } from '@/domain/types';
import Link from 'next/link';
import { reportService } from '@/lib/reports/reportService';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<{
    jobs: Job[],
    customers: Customer[],
    settings: BusinessProfile
  } | null>(null);

  useEffect(() => {
    setData({
      jobs: storageService.getJobs(),
      customers: storageService.getCustomers(),
      settings: storageService.getSettings()
    });
    setBusinessHealth(reportService.getBusinessKPIs());
    setRecentTrends(reportService.getFinancialTrends(6));
  }, []);

  const [businessHealth, setBusinessHealth] = useState<any>(null);
  const [recentTrends, setRecentTrends] = useState<any[]>([]);

  if (!data) return null;

  const { jobs, customers, settings } = data;

  const kpis = [
    { label: 'Network', title: 'Customers', value: customers.length, icon: Users, color: 'var(--primary)' },
    { label: 'Active', title: 'Projects', value: jobs.filter(j => j.status === 'in progress').length, icon: Briefcase, color: 'var(--success)' },
    { label: 'Profit', title: 'Gross Profit', value: businessHealth ? `$${(businessHealth.grossProfit / 1000).toFixed(1)}k` : '...', icon: TrendingUp, color: 'var(--info)' },
    { label: 'Efficiency', title: 'Avg Margin', value: businessHealth ? `${businessHealth.avgMargin}%` : '...', icon: ArrowUpRight, color: 'var(--warning)' },
  ];

  const recentJobs = [...jobs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-main)]">
            Morning, {settings.businessName.split("'")[0]}
          </h1>
          <p className="text-[var(--text-muted)]">Here's what's happening across your projects today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/jobs/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Job
            </Button>
          </Link>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="hover:border-[var(--primary)] transition-all cursor-default group border-b-4" style={{ borderBottomColor: kpi.color }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">
                  {kpi.label}
                </p>
                <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-1">{kpi.title}</h3>
                <div className="text-3xl font-bold">{kpi.value}</div>
              </div>
              <div 
                className="p-3 rounded-2xl transition-all group-hover:scale-110 duration-300"
                style={{ backgroundColor: `${kpi.color}10`, color: kpi.color }}
              >
                <kpi.icon size={24} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold">Recent Projects</h2>
            <Link href="/jobs" className="text-sm font-medium text-[var(--primary)] hover:underline">View All</Link>
          </div>
          <Card className="p-0">
            {recentJobs.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-[var(--text-muted)]">No projects tracked yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {recentJobs.map(job => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="block hover:bg-[var(--primary-subtle)] transition-colors p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-bold flex items-center gap-2">
                          {job.title}
                          <Badge variant={job.status === 'in progress' ? 'success' : 'info'}>{job.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {job.siteAddress}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {new Date(job.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-[var(--text-muted)]" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Business Overview Sidebar */}
        <div className="space-y-8">
          <Card title="Quick Actions">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/customers/new" className="col-span-2">
                <Button variant="outline" className="w-full justify-start h-12">
                  <Users className="mr-3 h-4 w-4 text-[var(--primary)]" />
                  Add Customer
                </Button>
              </Link>
              <Link href="/jobs/new" className="col-span-2">
                <Button variant="outline" className="w-full justify-start h-12">
                  <Briefcase className="mr-3 h-4 w-4 text-[var(--primary)]" />
                  Create Project
                </Button>
              </Link>
              <Link href="/estimates/new" className="col-span-2">
                <Button variant="outline" className="w-full justify-start h-12">
                  <FileText className="mr-3 h-4 w-4 text-[var(--primary)]" />
                  New Estimate
                </Button>
              </Link>
              <Link href="/invoices/new" className="col-span-2">
                <Button variant="outline" className="w-full justify-start h-12">
                  <Receipt className="mr-3 h-4 w-4 text-[var(--primary)]" />
                  New Invoice
                </Button>
              </Link>
              <Link href="/reports" className="col-span-2">
                <Button variant="outline" className="w-full justify-start h-12 bg-indigo-50 border-indigo-100 hover:bg-indigo-100 transition-colors">
                  <BarChart3 className="mr-3 h-4 w-4 text-indigo-600" />
                  Business Reports
                </Button>
              </Link>
            </div>
          </Card>

          <Card title="Upcoming Milestones">
            <div className="space-y-4">
              {jobs.filter(j => j.targetStartDate).slice(0, 3).map(job => (
                <div key={job.id} className="flex gap-4 items-start">
                   <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] flex flex-col items-center justify-center text-[var(--primary)] shrink-0">
                      <span className="text-[10px] font-bold uppercase">{new Date(job.targetStartDate!).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-sm font-bold leading-none">{new Date(job.targetStartDate!).getDate()}</span>
                   </div>
                   <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{job.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">Project Start</p>
                   </div>
                </div>
              ))}
              {jobs.filter(j => j.targetStartDate).length === 0 && (
                <p className="text-sm text-[var(--text-muted)] italic text-center py-4">No scheduled starts.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
