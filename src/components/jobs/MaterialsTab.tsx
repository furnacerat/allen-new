'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal } from '@/components/ui';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Edit,
  Trash2
} from 'lucide-react';
import { storageService } from '@/lib/storage/storageService';
import { ProjectMaterial } from '@/domain/types';
import { useToast } from '@/context/ToastContext';

interface MaterialsTabProps {
  jobId: string;
}

export function MaterialsTab({ jobId }: MaterialsTabProps) {
  const { showToast } = useToast();
  const [materials, setMaterials] = useState<ProjectMaterial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<ProjectMaterial | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'ea',
    estimatedCost: 0,
    actualCost: 0,
    status: 'needed' as ProjectMaterial['status'],
    vendor: '',
    notes: ''
  });

  useEffect(() => {
    loadMaterials();
  }, [jobId]);

  const loadMaterials = () => {
    const allMaterials = storageService.getCollection('materials') as ProjectMaterial[];
    setMaterials(allMaterials.filter(m => m.jobId === jobId));
  };

  const handleOpenModal = (material?: ProjectMaterial) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        name: material.name,
        quantity: material.quantity,
        unit: material.unit,
        estimatedCost: material.estimatedCost,
        actualCost: material.actualCost,
        status: material.status,
        vendor: material.vendor || '',
        notes: material.notes || ''
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        name: '',
        quantity: 1,
        unit: 'ea',
        estimatedCost: 0,
        actualCost: 0,
        status: 'needed',
        vendor: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      showToast('Item name is required', 'error');
      return;
    }

    const materialData: ProjectMaterial = {
      id: editingMaterial?.id || crypto.randomUUID(),
      jobId,
      ...formData,
      createdAt: editingMaterial?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveItem('materials', materialData);
    showToast(editingMaterial ? 'Item updated' : 'Item added', 'success');
    setIsModalOpen(false);
    loadMaterials();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      storageService.removeItem('materials', id);
      showToast('Item removed', 'success');
      loadMaterials();
    }
  };

  const totals = materials.reduce((acc, curr) => {
    acc.estimated += curr.estimatedCost * curr.quantity;
    acc.actual += curr.actualCost * curr.quantity;
    return acc;
  }, { estimated: 0, actual: 0 });

  const variance = totals.estimated - totals.actual;
  const isOverBudget = variance < 0;

  const getStatusBadge = (status: ProjectMaterial['status']) => {
    switch (status) {
      case 'needed': return <Badge variant="neutral">Needed</Badge>;
      case 'ordered': return <Badge variant="info">Ordered</Badge>;
      case 'purchased': return <Badge variant="warning">Purchased</Badge>;
      case 'received': return <Badge variant="success">Received</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-white to-[var(--primary-subtle)] border-l-4 border-l-[var(--primary)]">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Estimated Materials</p>
              <h3 className="text-2xl font-bold">${totals.estimated.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--primary)]">
              <Package size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-white to-[var(--primary-subtle)] border-l-4 border-l-[var(--secondary)]">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Actual Spent</p>
              <h3 className="text-2xl font-bold">${totals.actual.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--secondary)]">
              <TrendingUp size={20} />
            </div>
          </div>
        </Card>

        <Card className={`bg-gradient-to-br from-white ${isOverBudget ? 'to-red-50 border-l-red-500' : 'to-green-50 border-l-green-500'} border-l-4`}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Variance</p>
              <h3 className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                {isOverBudget ? '-' : '+'}${Math.abs(variance).toLocaleString()}
              </h3>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOverBudget ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              {isOverBudget ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Search materials or vendors..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Material
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Item Name</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Quantity</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Vendor</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Est. Total</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Actual Total</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-[var(--bg-app)] transition-colors group">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-[var(--text-main)] text-capitalize">{material.name}</div>
                      {material.notes && <div className="text-[10px] text-[var(--text-muted)] truncate max-w-[200px]">{material.notes}</div>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {material.quantity} <span className="text-[var(--text-muted)] text-xs">{material.unit}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[var(--text-muted)]">
                      {material.vendor || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(material.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-[var(--text-muted)]">
                      ${(material.estimatedCost * material.quantity).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${material.actualCost > material.estimatedCost ? 'text-red-600' : 'text-green-600'}`}>
                        ${(material.actualCost * material.quantity).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(material)}
                          className="p-1.5 hover:bg-[var(--primary-subtle)] text-[var(--primary)] rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(material.id)}
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
                        <Package size={24} />
                      </div>
                      <p>No materials found for this job.</p>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal()}>Add your first item</Button>
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
        title={editingMaterial ? 'Edit Material' : 'Add Material'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Material</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Item Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Lumber, Drywall, Paint"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Quantity</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Unit</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                placeholder="ea, sqft, lft"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Est. Unit Cost</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({...formData, estimatedCost: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Actual Unit Cost</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                value={formData.actualCost}
                onChange={(e) => setFormData({...formData, actualCost: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Status</label>
            <select 
              className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as any})}
            >
              <option value="needed">Needed</option>
              <option value="ordered">Ordered</option>
              <option value="purchased">Purchased</option>
              <option value="received">Received</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Vendor (Optional)</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              value={formData.vendor}
              onChange={(e) => setFormData({...formData, vendor: e.target.value})}
              placeholder="Home Depot, Lowe's, etc."
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Notes</label>
            <textarea 
              className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all min-h-[80px]"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
