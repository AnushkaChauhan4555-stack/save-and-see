export type ArticleStatus = 'inbox' | 'reading' | 'archived';

export type HighlightColor = 'amber' | 'emerald' | 'sky' | 'rose' | 'violet';

export interface Highlight {
  id: string;
  text: string;
  color: HighlightColor;
  note?: string;
  createdAt: string;
  paragraphIndex?: number;
}

export interface ArticleNote {
  id: string;
  content: string;
  createdAt: string;
}

export interface Article {
  id: string;
  url: string;
  title: string;
  author: string;
  siteName: string;
  domain: string;
  favicon?: string;
  heroImage?: string;
  excerpt: string;
  content: string; // rich markdown / html formatted string
  wordCount: number;
  readingTimeMinutes: number;
  status: ArticleStatus;
  isFavorite: boolean;
  progress: number; // 0 to 100
  savedAt: string;
  readAt?: string;
  tags: string[];
  collectionId: string;
  highlights: Highlight[];
  personalNotes?: ArticleNote[];
}

export interface Collection {
  id: string;
  name: string;
  iconName: string;
  color: string;
  count?: number;
}

export type ReaderTheme = 'paper' | 'light' | 'slate' | 'charcoal';
export type ReaderFontFamily = 'serif' | 'sans' | 'mono';
export type ReaderWidth = 'narrow' | 'medium' | 'wide';

export interface ReaderSettings {
  theme: ReaderTheme;
  fontFamily: ReaderFontFamily;
  fontSize: number; // in px: 16 to 26
  lineHeight: number; // 1.4 to 2.0
  maxWidth: ReaderWidth;
  speechSpeed: number; // 0.75, 1, 1.25, 1.5, 2
  speechVoice?: string;
}

export type NavigationFilter =
  | { type: 'status'; value: ArticleStatus }
  | { type: 'favorites' }
  | { type: 'highlights' }
  | { type: 'collection'; id: string }
  | { type: 'tag'; tag: string }
  | { type: 'all' };

export type SortOption = 'newest' | 'oldest' | 'read_time_asc' | 'read_time_desc' | 'progress';
