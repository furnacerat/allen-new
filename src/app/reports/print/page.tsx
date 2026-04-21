'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { reportService, MonthlyMetric, CategoryData, JobProfitability } from '@/lib/reports/reportService';
import { api } from '@/lib/api';
import { Button } from '@/components/ui';
import { Printer } from 'lucide-react';
import { PrintLayout } from '@/components/layout/PrintLayout';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'];

function PrintReportContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'executive_summary';
  
  const [stats, setStats] = useState<any>(null);
  const [financialTrends, setFinancialTrends] = useState<MonthlyMetric[]>([]);
  const [expenses, setExpenses] = useState<CategoryData[]>([]);
  const [jobTypes, setJobTypes] = useState<CategoryData[]>([]);
  const [profitability, setProfitability] = useState<JobProfitability[]>([]);
  const [customerValue, setCustomerValue] = useState<any[]>([]);
  const [salesStats, setSalesStats] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    setStats(reportService.getBusinessKPIs());
    setFinancialTrends(reportService.getFinancialTrends());
    setExpenses(reportService.getExpenseBreakdown());
    setJobTypes(reportService.getJobTypeDistribution());
    setProfitability(reportService.getJobProfitabilityReport());
    setCustomerValue(reportService.getCustomerValueSummary());
    setSalesStats(reportService.getEstimateStats());
    
    api.settings.get().then(b => setBusiness(b));
  }, []);

  if (!stats || !business) return <div className="p-10 text-center">Loading Report for Print...</div>;

  return (
    <>
      <PrintLayout
        business={business}
        documentTitle={`${category.replace('_', ' ')} Report`}
        referenceDate={new Date().toISOString()}
        footerNotesOverride="Confidential Internal Business Information. Do not distribute without authorization."
      >
        {/* Executive Overview */}
        <div className="grid grid-cols-4 gap-8 mb-12">
           <div className="p-6 bg-gray-50 rounded-sm border-l-4 border-indigo-600">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Total Revenue</p>
              <p className="text-2xl font-black">${stats.totalRevenue.toLocaleString()}</p>
           </div>
           <div className="p-6 bg-gray-50 rounded-sm border-l-4 border-green-600">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Gross Profit</p>
              <p className="text-2xl font-black">${stats.grossProfit.toLocaleString()}</p>
           </div>
           <div className="p-6 bg-gray-50 rounded-sm border-l-4 border-amber-600">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Margin</p>
              <p className="text-2xl font-black">{stats.avgMargin}%</p>
           </div>
           <div className="p-6 bg-gray-50 rounded-sm border-l-4 border-blue-600">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Win Rate</p>
              <p className="text-2xl font-black">{salesStats.winRate}%</p>
           </div>
        </div>

        {/* Financial Trends Area */}
        <div className="mb-16">
           <h2 className="text-lg font-black uppercase tracking-widest mb-6 border-b pb-2">Financial Performance Trend (12 Months)</h2>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={financialTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => `$${v/1000}k`} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.05} />
                    <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.05} />
                    <Legend />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Breakdown Section */}
        <div className="grid grid-cols-2 gap-12 mb-16 break-inside-avoid">
           <div>
              <h2 className="text-sm font-black uppercase tracking-widest mb-6 border-b pb-2">Expense Allocation</h2>
              <div className="h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={expenses}
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                       >
                          {expenses.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Pie>
                       <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '10px', fontWeight: 600 }} />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
           </div>
           <div>
              <h2 className="text-sm font-black uppercase tracking-widest mb-6 border-b pb-2">Project Type Distribution</h2>
              <div className="h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jobTypes} layout="vertical">
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} width={100} />
                       <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Profitability Table */}
        <div className="mb-16 break-inside-avoid">
           <h2 className="text-md font-black uppercase tracking-widest mb-6 border-b pb-2">Individual Project Profitability</h2>
           <table className="w-full text-left border-collapse border border-gray-100">
              <thead>
                 <tr className="bg-gray-100 text-[10px] font-black uppercase tracking-widest">
                    <th className="p-3">Project</th>
                    <th className="p-3 text-right">Revenue</th>
                    <th className="p-3 text-right">Actual Cost</th>
                    <th className="p-3 text-right">Profit</th>
                    <th className="p-3 text-right">Margin</th>
                 </tr>
              </thead>
              <tbody className="text-xs">
                 {profitability.map((job, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                       <td className="p-3 font-bold">{job.jobTitle}</td>
                       <td className="p-3 text-right">${job.contractAmount.toLocaleString()}</td>
                       <td className="p-3 text-right text-gray-500">${job.actualCost.toLocaleString()}</td>
                       <td className="p-3 text-right font-black">${job.profit.toLocaleString()}</td>
                       <td className="p-3 text-right font-bold text-indigo-600">{job.margin}%</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Customer Value Table */}
        <div className="break-inside-avoid">
           <h2 className="text-md font-black uppercase tracking-widest mb-6 border-b pb-2">Customer Lifetime Value</h2>
           <table className="w-full text-left border-collapse border border-gray-100">
              <thead>
                 <tr className="bg-gray-100 text-[10px] font-black uppercase tracking-widest">
                    <th className="p-3">Customer</th>
                    <th className="p-3 text-center">Projects</th>
                    <th className="p-3 text-right">Total Invoiced</th>
                    <th className="p-3 text-right">Collected</th>
                 </tr>
              </thead>
              <tbody className="text-xs">
                 {customerValue.map((c, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                       <td className="p-3">
                          <div className="font-bold">{c.name}</div>
                          <div className="text-[9px] text-gray-400 uppercase">{c.company}</div>
                       </td>
                       <td className="p-3 text-center font-medium">{c.jobCount}</td>
                       <td className="p-3 text-right font-black">${c.totalInvoiced.toLocaleString()}</td>
                       <td className="p-3 text-right font-bold text-green-600">${c.totalPaid.toLocaleString()}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </PrintLayout>
      
      {/* Print Controls */}
      <div className="fixed bottom-8 right-8 print:hidden flex gap-3 z-50">
         <Button variant="outline" onClick={() => window.close()} className="bg-white">
            Close Preview
         </Button>
         <Button onClick={() => window.print()} className="shadow-2xl">
            <Printer className="mr-2 h-4 w-4" />
            Start Printing
         </Button>
      </div>
    </>
  );
}

export default function ReportsPrintPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading Report Context...</div>}>
      <PrintReportContent />
    </Suspense>
  );
}
