'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal } from '@/components/ui';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Clock, 
  Edit, 
  Trash2,
  FileText,
  Activity,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { storageService } from '@/lib/storage/storageService';
import { JobNote, JobProgress } from '@/domain/types';
import { useToast } from '@/context/ToastContext';

interface NotesTabProps {
  jobId: string;
}

export function NotesTab({ jobId }: NotesTabProps) {
  const { showToast } = useToast();
  const [notes, setNotes] = useState<JobNote[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<JobNote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    content: ''
  });

  useEffect(() => {
    loadNotes();
  }, [jobId]);

  const loadNotes = () => {
    const allNotes = storageService.getCollection('jobNotes') as JobNote[];
    setNotes(allNotes.filter(n => n.jobId === jobId));
  };

  const handleOpenModal = (note?: JobNote) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        content: note.content
      });
    } else {
      setEditingNote(null);
      setFormData({
        content: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.content) {
      showToast('Note content is required', 'error');
      return;
    }

    const noteData: JobNote = {
      id: editingNote?.id || crypto.randomUUID(),
      jobId,
      content: formData.content,
      author: 'Admin',
      createdAt: editingNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveItem('jobNotes', noteData);
    showToast(editingNote ? 'Note updated' : 'Note added', 'success');
    setIsModalOpen(false);
    loadNotes();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      storageService.removeItem('jobNotes', id);
      showToast('Note removed', 'success');
      loadNotes();
    }
  };

  const filteredNotes = notes.filter(n => 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Internal Note
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {filteredNotes.length > 0 ? (
           filteredNotes.map((note) => (
             <Card key={note.id} className="relative group hover:border-[var(--primary)] transition-colors">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      <Clock size={12} />
                      {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </div>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(note)}
                        className="p-1 hover:bg-[var(--primary-subtle)] text-[var(--primary)] rounded transition-colors"
                      >
                         <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(note.id)}
                        className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>
                </div>
                <p className="text-sm text-[var(--text-main)] leading-relaxed whitespace-pre-wrap">
                   {note.content}
                </p>
             </Card>
           ))
         ) : (
           <div className="md:col-span-2 py-20 text-center">
              <div className="w-16 h-16 bg-[var(--bg-app)] rounded-full flex items-center justify-center mx-auto text-[var(--text-muted)] opacity-30 mb-4">
                 <MessageSquare size={32} />
              </div>
              <p className="text-[var(--text-muted)]">No internal notes for this project.</p>
              <Button variant="ghost" size="sm" className="mt-4" onClick={() => handleOpenModal()}>Create your first note</Button>
           </div>
         )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingNote ? 'Edit Note' : 'Add Internal Note'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Note</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Note Content</label>
            <textarea 
              className="w-full px-4 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all min-h-[150px]"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Record project updates, phone calls, or internal reminders..."
            />
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
             <FileText size={16} className="text-blue-600 shrink-0 mt-0.5" />
             <p className="text-[10px] text-blue-800 leading-normal">
                These notes are for <b>internal use only</b> and will not be displayed on customer-facing documents.
             </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
