import React, { useState, useEffect } from 'react';
import { FileText, Pin, Folder, Heart, Clock, Plus, Trash2, Edit3, Search, X, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const COLOR_PRESETS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Sky Blue', value: '#eff6ff' },
  { name: 'Mint Green', value: '#f0fdf4' },
  { name: 'Amber Yellow', value: '#fffbeb' },
  { name: 'Rose Pink', value: '#fef2f2' },
  { name: 'Lavender Purple', value: '#faf5ff' }
];

const Dashboard = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteModalMode, setNoteModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteForm, setNoteForm] = useState({ title: '', content: '', color: '#ffffff' });

  // Delete Confirm state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notes');
      if (response.data && response.data.status === 'success') {
        setNotes(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Show error for 4 seconds, then fade out
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle Note Create/Edit Submit
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteForm.title.trim()) {
      setError('Title is required.');
      return;
    }

    try {
      if (noteModalMode === 'create') {
        const response = await api.post('/notes', {
          title: noteForm.title.trim(),
          content: noteForm.content,
          color: noteForm.color,
          is_pinned: false,
          is_favorite: false
        });
        if (response.data && response.data.status === 'success') {
          setNotes([response.data.data, ...notes]);
          setIsNoteModalOpen(false);
        }
      } else if (noteModalMode === 'edit' && selectedNote) {
        const response = await api.put(`/notes/${selectedNote.id}`, {
          title: noteForm.title.trim(),
          content: noteForm.content,
          color: noteForm.color
        });
        if (response.data && response.data.status === 'success') {
          setNotes(notes.map(n => n.id === selectedNote.id ? response.data.data : n));
          setIsNoteModalOpen(false);
        }
      }
      // Reset form
      setNoteForm({ title: '', content: '', color: '#ffffff' });
      setSelectedNote(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note.');
    }
  };

  // Toggle Pinned Status
  const togglePin = async (e, note) => {
    e.stopPropagation();
    try {
      const response = await api.put(`/notes/${note.id}`, {
        is_pinned: !note.is_pinned
      });
      if (response.data && response.data.status === 'success') {
        // Resort: pinned first, then updated_at desc
        const updatedNotes = notes.map(n => n.id === note.id ? response.data.data : n);
        updatedNotes.sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) {
            return b.is_pinned ? 1 : -1;
          }
          return new Date(b.updated_at) - new Date(a.updated_at);
        });
        setNotes(updatedNotes);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update pin status.');
    }
  };

  // Toggle Favorite Status
  const toggleFavorite = async (e, note) => {
    e.stopPropagation();
    try {
      const response = await api.put(`/notes/${note.id}`, {
        is_favorite: !note.is_favorite
      });
      if (response.data && response.data.status === 'success') {
        setNotes(notes.map(n => n.id === note.id ? response.data.data : n));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update favorite status.');
    }
  };

  // Trigger Edit Modal
  const openEditModal = (note) => {
    setSelectedNote(note);
    setNoteForm({
      title: note.title,
      content: note.content || '',
      color: note.color || '#ffffff'
    });
    setNoteModalMode('edit');
    setIsNoteModalOpen(true);
  };

  // Trigger Delete Dialog
  const openDeleteDialog = (e, note) => {
    e.stopPropagation();
    setNoteToDelete(note);
    setIsDeleteConfirmOpen(true);
  };

  // Delete note
  const handleDeleteNote = async () => {
    if (!noteToDelete) return;
    try {
      const response = await api.delete(`/notes/${noteToDelete.id}`);
      if (response.data && response.data.status === 'success') {
        setNotes(notes.filter(n => n.id !== noteToDelete.id));
        setIsDeleteConfirmOpen(false);
        setNoteToDelete(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete note.');
    }
  };

  // Truncate content preview helper (100-150 characters)
  const getPreviewContent = (text) => {
    if (!text) return '';
    const limit = 120;
    if (text.length <= limit) return text;
    return text.slice(0, limit) + '...';
  };

  // Relative Time helper for activities and note cards
  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    
    if (diffMs < 0) return 'Just now';
    
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return 'Just now';
    
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) {
      return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
    }
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // Metric calculation
  const totalNotes = notes.length;
  const pinnedNotesCount = notes.filter(n => n.is_pinned).length;
  const categoriesCount = 0; // Categories (0 for now) as requested
  const favoriteNotesCount = notes.filter(n => n.is_favorite).length;

  // Filtered notes based on search query
  const filteredNotes = notes.filter(note => {
    const titleMatch = note.title.toLowerCase().includes(searchQuery.toLowerCase());
    const contentMatch = (note.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || contentMatch;
  });

  // Dynamic activity log derived from note updates and creations
  const getActivityLog = () => {
    const events = [];
    notes.forEach(note => {
      // Every note has a creation event
      events.push({
        action: 'Created note',
        target: note.title,
        timestamp: note.created_at
      });
      
      // If updated_at is different from created_at, it also has an update event
      const isUpdated = Math.abs(new Date(note.updated_at) - new Date(note.created_at)) > 2000;
      if (isUpdated) {
        events.push({
          action: 'Updated note',
          target: note.title,
          timestamp: note.updated_at
        });
      }
    });

    // Sort by timestamp descending and take the 5 most recent
    return events
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
      .map(event => ({
        action: event.action,
        target: event.target,
        time: getRelativeTime(event.timestamp)
      }));
  };

  const recentActivities = getActivityLog();

  const cards = [
    {
      title: 'Total Notes',
      value: totalNotes,
      change: 'All secure entries',
      icon: FileText,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      title: 'Pinned Notes',
      value: pinnedNotesCount,
      change: 'Quick access keys',
      icon: Pin,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      title: 'Categories',
      value: categoriesCount,
      change: 'Active organization groups',
      icon: Folder,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Favorite Notes',
      value: favoriteNotesCount,
      change: 'Marked important',
      icon: Heart,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto select-none">
      {/* Toast Notification for errors */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-fade-in flex items-center gap-2 max-w-md">
          <span className="text-xs font-semibold">{error}</span>
          <button onClick={() => setError('')} className="p-0.5 hover:bg-white/20 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top dashboard heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Welcome, {user?.full_name || 'User'}</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time statistics of your secured note vault.</p>
        </div>
        
        {/* Create Note Button */}
        <button
          onClick={() => {
            setNoteForm({ title: '', content: '', color: '#ffffff' });
            setNoteModalMode('create');
            setIsNoteModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors duration-150"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={index} 
              className="bg-white border border-slate-100/80 p-6 rounded-2xl shadow-premium hover:shadow-hover transition-all duration-200 flex items-start justify-between"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{card.title}</span>
                <span className="text-3xl font-extrabold text-slate-900 block">{card.value}</span>
                <span className="text-[11px] text-slate-400 font-medium block">{card.change}</span>
              </div>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes and Activity Grid */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Notes list area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Bar UI */}
          <div className="bg-white border border-slate-100/80 p-4 rounded-2xl shadow-premium flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Notes display */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs text-slate-400">Loading secure notes...</span>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {searchQuery ? 'No matching notes found' : 'No notes yet. Create your first note.'}
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {searchQuery 
                  ? 'Try modifying your search criteria or clear the query.' 
                  : 'Start cataloging your thoughts, codes, and secure credentials in real-time.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => {
                    setNoteForm({ title: '', content: '', color: '#ffffff' });
                    setNoteModalMode('create');
                    setIsNoteModalOpen(true);
                  }}
                  className="mt-2 text-xs text-primary font-bold hover:text-primary-hover flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create note
                </button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => openEditModal(note)}
                  className="group relative border border-slate-100 p-5 rounded-2xl shadow-premium hover:shadow-hover transition-all duration-200 flex flex-col justify-between min-h-[160px] cursor-pointer"
                  style={{ backgroundColor: note.color }}
                >
                  {/* Note body */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-6">
                      <h3 className="text-sm font-bold text-slate-800 break-words flex-1 group-hover:text-primary transition-colors">
                        {note.title}
                      </h3>
                      
                      {/* Pinned & Favorite status */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={(e) => togglePin(e, note)}
                          className={`p-1.5 rounded-lg hover:bg-slate-900/5 transition-colors focus:outline-none cursor-pointer ${
                            note.is_pinned ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                          }`}
                          title={note.is_pinned ? 'Unpin Note' : 'Pin Note'}
                        >
                          <Pin className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={(e) => toggleFavorite(e, note)}
                          className={`p-1.5 rounded-lg hover:bg-slate-900/5 transition-colors focus:outline-none cursor-pointer ${
                            note.is_favorite ? 'text-rose-500' : 'text-slate-300 hover:text-rose-500'
                          }`}
                          title={note.is_favorite ? 'Unfavorite Note' : 'Favorite Note'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${note.is_favorite ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed break-words">
                      {getPreviewContent(note.content)}
                    </p>
                  </div>

                  {/* Note Footer */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-900/5 text-[10px] text-slate-400">
                    <span>{getRelativeTime(note.created_at)}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(note);
                        }}
                        className="p-1 hover:bg-slate-900/5 rounded text-slate-500"
                        title="Edit note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => openDeleteDialog(e, note)}
                        className="p-1 hover:bg-red-50 rounded text-red-500"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Recent Activity & Actions */}
        <div className="space-y-6">
          {/* Recent Activity Card */}
          <div className="bg-white border border-slate-100/80 p-6 rounded-2xl shadow-premium space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
              <Clock className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
            </div>
            
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No recent activity detected.</p>
              ) : (
                recentActivities.map((act, index) => (
                  <div key={index} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-hover flex-shrink-0"></span>
                      <span className="text-slate-500">{act.action}</span>
                      <span className="font-semibold text-slate-700 max-w-[120px] truncate block">
                        {act.target}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[10px] flex-shrink-0">{act.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Info panel */}
          <div className="bg-gradient-to-b from-blue-50/50 to-indigo-50/30 border border-blue-50 p-6 rounded-2xl shadow-premium flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Secure Note Vault</span>
              <h4 className="text-sm font-bold text-slate-800 leading-tight">Database integrity active</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                All records are saved securely. When deleting notes, data is permanently scrubbed from the active local store.
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-blue-100/60 flex items-center justify-between text-[10px] text-slate-400">
              <span>SQLite version: 3.x</span>
              <span>Encryption: AES-ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE & EDIT NOTE MODAL */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-premium border border-slate-100 max-w-lg w-full overflow-hidden animate-slide-up flex flex-col">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {noteModalMode === 'create' ? 'Create New Note' : 'Edit Note'}
              </h3>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleNoteSubmit} className="p-5 space-y-4">
              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Note title"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary transition-colors text-slate-700 bg-transparent"
                />
              </div>

              {/* Content Textarea */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Content (Optional)</label>
                <textarea
                  placeholder="Write note contents here..."
                  rows="5"
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary transition-colors text-slate-700 bg-transparent resize-none"
                />
              </div>

              {/* Color Preset Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Color Accent</label>
                <div className="flex flex-wrap gap-2.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setNoteForm({ ...noteForm, color: preset.value })}
                      className={`w-7 h-7 rounded-full border cursor-pointer transition-all duration-150 flex items-center justify-center ${
                        noteForm.color === preset.value
                          ? 'border-primary ring-2 ring-primary/20 scale-105 shadow-sm'
                          : 'border-slate-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.value }}
                      title={preset.name}
                    >
                      {noteForm.color === preset.value && (
                        <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {noteModalMode === 'create' ? 'Create Note' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-premium border border-slate-100 max-w-sm w-full p-5 animate-slide-up space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Delete Note</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-700">"{noteToDelete?.title}"</span>? This action cannot be undone and will permanently erase this record.
            </p>
            
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setNoteToDelete(null);
                }}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteNote}
                className="px-3.5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
