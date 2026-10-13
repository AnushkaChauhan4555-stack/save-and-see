import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'J / ↓', desc: 'Select next article in list' },
    { key: 'K / ↑', desc: 'Select previous article in list' },
    { key: 'Enter / R', desc: 'Open selected article in Reader mode' },
    { key: 'A / E', desc: 'Archive or restore active article' },
    { key: 'S', desc: 'Toggle star / favorite' },
    { key: '/', desc: 'Focus instant search bar' },
    { key: 'N', desc: 'Open Save Article modal' },
    { key: 'H', desc: 'Open Highlights & Marginalia vault' },
    { key: 'Esc', desc: 'Exit reader mode or close any active modal' },
    { key: '?', desc: 'Toggle this shortcuts reference guide' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-4 h-4 text-amber-600" />
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 divide-y divide-stone-100 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((s) => (
            <div key={s.key} className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-stone-600 font-sans">{s.desc}</span>
              <kbd className="px-2 py-1 font-mono text-[11px] font-semibold text-stone-800 bg-stone-100 border border-stone-300/80 rounded shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-3 bg-stone-50 border-t border-stone-100 text-center">
          <p className="text-[11px] text-stone-500">
            Folio is built for keyboard-driven reading flows.
          </p>
        </div>
      </div>
    </div>
  );
};
