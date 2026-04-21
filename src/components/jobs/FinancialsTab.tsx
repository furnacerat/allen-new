'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Wallet, 
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { storageService } from '@/lib/storage/storageService';
import { Job, ProjectMaterial, LaborEntry, JobExpense, ChangeOrder } from '@/domain/types';

interface FinancialsTabProps {
  jobId: string;
}

export function FinancialsTab({ jobId }: FinancialsTabProps) {
  const [data, setData] = useState<{
    job: Job | null;
    materials: ProjectMaterial[];
    labor: LaborEntry[];
    expenses: JobExpense[];
    changeOrders: ChangeOrder[];
  }>({
    job: null,
    materials: [],
    labor: [],
    expenses: [],
    changeOrders: [],
  });

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = () => {
    const job = storageService.getItem('jobs', jobId) as Job;
    const allMaterials = storageService.getCollection('materials') as ProjectMaterial[];
    const allLabor = storageService.getCollection('laborEntries') as LaborEntry[];
    const allExpenses = storageService.getCollection('expenses') as JobExpense[];
    const allOrders = storageService.getCollection('changeOrders') as ChangeOrder[];

    setData({
      job,
      materials: allMaterials.filter(m => m.jobId === jobId),
      labor: allLabor.filter(l => l.jobId === jobId),
      expenses: allExpenses.filter(e => e.jobId === jobId),
      changeOrders: allOrders.filter(o => o.jobId === jobId),
    });
  };

  if (!data.job) return null;

  // -- Calculations --

  // 1. Revenue
  const approvedChangeRevenue = data.changeOrders
    .filter(o => o.status === 'approved')
    .reduce((sum, o) => sum + o.amountChange, 0);
  
  const totalRevenue = data.job.contractAmount + approvedChangeRevenue;

  // 2. Costs
  const materialCosts = data.materials.reduce((sum, m) => sum + (m.actualCost * m.quantity), 0);
  const laborCosts = data.labor.reduce((sum, l) => sum + l.totalCost, 0);
  const otherExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const totalActualCost = materialCosts + laborCosts + otherExpenses;

  // 3. Profit & Margin
  const grossProfit = totalRevenue - totalActualCost;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // 4. Estimates vs Actual
  const initialEstCost = data.job.estimatedCost;
  const variance = initialEstCost - totalActualCost;
  const variancePercent = initialEstCost > 0 ? (variance / initialEstCost) * 100 : 0;

  // Category breakdown for charts/progress bars
  const categories = [
    { name: 'Materials', amount: materialCosts, color: 'bg-green-500', icon: <Briefcase size={14} /> },
    { name: 'Labor', amount: laborCosts, color: 'bg-blue-500', icon: <TrendingUp size={14} /> },
    { name: 'Other Expenses', amount: otherExpenses, color: 'bg-orange-500', icon: <Wallet size={14} /> },
  ];

  const maxCategory = Math.max(...categories.map(c => c.amount), 1);

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[var(--primary)]">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Revenue</p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">${totalRevenue.toLocaleString()}</h3>
              <div className="w-8 h-8 rounded-full bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--primary)]">
                <DollarSign size={18} />
              </div>
            </div>
            <p className="text-[10px] text-[var(--text-muted)]">
              Orig: ${data.job.contractAmount.toLocaleString()} + Changes: ${approvedChangeRevenue.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="border-l-4 border-l-[var(--secondary)]">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Actual Total Cost</p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">${totalActualCost.toLocaleString()}</h3>
              <div className="w-8 h-8 rounded-full bg-[var(--bg-app)] flex items-center justify-center text-[var(--secondary)]">
                <Target size={18} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <span className={variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                {variance >= 0 ? 'Under' : 'Over'} budget by ${Math.abs(variance).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-[var(--success)]">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Gross Profit</p>
            <div className="flex items-center justify-between">
              <h3 className={`text-2xl font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${grossProfit.toLocaleString()}
              </h3>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${grossProfit >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {grossProfit >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              </div>
            </div>
            <p className="text-[10px] text-[var(--text-muted)]">Based on current tracked costs</p>
          </div>
        </Card>

        <Card className="border-l-4 border-l-[var(--info)]">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Profit Margin</p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">{profitMargin.toFixed(1)}%</h3>
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <PieChart size={18} />
              </div>
            </div>
            <div className="w-full bg-[var(--bg-app)] h-1.5 rounded-full mt-2 overflow-hidden">
               <div 
                 className={`h-full transition-all duration-1000 ${profitMargin > 30 ? 'bg-green-500' : profitMargin > 15 ? 'bg-blue-500' : 'bg-orange-500'}`}
                 style={{ width: `${Math.min(Math.max(profitMargin, 0), 100)}%` }}
               />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cost Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Cost Breakdown" subtitle="Detailed comparison across spending categories">
            <div className="space-y-8">
              {categories.map((cat) => {
                const percentage = totalActualCost > 0 ? (cat.amount / totalActualCost) * 100 : 0;
                return (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 font-semibold">
                        <div className={`p-1.5 rounded-lg ${cat.color} text-white`}>
                          {cat.icon}
                        </div>
                        {cat.name}
                      </div>
                      <div className="text-right">
                        <span className="font-bold">${cat.amount.toLocaleString()}</span>
                        <span className="ml-2 text-[var(--text-muted)] text-xs">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-[var(--bg-app)] h-2 rounded-full overflow-hidden">
                       <div 
                         className={`h-full ${cat.color} transition-all duration-1000`} 
                         style={{ width: `${percentage}%` }}
                       />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Projected vs Actual Comparison">
             <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-subtle)]">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Initial Estimate</p>
                      <p className="text-lg font-bold">${initialEstCost.toLocaleString()}</p>
                   </div>
                   <div className="h-8 w-px bg-[var(--border-subtle)]" />
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Current Spend</p>
                      <p className="text-lg font-bold">${totalActualCost.toLocaleString()}</p>
                   </div>
                   <div className="h-8 w-px bg-[var(--border-subtle)]" />
                   <div className="space-y-1 text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Variance %</p>
                      <p className={`text-lg font-bold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {variance >= 0 ? '+' : ''}{variancePercent.toFixed(1)}%
                      </p>
                   </div>
                </div>

                {variance < 0 && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                     <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                     <div className="space-y-1">
                        <p className="text-sm font-bold text-red-900">Over Budget Warning</p>
                        <p className="text-xs text-red-700 leading-relaxed">
                           Current actual costs have exceeded the initial project estimate by ${Math.abs(variance).toLocaleString()}. 
                           Review change orders or material costs for discrepancies.
                        </p>
                     </div>
                  </div>
                )}
             </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card title="Financial Summary">
             <div className="space-y-4">
                <div className="flex justify-between text-sm">
                   <span className="text-[var(--text-muted)]">Original Contract</span>
                   <span className="font-semibold">${data.job.contractAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-[var(--text-muted)]">Approved Changes</span>
                   <span className={`font-semibold ${approvedChangeRevenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                     {approvedChangeRevenue >= 0 ? '+' : '-'}${Math.abs(approvedChangeRevenue).toLocaleString()}
                   </span>
                </div>
                <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between font-bold">
                   <span>Adjusted Revenue</span>
                   <span className="text-[var(--primary)]">${totalRevenue.toLocaleString()}</span>
                </div>
                
                <div className="mt-8 space-y-3">
                   <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Project Health</p>
                   <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                      <div className="flex items-center gap-2 text-green-700 font-bold text-xs uppercase mb-1">
                         <BarChart3 size={14} />
                         Profitability
                      </div>
                      <p className="text-xs text-green-800">
                         This project is running at a <b>{profitMargin.toFixed(0)}% margin</b>. This is {profitMargin > 20 ? 'above' : 'near'} target.
                      </p>
                   </div>
                </div>
             </div>
          </Card>

          <Button variant="outline" className="w-full" onClick={() => window.print()}>
             <BarChart3 className="mr-2 h-4 w-4" />
             Export Financial Log
          </Button>
        </div>
      </div>
    </div>
  );
}
