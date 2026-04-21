'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal } from '@/components/ui';
import { 
  Users, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  DollarSign,
  Edit,
  Trash2,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { storageService } from '@/lib/storage/storageService';
import { LaborEntry } from '@/domain/types';
import { useToast } from '@/context/ToastContext';

interface LaborTabProps {
  jobId: string;
}

export function LaborTab({ jobId }: LaborTabProps) {
  const { showToast } = useToast();
  const [entries, setEntries] = useState<LaborEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LaborEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    workerName: '',
    laborType: 'general',
    hours: 0,
    hourlyCost: 0,
    billableRate: 0,
    totalCost: 0
  });

  useEffect(() => {
    loadEntries();
  }, [jobId]);

  const loadEntries = () => {
    const allEntries = storageService.getCollection('laborEntries') as LaborEntry[];
    setEntries(allEntries.filter(e => e.jobId === jobId));
  };

  const handleOpenModal = (entry?: LaborEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        date: entry.date,
        workerName: entry.workerName,
        laborType: entry.laborType,
        hours: entry.hours,
        hourlyCost: entry.hourlyCost,
        billableRate: entry.billableRate || 0,
        totalCost: entry.totalCost
      });
    } else {
      setEditingEntry(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        workerName: '',
        laborType: 'general',
        hours: 0,
        hourlyCost: 0,
        billableRate: 0,
        totalCost: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.workerName || formData.hours <= 0) {
      showToast('Worker name and hours are required', 'error');
      return;
    }

    const entryData: LaborEntry = {
      id: editingEntry?.id || crypto.randomUUID(),
      jobId,
      ...formData,
      totalCost: formData.hours * formData.hourlyCost,
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveItem('laborEntries', entryData);
    showToast(editingEntry ? 'Entry updated' : 'Entry added', 'success');
    setIsModalOpen(false);
    loadEntries();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this labor entry?')) {
      storageService.removeItem('laborEntries', id);
      showToast('Entry removed', 'success');
      loadEntries();
    }
  };

  const totals = entries.reduce((acc, curr) => {
    acc.hours += curr.hours;
    acc.cost += curr.totalCost;
    return acc;
  }, { hours: 0, cost: 0 });

  const filteredEntries = entries.filter(e => 
    e.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.laborType.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-white to-[var(--primary-subtle)] border-l-4 border-l-[var(--primary)]">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Labor Cost</p>
              <h3 className="text-2xl font-bold">${totals.cost.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--primary)]">
              <DollarSign size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-white to-[var(--primary-subtle)] border-l-4 border-l-[var(--secondary)]">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Hours</p>
              <h3 className="text-2xl font-bold">{totals.hours} <span className="text-sm font-normal text-[var(--text-muted)]">hrs</span></h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--secondary)]">
              <Clock size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-white to-[var(--primary-subtle)] border-l-4 border-l-[var(--info)]">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Team Members</p>
              <h3 className="text-2xl font-bold text-capitalize">{new Set(entries.map(e => e.workerName)).size}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--info)]">
              <UserCheck size={20} />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Search workers or tasks..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Labor Entry
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Date</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Worker</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Labor Type</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Hours</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Rate</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Total</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[var(--bg-app)] transition-colors group">
                    <td className="px-4 py-4 whitespace-nowrap font-medium">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-[var(--text-main)] text-capitalize">{entry.workerName}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant="neutral" className="text-capitalize">{entry.laborType}</Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {entry.hours} <span className="text-[var(--text-muted)] text-xs">hrs</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[var(--text-muted)] text-capitalize">
                      ${entry.hourlyCost}/hr
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-bold text-[var(--primary)]">
                      ${entry.totalCost.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(entry)}
                          className="p-1.5 hover:bg-[var(--primary-subtle)] text-[var(--primary)] rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(entry.id)}
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
                  <td colSpan={7} className="px-4 py-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--bg-app)] flex items-center justify-center opacity-30">
                        <Users size={24} />
                      </div>
                      <p>No labor entries recorded yet.</p>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal()}>Record work hours</Button>
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
        title={editingEntry ? 'Edit Labor Entry' : 'Add Labor Entry'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Entry</Button>
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
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Labor Type</label>
              <select 
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-capitalize"
                value={formData.laborType}
                onChange={(e) => setFormData({...formData, laborType: e.target.value})}
              >
                <option value="general">General Labor</option>
                <option value="electrician">Electrician</option>
                <option value="plumber">Plumber</option>
                <option value="carpenter">Carpenter</option>
                <option value="painter">Painter</option>
                <option value="subcontractor">Subcontractor</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Worker Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-capitalize"
              value={formData.workerName}
              onChange={(e) => setFormData({...formData, workerName: e.target.value})}
              placeholder="Full name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Hours Worked</label>
              <input 
                type="number" 
                step="0.5"
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                value={formData.hours}
                onChange={(e) => setFormData({...formData, hours: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Internal Hourly Cost ($)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                value={formData.hourlyCost}
                onChange={(e) => setFormData({...formData, hourlyCost: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Billable Rate ($)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                value={formData.billableRate}
                onChange={(e) => setFormData({...formData, billableRate: parseFloat(e.target.value) || 0})}
              />
              <p className="text-[9px] text-[var(--text-muted)] italic">Charged to client via contract/invoice.</p>
            </div>
            <div className="flex items-end pb-1">
               <div className="w-full p-2 bg-[var(--primary-subtle)]/30 rounded-xl border border-[var(--primary-subtle)] flex justify-between items-center text-xs">
                  <span className="font-medium text-[var(--text-muted)]">Total Line Cost:</span>
                  <span className="font-bold text-[var(--primary)]">${(formData.hours * formData.hourlyCost).toLocaleString()}</span>
               </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
