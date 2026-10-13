import { Article, Collection, ReaderSettings } from '../types';
import { INITIAL_ARTICLES, INITIAL_COLLECTIONS } from '../data/seedArticles';

const ARTICLES_STORAGE_KEY = 'folio_saved_articles_v1';
const COLLECTIONS_STORAGE_KEY = 'folio_collections_v1';
const SETTINGS_STORAGE_KEY = 'folio_reader_settings_v1';

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  theme: 'paper',
  fontFamily: 'serif',
  fontSize: 19,
  lineHeight: 1.75,
  maxWidth: 'medium',
  speechSpeed: 1.0,
};

export function loadArticles(): Article[] {
  try {
    const raw = localStorage.getItem(ARTICLES_STORAGE_KEY);
    if (!raw) {
      saveArticles(INITIAL_ARTICLES);
      return INITIAL_ARTICLES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ARTICLES;
  } catch (e) {
    console.error('Failed to load articles from storage:', e);
    return INITIAL_ARTICLES;
  }
}

export function saveArticles(articles: Article[]): void {
  try {
    localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
  } catch (e) {
    console.error('Failed to save articles to storage:', e);
  }
}

export function loadCollections(): Collection[] {
  try {
    const raw = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
    if (!raw) {
      saveCollections(INITIAL_COLLECTIONS);
      return INITIAL_COLLECTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_COLLECTIONS;
  } catch (e) {
    console.error('Failed to load collections:', e);
    return INITIAL_COLLECTIONS;
  }
}

export function saveCollections(collections: Collection[]): void {
  try {
    localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
  } catch (e) {
    console.error('Failed to save collections:', e);
  }
}

export function loadReaderSettings(): ReaderSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_READER_SETTINGS;
    return { ...DEFAULT_READER_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_READER_SETTINGS;
  }
}

export function saveReaderSettings(settings: ReaderSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save reader settings:', e);
  }
}

// Export library as JSON
export function exportLibraryToJson(articles: Article[], collections: Collection[]): void {
  const data = {
    app: 'Folio Save-for-Later',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    articles,
    collections
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `folio-reading-vault-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Export article and its highlights to Markdown (for Obsidian / Notes)
export function exportArticleToMarkdown(article: Article): void {
  let md = `# ${article.title}\n\n`;
  md += `- **Author**: ${article.author || 'Unknown'}\n`;
  md += `- **Source**: [${article.siteName || article.domain}](${article.url})\n`;
  md += `- **Saved At**: ${new Date(article.savedAt).toLocaleDateString()}\n`;
  md += `- **Word Count**: ${article.wordCount} words (~${article.readingTimeMinutes} min read)\n`;
  if (article.tags.length > 0) {
    md += `- **Tags**: ${article.tags.map(t => `#${t.replace(/\s+/g, '-')}`).join(' ')}\n`;
  }
  md += `\n---\n\n`;

  if (article.highlights && article.highlights.length > 0) {
    md += `## Highlights & Annotations (${article.highlights.length})\n\n`;
    article.highlights.forEach((hl, i) => {
      md += `> "${hl.text}"\n\n`;
      if (hl.note) {
        md += `*Note*: ${hl.note}\n\n`;
      }
    });
    md += `---\n\n`;
  }

  if (article.personalNotes && article.personalNotes.length > 0) {
    md += `## Personal Thoughts & Summary\n\n`;
    article.personalNotes.forEach(n => {
      md += `- ${n.content} (${new Date(n.createdAt).toLocaleDateString()})\n`;
    });
    md += `\n---\n\n`;
  }

  md += `## Full Text\n\n`;
  // Simple HTML to text conversion for clean markdown
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = article.content;
  const cleanBody = tempDiv.innerText || tempDiv.textContent || '';
  md += cleanBody;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeFilename = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
  a.href = url;
  a.download = `${safeFilename}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
