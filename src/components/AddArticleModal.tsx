import React, { useState } from 'react';
import { X, Link2, FileText, Check, Sparkles, Folder } from 'lucide-react';
import { Article, Collection } from '../types';
import { calculateReadingStats, extractDomain, formatUrlTitle, convertPlainTextToHtml } from '../utils/textParser';

interface AddArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  onAddArticle: (article: Article) => void;
}

export const AddArticleModal: React.FC<AddArticleModalProps> = ({
  isOpen,
  onClose,
  collections,
  onAddArticle,
}) => {
  const [mode, setMode] = useState<'url' | 'text'>('url');
  
  // URL mode state
  const [url, setUrl] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlAuthor, setUrlAuthor] = useState('');
  const [urlCollectionId, setUrlCollectionId] = useState(collections[0]?.id || '');
  const [urlTags, setUrlTags] = useState('');

  // Manual text mode state
  const [textTitle, setTextTitle] = useState('');
  const [textAuthor, setTextAuthor] = useState('');
  const [textContent, setTextContent] = useState('');
  const [textSourceUrl, setTextSourceUrl] = useState('');
  const [textCollectionId, setTextCollectionId] = useState(collections[0]?.id || '');
  const [textTags, setTextTags] = useState('');

  if (!isOpen) return null;

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value && !urlTitle) {
      setUrlTitle(formatUrlTitle(value));
    }
  };

  const handleSaveUrlArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const { domain, siteName } = extractDomain(url);
    const title = urlTitle.trim() || formatUrlTitle(url);
    
    // Create rich simulated parsed article body
    const sampleArticleContent = `
<h2>Summary of ${title}</h2>
<p>Saved from <strong>${siteName}</strong> on ${new Date().toLocaleDateString()}. Below is the archived reading copy preserved in your personal vault.</p>

<p>When studying architecture, focus, and modern thought, the fundamental challenge is signal extraction. We are surrounded by continuous notification streams, yet genuine synthesis requires sitting with coherent arguments over extended stretches.</p>

<blockquote>"The difference between knowledge and information is deliberate reflection and marginal synthesis."</blockquote>

<p>Key takeaways from this piece explore the intersection of craft, systems thinking, and durable design. As you read through, select any passage to create highlights or record personal thoughts directly in your margin vault.</p>
`;

    const stats = calculateReadingStats(sampleArticleContent);
    const parsedTags = urlTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newArticle: Article = {
      id: `art-${Date.now()}`,
      url: url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`,
      title,
      author: urlAuthor.trim() || siteName,
      siteName,
      domain,
      excerpt: `An insightful piece from ${siteName} exploring ${title.toLowerCase()}. Preserved for distraction-free reading.`,
      content: sampleArticleContent,
      wordCount: stats.wordCount,
      readingTimeMinutes: stats.readingTimeMinutes,
      status: 'inbox',
      isFavorite: false,
      progress: 0,
      savedAt: new Date().toISOString(),
      collectionId: urlCollectionId || (collections[0]?.id || 'col-essays'),
      tags: parsedTags.length > 0 ? parsedTags : ['Web'],
      highlights: [],
    };

    onAddArticle(newArticle);
    onClose();
    // Reset fields
    setUrl('');
    setUrlTitle('');
    setUrlAuthor('');
    setUrlTags('');
  };

  const handleSaveTextArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textTitle.trim() || !textContent.trim()) return;

    const htmlContent = convertPlainTextToHtml(textContent);
    const stats = calculateReadingStats(htmlContent);
    const parsedTags = textTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const { domain, siteName } = textSourceUrl.trim()
      ? extractDomain(textSourceUrl)
      : { domain: 'notes', siteName: 'Personal Note' };

    const newArticle: Article = {
      id: `art-${Date.now()}`,
      url: textSourceUrl.trim() || 'https://personal-notes.local',
      title: textTitle.trim(),
      author: textAuthor.trim() || 'Me',
      siteName,
      domain,
      excerpt: textContent.trim().slice(0, 160) + '...',
      content: htmlContent,
      wordCount: stats.wordCount,
      readingTimeMinutes: stats.readingTimeMinutes,
      status: 'inbox',
      isFavorite: false,
      progress: 0,
      savedAt: new Date().toISOString(),
      collectionId: textCollectionId || (collections[0]?.id || 'col-essays'),
      tags: parsedTags.length > 0 ? parsedTags : ['Notes'],
      highlights: [],
    };

    onAddArticle(newArticle);
    onClose();
    // Reset fields
    setTextTitle('');
    setTextAuthor('');
    setTextContent('');
    setTextSourceUrl('');
    setTextTags('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-bold text-stone-900">Save for Later</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setMode('url')}
              className={`py-1.5 flex items-center justify-center gap-2 rounded-md transition-all ${
                mode === 'url'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Paste Web URL</span>
            </button>

            <button
              onClick={() => setMode('text')}
              className={`py-1.5 flex items-center justify-center gap-2 rounded-md transition-all ${
                mode === 'text'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Text / Essay</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        {mode === 'url' ? (
          <form onSubmit={handleSaveUrlArticle} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Article URL *
              </label>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/article-slug"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:bg-white text-stone-900"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Title (Optional)
              </label>
              <input
                type="text"
                value={urlTitle}
                onChange={(e) => setUrlTitle(e.target.value)}
                placeholder="Auto-detected or enter custom title"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:bg-white text-stone-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Collection
                </label>
                <select
                  value={urlCollectionId}
                  onChange={(e) => setUrlCollectionId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:bg-white text-stone-900"
                >
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Author (Optional)
                </label>
                <input
                  type="text"
                  value={urlAuthor}
                  onChange={(e) => setUrlAuthor(e.target.value)}
                  placeholder="e.g. Paul Graham"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:bg-white text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={urlTags}
                onChange={(e) => setUrlTags(e.target.value)}
                placeholder="Technology, AI, Philosophy"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:bg-white text-stone-900"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Save Article
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSaveTextArticle} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                placeholder="Essay or newsletter title"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:bg-white text-stone-900"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Article / Essay Content *
              </label>
              <textarea
                required
                rows={6}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste the full article, markdown, newsletter paragraphs..."
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:bg-white text-stone-900 leading-relaxed font-sans"
              />
              {textContent && (
                <div className="text-[11px] text-stone-500 font-mono mt-1">
                  {calculateReadingStats(textContent).wordCount} words · ~
                  {calculateReadingStats(textContent).readingTimeMinutes} min read
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Collection
                </label>
                <select
                  value={textCollectionId}
                  onChange={(e) => setTextCollectionId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:bg-white text-stone-900"
                >
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={textAuthor}
                  onChange={(e) => setTextAuthor(e.target.value)}
                  placeholder="e.g. Ted Chiang"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:bg-white text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                value={textTags}
                onChange={(e) => setTextTags(e.target.value)}
                placeholder="Philosophy, Notes, Ideas"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:bg-white text-stone-900"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Save to Vault
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
