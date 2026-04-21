'use client';
import React from 'react';
import { Job, Customer, ProjectMaterial, LaborEntry, JobExpense, ChangeOrder } from '@/domain/types';

interface JobReportProps {
  job: Job & { customer?: Customer };
  materials: ProjectMaterial[];
  labor: LaborEntry[];
  expenses: JobExpense[];
  changeOrders: ChangeOrder[];
}

export function JobReport({ job, materials, labor, expenses, changeOrders }: JobReportProps) {
  // Calculations
  const approvedChangeRevenue = changeOrders
    .filter(o => o.status === 'approved')
    .reduce((sum, o) => sum + o.amountChange, 0);
  
  const totalRevenue = job.contractAmount + approvedChangeRevenue;

  const totalMaterials = materials.reduce((sum, m) => sum + (m.actualCost * m.quantity), 0);
  const totalLabor = labor.reduce((sum, l) => sum + l.totalCost, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalActualCost = totalMaterials + totalLabor + totalExpenses;

  const grossProfit = totalRevenue - totalActualCost;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  return (
    <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-12 overflow-y-auto text-black font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase">Allen's Contractor's</h1>
            <p className="text-lg font-bold">Project Cost Summary Report</p>
            <p className="text-sm text-gray-500 mt-1">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold">{job.title}</h2>
            <p className="text-sm">Job ID: {job.id.slice(0, 12)}</p>
            <p className="text-sm font-medium mt-1">Status: {job.status.toUpperCase()}</p>
          </div>
        </div>

        {/* Client & Info */}
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest border-b pb-1">Client Information</h3>
            <div className="space-y-1">
              <p className="text-lg font-bold">{job.customer?.name}</p>
              {job.customer?.companyName && <p className="text-sm">{job.customer.companyName}</p>}
              <p className="text-sm">{job.customer?.phone}</p>
              <p className="text-sm">{job.customer?.email}</p>
              <p className="text-sm font-medium mt-2">Site Address:</p>
              <p className="text-sm italic">{job.siteAddress}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest border-b pb-1">Project Schedule</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                   <p className="font-bold">Start Date</p>
                   <p>{job.targetStartDate || 'Not specified'}</p>
                </div>
                <div>
                   <p className="font-bold">Completion</p>
                   <p>{job.targetCompletionDate || 'Not specified'}</p>
                </div>
                <div>
                   <p className="font-bold">Created</p>
                   <p>{new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                   <p className="font-bold">Last Update</p>
                   <p>{new Date(job.updatedAt).toLocaleDateString()}</p>
                </div>
            </div>
          </div>
        </div>

        {/* Financial Overview Table */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest border-b pb-1">Financial Intelligence Summary</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-xs uppercase font-black">
                <th className="p-2 border border-gray-300">Description</th>
                <th className="p-2 border border-gray-300 text-right">Estimated</th>
                <th className="p-2 border border-gray-300 text-right">Actual / Contract</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr>
                <td className="p-2 border border-gray-300">Base Contract Amount</td>
                <td className="p-2 border border-gray-300 text-right">-</td>
                <td className="p-2 border border-gray-300 text-right">${job.contractAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-300">Approved Change Orders</td>
                <td className="p-2 border border-gray-300 text-right">-</td>
                <td className="p-2 border border-gray-300 text-right">${approvedChangeRevenue.toLocaleString()}</td>
              </tr>
              <tr className="font-bold bg-gray-50">
                <td className="p-2 border border-gray-300">Total Project Revenue</td>
                <td className="p-2 border border-gray-300 text-right">-</td>
                <td className="p-2 border border-gray-300 text-right">${totalRevenue.toLocaleString()}</td>
              </tr>
              <tr><td colSpan={3} className="h-4"></td></tr>
              <tr>
                <td className="p-2 border border-gray-300">Material Costs</td>
                <td className="p-2 border border-gray-300 text-right">-</td>
                <td className="p-2 border border-gray-300 text-right">${totalMaterials.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-300">Labor Costs</td>
                <td className="p-2 border border-gray-300 text-right">-</td>
                <td className="p-2 border border-gray-300 text-right">${totalLabor.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-300">Other Expenses</td>
                <td className="p-2 border border-gray-300 text-right">-</td>
                <td className="p-2 border border-gray-300 text-right">${totalExpenses.toLocaleString()}</td>
              </tr>
              <tr className="font-bold bg-gray-50">
                <td className="p-2 border border-gray-300">Total Project Costs</td>
                <td className="p-2 border border-gray-300 text-right">${job.estimatedCost.toLocaleString()}</td>
                <td className="p-2 border border-gray-300 text-right">${totalActualCost.toLocaleString()}</td>
              </tr>
              <tr><td colSpan={3} className="h-6"></td></tr>
              <tr className="bg-black text-white font-black text-lg">
                <td className="p-3 border border-black uppercase text-left">Project Net Profit</td>
                <td className="p-3 border border-black text-right" colSpan={2}>
                   ${grossProfit.toLocaleString()} ({profitMargin.toFixed(1)}%)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Change Orders */}
        {changeOrders.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest border-b pb-1">Change Order Log</h3>
            <table className="w-full border-collapse text-xs">
              <thead className="bg-gray-100 font-bold uppercase">
                <tr>
                  <th className="p-2 border border-gray-300 text-left">ID</th>
                  <th className="p-2 border border-gray-300 text-left">Description</th>
                  <th className="p-2 border border-gray-300 text-left">Status</th>
                  <th className="p-2 border border-gray-300 text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody>
                {changeOrders.map(o => (
                  <tr key={o.id}>
                    <td className="p-2 border border-gray-300 font-mono">{o.id.slice(0, 6)}</td>
                    <td className="p-2 border border-gray-300 font-bold">{o.title}</td>
                    <td className="p-2 border border-gray-300 uppercase">{o.status}</td>
                    <td className="p-2 border border-gray-300 text-right font-bold">
                       {o.amountChange >= 0 ? '+' : '-'}${Math.abs(o.amountChange).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Materials List */}
        <div className="space-y-4 page-break-before">
          <h3 className="text-sm font-black uppercase tracking-widest border-b pb-1">Detailed Materials Summary</h3>
          <table className="w-full border-collapse text-xs">
            <thead className="bg-gray-100 font-bold uppercase">
              <tr>
                <th className="p-2 border border-gray-300 text-left">Item Name</th>
                <th className="p-2 border border-gray-300 text-right">Qty</th>
                <th className="p-2 border border-gray-300 text-left">Vendor</th>
                <th className="p-2 border border-gray-300 text-right">Unit Price</th>
                <th className="p-2 border border-gray-300 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(m => (
                <tr key={m.id}>
                  <td className="p-2 border border-gray-300 font-bold">{m.name}</td>
                  <td className="p-2 border border-gray-300 text-right font-mono">{m.quantity} {m.unit}</td>
                  <td className="p-2 border border-gray-300">{m.vendor || 'N/A'}</td>
                  <td className="p-2 border border-gray-300 text-right">${m.actualCost.toLocaleString()}</td>
                  <td className="p-2 border border-gray-300 text-right font-bold">${(m.actualCost * m.quantity).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-black">
                <td className="p-2 border border-gray-300 text-right" colSpan={4}>Actual Total Material Spend</td>
                <td className="p-2 border border-gray-300 text-right">${totalMaterials.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-12 border-t-2 border-black flex justify-between text-[10px] font-bold uppercase text-gray-400">
           <span>Allen's Contractor's - Proprietary Business System</span>
           <span>Confidential Document</span>
           <span>Page {1} of {1}</span>
        </div>
      </div>
    </div>
  );
}
