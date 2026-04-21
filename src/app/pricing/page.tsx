'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge, PageHeader, EmptyState, Modal } from '@/components/ui';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  Package,
  Wrench,
  Truck,
  Users,
  MoreHorizontal,
  X,
  Save
} from 'lucide-react';
import { storageService } from '@/lib/storage/storageService';
import { PricingItem, PricingCategory } from '@/domain/types';

const CATEGORIES: { id: PricingCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'material', label: 'Materials', icon: <Package size={16} /> },
  { id: 'labor', label: 'Labor', icon: <Wrench size={16} /> },
  { id: 'equipment', label: 'Equipment', icon: <Truck size={16} /> },
  { id: 'subcontractor', label: 'Subcontractors', icon: <Users size={16} /> },
  { id: 'misc', label: 'Misc', icon: <DollarSign size={16} /> },
];

const UNITS = ['each', 'hr', 'day', 'sqft', 'linear ft', 'gallon', 'pound', 'ton', 'bundle', 'box', 'sheet', 'pc', 'ln ft'];

export default function PricingPage() {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PricingCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PricingItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'labor' as PricingCategory,
    unit: 'each',
    unitCost: 0,
    sellPrice: 0,
    markup: 0,
    isActive: true,
    notes: ''
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    setItems(storageService.getPricing());
    setIsLoading(false);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openModal = (item?: PricingItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        category: item.category,
        unit: item.unit,
        unitCost: item.unitCost,
        sellPrice: item.sellPrice,
        markup: item.markup,
        isActive: item.isActive,
        notes: item.notes || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        category: 'labor',
        unit: 'hr',
        unitCost: 0,
        sellPrice: 0,
        markup: 0,
        isActive: true,
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    storageService.savePricingItem({
      id: editingItem?.id,
      ...formData
    });
    loadItems();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this pricing item?')) {
      storageService.deletePricingItem(id);
      loadItems();
    }
  };

  const getCategoryStats = (category: PricingCategory) => {
    return items.filter(i => i.category === category && i.isActive).length;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in">
        <div className="h-10 w-32 bg-[var(--border-subtle)] rounded animate-pulse" />
        <div className="grid grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-20 bg-[var(--border-subtle)] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Pricing"
        description="Manage your labor, material, equipment, and subcontractor pricing."
        action={
          <Button onClick={() => openModal()}>
            <Plus size={18} />
            Add Pricing
          </Button>
        }
      />

      {/* Category Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(categoryFilter === cat.id ? 'all' : cat.id)}
            className={`
              p-4 rounded-xl text-left transition-all duration-150
              ${categoryFilter === cat.id 
                ? 'bg-[var(--primary)] text-white shadow-lg' 
                : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--primary)]'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={categoryFilter === cat.id ? 'text-white/80' : 'text-[var(--text-muted)]'}>
                {cat.icon}
              </span>
              <span className={`text-xs font-medium ${categoryFilter === cat.id ? 'text-white/80' : ''}`}>
                {cat.label}
              </span>
            </div>
            <div className={`text-2xl font-bold ${categoryFilter === cat.id ? 'text-white' : 'text-[var(--text-main)]'}`}>
              {getCategoryStats(cat.id)}
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 bg-[var(--bg-card)] p-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text"
            placeholder="Search pricing..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm pl-10 pr-4 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Pricing List */}
      {filteredItems.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={<DollarSign size={32} />}
            title="No pricing items"
            description="Add your labor rates, material costs, and subcontractor prices to use in estimates."
            action={<Button onClick={() => openModal()}>Add First Pricing</Button>}
          />
        </Card>
      ) : (
        <Card className="p-0" padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left text-xs font-semibold text-[var(--text-muted)] px-5 py-4">Item</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-muted)] px-5 py-4">Category</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-muted)] px-5 py-4">Unit</th>
                  <th className="text-right text-xs font-semibold text-[var(--text-muted)] px-5 py-4">Your Cost</th>
                  <th className="text-right text-xs font-semibold text-[var(--text-muted)] px-5 py-4">Sell Price</th>
                  <th className="text-right text-xs font-semibold text-[var(--text-muted)] px-5 py-4">Markup</th>
                  <th className="text-center text-xs font-semibold text-[var(--text-muted)] px-5 py-4">Status</th>
                  <th className="text-right text-xs font-semibold text-[var(--text-muted)] px-5 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--primary-subtle)]/30 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-[var(--text-main)]">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-[var(--text-muted)]">{item.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={item.category === 'labor' ? 'info' : item.category === 'material' ? 'success' : 'warning'}>
                        {item.category}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">{item.unit}</td>
                    <td className="px-5 py-4 text-right font-medium">${item.unitCost.toFixed(2)}</td>
                    <td className="px-5 py-4 text-right font-bold text-[var(--text-main)]">${item.sellPrice.toFixed(2)}</td>
                    <td className="px-5 py-4 text-right text-sm text-[var(--text-muted)]">{item.markup}%</td>
                    <td className="px-5 py-4 text-center">
                      <Badge variant={item.isActive ? 'success' : 'neutral'}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => openModal(item)}
                          className="p-2 hover:bg-[var(--primary-subtle)] rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)]"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-[var(--danger-subtle)] rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Pricing' : 'Add Pricing'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              <Save size={16} />
              <span className="ml-2">Save</span>
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Hourly Labor, Drywall Sheet"
              className="w-full h-11 px-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description (Optional)</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details..."
              className="w-full h-11 px-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as PricingCategory })}
                className="w-full h-11 px-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full h-11 px-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
              >
                {UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Your Cost ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                className="w-full h-11 px-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Sell Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.sellPrice}
                onChange={(e) => setFormData({ ...formData, sellPrice: parseFloat(e.target.value) || 0 })}
                className="w-full h-11 px-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Markup (%)</label>
            <input
              type="number"
              value={formData.markup}
              onChange={(e) => setFormData({ ...formData, markup: parseFloat(e.target.value) || 0 })}
              className="w-full h-11 px-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-[var(--border-subtle)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">Active (available in estimates)</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}