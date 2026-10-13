import React from 'react';
import { X, BarChart2, BookOpen, Clock, Highlighter, CheckCircle2, RotateCcw } from 'lucide-react';
import { Article, Collection } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  collections: Collection[];
  onResetSeedData: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  articles,
  collections,
  onResetSeedData,
}) => {
  if (!isOpen) return null;

  const totalArticles = articles.length;
  const inboxCount = articles.filter((a) => a.status === 'inbox').length;
  const readingCount = articles.filter((a) => a.status === 'reading').length;
  const archivedCount = articles.filter((a) => a.status === 'archived').length;
  const totalWords = articles.reduce((sum, a) => sum + (a.wordCount || 0), 0);
  const totalMinutes = articles.reduce((sum, a) => sum + (a.readingTimeMinutes || 0), 0);
  const totalHighlights = articles.reduce((sum, a) => sum + (a.highlights?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Reading Vault Analytics
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                Personal reading pace & volume
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
              <span className="block text-xl font-bold font-serif text-stone-900">
                {totalArticles}
              </span>
              <span className="text-[11px] text-stone-500 font-sans">Total Articles</span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
              <span className="block text-xl font-bold font-serif text-amber-600">
                {archivedCount}
              </span>
              <span className="text-[11px] text-stone-500 font-sans">Finished / Read</span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
              <span className="block text-xl font-bold font-serif text-emerald-600">
                {totalHighlights}
              </span>
              <span className="text-[11px] text-stone-500 font-sans">Highlights</span>
            </div>
          </div>

          {/* Reading Volume Stats */}
          <div className="p-4 bg-stone-50/70 rounded-xl border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-600 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                Total Reading Time in Vault
              </span>
              <span className="font-mono font-medium text-stone-900">
                ~{totalMinutes} minutes ({Math.round((totalMinutes / 60) * 10) / 10} hrs)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-600 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                Total Words Saved
              </span>
              <span className="font-mono font-medium text-stone-900">
                {totalWords.toLocaleString()} words
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-600 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Reading Completion Rate
              </span>
              <span className="font-mono font-medium text-stone-900">
                {totalArticles > 0
                  ? `${Math.round((archivedCount / totalArticles) * 100)}%`
                  : '0%'}
              </span>
            </div>
          </div>

          {/* Collections Distribution */}
          <div>
            <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2.5">
              Collections Distribution
            </h4>
            <div className="space-y-2">
              {collections.map((col) => {
                const count = articles.filter((a) => a.collectionId === col.id).length;
                const pct = totalArticles > 0 ? Math.round((count / totalArticles) * 100) : 0;
                return (
                  <div key={col.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: col.color }}
                        />
                        <span className="text-stone-700">{col.name}</span>
                      </div>
                      <span className="font-mono text-stone-500 text-[11px]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: col.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={() => {
              if (
                window.confirm(
                  'Restore initial curated sample essays and reset local edits?'
                )
              ) {
                onResetSeedData();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Curated Seed Essays</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-stone-700 bg-stone-200/80 hover:bg-stone-300 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
