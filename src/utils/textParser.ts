export function calculateReadingStats(textOrHtml: string) {
  // Strip HTML tags for word counting
  const text = textOrHtml.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 220;
  const minutes = Math.max(1, Math.round(words / wordsPerMinute));
  return {
    wordCount: words,
    readingTimeMinutes: minutes
  };
}

export function extractDomain(urlStr: string): { domain: string; siteName: string } {
  try {
    let cleanUrl = urlStr.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    const parsed = new URL(cleanUrl);
    const hostname = parsed.hostname.replace(/^www\./, '');
    
    // Friendly site name formatting
    let siteName = hostname;
    if (hostname.includes('nytimes.com')) siteName = 'The New York Times';
    else if (hostname.includes('paulgraham.com')) siteName = 'Paul Graham Essays';
    else if (hostname.includes('theatlantic.com')) siteName = 'The Atlantic';
    else if (hostname.includes('medium.com')) siteName = 'Medium';
    else if (hostname.includes('substack.com')) siteName = 'Substack';
    else if (hostname.includes('wired.com')) siteName = 'Wired';
    else if (hostname.includes('github.com')) siteName = 'GitHub Readme';
    else if (hostname.includes('wikipedia.org')) siteName = 'Wikipedia';
    else if (hostname.includes('newyorker.com')) siteName = 'The New Yorker';
    else if (hostname.includes('bloomberg.com')) siteName = 'Bloomberg';
    else {
      // Capitalize domain parts
      siteName = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
    }

    return { domain: hostname, siteName };
  } catch (e) {
    return { domain: 'web', siteName: 'Web Article' };
  }
}

export function formatUrlTitle(urlStr: string): string {
  try {
    let cleanUrl = urlStr.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    const parsed = new URL(cleanUrl);
    const pathSegments = parsed.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const last = pathSegments[pathSegments.length - 1]
        .replace(/\.html?$/i, '')
        .replace(/[-_]/g, ' ');
      if (last.length > 3) {
        return last.charAt(0).toUpperCase() + last.slice(1);
      }
    }
    return `Article from ${parsed.hostname.replace(/^www\./, '')}`;
  } catch (e) {
    return 'Saved Web Article';
  }
}

export function convertPlainTextToHtml(text: string): string {
  if (!text) return '';
  // Check if it already contains HTML tags like <p> or <h2>
  if (/<(p|h1|h2|h3|ul|ol|blockquote)[\s>]/i.test(text)) {
    return text;
  }

  // Convert markdown-like paragraphs to HTML
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  return paragraphs.map(p => {
    const trimmed = p.trim();
    if (trimmed.startsWith('# ')) {
      return `<h2>${trimmed.replace(/^#\s+/, '')}</h2>`;
    }
    if (trimmed.startsWith('## ')) {
      return `<h2>${trimmed.replace(/^##\s+/, '')}</h2>`;
    }
    if (trimmed.startsWith('### ')) {
      return `<h3>${trimmed.replace(/^###\s+/, '')}</h3>`;
    }
    if (trimmed.startsWith('> ')) {
      return `<blockquote>${trimmed.replace(/^>\s+/, '')}</blockquote>`;
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = trimmed.split('\n').map(li => `<li>${li.replace(/^[-*]\s+/, '')}</li>`).join('');
      return `<ul>${items}</ul>`;
    }
    return `<p>${trimmed}</p>`;
  }).join('\n');
}

export function stripHtml(htmlStr: string): string {
  if (!htmlStr) return '';
  return htmlStr.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function findContentSnippet(htmlContent: string, query: string, maxLength: number = 140): string | null {
  if (!query || !htmlContent) return null;
  const plainText = stripHtml(htmlContent);
  const lowerText = plainText.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return null;

  const start = Math.max(0, index - Math.floor((maxLength - query.length) / 2));
  const end = Math.min(plainText.length, start + maxLength);
  let snippet = plainText.slice(start, end);

  if (start > 0) snippet = '...' + snippet;
  if (end < plainText.length) snippet = snippet + '...';

  return snippet;
}

export function splitByQuery(text: string, query: string): Array<{ text: string; isMatch: boolean }> {
  if (!query || !query.trim() || !text) {
    return [{ text, isMatch: false }];
  }

  const trimmedQuery = query.trim();
  // Escape special regex characters in the query
  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return parts
    .filter(Boolean)
    .map(part => ({
      text: part,
      isMatch: part.toLowerCase() === trimmedQuery.toLowerCase()
    }));
}

