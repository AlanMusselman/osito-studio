import React, { useState, useMemo } from 'react';
import { Keyboard, X, Search, Play, Command, Monitor } from 'lucide-react';

export interface ShortcutItem {
  id: string;
  category:
    | 'Omnibar & Deep Research'
    | 'Clipboard & Cloning'
    | 'Tools (Single Key)'
    | 'Arrange & Layers'
    | 'View, Zoom & Grids'
    | 'Select, Path & Pixels'
    | 'File & Studios';
  label: string;
  description: string;
  winKeys: string[];
  macKeys: string[];
  action?: () => void;
}

export interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: ShortcutItem[];
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  shortcuts,
}) => {
  const isMacDefault =
    typeof navigator !== 'undefined' &&
    /Mac|iPod|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

  const [osMode, setOsMode] = useState<'win' | 'mac'>(isMacDefault ? 'mac' : 'win');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const set = new Set<string>();
    shortcuts.forEach((s) => set.add(s.category));
    return ['ALL', ...Array.from(set)];
  }, [shortcuts]);

  const filteredShortcuts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return shortcuts.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.winKeys.join(' ').toLowerCase().includes(q) ||
        item.macKeys.join(' ').toLowerCase().includes(q)
      );
    });
  }, [shortcuts, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      style={{ zIndex: 10000 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[10000] select-none rounded-none"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl max-h-[88vh] bg-[#121212] border border-[#525252] shadow-2xl flex flex-col rounded-none font-mono text-xs text-[#e5e5e5]">
        {/* Modal Header */}
        <div className="px-4 py-3 bg-[#181818] border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#262626] border border-[#525252] flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide uppercase">
                Osito Studio 4.0 Keyboard Shortcuts (Windows &amp; macOS)
              </div>
              <div className="text-[11px] text-[#a3a3a3]">
                Ctrl+K Omnibar &amp; Deep Research · Ctrl+C Copy · Ctrl+V Paste in Place · Ctrl+Shift+V Paste Offset Above · All Classic Tools
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Windows / macOS Keycap Switcher */}
            <div className="flex items-center bg-[#0c0c0c] border border-[#383838] p-0.5">
              <button
                onClick={() => setOsMode('win')}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] transition ${
                  osMode === 'win'
                    ? 'bg-[#e5e5e5] text-[#0a0a0a] font-bold'
                    : 'text-[#8c8c8c] hover:text-white'
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>Windows (Ctrl/Alt)</span>
              </button>
              <button
                onClick={() => setOsMode('mac')}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] transition ${
                  osMode === 'mac'
                    ? 'bg-[#e5e5e5] text-[#0a0a0a] font-bold'
                    : 'text-[#8c8c8c] hover:text-white'
                }`}
              >
                <Command className="w-3 h-3" />
                <span>macOS (⌘/⌥)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 bg-[#1c1c1c] hover:bg-[#333333] border border-[#404040] text-[#d4d4d4] hover:text-white transition"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-3 bg-[#161616] border-b border-[#2a2a2a] flex flex-wrap items-center justify-between gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-[#737373] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts (e.g. paste in place, clone, subselect, marquee, bring to front)..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#0c0c0c] border border-[#383838] text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white rounded-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 text-[10px] uppercase tracking-wider border transition ${
                  selectedCategory === cat
                    ? 'bg-[#e5e5e5] text-[#0a0a0a] border-white font-bold'
                    : 'bg-[#1c1c1c] text-[#a3a3a3] border-[#333333] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Banner for Omnibar (Ctrl+K), Copy / Paste in Place / Paste Offset Above */}
        <div className="px-4 py-2.5 bg-[#1c1c1c] border-b border-[#333333] grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="p-2 bg-[#111822] border border-cyan-500/50 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-cyan-300">Omnibar &amp; Deep Research</div>
              <div className="text-[10px] text-[#94a3b8]">Instant Research, Audit &amp; Commands</div>
            </div>
            <kbd className="px-2 py-1 bg-cyan-400 text-[#0a0a0a] border border-white font-bold text-[11px]">
              {osMode === 'mac' ? '⌘ + K' : 'Ctrl + K'}
            </kbd>
          </div>
          <div className="p-2 bg-[#121212] border border-[#383838] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-white">Copy / Cut Selection</div>
              <div className="text-[10px] text-[#8c8c8c]">Pixel marquee, objects, or slice</div>
            </div>
            <kbd className="px-2 py-1 bg-[#262626] border border-[#525252] text-white font-bold text-[11px]">
              {osMode === 'mac' ? '⌘ + C / X' : 'Ctrl + C / X'}
            </kbd>
          </div>
          <div className="p-2 bg-[#121212] border border-[#525252] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-white">Paste in Place (Top)</div>
              <div className="text-[10px] text-[#a3a3a3]">Exact X,Y coords on top</div>
            </div>
            <kbd className="px-2 py-1 bg-[#e5e5e5] text-[#0a0a0a] border border-white font-bold text-[11px]">
              {osMode === 'mac' ? '⌘ + V' : 'Ctrl + V'}
            </kbd>
          </div>
          <div className="p-2 bg-[#121212] border border-[#525252] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-white">Paste Offset Above</div>
              <div className="text-[10px] text-[#a3a3a3]">Down &amp; right (+16px, +16px) on top</div>
            </div>
            <kbd className="px-2 py-1 bg-[#e5e5e5] text-[#0a0a0a] border border-white font-bold text-[11px]">
              {osMode === 'mac' ? '⌘ + ⇧ + V' : 'Ctrl + Shift + V'}
            </kbd>
          </div>
        </div>

        {/* Shortcuts Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          {filteredShortcuts.map((item) => {
            const keys = osMode === 'mac' ? item.macKeys : item.winKeys;
            return (
              <div
                key={item.id}
                className="p-2.5 bg-[#181818] hover:bg-[#202020] border border-[#2e2e2e] flex items-center justify-between gap-3 transition"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white truncate">{item.label}</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-[#0c0c0c] border border-[#2e2e2e] text-[#8c8c8c] uppercase shrink-0">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8c8c8c] truncate mt-0.5">
                    {item.description}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-1">
                    {keys.map((k, idx) => (
                      <React.Fragment key={`${item.id}-${k}-${idx}`}>
                        <kbd className="px-1.5 py-0.5 bg-[#0c0c0c] border border-[#484848] text-[#f5f5f5] text-[10px] font-bold shadow-inner">
                          {k}
                        </kbd>
                        {idx < keys.length - 1 && (
                          <span className="text-[#666666] text-[10px]">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {item.action && (
                    <button
                      onClick={() => {
                        item.action?.();
                      }}
                      className="px-1.5 py-1 bg-[#262626] hover:bg-[#3a3a3a] border border-[#484848] text-[#e5e5e5] hover:text-white transition"
                      title={`Run "${item.label}" now`}
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#181818] border-t border-[#2e2e2e] flex items-center justify-between text-[11px] text-[#8c8c8c]">
          <span>
            Tip: Hold <strong className="text-white">Spacebar</strong> at any time to temporarily pan the canvas with the Hand tool.
          </span>
          <span>
            Press <strong className="text-white">?</strong> or <strong className="text-white">F1</strong> anytime to toggle this reference
          </span>
        </div>
      </div>
    </div>
  );
};
