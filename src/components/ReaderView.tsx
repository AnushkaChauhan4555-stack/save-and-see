import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Settings,
  Highlighter,
  MessageSquare,
  Copy,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Star,
  Archive,
  Download,
  Share2,
  Check,
  X,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Article, Highlight, HighlightColor, ReaderSettings, ReaderTheme, ReaderFontFamily, ReaderWidth } from '../types';
import { ArticleSpeechManager } from '../utils/speech';
import { exportArticleToMarkdown } from '../utils/storage';

interface ReaderViewProps {
  article: Article;
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: ReaderSettings) => void;
  onUpdateArticle: (updated: Article) => void;
  onClose: () => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  article,
  settings,
  onUpdateSettings,
  onUpdateArticle,
  onClose,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(article.progress || 0);
  const [showAppearanceMenu, setShowAppearanceMenu] = useState(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  
  // Selection toolbar state
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<{ top: number; left: number } | null>(null);
  const [addingNoteForHighlight, setAddingNoteForHighlight] = useState<string | null>(null);
  const [highlightNoteText, setHighlightNoteText] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Audio Speech state
  const speechManager = useRef<ArticleSpeechManager | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [totalSentences, setTotalSentences] = useState(0);
  const [isAudioBarVisible, setIsAudioBarVisible] = useState(false);

  // Initialize Speech Manager
  useEffect(() => {
    speechManager.current = new ArticleSpeechManager();
    speechManager.current.setRate(settings.speechSpeed);

    return () => {
      if (speechManager.current) {
        speechManager.current.stop();
      }
    };
  }, []);

  // Sync speech rate if settings change
  useEffect(() => {
    if (speechManager.current) {
      speechManager.current.setRate(settings.speechSpeed);
    }
  }, [settings.speechSpeed]);

  // Track scroll depth and update progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const currentScroll = window.scrollY;
      const progress = Math.min(100, Math.max(0, Math.round((currentScroll / totalHeight) * 100)));
      setScrollProgress(progress);

      // Periodically update article progress
      if (Math.abs(progress - article.progress) >= 5) {
        const updatedStatus = progress >= 95 ? 'archived' : (progress > 5 ? 'reading' : article.status);
        onUpdateArticle({
          ...article,
          progress,
          status: updatedStatus,
          readAt: progress >= 95 ? new Date().toISOString() : article.readAt,
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article, onUpdateArticle]);

  // Handle Text Selection for Highlighting
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      // Don't close immediately if clicking on note input
      if (!addingNoteForHighlight) {
        setSelectionPosition(null);
        setSelectedText('');
      }
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 3) {
      setSelectionPosition(null);
      setSelectedText('');
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelectedText(text);
    setSelectionPosition({
      top: rect.top + window.scrollY - 54, // position above selection
      left: Math.max(16, rect.left + rect.width / 2),
    });
  };

  // Add Highlight
  const handleAddHighlight = (color: HighlightColor) => {
    if (!selectedText) return;

    const newHighlight: Highlight = {
      id: `hl-${Date.now()}`,
      text: selectedText,
      color,
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...article,
      highlights: [...(article.highlights || []), newHighlight],
    };

    onUpdateArticle(updated);
    setSelectionPosition(null);
    setSelectedText('');
    window.getSelection()?.removeAllRanges();
  };

  // Delete Highlight
  const handleDeleteHighlight = (id: string) => {
    const updated = {
      ...article,
      highlights: article.highlights.filter((h) => h.id !== id),
    };
    onUpdateArticle(updated);
  };

  // Update Highlight Note
  const handleSaveHighlightNote = (id: string, note: string) => {
    const updated = {
      ...article,
      highlights: article.highlights.map((h) => (h.id === id ? { ...h, note } : h)),
    };
    onUpdateArticle(updated);
    setAddingNoteForHighlight(null);
    setHighlightNoteText('');
  };

  // Copy with citation
  const handleCopyQuote = () => {
    if (!selectedText) return;
    const quoteWithCitation = `"${selectedText}"\n\n— From "${article.title}" by ${article.author || article.siteName} (${article.url})`;
    navigator.clipboard.writeText(quoteWithCitation);
    setCopiedNotification(true);
    setTimeout(() => {
      setCopiedNotification(false);
      setSelectionPosition(null);
      setSelectedText('');
      window.getSelection()?.removeAllRanges();
    }, 1200);
  };

  // Audio Playback Handlers
  const handleToggleAudio = () => {
    if (!speechManager.current) return;

    if (!isAudioBarVisible) {
      setIsAudioBarVisible(true);
      speechManager.current.loadArticleContent(article.content);
      speechManager.current.play(
        (idx, total) => {
          setCurrentSentenceIdx(idx);
          setTotalSentences(total);
        },
        (playing, paused) => {
          setIsAudioPlaying(playing);
          setIsAudioPaused(paused);
        }
      );
      return;
    }

    if (isAudioPlaying && !isAudioPaused) {
      speechManager.current.pause();
    } else {
      speechManager.current.resume();
    }
  };

  const handleStopAudio = () => {
    if (speechManager.current) {
      speechManager.current.stop();
    }
    setIsAudioBarVisible(false);
    setIsAudioPlaying(false);
    setIsAudioPaused(false);
  };

  // Theme styling helpers
  const getThemeClass = (theme: ReaderTheme) => {
    switch (theme) {
      case 'paper': return 'theme-paper';
      case 'light': return 'theme-light';
      case 'slate': return 'theme-slate';
      case 'charcoal': return 'theme-charcoal';
      default: return 'theme-paper';
    }
  };

  const getFontFamilyClass = (font: ReaderFontFamily) => {
    switch (font) {
      case 'serif': return 'font-reader-serif';
      case 'sans': return 'font-reader-sans';
      case 'mono': return 'font-reader-mono';
      default: return 'font-reader-serif';
    }
  };

  const getMaxWidthClass = (width: ReaderWidth) => {
    switch (width) {
      case 'narrow': return 'max-w-[620px]';
      case 'medium': return 'max-w-[740px]';
      case 'wide': return 'max-w-[880px]';
      default: return 'max-w-[740px]';
    }
  };

  // Finish Reading & Archive
  const handleMarkFinished = () => {
    onUpdateArticle({
      ...article,
      progress: 100,
      status: 'archived',
      readAt: new Date().toISOString(),
    });
    setScrollProgress(100);
  };

  // Color map for highlights
  const highlightColorClasses: Record<HighlightColor, string> = {
    amber: 'bg-amber-200/60 border-b border-amber-400 text-stone-900',
    emerald: 'bg-emerald-200/60 border-b border-emerald-400 text-stone-900',
    sky: 'bg-sky-200/60 border-b border-sky-400 text-stone-900',
    rose: 'bg-rose-200/60 border-b border-rose-400 text-stone-900',
    violet: 'bg-purple-200/60 border-b border-purple-400 text-stone-900',
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${getThemeClass(settings.theme)} relative`}>
      {/* Hairline Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-stone-300/30">
        <div
          className="h-full bg-amber-600 transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reader Fixed Sticky Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-inherit/90 border-b border-stone-200/40 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium rounded-lg hover:bg-stone-500/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Library</span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-xs opacity-75 font-mono">
            <span className="truncate max-w-[240px]">{article.siteName || article.domain}</span>
            <span aria-hidden="true">·</span>
            <span>{article.readingTimeMinutes} min read</span>
            <span aria-hidden="true">·</span>
            <span>{scrollProgress}% read</span>
          </div>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-1.5">
          {/* Audio Listen Mode Toggle */}
          <button
            onClick={handleToggleAudio}
            className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              isAudioPlaying
                ? 'bg-amber-600 text-white'
                : 'hover:bg-stone-500/10 text-inherit'
            }`}
            title="Listen to article"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isAudioPlaying ? (isAudioPaused ? 'Resume' : 'Pause') : 'Listen'}
            </span>
          </button>

          {/* Highlights & Notes Drawer Toggle */}
          <button
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            className={`relative p-2 rounded-lg hover:bg-stone-500/10 transition-colors ${
              showNotesDrawer ? 'bg-stone-500/15' : ''
            }`}
            title="View Highlights & Notes"
          >
            <Highlighter className="w-4 h-4" />
            {(article.highlights?.length || 0) > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>

          {/* Star / Favorite */}
          <button
            onClick={() => onUpdateArticle({ ...article, isFavorite: !article.isFavorite })}
            className={`p-2 rounded-lg hover:bg-stone-500/10 transition-colors ${
              article.isFavorite ? 'text-amber-500' : ''
            }`}
            title={article.isFavorite ? 'Favorited' : 'Add to Favorites'}
          >
            <Star className={`w-4 h-4 ${article.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Mark Read & Archive */}
          <button
            onClick={handleMarkFinished}
            className={`p-2 rounded-lg hover:bg-stone-500/10 transition-colors ${
              article.status === 'archived' ? 'text-emerald-600' : ''
            }`}
            title={article.status === 'archived' ? 'Archived' : 'Archive article'}
          >
            <Archive className="w-4 h-4" />
          </button>

          {/* Export to Markdown */}
          <button
            onClick={() => exportArticleToMarkdown(article)}
            className="p-2 rounded-lg hover:bg-stone-500/10 transition-colors"
            title="Export to Markdown (Obsidian / Notes)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Appearance Customizer Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowAppearanceMenu(!showAppearanceMenu)}
              className={`p-2 rounded-lg hover:bg-stone-500/10 transition-colors ${
                showAppearanceMenu ? 'bg-stone-500/15' : ''
              }`}
              title="Typography & Appearance"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Appearance Popover Menu */}
            {showAppearanceMenu && (
              <div className="absolute right-0 mt-2 w-72 p-4 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 z-50 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Appearance
                  </span>
                  <button
                    onClick={() => setShowAppearanceMenu(false)}
                    className="p-1 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Theme Selector */}
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-400 block mb-2">
                    Theme
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(
                      [
                        { id: 'paper', label: 'Paper', bg: 'bg-[#fcf9f2] text-[#2c2523]' },
                        { id: 'light', label: 'Light', bg: 'bg-white text-stone-900 border border-stone-200' },
                        { id: 'slate', label: 'Slate', bg: 'bg-[#1e293b] text-slate-100' },
                        { id: 'charcoal', label: 'OLED', bg: 'bg-[#121212] text-stone-200' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onUpdateSettings({ ...settings, theme: t.id })}
                        className={`py-2 px-1 text-xs rounded-lg font-medium transition-all ${t.bg} ${
                          settings.theme === t.id ? 'ring-2 ring-amber-500 ring-offset-1' : ''
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Family */}
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-400 block mb-2">
                    Typography
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg">
                    {(
                      [
                        { id: 'serif', label: 'Serif', font: 'font-reader-serif' },
                        { id: 'sans', label: 'Sans', font: 'font-reader-sans' },
                        { id: 'mono', label: 'Mono', font: 'font-reader-mono' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => onUpdateSettings({ ...settings, fontFamily: f.id })}
                        className={`py-1.5 text-xs rounded-md transition-colors ${f.font} ${
                          settings.fontFamily === f.id
                            ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-medium'
                            : 'text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size & Line Height */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
                      Font Size
                    </label>
                    <span className="text-xs font-mono text-stone-500">
                      {settings.fontSize}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onUpdateSettings({
                          ...settings,
                          fontSize: Math.max(15, settings.fontSize - 1),
                        })
                      }
                      className="px-2.5 py-1 text-xs bg-stone-100 dark:bg-stone-800 rounded hover:bg-stone-200"
                    >
                      A-
                    </button>
                    <input
                      type="range"
                      min={15}
                      max={26}
                      value={settings.fontSize}
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          fontSize: Number(e.target.value),
                        })
                      }
                      className="flex-1 accent-amber-600"
                    />
                    <button
                      onClick={() =>
                        onUpdateSettings({
                          ...settings,
                          fontSize: Math.min(26, settings.fontSize + 1),
                        })
                      }
                      className="px-2.5 py-1 text-xs bg-stone-100 dark:bg-stone-800 rounded hover:bg-stone-200"
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* Column Width */}
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-400 block mb-2">
                    Reading Column Width
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs">
                    {(
                      [
                        { id: 'narrow', label: 'Narrow' },
                        { id: 'medium', label: 'Medium' },
                        { id: 'wide', label: 'Wide' },
                      ] as const
                    ).map((w) => (
                      <button
                        key={w.id}
                        onClick={() => onUpdateSettings({ ...settings, maxWidth: w.id })}
                        className={`py-1.5 rounded-md transition-colors ${
                          settings.maxWidth === w.id
                            ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-medium'
                            : 'text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speech Rate Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
                      Audio Speed
                    </label>
                    <span className="text-xs font-mono text-stone-500">
                      {settings.speechSpeed}x
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[0.8, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => onUpdateSettings({ ...settings, speechSpeed: rate })}
                        className={`flex-1 py-1 text-[11px] font-mono rounded transition-colors ${
                          settings.speechSpeed === rate
                            ? 'bg-amber-600 text-white font-semibold'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Selection Toolbar for Highlighting */}
      {selectionPosition && selectedText && (
        <div
          className="fixed z-50 bg-stone-900 text-white rounded-lg shadow-xl px-2.5 py-1.5 flex items-center gap-2 text-xs border border-stone-800 animate-in fade-in zoom-in-95 -translate-x-1/2"
          style={{ top: `${selectionPosition.top}px`, left: `${selectionPosition.left}px` }}
        >
          {/* Highlight Color Pickers */}
          <div className="flex items-center gap-1.5 pr-2 border-r border-stone-700">
            {(
              [
                { id: 'amber', bg: 'bg-amber-400', label: 'Gold' },
                { id: 'emerald', bg: 'bg-emerald-400', label: 'Green' },
                { id: 'sky', bg: 'bg-sky-400', label: 'Blue' },
                { id: 'rose', bg: 'bg-rose-400', label: 'Pink' },
                { id: 'violet', bg: 'bg-purple-400', label: 'Purple' },
              ] as const
            ).map((c) => (
              <button
                key={c.id}
                onClick={() => handleAddHighlight(c.id)}
                className={`w-4 h-4 rounded-full ${c.bg} hover:scale-125 transition-transform cursor-pointer`}
                title={`Highlight in ${c.label}`}
              />
            ))}
          </div>

          {/* Copy Quote Button */}
          <button
            onClick={handleCopyQuote}
            className="flex items-center gap-1 text-stone-300 hover:text-white transition-colors p-1 rounded"
            title="Copy quote with attribution"
          >
            {copiedNotification ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedNotification ? 'Copied' : 'Quote'}</span>
          </button>
        </div>
      )}

      {/* Floating Audio Playback Bar */}
      {isAudioBarVisible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900/95 backdrop-blur-md text-stone-100 rounded-2xl shadow-2xl px-5 py-3 border border-stone-800 flex items-center gap-4 max-w-lg w-[90%]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => speechManager.current?.previousSentence()}
              className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-800 transition-colors"
              title="Previous sentence"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleAudio}
              className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center transition-colors shadow-sm"
              title={isAudioPaused ? 'Resume' : 'Pause'}
            >
              {isAudioPaused ? (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              ) : (
                <Pause className="w-4 h-4 fill-current" />
              )}
            </button>

            <button
              onClick={() => speechManager.current?.nextSentence()}
              className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-800 transition-colors"
              title="Next sentence"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono mb-1">
              <span>Listening to text</span>
              <span>
                {currentSentenceIdx + 1} / {totalSentences || 1}
              </span>
            </div>
            <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{
                  width: `${
                    totalSentences > 0
                      ? ((currentSentenceIdx + 1) / totalSentences) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <button
            onClick={handleStopAudio}
            className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800"
            title="Close audio player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Article Reading Container */}
      <div className="px-6 py-12 max-w-5xl mx-auto flex gap-8">
        <main
          className={`flex-1 mx-auto transition-all duration-200 ${getMaxWidthClass(
            settings.maxWidth
          )}`}
          onMouseUp={handleMouseUp}
        >
          {/* Article Header Metadata - NO PILLS */}
          <div className="mb-10 text-center sm:text-left">
            <div className="flex flex-wrap items-center gap-2 text-xs opacity-75 font-mono mb-4">
              <span>{article.siteName || article.domain}</span>
              <span aria-hidden="true">·</span>
              <span>
                {new Date(article.savedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span aria-hidden="true">·</span>
              <span>{article.readingTimeMinutes} min read ({article.wordCount} words)</span>
            </div>

            <h1
              className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.2] mb-6 ${getFontFamilyClass(
                settings.fontFamily
              )}`}
            >
              {article.title}
            </h1>

            {article.author && (
              <p className="text-sm opacity-80 mb-6 font-sans">
                Written by <span className="font-semibold">{article.author}</span>
              </p>
            )}

            {article.url && (
              <div className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 hover:underline">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                  <span>Visit original publication</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Hero Image if available */}
          {article.heroImage && (
            <div className="mb-10 rounded-xl overflow-hidden shadow-sm border border-stone-200/50">
              <img
                src={article.heroImage}
                alt=""
                className="w-full h-auto max-h-[440px] object-cover"
              />
            </div>
          )}

          {/* Render Article Highlights Banner if any */}
          {article.highlights && article.highlights.length > 0 && (
            <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  <Highlighter className="w-3.5 h-3.5 text-amber-600" />
                  {article.highlights.length} Saved Highlight{article.highlights.length > 1 ? 's' : ''} in this Article
                </span>
                <button
                  onClick={() => setShowNotesDrawer(true)}
                  className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Review notes</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* The Rich Article Prose */}
          <div
            ref={contentRef}
            className={`reader-prose ${getFontFamilyClass(settings.fontFamily)}`}
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* End of Article Action Card */}
          <div className="mt-16 pt-8 border-t border-stone-200/60 dark:border-stone-800 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold">You've reached the end</h3>
            <p className="text-xs opacity-75 max-w-sm mx-auto">
              Mark this essay as finished to archive it from your active inbox. It will remain searchable forever.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleMarkFinished}
                className="px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Mark Finished & Archive
              </button>
              <button
                onClick={() => exportArticleToMarkdown(article)}
                className="px-4 py-2.5 text-xs font-medium bg-stone-200/60 hover:bg-stone-200 text-inherit rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Markdown</span>
              </button>
            </div>
          </div>
        </main>

        {/* Side Drawer: Article Highlights & Margin Notes */}
        {showNotesDrawer && (
          <aside className="w-80 shrink-0 hidden lg:block sticky top-16 h-[calc(100vh-5rem)] overflow-y-auto p-4 bg-white/70 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Highlighter className="w-4 h-4 text-amber-600" />
                <h3 className="font-serif font-semibold text-sm">Highlights & Notes</h3>
              </div>
              <button
                onClick={() => setShowNotesDrawer(false)}
                className="p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(!article.highlights || article.highlights.length === 0) ? (
              <div className="text-center py-10 text-xs opacity-60">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No highlights yet.</p>
                <p className="mt-1">Select any sentence in the text to highlight and add notes.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {article.highlights.map((hl) => (
                  <div
                    key={hl.id}
                    className="p-3 rounded-lg border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 text-xs space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            hl.color === 'amber'
                              ? 'bg-amber-400'
                              : hl.color === 'emerald'
                              ? 'bg-emerald-400'
                              : hl.color === 'sky'
                              ? 'bg-sky-400'
                              : hl.color === 'rose'
                              ? 'bg-rose-400'
                              : 'bg-purple-400'
                          }`}
                        />
                        <span className="text-[10px] opacity-60 font-mono">
                          {new Date(hl.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteHighlight(hl.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                        title="Delete highlight"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <blockquote className="border-l-2 border-amber-500/60 pl-2 italic font-serif opacity-90 line-clamp-4">
                      "{hl.text}"
                    </blockquote>

                    {hl.note ? (
                      <div className="bg-amber-500/10 p-2 rounded text-stone-800 dark:text-stone-200 text-xs">
                        <p className="font-sans font-medium text-[11px] text-amber-800 dark:text-amber-400 mb-0.5">Note:</p>
                        <p>{hl.note}</p>
                      </div>
                    ) : addingNoteForHighlight === hl.id ? (
                      <div className="space-y-1.5 pt-1">
                        <textarea
                          value={highlightNoteText}
                          onChange={(e) => setHighlightNoteText(e.target.value)}
                          placeholder="Add your thought..."
                          className="w-full p-2 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none focus:border-amber-500"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setAddingNoteForHighlight(null);
                              setHighlightNoteText('');
                            }}
                            className="px-2 py-1 text-[11px] text-stone-500"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveHighlightNote(hl.id, highlightNoteText)}
                            className="px-2.5 py-1 text-[11px] bg-amber-600 text-white rounded font-medium"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAddingNoteForHighlight(hl.id);
                          setHighlightNoteText('');
                        }}
                        className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add personal note</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};
