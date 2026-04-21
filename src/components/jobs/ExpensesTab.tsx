'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal } from '@/components/ui';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Calendar, 
  Tag, 
  DollarSign,
  Edit,
  Trash2,
  Receipt,
  Truck,
  HardHat,
  Scissors,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { storageService } from '@/lib/storage/storageService';
import { JobExpense } from '@/domain/types';
import { useToast } from '@/context/ToastContext';

interface ExpensesTabProps {
  jobId: string;
}

export function ExpensesTab({ jobId }: ExpensesTabProps) {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState<JobExpense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<JobExpense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'other' as JobExpense['category'],
    vendor: '',
    amount: 0,
    paymentMethod: '',
    receiptPlaceholder: '',
    receiptPhoto: '',
    notes: ''
  });

  useEffect(() => {
    loadExpenses();
  }, [jobId]);

  const loadExpenses = () => {
    const allExpenses = storageService.getCollection('expenses') as JobExpense[];
    setExpenses(allExpenses.filter(e => e.jobId === jobId));
  };

  const handleOpenModal = (expense?: JobExpense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        date: expense.date,
        category: expense.category,
        vendor: expense.vendor,
        amount: expense.amount,
        paymentMethod: expense.paymentMethod || '',
        receiptPlaceholder: expense.receiptPlaceholder || '',
        receiptPhoto: expense.receiptPhoto || '',
        notes: expense.notes || ''
      });
    } else {
      setEditingExpense(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'other',
        vendor: '',
        amount: 0,
        paymentMethod: '',
        receiptPlaceholder: '',
        receiptPhoto: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, receiptPhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
// ...
    if (!formData.vendor || formData.amount <= 0) {
      showToast('Vendor and amount are required', 'error');
      return;
    }

    const expenseData: JobExpense = {
      id: editingExpense?.id || crypto.randomUUID(),
      jobId,
      ...formData,
      createdAt: editingExpense?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveItem('expenses', expenseData);
    showToast(editingExpense ? 'Expense updated' : 'Expense added', 'success');
    setIsModalOpen(false);
    loadExpenses();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      storageService.removeItem('expenses', id);
      showToast('Expense removed', 'success');
      loadExpenses();
    }
  };

  const getCategoryIcon = (category: JobExpense['category']) => {
    switch (category) {
      case 'subcontractor': return <HardHat size={16} className="text-orange-500" />;
      case 'equipment': return <Truck size={16} className="text-blue-500" />;
      case 'material': return <Scissors size={16} className="text-green-500" />;
      case 'permit': return <Receipt size={16} className="text-purple-500" />;
      default: return <Tag size={16} className="text-gray-500" />;
    }
  };

  const totals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    acc.total += curr.amount;
    return acc;
  }, { total: 0 } as Record<string, number>);

  const filteredExpenses = expenses.filter(e => 
    e.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-white to-[var(--primary-subtle)] border-l-4 border-l-[var(--primary)] col-span-1 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Misc Expenses</p>
              <h3 className="text-2xl font-bold">${totals.total.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--primary)]">
              <CreditCard size={20} />
            </div>
          </div>
        </Card>

        {Object.entries(totals).filter(([k]) => k !== 'total').map(([category, amount]) => (
          <Card key={category} className="bg-white border-l-4 border-l-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] text-capitalize">{category}</p>
                <h3 className="text-lg font-bold">${amount.toLocaleString()}</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-[var(--bg-app)] flex items-center justify-center">
                 {getCategoryIcon(category as any)}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Search vendors or categories..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Date</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Category</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Vendor</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Method</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Receipt</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Amount</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-[var(--bg-app)] transition-colors group">
                    <td className="px-4 py-4 whitespace-nowrap font-medium">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-capitalize">
                        {getCategoryIcon(expense.category)}
                        <span>{expense.category}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-semibold text-[var(--text-main)] text-capitalize">
                      {expense.vendor}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[var(--text-muted)] text-capitalize">
                      {expense.paymentMethod || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {expense.receiptPlaceholder && (
                          <div title="URL Receipt Linked" className="text-blue-500"><ExternalLink size={14} /></div>
                        )}
                        {expense.receiptPhoto && (
                          <div title="Photo Receipt Uploaded" className="text-green-500"><Receipt size={14} /></div>
                        )}
                        {!expense.receiptPlaceholder && !expense.receiptPhoto && (
                          <span className="text-[var(--text-muted)] opacity-30 text-[10px]">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-bold">
                      ${expense.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(expense)}
                          className="p-1.5 hover:bg-[var(--primary-subtle)] text-[var(--primary)] rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(expense.id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--bg-app)] flex items-center justify-center opacity-30">
                        <CreditCard size={24} />
                      </div>
                      <p>No expenses recorded for this project.</p>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal()}>Add first expense</Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Expense</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Category</label>
              <select 
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-capitalize"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as any})}
              >
                <option value="subcontractor">Subcontractor</option>
                <option value="equipment">Equipment</option>
                <option value="material">Material</option>
                <option value="permit">Permit</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Vendor</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-capitalize"
              value={formData.vendor}
              onChange={(e) => setFormData({...formData, vendor: e.target.value})}
              placeholder="Who did you pay?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Amount ($)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Payment Method</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                placeholder="Credit, Cash, Check"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Receipt URL</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                value={formData.receiptPlaceholder}
                onChange={(e) => setFormData({...formData, receiptPlaceholder: e.target.value})}
                placeholder="Link to digital receipt"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Receipt Photo</label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  id="receipt-photo-upload"
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="receipt-photo-upload"
                  className="flex items-center justify-center w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm cursor-pointer hover:border-[var(--primary)] transition-all"
                >
                  {formData.receiptPhoto ? (
                    <span className="text-green-600 flex items-center gap-1 font-semibold"><CheckCircle2 size={14} /> Uploaded</span>
                  ) : (
                    <span className="flex items-center gap-1"><Plus size={14} /> Upload Photo</span>
                  )}
                </label>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Notes</label>
            <textarea 
              className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all min-h-[60px]"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
