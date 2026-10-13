import React, { useState } from 'react';
import {
  Inbox,
  BookOpen,
  Archive,
  Star,
  Highlighter,
  FolderPlus,
  BarChart2,
  Download,
  Upload,
  Keyboard,
  Plus,
  Check,
  X,
  Compass,
  Terminal,
  Layers,
  Atom,
  Tag as TagIcon
} from 'lucide-react';
import { Article, Collection, NavigationFilter } from '../types';

interface SidebarProps {
  currentFilter: NavigationFilter;
  onSelectFilter: (filter: NavigationFilter) => void;
  articles: Article[];
  collections: Collection[];
  onAddCollection: (name: string, color: string) => void;
  onOpenAddModal: () => void;
  onOpenStatsModal: () => void;
  onOpenShortcutsModal: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFilter,
  onSelectFilter,
  articles,
  collections,
  onAddCollection,
  onOpenAddModal,
  onOpenStatsModal,
  onOpenShortcutsModal,
  onExportData,
  onImportData,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionColor, setNewCollectionColor] = useState('#0284c7');

  // Counts
  const inboxCount = articles.filter(a => a.status === 'inbox').length;
  const readingCount = articles.filter(a => a.status === 'reading').length;
  const archiveCount = articles.filter(a => a.status === 'archived').length;
  const favoritesCount = articles.filter(a => a.isFavorite).length;
  const totalHighlightsCount = articles.reduce((sum, a) => sum + (a.highlights?.length || 0), 0);

  // Extract all unique tags
  const allTags = Array.from(new Set(articles.flatMap(a => a.tags || []))).slice(0, 10);

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    onAddCollection(newCollectionName.trim(), newCollectionColor);
    setNewCollectionName('');
    setIsCreatingCollection(false);
  };

  const getCollectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal': return <Terminal className="w-4 h-4" />;
      case 'Layers': return <Layers className="w-4 h-4" />;
      case 'Compass': return <Compass className="w-4 h-4" />;
      case 'Atom': return <Atom className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const isNavActive = (filter: NavigationFilter): boolean => {
    if (filter.type !== currentFilter.type) return false;
    if (filter.type === 'status' && currentFilter.type === 'status') {
      return filter.value === currentFilter.value;
    }
    if (filter.type === 'collection' && currentFilter.type === 'collection') {
      return filter.id === currentFilter.id;
    }
    if (filter.type === 'tag' && currentFilter.type === 'tag') {
      return filter.tag === currentFilter.tag;
    }
    return true;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-stone-900 text-stone-200 flex flex-col border-r border-stone-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="p-5 pb-4 border-b border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-lg">
              F
            </div>
            <div>
              <h1 className="font-serif font-medium tracking-wide text-stone-100 text-base">
                FOLIO
              </h1>
              <p className="text-[11px] text-stone-400 font-mono tracking-wider">
                READING VAULT
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 text-stone-400 hover:text-stone-200 rounded-md hover:bg-stone-800 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: Add Item */}
        <div className="p-4 pb-2">
          <button
            onClick={onOpenAddModal}
            className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-amber-50 rounded-lg text-sm font-medium flex items-center justify-between shadow-xs transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Save Article</span>
            </div>
            <span className="text-[11px] font-mono opacity-75 bg-amber-700/50 px-1.5 py-0.5 rounded">
              A
            </span>
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {/* Main Navigation Views */}
          <div className="space-y-0.5">
            <button
              onClick={() => {
                onSelectFilter({ type: 'status', value: 'inbox' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                isNavActive({ type: 'status', value: 'inbox' })
                  ? 'bg-stone-800 text-amber-400 font-medium'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-stone-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Inbox className="w-4 h-4 text-stone-400" />
                <span>Inbox</span>
              </div>
              <span className="text-xs text-stone-400 font-mono">{inboxCount}</span>
            </button>

            <button
              onClick={() => {
                onSelectFilter({ type: 'status', value: 'reading' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                isNavActive({ type: 'status', value: 'reading' })
                  ? 'bg-stone-800 text-amber-400 font-medium'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-stone-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-stone-400" />
                <span>Reading</span>
              </div>
              <span className="text-xs text-stone-400 font-mono">{readingCount}</span>
            </button>

            <button
              onClick={() => {
                onSelectFilter({ type: 'favorites' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                isNavActive({ type: 'favorites' })
                  ? 'bg-stone-800 text-amber-400 font-medium'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-stone-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Favorites</span>
              </div>
              <span className="text-xs text-stone-400 font-mono">{favoritesCount}</span>
            </button>

            <button
              onClick={() => {
                onSelectFilter({ type: 'highlights' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                isNavActive({ type: 'highlights' })
                  ? 'bg-stone-800 text-amber-400 font-medium'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-stone-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Highlighter className="w-4 h-4 text-stone-400" />
                <span>Highlights & Notes</span>
              </div>
              <span className="text-xs text-stone-400 font-mono">{totalHighlightsCount}</span>
            </button>

            <button
              onClick={() => {
                onSelectFilter({ type: 'status', value: 'archived' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                isNavActive({ type: 'status', value: 'archived' })
                  ? 'bg-stone-800 text-amber-400 font-medium'
                  : 'text-stone-300 hover:bg-stone-800/60 hover:text-stone-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Archive className="w-4 h-4 text-stone-400" />
                <span>Archive</span>
              </div>
              <span className="text-xs text-stone-400 font-mono">{archiveCount}</span>
            </button>
          </div>

          {/* Collections Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">
              <span>Collections</span>
              <button
                onClick={() => setIsCreatingCollection(true)}
                className="text-stone-400 hover:text-amber-400 transition-colors p-0.5 rounded cursor-pointer"
                title="Add collection"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {isCreatingCollection && (
              <form onSubmit={handleCreateCollection} className="p-2.5 mb-2 bg-stone-800/90 rounded-lg space-y-2 border border-stone-700">
                <input
                  type="text"
                  placeholder="Collection name..."
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  autoFocus
                  className="w-full px-2.5 py-1.5 text-xs bg-stone-900 border border-stone-700 rounded text-stone-100 focus:outline-none focus:border-amber-500"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {['#0284c7', '#d97706', '#7c3aed', '#059669', '#dc2626', '#ec4899'].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setNewCollectionColor(c)}
                        className={`w-4 h-4 rounded-full transition-transform ${
                          newCollectionColor === c ? 'scale-125 ring-2 ring-white/60' : 'opacity-70'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingCollection(false)}
                      className="p-1 text-stone-400 hover:text-stone-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="submit"
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-0.5">
              {collections.map((col) => {
                const count = articles.filter((a) => a.collectionId === col.id).length;
                const isActive = isNavActive({ type: 'collection', id: col.id });

                return (
                  <button
                    key={col.id}
                    onClick={() => {
                      onSelectFilter({ type: 'collection', id: col.id });
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors text-left ${
                      isActive
                        ? 'bg-stone-800 text-amber-400 font-medium'
                        : 'text-stone-300 hover:bg-stone-800/60 hover:text-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: col.color }}
                      />
                      <span className="truncate">{col.name}</span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono ml-2 shrink-0">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Section */}
          {allTags.length > 0 && (
            <div>
              <div className="px-3 mb-2 text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <TagIcon className="w-3 h-3 text-stone-400" />
                <span>Tags</span>
              </div>
              <div className="flex flex-wrap gap-1 px-2">
                {allTags.map((tag) => {
                  const isActive = isNavActive({ type: 'tag', tag });
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        onSelectFilter({ type: 'tag', tag });
                        onCloseMobile();
                      }}
                      className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-amber-600/30 text-amber-300 font-medium'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Utilities */}
        <div className="p-3 border-t border-stone-800 bg-stone-900/60 text-xs text-stone-400 space-y-1">
          <div className="flex items-center justify-between px-1">
            <button
              onClick={onOpenStatsModal}
              className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-stone-800 hover:text-stone-200 transition-colors"
            >
              <BarChart2 className="w-3.5 h-3.5 text-stone-400" />
              <span>Vault Stats</span>
            </button>

            <button
              onClick={onOpenShortcutsModal}
              className="flex items-center gap-1.5 py-1.5 px-2 rounded hover:bg-stone-800 hover:text-stone-200 transition-colors font-mono text-[11px]"
              title="Keyboard shortcuts"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>?</span>
            </button>
          </div>

          <div className="flex items-center justify-between px-1 pt-1 border-t border-stone-800/60">
            <button
              onClick={onExportData}
              className="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-stone-800 hover:text-stone-200 transition-colors text-[11px]"
              title="Export reading vault as JSON"
            >
              <Download className="w-3 h-3" />
              <span>Backup JSON</span>
            </button>

            <label className="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-stone-800 hover:text-stone-200 transition-colors text-[11px] cursor-pointer">
              <Upload className="w-3 h-3" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={onImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </aside>
    </>
  );
};
