import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  BookOpen,
  Plus,
  ArrowUpDown,
  X,
  Tag as TagIcon,
  FileText,
  Type,
  Globe
} from 'lucide-react';
import { Article, Collection, NavigationFilter, SortOption } from '../types';
import { ArticleCard } from './ArticleCard';
import { stripHtml } from '../utils/textParser';

type SearchTarget = 'all' | 'title' | 'tags' | 'content';
type SearchScope = 'current' | 'all';

interface ArticleListProps {
  articles: Article[];
  collections: Collection[];
  currentFilter: NavigationFilter;
  selectedIndex: number;
  onOpenReader: (article: Article) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onToggleStatus: (id: string, newStatus: Article['status'], e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onOpenAddModal: () => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  collections,
  currentFilter,
  selectedIndex,
  onOpenReader,
  onToggleFavorite,
  onToggleStatus,
  onDelete,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTarget, setSearchTarget] = useState<SearchTarget>('all');
  const [searchScope, setSearchScope] = useState<SearchScope>('current');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Compute view title and subtitle
  const { title, subtitle } = useMemo(() => {
    switch (currentFilter.type) {
      case 'status':
        if (currentFilter.value === 'inbox') {
          return { title: 'Inbox', subtitle: 'Unread articles waiting for your attention' };
        }
        if (currentFilter.value === 'reading') {
          return { title: 'Currently Reading', subtitle: 'Articles in progress with saved reading position' };
        }
        return { title: 'Archive', subtitle: 'Completed articles preserved in your permanent vault' };
      case 'favorites':
        return { title: 'Favorites', subtitle: 'Starred articles, essays, and core references' };
      case 'highlights':
        return { title: 'Highlights & Notes', subtitle: 'Annotated passages from your library' };
      case 'collection': {
        const col = collections.find(c => c.id === currentFilter.id);
        return {
          title: col ? col.name : 'Collection',
          subtitle: `Curated folder collection`
        };
      }
      case 'tag':
        return { title: `#${currentFilter.tag}`, subtitle: `Articles tagged with #${currentFilter.tag}` };
      default:
        return { title: 'All Articles', subtitle: 'Your complete personal reading archive' };
    }
  }, [currentFilter, collections]);

  // Filter based on active navigation
  const filteredByNav = useMemo(() => {
    return articles.filter(article => {
      switch (currentFilter.type) {
        case 'status':
          return article.status === currentFilter.value;
        case 'favorites':
          return article.isFavorite;
        case 'highlights':
          return article.highlights && article.highlights.length > 0;
        case 'collection':
          return article.collectionId === currentFilter.id;
        case 'tag':
          return article.tags?.includes(currentFilter.tag);
        default:
          return true;
      }
    });
  }, [articles, currentFilter]);

  // Base list to search from (either current navigation view or all articles in the vault)
  const basePool = useMemo(() => {
    if (searchScope === 'all' || currentFilter.type === 'all') {
      return articles;
    }
    return filteredByNav;
  }, [searchScope, currentFilter, articles, filteredByNav]);

  // Real-time search across title, tags, and content
  const searchedArticles = useMemo(() => {
    if (!searchQuery.trim()) return filteredByNav;
    const query = searchQuery.toLowerCase().trim();

    return basePool.filter(article => {
      const matchTitle = article.title.toLowerCase().includes(query);
      const matchTags = article.tags?.some(t => t.toLowerCase().includes(query));
      const matchContent = stripHtml(article.content).toLowerCase().includes(query);
      const matchExcerpt = article.excerpt?.toLowerCase().includes(query);
      const matchAuthor = article.author?.toLowerCase().includes(query);
      const matchSite = article.siteName?.toLowerCase().includes(query) || article.domain?.toLowerCase().includes(query);
      const matchHighlights = article.highlights?.some(
        hl => hl.text.toLowerCase().includes(query) || (hl.note && hl.note.toLowerCase().includes(query))
      );

      switch (searchTarget) {
        case 'title':
          return matchTitle;
        case 'tags':
          return matchTags;
        case 'content':
          return matchContent;
        case 'all':
        default:
          return matchTitle || matchTags || matchContent || matchExcerpt || matchAuthor || matchSite || matchHighlights;
      }
    });
  }, [basePool, filteredByNav, searchQuery, searchTarget]);

  // Counts for search scope tags
  const allVaultMatchCount = useMemo(() => {
    if (!searchQuery.trim()) return articles.length;
    const query = searchQuery.toLowerCase().trim();
    return articles.filter(article => {
      const matchTitle = article.title.toLowerCase().includes(query);
      const matchTags = article.tags?.some(t => t.toLowerCase().includes(query));
      const matchContent = stripHtml(article.content).toLowerCase().includes(query);
      return matchTitle || matchTags || matchContent;
    }).length;
  }, [articles, searchQuery]);

  // Sort
  const sortedArticles = useMemo(() => {
    return [...searchedArticles].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
      }
      if (sortBy === 'read_time_asc') {
        return a.readingTimeMinutes - b.readingTimeMinutes;
      }
      if (sortBy === 'read_time_desc') {
        return b.readingTimeMinutes - a.readingTimeMinutes;
      }
      if (sortBy === 'progress') {
        return b.progress - a.progress;
      }
      return 0;
    });
  }, [searchedArticles, sortBy]);

  // Collections lookup
  const collectionsMap = useMemo(() => {
    return new Map(collections.map(c => [c.id, c]));
  }, [collections]);

  return (
    <div className="flex-1 min-h-screen bg-stone-50/50">
      {/* Top Header Banner */}
      <div className="border-b border-stone-200/80 bg-white/80 backdrop-blur-xs sticky top-0 z-20 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
                  {title}
                </h1>
                <span className="text-xs font-mono text-stone-600 bg-stone-100 border border-stone-200/60 px-2 py-0.5 rounded-md">
                  {sortedArticles.length} {sortedArticles.length === 1 ? 'article' : 'articles'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 font-sans">{subtitle}</p>
            </div>

            {/* Quick Action */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-amber-50 bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Article</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchQuery('');
                      searchInputRef.current?.blur();
                    }
                  }}
                  placeholder="Real-time search across titles, tags, or article text... (Press '/' to focus)"
                  className="w-full pl-9 pr-9 py-2 text-xs bg-stone-100/90 hover:bg-stone-100 focus:bg-white border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-200/60 transition-colors cursor-pointer"
                    title="Clear search (Esc)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Controls Segment */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Sort Selector */}
                <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-600">
                  <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent text-xs font-medium text-stone-700 focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Recently Saved</option>
                    <option value="oldest">Oldest Saved</option>
                    <option value="read_time_asc">Shortest Read</option>
                    <option value="read_time_desc">Longest Read</option>
                    <option value="progress">Reading Progress</option>
                  </select>
                </div>

                {/* View Layout Toggle */}
                <div className="flex items-center bg-stone-100 border border-stone-200 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-400 hover:text-stone-700'
                    }`}
                    title="List view"
                  >
                    <ListIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-400 hover:text-stone-700'
                    }`}
                    title="Grid view"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time Search Filter Bar (Filter by Target: Title, Tags, Content & Scope) */}
            {searchQuery && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-0.5 text-xs">
                {/* Filter by Target: All / Title / Tags / Content */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-mono text-stone-400 mr-1">Filter in:</span>
                  {(
                    [
                      { id: 'all', label: 'All Fields' },
                      { id: 'title', label: 'Titles' },
                      { id: 'tags', label: 'Tags' },
                      { id: 'content', label: 'Article Text' },
                    ] as const
                  ).map((target) => (
                    <button
                      key={target.id}
                      onClick={() => setSearchTarget(target.id)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                        searchTarget === target.id
                          ? 'bg-stone-900 text-stone-100'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {target.label}
                    </button>
                  ))}
                </div>

                {/* Scope selector if inside a specific folder/view */}
                {currentFilter.type !== 'all' && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-stone-400 font-mono">Scope:</span>
                    <button
                      onClick={() => setSearchScope('current')}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        searchScope === 'current'
                          ? 'font-semibold text-amber-700 underline decoration-2'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {title} ({searchedArticles.length})
                    </button>
                    <span className="text-stone-300">/</span>
                    <button
                      onClick={() => setSearchScope('all')}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        searchScope === 'all'
                          ? 'font-semibold text-amber-700 underline decoration-2'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      All Vault ({allVaultMatchCount})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Articles Area */}
      <main className="max-w-5xl mx-auto p-6">
        {/* Real-time search feedback strip */}
        {searchQuery && (
          <div className="mb-4 flex items-center justify-between text-xs text-stone-600 pb-2 border-b border-stone-200/60 font-sans">
            <div>
              <span>
                Found <strong className="text-stone-900">{sortedArticles.length}</strong> matching {sortedArticles.length === 1 ? 'article' : 'articles'} for "
                <span className="text-amber-800 font-medium">{searchQuery}</span>"
              </span>
              {searchTarget !== 'all' && (
                <span className="text-stone-400 ml-1">
                  (matched in {searchTarget === 'content' ? 'article text' : searchTarget})
                </span>
              )}
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-stone-500 hover:text-stone-800 underline text-xs"
            >
              Reset search
            </button>
          </div>
        )}

        {sortedArticles.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white border border-stone-200/80 rounded-2xl max-w-lg mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-stone-900 mb-1">
              {searchQuery ? 'No matching articles found' : 'No articles in this view'}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5 leading-relaxed">
              {searchQuery
                ? `No articles matched "${searchQuery}" in ${
                    searchTarget === 'all' ? 'title, tags, or content' : searchTarget
                  }. Try searching across your whole library or with broader keywords.`
                : 'Save interesting essays, newsletters, and articles to read them in a distraction-free reader anytime.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {searchQuery && searchScope === 'current' && currentFilter.type !== 'all' && (
                <button
                  onClick={() => setSearchScope('all')}
                  className="px-3.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  Search Entire Library ({allVaultMatchCount})
                </button>
              )}
              {searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchTarget('all');
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium text-amber-50 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                >
                  Clear Search Filter
                </button>
              ) : (
                <button
                  onClick={onOpenAddModal}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-50 bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save New Article</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                : 'space-y-3.5'
            }
          >
            {sortedArticles.map((article, index) => {
              const col = collectionsMap.get(article.collectionId);
              return (
                <ArticleCard
                  key={article.id}
                  article={article}
                  collectionName={col?.name}
                  collectionColor={col?.color}
                  isSelected={index === selectedIndex}
                  searchQuery={searchQuery}
                  onOpenReader={onOpenReader}
                  onToggleFavorite={onToggleFavorite}
                  onToggleStatus={onToggleStatus}
                  onDelete={onDelete}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
