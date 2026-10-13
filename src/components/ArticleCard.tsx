import React from 'react';
import {
  Star,
  Archive,
  BookOpen,
  Trash2,
  Highlighter,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { Article } from '../types';
import { splitByQuery, findContentSnippet } from '../utils/textParser';

interface ArticleCardProps {
  article: Article;
  collectionName?: string;
  collectionColor?: string;
  isSelected?: boolean;
  searchQuery?: string;
  onOpenReader: (article: Article) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onToggleStatus: (id: string, newStatus: Article['status'], e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

const HighlightedText: React.FC<{ text: string; query?: string }> = ({ text, query }) => {
  if (!query || !query.trim()) return <>{text}</>;
  const parts = splitByQuery(text, query);
  return (
    <>
      {parts.map((part, i) =>
        part.isMatch ? (
          <mark key={i} className="bg-amber-200/90 text-amber-950 font-medium px-0.5 rounded-xs">
            {part.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{part.text}</React.Fragment>
        )
      )}
    </>
  );
};

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  collectionName,
  collectionColor = '#78716c',
  isSelected = false,
  searchQuery = '',
  onOpenReader,
  onToggleFavorite,
  onToggleStatus,
  onDelete,
}) => {
  const formattedDate = new Date(article.savedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const highlightsCount = article.highlights?.length || 0;

  // If search query is active, check if there's a match in the full article content
  const isMatchInTitleOrExcerpt = searchQuery && (
    article.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );
  const contentSnippet = searchQuery && !isMatchInTitleOrExcerpt
    ? findContentSnippet(article.content, searchQuery)
    : null;

  return (
    <article
      onClick={() => onOpenReader(article)}
      className={`group relative bg-white border rounded-xl p-5 transition-all duration-150 cursor-pointer hover:shadow-md ${
        isSelected
          ? 'border-amber-500 ring-2 ring-amber-500/20'
          : 'border-stone-200/80 hover:border-stone-300'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Subtle 1-line text kicker - NO PILLS */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-2 font-mono">
            {collectionName && (
              <span className="flex items-center gap-1.5 font-sans font-medium text-stone-700">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: collectionColor }}
                />
                {collectionName}
              </span>
            )}
            {collectionName && <span aria-hidden="true">·</span>}
            <span className="truncate">{article.siteName || article.domain}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{article.readingTimeMinutes} min read</span>
          </div>

          {/* Title */}
          <h2 className="font-serif text-lg font-semibold text-stone-900 group-hover:text-amber-900 line-clamp-2 leading-snug mb-2 transition-colors">
            <HighlightedText text={article.title} query={searchQuery} />
          </h2>

          {/* Excerpt */}
          <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed mb-3 font-sans">
            <HighlightedText text={article.excerpt} query={searchQuery} />
          </p>

          {/* Matched in full content preview if search match occurred in body */}
          {contentSnippet && (
            <div className="mb-3 p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-lg text-xs text-stone-700 font-sans">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-800 font-semibold block mb-0.5">
                Matched in article text:
              </span>
              <p className="italic text-stone-600 line-clamp-2">
                "<HighlightedText text={contentSnippet} query={searchQuery} />"
              </p>
            </div>
          )}

          {/* Metadata Footer: Clean unboxed text & tags */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 pt-1">
            <span>Saved {formattedDate}</span>
            
            {article.author && (
              <>
                <span aria-hidden="true">·</span>
                <span>By <HighlightedText text={article.author} query={searchQuery} /></span>
              </>
            )}

            {highlightsCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                  <Highlighter className="w-3 h-3" />
                  {highlightsCount} highlight{highlightsCount > 1 ? 's' : ''}
                </span>
              </>
            )}

            {article.tags && article.tags.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <div className="flex items-center gap-1.5 text-stone-500">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="hover:text-stone-800">
                      #<HighlightedText text={tag} query={searchQuery} />
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span>+{article.tags.length - 3}</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Thumbnail / Hero Image if available */}
        {article.heroImage && (
          <div className="hidden sm:block shrink-0 w-28 h-20 rounded-lg overflow-hidden bg-stone-100 border border-stone-200/60">
            <img
              src={article.heroImage}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Progress Bar (if reading in progress) */}
      {article.progress > 0 && article.progress < 100 && (
        <div className="mt-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="w-full max-w-[200px] h-1.5 bg-stone-100 rounded-full overflow-hidden mr-3">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${article.progress}%` }}
            />
          </div>
          <span className="font-mono text-[11px] shrink-0 text-stone-400">
            {article.progress}% read
          </span>
        </div>
      )}

      {/* Hover Action Strip */}
      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => onToggleFavorite(article.id, e)}
            className={`p-1.5 rounded-md hover:bg-stone-100 transition-colors ${
              article.isFavorite ? 'text-amber-500' : 'text-stone-400 hover:text-stone-700'
            }`}
            title={article.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
          >
            <Star className={`w-4 h-4 ${article.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
          </button>

          {article.status === 'archived' ? (
            <button
              onClick={(e) => onToggleStatus(article.id, 'inbox', e)}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
              title="Move back to inbox"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={(e) => onToggleStatus(article.id, 'archived', e)}
              className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
              title="Mark as read & Archive"
            >
              <Archive className="w-4 h-4" />
            </button>
          )}

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
            title="Open original link"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => onDelete(article.id, e)}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
            title="Delete article"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenReader(article)}
            className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-600" />
            <span>Read</span>
          </button>
        </div>
      </div>
    </article>
  );
};
