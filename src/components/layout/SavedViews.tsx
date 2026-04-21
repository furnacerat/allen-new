'use client';
import { useState, useEffect } from 'react';
import { Save, X, Filter, ArrowDown, ArrowUp, Trash2, Bookmark } from 'lucide-react';
import { storageService } from '@/lib/storage/storageService';
import { Button, Badge, Modal } from '@/components/ui';
import { SavedView } from '@/domain/types';

interface SavedViewsProps {
  page: 'customers' | 'jobs' | 'invoices' | 'estimates';
  currentFilters: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onApplyView: (filters: Record<string, any>, sortBy?: string, sortOrder?: 'asc' | 'desc') => void;
}

export function SavedViews({ page, currentFilters, sortBy, sortOrder, onApplyView }: SavedViewsProps) {
  const [views, setViews] = useState<SavedView[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  useEffect(() => {
    setViews(storageService.getSavedViews(page));
  }, [page]);

  const handleSaveView = () => {
    if (!newViewName.trim()) return;
    storageService.saveSavedView({
      name: newViewName.trim(),
      page,
      filters: currentFilters,
      sortBy,
      sortOrder
    });
    setViews(storageService.getSavedViews(page));
    setNewViewName('');
    setIsModalOpen(false);
  };

  const handleDeleteView = (id: string) => {
    storageService.deleteSavedView(id);
    setViews(storageService.getSavedViews(page));
  };

  const handleApplyView = (view: SavedView) => {
    onApplyView(view.filters, view.sortBy, view.sortOrder);
  };

  const hasFilters = Object.values(currentFilters).some(v => v && v !== 'all' && v !== '');

  return (
    <div className="flex items-center gap-2">
      {views.length > 0 && (
        <div className="flex items-center gap-1">
          <Bookmark size={14} className="text-[var(--text-muted)]" />
          <select
            className="bg-transparent border-none text-sm focus:ring-0 h-9 cursor-pointer pr-6 text-[var(--primary)] font-medium"
            onChange={(e) => {
              const view = views.find(v => v.id === e.target.value);
              if (view) handleApplyView(view);
            }}
            defaultValue=""
          >
            <option value="" disabled>Saved Views</option>
            {views.map(view => (
              <option key={view.id} value={view.id}>{view.name}</option>
            ))}
          </select>
        </div>
      )}

      {hasFilters && (
        <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
          <Save className="mr-2 h-3 w-3" />
          Save View
        </Button>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Save Current View"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveView} disabled={!newViewName.trim()}>Save View</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold">View Name</label>
            <input
              type="text"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              placeholder="e.g., Active Jobs, This Month's Invoices"
              className="w-full mt-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              autoFocus
            />
          </div>
          <div className="text-sm text-[var(--text-muted)]">
            <p className="font-medium mb-2">Current filters to save:</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(currentFilters).filter(([_, v]) => v && v !== 'all' && v !== '').map(([key, value]) => (
                <Badge key={key} variant="info">{key}: {String(value)}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}