import React, { useState } from 'react';
import { X, Highlighter, Download, Search, ExternalLink, BookOpen, Trash2 } from 'lucide-react';
import { Article, Highlight, HighlightColor } from '../types';

interface HighlightsVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onOpenArticle: (article: Article) => void;
  onDeleteHighlight: (articleId: string, highlightId: string) => void;
}

export const HighlightsVaultModal: React.FC<HighlightsVaultModalProps> = ({
  isOpen,
  onClose,
  articles,
  onOpenArticle,
  onDeleteHighlight,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState<HighlightColor | 'all'>('all');

  if (!isOpen) return null;

  // Flatten all highlights with their parent article
  const allHighlightsWithArticle: Array<{
    highlight: Highlight;
    article: Article;
  }> = [];

  articles.forEach((art) => {
    (art.highlights || []).forEach((hl) => {
      allHighlightsWithArticle.push({
        highlight: hl,
        article: art,
      });
    });
  });

  // Filter
  const filtered = allHighlightsWithArticle.filter(({ highlight, article }) => {
    if (colorFilter !== 'all' && highlight.color !== colorFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchText = highlight.text.toLowerCase().includes(q);
    const matchNote = highlight.note?.toLowerCase().includes(q);
    const matchArticle = article.title.toLowerCase().includes(q);
    return matchText || matchNote || matchArticle;
  });

  // Export all highlights to Markdown
  const handleExportAllMarkdown = () => {
    let md = `# Folio Highlights Vault Export\n\n`;
    md += `Exported on: ${new Date().toLocaleDateString()}\n`;
    md += `Total Highlights: ${filtered.length}\n\n---\n\n`;

    filtered.forEach(({ highlight, article }) => {
      md += `### "${article.title}"\n`;
      md += `*By ${article.author || article.siteName}* — [Link](${article.url})\n\n`;
      md += `> "${highlight.text}"\n\n`;
      if (highlight.note) {
        md += `**Note**: ${highlight.note}\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `folio-highlights-vault-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Highlighter className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Highlights & Marginalia Vault
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                {allHighlightsWithArticle.length} total highlights across your saved articles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAllMarkdown}
              disabled={filtered.length === 0}
              className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              title="Export filtered highlights to Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export to Markdown</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search & Color filters */}
        <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search through highlighted passages and notes..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1 self-start sm:self-auto">
            <button
              onClick={() => setColorFilter('all')}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                colorFilter === 'all'
                  ? 'bg-stone-800 text-white font-medium'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Colors
            </button>
            {(
              [
                { id: 'amber', bg: 'bg-amber-400' },
                { id: 'emerald', bg: 'bg-emerald-400' },
                { id: 'sky', bg: 'bg-sky-400' },
                { id: 'rose', bg: 'bg-rose-400' },
                { id: 'violet', bg: 'bg-purple-400' },
              ] as const
            ).map((c) => (
              <button
                key={c.id}
                onClick={() => setColorFilter(c.id)}
                className={`w-4 h-4 rounded-full ${c.bg} transition-transform ${
                  colorFilter === c.id ? 'scale-125 ring-2 ring-stone-800' : 'opacity-60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* List of Highlights */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <Highlighter className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No highlights match your search.</p>
            </div>
          ) : (
            filtered.map(({ highlight, article }) => (
              <div
                key={highlight.id}
                className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/40 hover:bg-white hover:shadow-xs transition-all space-y-2 group"
              >
                {/* Parent Article Kicker */}
                <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenArticle(article);
                    }}
                    className="font-serif font-medium text-stone-800 hover:text-amber-700 truncate max-w-md text-left flex items-center gap-1.5"
                  >
                    <span>{article.title}</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px]">
                      {new Date(highlight.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => onDeleteHighlight(article.id, highlight.id)}
                      className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-600 p-1"
                      title="Delete highlight"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Highlight Quote */}
                <blockquote className="font-serif text-sm leading-relaxed text-stone-900 border-l-2 border-amber-500 pl-3 italic">
                  "{highlight.text}"
                </blockquote>

                {/* Annotation Note if present */}
                {highlight.note && (
                  <div className="bg-amber-500/10 p-2.5 rounded-lg text-xs text-stone-800 mt-2">
                    <p className="font-medium text-amber-900 text-[11px] mb-0.5">Your Marginalia:</p>
                    <p className="font-sans">{highlight.note}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
