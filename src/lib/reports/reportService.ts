import { storageService } from '../storage/storageService';
import { 
  Job, 
  Invoice, 
  Payment, 
  Estimate, 
  JobExpense, 
  Customer,
  ProjectMaterial,
  LaborEntry
} from '@/domain/types';

export interface MonthlyMetric {
  month: string;
  revenue: number;
  profit: number;
  expenses: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color?: string;
}

export interface JobProfitability {
  jobTitle: string;
  contractAmount: number;
  actualCost: number;
  profit: number;
  margin: number;
}

export const reportService = {
  getFinancialTrends(lastMonths: number = 12): MonthlyMetric[] {
    const invoices = storageService.getCollection('invoices') as Invoice[];
    const expenses = storageService.getCollection('expenses') as JobExpense[];
    
    // Create an array of the last N months
    const result: MonthlyMetric[] = [];
    const now = new Date();
    
    for (let i = lastMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      // Accrual Revenue: Invoices issued this month
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.issueDate);
        return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear();
      });
      
      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
      
      // Expenses: Actual costs incurred this month
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === d.getMonth() && expDate.getFullYear() === d.getFullYear();
      });
      
      const expenseTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      result.push({
        month: monthStr,
        revenue,
        expenses: expenseTotal,
        profit: revenue - expenseTotal
      });
    }
    
    return result;
  },

  getLaborVsMaterialComparison(): CategoryData[] {
    const materials = storageService.getCollection('materials') as ProjectMaterial[];
    const labor = storageService.getCollection('laborEntries') as LaborEntry[];
    
    const materialTotal = materials.reduce((sum, m) => sum + m.actualCost, 0);
    const laborTotal = labor.reduce((sum, l) => sum + l.totalCost, 0);
    
    return [
      { name: 'Materials', value: materialTotal, color: '#6366f1' },
      { name: 'Labor', value: laborTotal, color: '#f59e0b' }
    ];
  },

  getExpenseBreakdown(): CategoryData[] {
    const expenses = storageService.getCollection('expenses') as JobExpense[];
    const categories: Record<string, number> = {};
    
    expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value
    }));
  },

  getEstimateStats() {
    const estimates = storageService.getCollection('estimates') as Estimate[];
    const total = estimates.length;
    if (total === 0) return { winRate: 0, approved: 0, rejected: 0, pending: 0 };
    
    const approved = estimates.filter(e => e.status === 'approved' || e.status === 'converted').length;
    const rejected = estimates.filter(e => e.status === 'rejected').length;
    const pending = estimates.filter(e => e.status === 'sent' || e.status === 'draft').length;
    
    return {
      winRate: Math.round((approved / (approved + rejected || 1)) * 100),
      total,
      approved,
      rejected,
      pending
    };
  },

  getJobTypeDistribution() {
    const jobs = storageService.getJobs();
    const distribution: Record<string, { count: number; revenue: number }> = {};
    
    jobs.forEach(job => {
      if (!distribution[job.type]) {
        distribution[job.type] = { count: 0, revenue: 0 };
      }
      distribution[job.type].count += 1;
      distribution[job.type].revenue += job.contractAmount;
    });
    
    return Object.entries(distribution).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value: data.count,
      revenue: data.revenue
    })).sort((a, b) => b.revenue - a.revenue);
  },

  getJobProfitabilityReport(): JobProfitability[] {
    const jobs = storageService.getJobs();
    return jobs.map(job => {
      const profit = job.contractAmount - job.actualCost;
      const margin = job.contractAmount > 0 ? (profit / job.contractAmount) * 100 : 0;
      
      return {
        jobTitle: job.title,
        contractAmount: job.contractAmount,
        actualCost: job.actualCost,
        profit,
        margin: Math.round(margin)
      };
    }).sort((a, b) => b.profit - a.profit);
  },

  getCustomerValueSummary() {
    const customers = storageService.getCustomers();
    const invoices = storageService.getCollection('invoices') as Invoice[];
    
    return customers.map(customer => {
      const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
      const totalInvoiced = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const totalPaid = customerInvoices.reduce((sum, inv) => sum + (inv.total - inv.balanceDue), 0);
      
      return {
        id: customer.id,
        name: customer.name,
        company: customer.companyName,
        totalInvoiced,
        totalPaid,
        jobCount: storageService.getJobsByCustomer(customer.id).length
      };
    }).sort((a, b) => b.totalInvoiced - a.totalInvoiced);
  },

  getBusinessKPIs() {
    const jobs = storageService.getJobs();
    const invoices = storageService.getCollection('invoices') as Invoice[];
    const expenses = storageService.getCollection('expenses') as JobExpense[];
    
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const grossProfit = totalRevenue - totalExpenses;
    const avgMargin = jobs.length > 0 
      ? jobs.reduce((sum, job) => sum + (job.contractAmount > 0 ? ((job.contractAmount - job.actualCost) / job.contractAmount) : 0), 0) / jobs.length * 100
      : 0;

    // Trend Direction (simplified: current month vs last month)
    const trends = this.getFinancialTrends(2);
    let trendDirection: 'up' | 'down' | 'neutral' = 'neutral';
    if (trends.length === 2) {
      if (trends[1].revenue > trends[0].revenue) trendDirection = 'up';
      else if (trends[1].revenue < trends[0].revenue) trendDirection = 'down';
    }

    return {
      totalRevenue,
      totalExpenses,
      grossProfit,
      avgMargin: Math.round(avgMargin),
      trendDirection,
      avgJobSize: jobs.length > 0 ? totalRevenue / jobs.length : 0,
      openJobs: jobs.filter(j => j.status !== 'completed' && j.status !== 'archived').length,
      completionRate: jobs.length > 0 ? (jobs.filter(j => j.status === 'completed').length / jobs.length) * 100 : 0
    };
  }
};
