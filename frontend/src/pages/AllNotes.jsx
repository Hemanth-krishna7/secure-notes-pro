import React, { useState, useEffect } from 'react';
import { FileText, Pin, Folder, Heart, Plus, Edit3, Archive, Search, X, Loader2, Tag as TagIcon, ArrowUpDown } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import NoteModal from '../components/NoteModal';

const COLOR_PRESETS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Sky Blue', value: '#eff6ff' },
  { name: 'Mint Green', value: '#f0fdf4' },
  { name: 'Amber Yellow', value: '#fffbeb' },
  { name: 'Rose Pink', value: '#fef2f2' },
  { name: 'Lavender Purple', value: '#faf5ff' }
];

const AllNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState('all');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterPinned, setFilterPinned] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'alphabetical'

  // Modals state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteModalMode, setNoteModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedNote, setSelectedNote] = useState(null);
  // No duplicate state variables needed here since they are encapsulated inside NoteModal

  // Fetch all notes, categories, and tags
  const fetchData = async () => {
    try {
      setLoading(true);
      const [notesRes, categoriesRes, tagsRes] = await Promise.all([
        api.get('/notes'),
        api.get('/categories'),
        api.get('/tags')
      ]);

      if (notesRes.data?.status === 'success') {
        setNotes(notesRes.data.data || []);
      }
      if (categoriesRes.data?.status === 'success') {
        setCategories(categoriesRes.data.data || []);
      }
      if (tagsRes.data?.status === 'success') {
        setTags(tagsRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Show error for 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle Note Create/Edit Submit
  // Handle Note Save/Update Callback
  const handleNoteSaved = (savedNote) => {
    if (notes.some(n => n.id === savedNote.id)) {
      setNotes(notes.map(n => n.id === savedNote.id ? savedNote : n));
    } else {
      setNotes([savedNote, ...notes]);
    }
  };

  // Modal control helpers
  const openCreateModal = () => {
    setNoteModalMode('create');
    setSelectedNote(null);
    setIsNoteModalOpen(true);
  };

  const openEditModal = (note) => {
    setNoteModalMode('edit');
    setSelectedNote(note);
    setIsNoteModalOpen(true);
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

  // Filter & Sort Logic
  const getFilteredNotes = () => {
    let result = [...notes];

    // 1. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(note => 
        note.title.toLowerCase().includes(query) || 
        (note.content && note.content.toLowerCase().includes(query))
      );
    }

    // 2. Category Filter
    if (selectedCategoryFilter !== 'all') {
      if (selectedCategoryFilter === 'uncategorized') {
        result = result.filter(note => !note.category_id || note.category?.name === 'Uncategorized');
      } else {
        result = result.filter(note => note.category_id === parseInt(selectedCategoryFilter));
      }
    }

    // 3. Tag Filter
    if (selectedTagFilter !== 'all') {
      result = result.filter(note => 
        note.tags && note.tags.some(t => t.id === parseInt(selectedTagFilter))
      );
    }

    // 4. Favorites Only
    if (filterFavorites) {
      result = result.filter(note => note.is_favorite);
    }

    // 5. Pinned Only
    if (filterPinned) {
      result = result.filter(note => note.is_pinned);
    }

    // 6. Sorting
    result.sort((a, b) => {
      // Standard secondary sort: Pinned notes always stick to top if sorted by date
      if (sortBy === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  };

  const filteredNotes = getFilteredNotes();

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-all duration-150"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
            {/* Quick toggles */}
            <button
              onClick={() => setFilterPinned(!filterPinned)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                filterPinned 
                  ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-xs' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              Pinned
            </button>

            <button
              onClick={() => setFilterFavorites(!filterFavorites)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                filterFavorites 
                  ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Favorites
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>
        </div>

        {/* Filters and Sorting selectors */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4 border-t border-slate-100 text-slate-600">
          
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Folder className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="uncategorized">Uncategorized</option>
              {categories.filter(c => c.name !== 'Uncategorized').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <TagIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={selectedTagFilter}
              onChange={(e) => setSelectedTagFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="all">All Tags</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <ArrowUpDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="newest">Sort by Newest</option>
              <option value="oldest">Sort by Oldest</option>
              <option value="alphabetical">Sort Alphabetically</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
          <span>{error}</span>
        </div>
      )}

      {/* Notes Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm">Loading your notes...</span>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No notes found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or create a brand-new note.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => openEditModal(note)}
              className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200/80 transition-all duration-200 flex flex-col justify-between cursor-pointer min-h-[170px]"
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
                  <div className="flex items-center gap-0.5 flex-shrink-0">
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

              {/* Note Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-900/5 text-[10px] text-slate-400 mt-2">
                <span>{getRelativeTime(note.created_at)}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(note);
                    }}
                    className="p-1 hover:bg-slate-900/5 rounded text-slate-500 cursor-pointer"
                    title="Edit Note"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleArchiveNote(e, note)}
                    className="p-1 hover:bg-slate-900/5 rounded text-slate-500 cursor-pointer hover:text-primary"
                    title="Archive Note"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reusable Note Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setSelectedNote(null);
        }}
        note={selectedNote}
        mode={noteModalMode}
        categories={categories}
        tags={tags}
        onNoteSaved={handleNoteSaved}
        onTagCreated={(newTag) => setTags([...tags, newTag])}
        onCategoryCreated={(newCategory) => setCategories([...categories, newCategory])}
      />
    </div>
  );
};

export default AllNotes;
