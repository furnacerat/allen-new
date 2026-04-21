'use client';
import { useState, useEffect } from 'react';
import { Badge, Button, Card, Tabs } from '@/components/ui';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Users, 
  Briefcase, 
  Calendar,
  Filter,
  Printer,
  Download,
  Percent,
  ChevronRight,
  PieChart as PieIcon,
  ArrowUpRight,
  Calculator
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { reportService, MonthlyMetric, CategoryData, JobProfitability } from '@/lib/reports/reportService';
import { storageService } from '@/lib/storage/storageService';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('financials');
  const [stats, setStats] = useState<any>(null);
  const [financialTrends, setFinancialTrends] = useState<MonthlyMetric[]>([]);
  const [expenses, setExpenses] = useState<CategoryData[]>([]);
  const [jobTypes, setJobTypes] = useState<CategoryData[]>([]);
  const [profitability, setProfitability] = useState<JobProfitability[]>([]);
  const [customerValue, setCustomerValue] = useState<any[]>([]);
  const [salesStats, setSalesStats] = useState<any>(null);
  const [laborVsMaterial, setLaborVsMaterial] = useState<CategoryData[]>([]);

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = () => {
    setStats(reportService.getBusinessKPIs());
    setFinancialTrends(reportService.getFinancialTrends());
    setExpenses(reportService.getExpenseBreakdown());
    setJobTypes(reportService.getJobTypeDistribution());
    setProfitability(reportService.getJobProfitabilityReport());
    setCustomerValue(reportService.getCustomerValueSummary());
    setSalesStats(reportService.getEstimateStats());
    setLaborVsMaterial(reportService.getLaborVsMaterialComparison());
  };

  if (!stats) return null;

  const tabs = [
    { id: 'financials', label: 'Financials', icon: <DollarSign size={16} /> },
    { id: 'sales', label: 'Sales & Estimates', icon: <Target size={16} /> },
    { id: 'operations', label: 'Operations', icon: <Briefcase size={16} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={16} /> },
  ];

  const StatCard = ({ title, value, subValue, trend, icon: Icon, color }: any) => (
    <Card className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">{title}</p>
            <h3 className="text-3xl font-black tracking-tight">{value}</h3>
          </div>
          <div className="flex items-center gap-2">
            {trend && (
              <span className={`flex items-center text-[10px] font-black px-1.5 py-0.5 rounded ${
                trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {trend === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                {subValue}
              </span>
            )}
            {!trend && <span className="text-xs text-[var(--text-muted)] font-medium">{subValue}</span>}
          </div>
        </div>
        <div className={`p-4 rounded-2xl bg-opacity-10 group-hover:scale-110 transition-transform duration-300`} style={{ backgroundColor: `${color}20`, color }}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
             <BarChart3 className="text-[var(--primary)]" size={32} />
             Business Intelligence
          </h1>
          <p className="text-[var(--text-muted)]">Real-time performance analytics and growth metrics.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
           </Button>
           <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print Report
           </Button>
        </div>
      </header>

      {/* High Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${(stats.totalRevenue / 1000).toFixed(1)}k`} 
          subValue="Revenue Direction"
          trend={stats.trendDirection}
          icon={DollarSign}
          color="#6366f1"
        />
        <StatCard 
          title="Gross Profit" 
          value={`$${(stats.grossProfit / 1000).toFixed(1)}k`} 
          subValue={`${stats.avgMargin}% Avg Margin`}
          icon={TrendingUp}
          color="#10b981"
        />
        <StatCard 
          title="Avg Job Size" 
          value={`$${stats.avgJobSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          subValue={`${stats.openJobs} Active Projects`}
          icon={Calculator}
          color="#f59e0b"
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${salesStats?.winRate || 0}%`} 
          subValue={`${salesStats?.approved || 0} Wins / ${salesStats?.rejected || 0} Losses`}
          icon={Target}
          color="#3b82f6"
        />
      </div>

      <div className="space-y-6">
         <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
         
         {activeTab === 'financials' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card title="Monthly Revenue vs Expenses" className="lg:col-span-2">
                 <div className="h-[400px] mt-8">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={financialTrends}>
                          <defs>
                             <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                             </linearGradient>
                             <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                          <XAxis 
                             dataKey="month" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }}
                          />
                          <YAxis 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }}
                             tickFormatter={(value) => `$${value / 1000}k`}
                          />
                          <Tooltip 
                             contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '16px', fontSize: '12px' }}
                             itemStyle={{ fontWeight: 600 }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 800 }} />
                          <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                          <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </Card>

              <Card title="Expense Distribution">
                 <div className="h-[300px] mt-8">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={expenses}
                             cx="50%"
                             cy="50%"
                             innerRadius={60}
                             outerRadius={100}
                             paddingAngle={5}
                             dataKey="value"
                          >
                             {expenses.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                          </Pie>
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 600 }} />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-6 space-y-3">
                    {expenses.slice(0, 3).map((exp, idx) => (
                       <div key={exp.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                             <span className="text-xs font-medium text-[var(--text-muted)]">{exp.name}</span>
                          </div>
                          <span className="text-xs font-bold">${exp.value.toLocaleString()}</span>
                       </div>
                    ))}
                 </div>
              </Card>

              <Card title="Job Profitability Ranking" className="lg:col-span-3">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                             <th className="px-6 py-4">Project Title</th>
                             <th className="px-6 py-4 text-right">Contract Amount</th>
                             <th className="px-6 py-4 text-right">Actual Cost</th>
                             <th className="px-6 py-4 text-right">Net Profit</th>
                             <th className="px-6 py-4 text-right">Margin (%)</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-[var(--border-subtle)]">
                          {profitability.map((job) => (
                             <tr key={job.jobTitle} className="hover:bg-[var(--primary-subtle)] transition-colors">
                                <td className="px-6 py-4 font-bold text-sm">{job.jobTitle}</td>
                                <td className="px-6 py-4 text-right text-sm">${job.contractAmount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right text-sm text-[var(--text-muted)]">${job.actualCost.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right text-sm font-black text-green-600">${job.profit.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">
                                   <Badge variant={job.margin > 20 ? 'success' : job.margin > 10 ? 'info' : 'warning'}>
                                      {job.margin}%
                                   </Badge>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </Card>
           </div>
         )}

         {activeTab === 'sales' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card title="Estimate Approval Funnel">
                 <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="80%">
                       <PieChart>
                          <Pie
                             data={[
                                { name: 'Approved', value: salesStats.approved },
                                { name: 'Rejected', value: salesStats.rejected },
                                { name: 'Pending', value: salesStats.pending }
                             ]}
                             cx="50%"
                             cy="50%"
                             innerRadius={70}
                             outerRadius={100}
                             paddingAngle={8}
                             dataKey="value"
                          >
                             <Cell fill="#10b981" />
                             <Cell fill="#ef4444" />
                             <Cell fill="#6366f1" />
                          </Pie>
                          <Tooltip />
                          <Legend />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="p-6 bg-[var(--bg-app)] rounded-3xl mt-4 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black uppercase text-[var(--text-muted)]">Overall Win Rate</p>
                       <p className="text-3xl font-black text-[var(--primary)]">{salesStats.winRate}%</p>
                    </div>
                    <ArrowUpRight className="text-[var(--primary)] opacity-50" size={32} />
                 </div>
              </Card>
              
              <Card title="Active Sales Pipeline">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                             <CheckCircle2 size={24} />
                          </div>
                          <div>
                             <p className="font-bold">Approved Projects</p>
                             <p className="text-xs text-[var(--text-muted)]">Converted to active work</p>
                          </div>
                       </div>
                       <span className="text-xl font-black">{salesStats.approved}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                             <FileText size={20} />
                          </div>
                          <div>
                             <p className="font-bold">Pending Sent</p>
                             <p className="text-xs text-[var(--text-muted)]">Awaiting customer review</p>
                          </div>
                       </div>
                       <span className="text-xl font-black">{salesStats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                             <AlertCircle size={24} />
                          </div>
                          <div>
                             <p className="font-bold">Rejected Quotes</p>
                             <p className="text-xs text-[var(--text-muted)]">Lost opportunities</p>
                          </div>
                       </div>
                       <span className="text-xl font-black">{salesStats.rejected}</span>
                    </div>
                 </div>
              </Card>
           </div>
         )}

         {activeTab === 'operations' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card title="Labor vs Materials Cost Split">
                 <div className="h-[300px] mt-8">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={laborVsMaterial}
                             cx="50%"
                             cy="50%"
                             innerRadius={0}
                             outerRadius={100}
                             dataKey="value"
                             label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          >
                             {laborVsMaterial.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </Card>

              <Card title="Project Type Distribution">
                 <div className="h-[300px] mt-8">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={jobTypes} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-subtle)" />
                          <XAxis type="number" hide />
                          <YAxis 
                             dataKey="name" 
                             type="category" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
                             width={120}
                          />
                          <Tooltip />
                          <Bar dataKey="value" name="Count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </Card>
           </div>
         )}

         {activeTab === 'customers' && (
           <Card title="Customer Lifetime Value Ranking">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                          <th className="px-6 py-4">Customer / Company</th>
                          <th className="px-6 py-4 text-center">Projects</th>
                          <th className="px-6 py-4 text-right">Total Invoiced</th>
                          <th className="px-6 py-4 text-right">Total Collected</th>
                          <th className="px-6 py-4 text-right"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                       {customerValue.map((c) => (
                          <tr key={c.id} className="hover:bg-[var(--primary-subtle)] transition-colors group">
                             <td className="px-6 py-4">
                                <div className="font-bold text-sm">{c.name}</div>
                                {c.company && <div className="text-[10px] text-[var(--text-muted)] font-medium uppercase">{c.company}</div>}
                             </td>
                             <td className="px-6 py-4 text-center">
                                <Badge variant="neutral">{c.jobCount}</Badge>
                             </td>
                             <td className="px-6 py-4 text-right font-bold text-sm">
                                ${c.totalInvoiced.toLocaleString()}
                             </td>
                             <td className="px-6 py-4 text-right text-sm">
                                <span className={c.totalPaid === c.totalInvoiced ? 'text-green-600 font-bold' : 'text-[var(--text-muted)]'}>
                                   ${c.totalPaid.toLocaleString()}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <Link href={`/customers/${c.id}`}>
                                   <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      Profile <ChevronRight size={14} className="ml-1" />
                                   </Button>
                                </Link>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>
         )}
      </div>

      <div className="p-8 bg-gradient-to-br from-[var(--primary)] to-indigo-700 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-indigo-200">
         <div className="space-y-2">
            <h3 className="text-2xl font-black italic">Growth Insights</h3>
            <p className="text-indigo-100 text-sm max-w-md">
               Based on your current {salesStats.winRate}% win rate and ${stats.avgJobSize.toLocaleString()} average job size, you are on track to exceed last quarter's revenue.
            </p>
         </div>
         <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 h-12 text-sm font-bold uppercase tracking-widest">
            Schedule Review
         </Button>
      </div>

      {/* Global CSS for Charts Theming */}
      <style jsx global>{`
        .recharts-tooltip-cursor {
          fill: var(--primary);
          fill-opacity: 0.05;
        }
        @media print {
          nav, aside, header .flex-items-center, .print\\:hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
          .card {
            border: 1px solid #eee !important;
            box-shadow: none !important;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

function CheckCircle2(props: any) {
   return (
     <svg
       {...props}
       xmlns="http://www.w3.org/2000/svg"
       width="24"
       height="24"
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       strokeWidth="2"
       strokeLinecap="round"
       strokeLinejoin="round"
     >
       <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
       <path d="m9 12 2 2 4-4" />
     </svg>
   )
}

function FileText(props: any) {
   return (
     <svg
       {...props}
       xmlns="http://www.w3.org/2000/svg"
       width="24"
       height="24"
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       strokeWidth="2"
       strokeLinecap="round"
       strokeLinejoin="round"
     >
       <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
       <polyline points="14 2 14 8 20 8" />
       <line x1="16" y1="13" x2="8" y2="13" />
       <line x1="16" y1="17" x2="8" y2="17" />
       <line x1="10" y1="9" x2="8" y2="9" />
     </svg>
   )
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
