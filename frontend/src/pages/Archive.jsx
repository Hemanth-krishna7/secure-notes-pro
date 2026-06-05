import React, { useState, useEffect } from 'react';
import { Archive, RotateCcw, Trash2, Folder, Tag as TagIcon, Loader2, X, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const ArchivePage = () => {
  const [archivedNotes, setArchivedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Delete Confirmation Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch all archived notes
  const fetchArchivedNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notes?archived=true');
      if (response.data?.status === 'success') {
        setArchivedNotes(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch archived notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedNotes();
  }, []);

  // Show error for 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Restore Note handler
  const handleRestore = async (noteId) => {
    try {
      const response = await api.put(`/notes/${noteId}/restore`);
      if (response.data?.status === 'success') {
        setArchivedNotes(archivedNotes.filter(n => n.id !== noteId));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore note.');
    }
  };

  // Trigger Delete confirmation
  const triggerDelete = (note) => {
    setNoteToDelete(note);
    setIsConfirmOpen(true);
  };

  // Permanent Delete Note handler
  const handlePermanentDelete = async () => {
    if (!noteToDelete) return;
    try {
      setDeleting(true);
      const response = await api.delete(`/notes/${noteToDelete.id}`);
      if (response.data?.status === 'success') {
        setArchivedNotes(archivedNotes.filter(n => n.id !== noteToDelete.id));
        setIsConfirmOpen(false);
        setNoteToDelete(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to permanently delete note.');
    } finally {
      setDeleting(false);
    }
  };

  // Relative Time calculation
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 0) return 'Just now';
      if (diffInSeconds < 60) return 'Just now';
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes === 1) return '1 minute ago';
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours === 1) return '1 hour ago';
      if (diffInHours < 24) return `${diffInHours} hours ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return 'Yesterday';
      return `${diffInDays} days ago`;
    } catch (e) {
      return '';
    }
  };

  // Preview content limit helper
  const getPreviewContent = (text) => {
    if (!text) return 'No content';
    const cleanText = text.trim();
    if (cleanText.length <= 120) return cleanText;
    return cleanText.substring(0, 120) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Intro info bar */}
      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200/50 flex items-center justify-center text-slate-500 flex-shrink-0">
          <Archive className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">Archive Folder</h2>
          <p className="text-xs text-slate-500">
            Notes in the archive are kept secure. You can restore them to active notes at any time or permanently delete them.
          </p>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
          <span>{error}</span>
        </div>
      )}

      {/* Archived Notes Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm">Loading archived notes...</span>
        </div>
      ) : archivedNotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <Archive className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800 mb-1">Archive is empty</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You don't have any archived notes yet. Active notes can be archived from the Dashboard or All Notes page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archivedNotes.map((note) => (
            <div
              key={note.id}
              className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200/80 transition-all duration-200 flex flex-col justify-between min-h-[170px]"
              style={{ borderLeft: `6px solid ${note.color || '#ffffff'}` }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate leading-snug">
                      {note.title}
                    </h3>
                    {/* Category Badge */}
                    <span className="inline-flex items-center gap-1 text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full font-medium w-fit border border-slate-100">
                      <Folder className="w-2.5 h-2.5" />
                      {note.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed break-words mb-3">
                  {getPreviewContent(note.content)}
                </p>

                {/* Tags list */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {note.tags.map(t => (
                      <span key={t.id} className="inline-flex items-center gap-0.5 text-[9px] bg-blue-50/50 text-primary border border-blue-100/50 px-1.5 py-0.5 rounded-md font-medium">
                        <TagIcon className="w-2.5 h-2.5" />
                        {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Note Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-900/5 text-[10px] text-slate-400 mt-2">
                <span>{getRelativeTime(note.created_at)}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRestore(note.id)}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-primary transition-colors cursor-pointer"
                    title="Restore Note"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => triggerDelete(note)}
                    className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                    title="Permanently Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-slate-100 overflow-hidden animate-scale-in">
            <div className="p-5 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 text-red-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Permanently delete note?</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Are you sure you want to permanently delete <strong>"{noteToDelete?.title}"</strong>? This action is irreversible and the content cannot be recovered.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                disabled={deleting}
                onClick={() => {
                  setIsConfirmOpen(false);
                  setNoteToDelete(null);
                }}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handlePermanentDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivePage;
