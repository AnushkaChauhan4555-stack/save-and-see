import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Plus, Bookmark } from 'lucide-react';
import {
  Article,
  Collection,
  NavigationFilter,
  ReaderSettings,
} from './types';
import {
  loadArticles,
  saveArticles,
  loadCollections,
  saveCollections,
  loadReaderSettings,
  saveReaderSettings,
  exportLibraryToJson,
} from './utils/storage';
import { INITIAL_ARTICLES, INITIAL_COLLECTIONS } from './data/seedArticles';
import { Sidebar } from './components/Sidebar';
import { ArticleList } from './components/ArticleList';
import { ReaderView } from './components/ReaderView';
import { AddArticleModal } from './components/AddArticleModal';
import { HighlightsVaultModal } from './components/HighlightsVaultModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { StatsModal } from './components/StatsModal';

export default function App() {
  const [articles, setArticles] = useState<Article[]>(() => loadArticles());
  const [collections, setCollections] = useState<Collection[]>(() => loadCollections());
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(() => loadReaderSettings());

  const [currentFilter, setCurrentFilter] = useState<NavigationFilter>({
    type: 'status',
    value: 'inbox',
  });

  const [activeReaderArticle, setActiveReaderArticle] = useState<Article | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isHighlightsVaultOpen, setIsHighlightsVaultOpen] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Save changes to storage whenever articles, collections, or settings update
  useEffect(() => {
    saveArticles(articles);
  }, [articles]);

  useEffect(() => {
    saveCollections(collections);
  }, [collections]);

  useEffect(() => {
    saveReaderSettings(readerSettings);
  }, [readerSettings]);

  // Keep active reader article in sync if updated
  const handleUpdateActiveArticle = useCallback((updated: Article) => {
    setActiveReaderArticle(updated);
    setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }, []);

  // Filtered articles list for selection index computation
  const filteredArticles = articles.filter((article) => {
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

  // Toggle Favorite
  const handleToggleFavorite = useCallback(
    (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setArticles((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            const nextFav = !a.isFavorite;
            showToast(nextFav ? 'Added to favorites' : 'Removed from favorites');
            return { ...a, isFavorite: nextFav };
          }
          return a;
        })
      );
    },
    [showToast]
  );

  // Toggle Status (Archive / Inbox)
  const handleToggleStatus = useCallback(
    (id: string, newStatus: Article['status'], e?: React.MouseEvent) => {
      e?.stopPropagation();
      setArticles((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            showToast(newStatus === 'archived' ? 'Article archived' : 'Restored to inbox');
            return {
              ...a,
              status: newStatus,
              readAt: newStatus === 'archived' ? new Date().toISOString() : a.readAt,
            };
          }
          return a;
        })
      );
    },
    [showToast]
  );

  // Delete Article
  const handleDeleteArticle = useCallback(
    (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (window.confirm('Delete this article from your library?')) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        if (activeReaderArticle?.id === id) {
          setActiveReaderArticle(null);
        }
        showToast('Article deleted');
      }
    },
    [activeReaderArticle, showToast]
  );

  // Delete specific highlight
  const handleDeleteHighlight = useCallback((articleId: string, highlightId: string) => {
    setArticles((prev) =>
      prev.map((a) => {
        if (a.id === articleId) {
          return {
            ...a,
            highlights: a.highlights.filter((h) => h.id !== highlightId),
          };
        }
        return a;
      })
    );
  }, []);

  // Add Article
  const handleAddArticle = useCallback(
    (newArticle: Article) => {
      setArticles((prev) => [newArticle, ...prev]);
      showToast('Article saved to vault');
    },
    [showToast]
  );

  // Add Collection
  const handleAddCollection = useCallback(
    (name: string, color: string) => {
      const newCol: Collection = {
        id: `col-${Date.now()}`,
        name,
        iconName: 'BookOpen',
        color,
      };
      setCollections((prev) => [...prev, newCol]);
      showToast(`Collection "${name}" created`);
    },
    [showToast]
  );

  // Reset to seed data
  const handleResetSeedData = useCallback(() => {
    setArticles(INITIAL_ARTICLES);
    setCollections(INITIAL_COLLECTIONS);
    showToast('Restored curated seed library');
  }, [showToast]);

  // Export JSON
  const handleExportData = useCallback(() => {
    exportLibraryToJson(articles, collections);
    showToast('Library exported to JSON');
  }, [articles, collections, showToast]);

  // Import JSON
  const handleImportData = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed.articles && Array.isArray(parsed.articles)) {
            setArticles(parsed.articles);
            if (parsed.collections && Array.isArray(parsed.collections)) {
              setCollections(parsed.collections);
            }
            showToast(`Imported ${parsed.articles.length} articles`);
          } else {
            alert('Invalid Folio backup file format.');
          }
        } catch (err) {
          alert('Could not parse JSON file.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [showToast]
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Close modals or reader with Esc
      if (e.key === 'Escape') {
        if (activeReaderArticle) {
          setActiveReaderArticle(null);
          return;
        }
        if (isAddModalOpen) setIsAddModalOpen(false);
        if (isStatsModalOpen) setIsStatsModalOpen(false);
        if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
        if (isHighlightsVaultOpen) setIsHighlightsVaultOpen(false);
        return;
      }

      // If in Reader view, handle reader-specific shortcuts
      if (activeReaderArticle) {
        if (e.key === 's') {
          handleToggleFavorite(activeReaderArticle.id);
        }
        if (e.key === 'a' || e.key === 'e') {
          handleToggleStatus(
            activeReaderArticle.id,
            activeReaderArticle.status === 'archived' ? 'inbox' : 'archived'
          );
        }
        return;
      }

      // Library / List shortcuts
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(filteredArticles.length - 1, prev + 1));
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Enter' || e.key === 'r') {
        if (filteredArticles[selectedIndex]) {
          setActiveReaderArticle(filteredArticles[selectedIndex]);
        }
      } else if (e.key === 's') {
        if (filteredArticles[selectedIndex]) {
          handleToggleFavorite(filteredArticles[selectedIndex].id);
        }
      } else if (e.key === 'a' || e.key === 'e') {
        if (filteredArticles[selectedIndex]) {
          const currentArt = filteredArticles[selectedIndex];
          handleToggleStatus(
            currentArt.id,
            currentArt.status === 'archived' ? 'inbox' : 'archived'
          );
        }
      } else if (e.key === 'n') {
        e.preventDefault();
        setIsAddModalOpen(true);
      } else if (e.key === 'h') {
        e.preventDefault();
        setIsHighlightsVaultOpen(true);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeReaderArticle,
    filteredArticles,
    selectedIndex,
    isAddModalOpen,
    isStatsModalOpen,
    isShortcutsModalOpen,
    isHighlightsVaultOpen,
    handleToggleFavorite,
    handleToggleStatus,
  ]);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 flex">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-stone-100 text-xs px-4 py-2.5 rounded-lg shadow-xl border border-stone-800 animate-in fade-in slide-in-from-bottom-3 flex items-center gap-2">
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reader Mode (full-screen when an article is open) */}
      {activeReaderArticle ? (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <ReaderView
            article={activeReaderArticle}
            settings={readerSettings}
            onUpdateSettings={setReaderSettings}
            onUpdateArticle={handleUpdateActiveArticle}
            onClose={() => setActiveReaderArticle(null)}
          />
        </div>
      ) : (
        <>
          {/* Mobile Header Bar */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-stone-900 text-stone-100 px-4 py-3 flex items-center justify-between border-b border-stone-800">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-1.5 text-stone-300 hover:text-white rounded-md"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="font-serif font-semibold tracking-wide text-stone-100">
              FOLIO
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-1.5 text-amber-400 hover:text-amber-300 rounded-md"
              aria-label="Add article"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sidebar */}
          <Sidebar
            currentFilter={currentFilter}
            onSelectFilter={setCurrentFilter}
            articles={articles}
            collections={collections}
            onAddCollection={handleAddCollection}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenStatsModal={() => setIsStatsModalOpen(true)}
            onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
            onExportData={handleExportData}
            onImportData={handleImportData}
            isMobileOpen={mobileNavOpen}
            onCloseMobile={() => setMobileNavOpen(false)}
          />

          {/* Main Article Content List */}
          <div className="flex-1 lg:pl-72 pt-14 lg:pt-0 min-h-screen">
            <ArticleList
              articles={articles}
              collections={collections}
              currentFilter={currentFilter}
              selectedIndex={selectedIndex}
              onOpenReader={(article) => setActiveReaderArticle(article)}
              onToggleFavorite={handleToggleFavorite}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteArticle}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          </div>
        </>
      )}

      {/* Modal Dialogs */}
      <AddArticleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        collections={collections}
        onAddArticle={handleAddArticle}
      />

      <HighlightsVaultModal
        isOpen={isHighlightsVaultOpen || currentFilter.type === 'highlights'}
        onClose={() => {
          setIsHighlightsVaultOpen(false);
          if (currentFilter.type === 'highlights') {
            setCurrentFilter({ type: 'status', value: 'inbox' });
          }
        }}
        articles={articles}
        onOpenArticle={(article) => {
          setIsHighlightsVaultOpen(false);
          setActiveReaderArticle(article);
        }}
        onDeleteHighlight={handleDeleteHighlight}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        articles={articles}
        collections={collections}
        onResetSeedData={handleResetSeedData}
      />
    </div>
  );
}
