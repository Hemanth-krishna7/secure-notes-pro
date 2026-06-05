import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Tag as TagIcon, Folder, Paperclip, Copy, FileText, Eye, Edit2, Trash2, HelpCircle, Clock, Check } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import api from '../services/api';

const COLOR_PRESETS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Sky Blue', value: '#eff6ff' },
  { name: 'Mint Green', value: '#f0fdf4' },
  { name: 'Amber Yellow', value: '#fffbeb' },
  { name: 'Rose Pink', value: '#fef2f2' },
  { name: 'Lavender Purple', value: '#faf5ff' }
];

// Helper component for secure, session-aware image thumbnail fetching
const ImageThumbnail = ({ attachmentId, filename }) => {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchImage = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/attachments/${attachmentId}?thumbnail=true`, {
          responseType: 'blob'
        });
        if (active) {
          const url = URL.createObjectURL(response.data);
          setSrc(url);
        }
      } catch (err) {
        console.error("Failed to load thumbnail:", err);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchImage();
    return () => {
      active = false;
      if (src) {
        URL.revokeObjectURL(src);
      }
    };
  }, [attachmentId]);

  if (loading) {
    return (
      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      </div>
    );
  }
  if (error) {
    return <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center text-[10px] text-red-400">Error</div>;
  }

  return (
    <img
      src={src}
      alt={filename}
      className="w-16 h-16 object-cover rounded-lg shadow-xs hover:opacity-80 transition-opacity"
      loading="lazy"
    />
  );
};

// Full Image Lightbox Modal
const FullImagePreview = ({ attachmentId, filename, onClose }) => {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchFullImage = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/attachments/${attachmentId}`, {
          responseType: 'blob'
        });
        if (active) {
          const url = URL.createObjectURL(response.data);
          setSrc(url);
        }
      } catch (err) {
        console.error("Failed to load full image:", err);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchFullImage();
    return () => {
      active = false;
      if (src) {
        URL.revokeObjectURL(src);
      }
    };
  }, [attachmentId]);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300 transition-colors focus:outline-none cursor-pointer">
          <X className="w-6 h-6" />
        </button>
        {loading && (
          <div className="text-white flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading image...
          </div>
        )}
        {error && <div className="text-red-400 bg-red-950/50 px-4 py-2 rounded-xl">Failed to load image.</div>}
        {src && (
          <img
            src={src}
            alt={filename}
            className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
          />
        )}
        <div className="text-white text-xs mt-3 bg-slate-900/50 px-3 py-1.5 rounded-full backdrop-blur-xs">
          {filename}
        </div>
      </div>
    </div>
  );
};

const NoteModal = ({
  isOpen,
  onClose,
  note,
  mode,
  categories,
  tags,
  onNoteSaved,
  onTagCreated,
  onCategoryCreated
}) => {
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    color: '#ffffff',
    category_id: '',
    tag_ids: []
  });

  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedRendered, setCopiedRendered] = useState(false);
  const [activePreviewImage, setActivePreviewImage] = useState(null);
  const [error, setError] = useState('');
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const autosaveTimerRef = useRef(null);

  // Initialize form state
  useEffect(() => {
    if (isOpen) {
      setError('');
      // Clean up drafts older than 7 days
      cleanOldDrafts();

      if (mode === 'edit' && note) {
        // Attempt to restore autosaved draft if present
        const draftStr = localStorage.getItem(`draft_note_${note.id}`);
        let restoredForm = null;
        if (draftStr) {
          try {
            restoredForm = JSON.parse(draftStr);
          } catch (e) {
            console.error("Failed to parse draft:", e);
          }
        }

        if (restoredForm) {
          setNoteForm(restoredForm);
        } else {
          setNoteForm({
            title: note.title,
            content: note.content || '',
            color: note.color || '#ffffff',
            category_id: note.category_id ? note.category_id.toString() : '',
            tag_ids: note.tags ? note.tags.map(t => t.id) : []
          });
        }
        setAttachments(note.attachments || []);
      } else {
        // Create mode - Restore create draft
        const draftStr = localStorage.getItem('draft_note_new');
        let restoredForm = null;
        if (draftStr) {
          try {
            restoredForm = JSON.parse(draftStr);
          } catch (e) {
            console.error("Failed to parse draft:", e);
          }
        }

        if (restoredForm) {
          setNoteForm(restoredForm);
        } else {
          setNoteForm({
            title: '',
            content: '',
            color: '#ffffff',
            category_id: '',
            tag_ids: []
          });
        }
        setAttachments([]);
      }
    }
  }, [isOpen, note, mode]);

  // Clean up debounced autosave timer on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  // Clean old drafts (7 days expiry check)
  const cleanOldDrafts = () => {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    
    keys.forEach(key => {
      if (key.startsWith('draft_note_') && key.endsWith('_updated_at')) {
        const updatedAt = parseInt(localStorage.getItem(key));
        if (!isNaN(updatedAt) && (now - updatedAt > sevenDaysMs)) {
          const noteId = key.replace('draft_note_', '').replace('_updated_at', '');
          localStorage.removeItem(`draft_note_${noteId}`);
          localStorage.removeItem(key);
        }
      }
    });
  };

  // Debounced Local Storage Autosave
  const triggerAutosave = (formState) => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    
    autosaveTimerRef.current = setTimeout(() => {
      const draftId = mode === 'edit' ? note.id : 'new';
      localStorage.setItem(`draft_note_${draftId}`, JSON.stringify(formState));
      localStorage.setItem(`draft_note_${draftId}_updated_at`, Date.now().toString());
    }, 2000);
  };

  // Content change handler
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    const updatedForm = { ...noteForm, content: newContent };
    setNoteForm(updatedForm);
    triggerAutosave(updatedForm);
  };

  // Title change handler
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    const updatedForm = { ...noteForm, title: newTitle };
    setNoteForm(updatedForm);
    triggerAutosave(updatedForm);
  };

  // Clear local storage draft
  const clearDraft = () => {
    const draftId = mode === 'edit' ? note.id : 'new';
    localStorage.removeItem(`draft_note_${draftId}`);
    localStorage.removeItem(`draft_note_${draftId}_updated_at`);
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
  };

  // Save changes to database
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!noteForm.title.trim()) {
      setError('Title is required.');
      return;
    }

    try {
      const payload = {
        title: noteForm.title.trim(),
        content: noteForm.content,
        color: noteForm.color,
        category_id: noteForm.category_id ? parseInt(noteForm.category_id) : null,
        tag_ids: noteForm.tag_ids.map(id => parseInt(id))
      };

      if (mode === 'create') {
        const response = await api.post('/notes', payload);
        if (response.data?.status === 'success') {
          clearDraft();
          onNoteSaved(response.data.data);
          onClose();
        }
      } else if (mode === 'edit' && note) {
        const response = await api.put(`/notes/${note.id}`, payload);
        if (response.data?.status === 'success') {
          clearDraft();
          onNoteSaved(response.data.data);
          onClose();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note.');
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  // File Upload flow
  const handleFilesUpload = async (files) => {
    if (!files || files.length === 0) return;
    setError('');

    // Check count limit
    if (attachments.length + files.length > 10) {
      setError('Maximum 10 attachments allowed per note.');
      return;
    }

    setUploading(true);
    const newAttachments = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate size
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} exceeds the 10MB limit.`);
        setUploading(false);
        return;
      }

      // Validate extension
      const allowedExts = ['png', 'jpg', 'jpeg', 'webp'];
      const fileExt = file.name.split('.').pop().toLowerCase();
      if (!allowedExts.includes(fileExt)) {
        setError(`File ${file.name} is not a supported format.`);
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await api.post(`/notes/${note.id}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data?.status === 'success') {
          newAttachments.push(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || `Failed to upload ${file.name}`);
        setUploading(false);
        return;
      }
    }

    const updated = [...attachments, ...newAttachments];
    setAttachments(updated);
    setUploading(false);
    
    // Auto-update note listing state on parent
    if (onNoteSaved && note) {
      onNoteSaved({ ...note, attachments: updated });
    }
  };

  // Delete Attachment
  const handleDeleteAttachment = async (attachmentId) => {
    try {
      const response = await api.delete(`/attachments/${attachmentId}`);
      if (response.data?.status === 'success') {
        const updated = attachments.filter(a => a.id !== attachmentId);
        setAttachments(updated);
        if (onNoteSaved && note) {
          onNoteSaved({ ...note, attachments: updated });
        }
      }
    } catch (err) {
      setError('Failed to delete attachment.');
    }
  };

  // Inline Tag creation
  const handleCreateTagInline = async () => {
    const name = newTagName.trim();
    if (!name) return;
    try {
      const response = await api.post('/tags', { name });
      if (response.data?.status === 'success') {
        onTagCreated(response.data.data);
        const updatedForm = { ...noteForm, tag_ids: [...noteForm.tag_ids, response.data.data.id] };
        setNoteForm(updatedForm);
        triggerAutosave(updatedForm);
        setNewTagName('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tag.');
    }
  };

  // Inline Category creation
  const handleCreateCategoryInline = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      const response = await api.post('/categories', { name });
      if (response.data?.status === 'success') {
        onCategoryCreated(response.data.data);
        const updatedForm = { ...noteForm, category_id: response.data.data.id.toString() };
        setNoteForm(updatedForm);
        triggerAutosave(updatedForm);
        setNewCategoryName('');
        setShowAddCategory(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category.');
    }
  };

  const handleTagToggle = (tagId) => {
    const exists = noteForm.tag_ids.includes(tagId);
    let updatedTags;
    if (exists) {
      updatedTags = noteForm.tag_ids.filter(id => id !== tagId);
    } else {
      updatedTags = [...noteForm.tag_ids, tagId];
    }
    const updatedForm = { ...noteForm, tag_ids: updatedTags };
    setNoteForm(updatedForm);
    triggerAutosave(updatedForm);
  };

  // Markdown Render with DOMPurify
  const getRenderedMarkdown = () => {
    if (!noteForm.content) return '';
    try {
      const rawHtml = marked.parse(noteForm.content);
      return DOMPurify.sanitize(rawHtml);
    } catch (err) {
      return 'Error parsing Markdown.';
    }
  };

  // Copy Buttons functions
  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(noteForm.content || '');
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 1500);
  };

  const handleCopyRenderedText = () => {
    const html = getRenderedMarkdown();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.innerText || tempDiv.textContent || '';
    navigator.clipboard.writeText(text);
    setCopiedRendered(true);
    setTimeout(() => setCopiedRendered(false), 1500);
  };

  // Productivity Metrics
  const charCount = noteForm.content ? noteForm.content.length : 0;
  const wordCount = noteForm.content ? noteForm.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const estReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {mode === 'create' ? 'Create New Note' : 'Edit Note'}
            </h3>
            {mode === 'edit' && note && (
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Last updated: {new Date(note.updated_at).toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-6 flex flex-col md:flex-row gap-6">
          
          {/* Column 1: Note Details & Editor */}
          <div className="flex-1 space-y-4 min-w-0">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-2 rounded-xl text-xs">
                {error}
              </div>
            )}

            {/* Note Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Note Title *</label>
              <input
                type="text"
                placeholder="Enter title..."
                value={noteForm.title}
                onChange={handleTitleChange}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            {/* Tabs for Editor vs Preview */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'edit'
                      ? 'bg-primary text-white'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-primary text-white'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
              </div>

              {/* Copy actions */}
              {activeTab === 'preview' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-primary font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 transition-all cursor-pointer"
                  >
                    {copiedMarkdown ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {copiedMarkdown ? 'Copied!' : 'Copy MD'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyRenderedText}
                    className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-primary font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 transition-all cursor-pointer"
                  >
                    {copiedRendered ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {copiedRendered ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
              )}
            </div>

            {/* Editor Input Area */}
            {activeTab === 'edit' ? (
              <div className="space-y-1">
                <textarea
                  placeholder="Start writing in Markdown (e.g. # Heading, **bold**)..."
                  value={noteForm.content}
                  onChange={handleContentChange}
                  className="w-full h-64 px-3.5 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors font-mono resize-none"
                />
                <span className="text-[10px] text-slate-400 block text-right italic">
                  Autosaves drafts to browser local storage.
                </span>
              </div>
            ) : (
              /* Markdown Preview Area */
              <div className="border border-slate-200 rounded-xl p-4 h-64 overflow-y-auto bg-slate-50 prose prose-sm max-w-none text-slate-700">
                {noteForm.content ? (
                  <div dangerouslySetInnerHTML={{ __html: getRenderedMarkdown() }} />
                ) : (
                  <span className="text-slate-400 italic text-xs">Nothing to preview yet.</span>
                )}
              </div>
            )}

            {/* Productivity Metrics & Theme selection */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <strong>Characters:</strong> {charCount}
                </span>
                <span className="flex items-center gap-1">
                  <strong>Words:</strong> {wordCount}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <strong>Read Time:</strong> {estReadingTime} min
                </span>
              </div>

              {/* Color themes picker */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-400">Color:</span>
                <div className="flex gap-1.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => {
                        const updatedForm = { ...noteForm, color: preset.value };
                        setNoteForm(updatedForm);
                        triggerAutosave(updatedForm);
                      }}
                      className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                        noteForm.color === preset.value
                          ? 'ring-2 ring-primary ring-offset-1 border-transparent scale-105'
                          : 'border-slate-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.value }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Markdown Quick-Reference Panel */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-600 space-y-2">
              <h4 className="font-bold text-slate-700 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-primary" /> Markdown Guide
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-slate-500">
                <div><code># Title</code></div>
                <div><code>- Bullet list</code></div>
                <div><code>**Bold Text**</code></div>
                <div><code>*Italic Text*</code></div>
                <div><code>[Link](url)</code></div>
                <div><code>`Inline Code`</code></div>
                <div><code>```codeblock```</code></div>
                <div><code>&gt; Blockquote</code></div>
              </div>
            </div>
          </div>

          {/* Column 2: Meta Organization & Attachments */}
          <div className="w-full md:w-80 space-y-6">
            
            {/* Category selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="text-xs text-primary hover:text-primary-hover font-semibold cursor-pointer"
                >
                  {showAddCategory ? 'Cancel' : '+ New Category'}
                </button>
              </div>

              {showAddCategory ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New category..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategoryInline}
                    className="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={noteForm.category_id}
                  onChange={(e) => {
                    const val = e.target.value;
                    const updatedForm = { ...noteForm, category_id: val };
                    setNoteForm(updatedForm);
                    triggerAutosave(updatedForm);
                  }}
                  className="w-full py-2 px-3.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">Uncategorized</option>
                  {categories.filter(c => c.name !== 'Uncategorized').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Tag Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="flex-grow px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleCreateTagInline}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {tags.map((tag) => {
                  const isSelected = noteForm.tag_ids.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-blue-200 text-primary'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <TagIcon className="w-2.5 h-2.5" />
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* File Attachments Area */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Attachments ({attachments.length}/10)
              </label>

              {mode === 'create' ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400">
                  <Paperclip className="w-5 h-5 mx-auto mb-1.5 text-slate-300 animate-pulse" />
                  Save the note first to enable image attachments.
                </div>
              ) : (
                /* Drag-and-drop target */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-primary bg-blue-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFilesUpload(e.target.files)}
                    multiple
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                  />
                  <Paperclip className="w-5 h-5 mx-auto mb-1.5 text-slate-400" />
                  <span className="text-[11px] font-medium text-slate-500 block">
                    {uploading ? 'Uploading...' : 'Drop images here or click to select'}
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    PNG, JPG, JPEG, WEBP up to 10MB
                  </span>
                </div>
              )}

              {/* Thumbnails Gallery */}
              {attachments.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="relative group rounded-lg overflow-hidden border border-slate-100 flex-shrink-0"
                    >
                      <div onClick={() => setActivePreviewImage(attachment)} className="cursor-zoom-in">
                        <ImageThumbnail attachmentId={attachment.id} filename={attachment.original_filename} />
                      </div>
                      
                      {/* Remove Attachment Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteAttachment(attachment.id)}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-slate-900/60 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove Attachment"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                mode === 'edit' && (
                  <p className="text-[10px] text-slate-400 italic">No attachments uploaded yet.</p>
                )
              )}
            </div>
          </div>
        </form>

        {/* Submit Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleFormSubmit}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            {mode === 'create' ? 'Create Note' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Full Image Zoom Lightbox Modal */}
      {activePreviewImage && (
        <FullImagePreview
          attachmentId={activePreviewImage.id}
          filename={activePreviewImage.original_filename}
          onClose={() => setActivePreviewImage(null)}
        />
      )}
    </div>
  );
};

export default NoteModal;
