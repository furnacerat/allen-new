'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal } from '@/components/ui';
import { 
  FileEdit, 
  Plus, 
  Search, 
  Calendar, 
  DollarSign,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { storageService } from '@/lib/storage/storageService';
import { ChangeOrder } from '@/domain/types';
import { useToast } from '@/context/ToastContext';

interface ChangeOrdersTabProps {
  jobId: string;
}

export function ChangeOrdersTab({ jobId }: ChangeOrdersTabProps) {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<ChangeOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ChangeOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amountChange: 0,
    status: 'pending' as ChangeOrder['status']
  });

  useEffect(() => {
    loadOrders();
  }, [jobId]);

  const loadOrders = () => {
    const allOrders = storageService.getCollection('changeOrders') as ChangeOrder[];
    setOrders(allOrders.filter(o => o.jobId === jobId));
  };

  const handleOpenModal = (order?: ChangeOrder) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        title: order.title,
        description: order.description,
        amountChange: order.amountChange,
        status: order.status
      });
    } else {
      setEditingOrder(null);
      setFormData({
        title: '',
        description: '',
        amountChange: 0,
        status: 'pending'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title) {
      showToast('Title is required', 'error');
      return;
    }

    const orderData: ChangeOrder = {
      id: editingOrder?.id || crypto.randomUUID(),
      jobId,
      ...formData,
      createdAt: editingOrder?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveItem('changeOrders', orderData);
    showToast(editingOrder ? 'Change order updated' : 'Change order added', 'success');
    setIsModalOpen(false);
    loadOrders();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this change order?')) {
      storageService.removeItem('changeOrders', id);
      showToast('Change order removed', 'success');
      loadOrders();
    }
  };

  const getStatusBadge = (status: ChangeOrder['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'approved': return <Badge variant="success">Approved</Badge>;
      case 'rejected': return <Badge variant="danger">Rejected</Badge>;
      case 'void': return <Badge variant="neutral">Void</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const approvedChange = orders
    .filter(o => o.status === 'approved')
    .reduce((sum, o) => sum + o.amountChange, 0);

  const filteredOrders = orders.filter(o => 
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-white to-[var(--primary-subtle)] border-l-4 border-l-[var(--primary)]">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Approved Change Total</p>
              <h3 className="text-2xl font-bold ${approvedChange >= 0 ? 'text-green-600' : 'text-red-600'}">
                {approvedChange >= 0 ? '+' : '-'}${Math.abs(approvedChange).toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--primary)]">
              <DollarSign size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-l-4 border-l-[var(--warning)]">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Pending Orders</p>
              <h3 className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <HelpCircle size={20} />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Search change orders..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          New Change Order
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Title</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Amount Change</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Created</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--bg-app)] transition-colors group">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-[var(--text-main)] text-capitalize">{order.title}</div>
                      {order.description && <div className="text-[10px] text-[var(--text-muted)] truncate max-w-[300px]">{order.description}</div>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`font-bold ${order.amountChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {order.amountChange >= 0 ? '+' : '-'}${Math.abs(order.amountChange).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[var(--text-muted)]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(order)}
                          className="p-1.5 hover:bg-[var(--primary-subtle)] text-[var(--primary)] rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(order.id)}
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
                  <td colSpan={5} className="px-4 py-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--bg-app)] flex items-center justify-center opacity-30">
                        <FileEdit size={24} />
                      </div>
                      <p>No change orders found.</p>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal()}>Create first change order</Button>
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
        title={editingOrder ? 'Edit Change Order' : 'New Change Order'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Change Order</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Title</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Additional Cabinetry"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Description</label>
            <textarea 
              className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all min-h-[80px]"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Detail the scope changes..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Amount Change ($)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                value={formData.amountChange}
                onChange={(e) => setFormData({...formData, amountChange: parseFloat(e.target.value) || 0})}
              />
              <p className="text-[10px] text-[var(--text-muted)]">Use negative for deductions</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Status</label>
              <select 
                className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="void">Void</option>
              </select>
            </div>
          </div>
          {formData.status === 'approved' && (
            <div className="p-3 bg-green-50 rounded-xl border border-green-100 flex items-start gap-3">
               <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
               <p className="text-xs text-green-800">
                  Approved change orders will update the contract amount and profit calculations.
               </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
