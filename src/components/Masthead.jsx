import { format } from 'date-fns'

const SECTIONS = [
  { key: 'top', label: 'Front Page' },
  { key: 'best', label: 'Best' },
  { key: 'new', label: 'Latest' },
  { key: 'ask', label: 'Ask HN' },
  { key: 'show', label: 'Show HN' },
  { key: 'job', label: 'Jobs' },
]

export default function Masthead({ section, onSectionChange, onInstall, isInstallable, darkMode, onToggleDarkMode }) {
  const today = new Date()

  return (
    <header className="relative">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 text-xs font-garamond tracking-wider text-ink-muted border-b border-rule-light">
        <span className="uppercase">{format(today, 'EEEE')}</span>
        <span>{format(today, 'MMMM d, yyyy')}</span>
        <div className="flex items-center gap-3">
          {isInstallable && (
            <button
              onClick={onInstall}
              className="px-2 py-0.5 text-xs border border-ink-muted rounded hover:bg-ink hover:text-paper transition-colors cursor-pointer"
            >
              Install App
            </button>
          )}
          <span className="uppercase">Est. 2007</span>
        </div>
      </div>

      {/* Decorative rule */}
      <div className="border-b-2 border-rule mx-4" />
      <div className="border-b border-rule-light mx-4 mt-0.5" />

      {/* Masthead title */}
      <div className="py-4 md:py-6 text-center">
        <h1 className="font-masthead text-5xl md:text-7xl lg:text-8xl text-ink leading-none tracking-tight select-none">
          Hacker News Times
        </h1>
        <p className="font-garamond text-sm md:text-base text-ink-muted mt-1 italic tracking-wide">
          Hacker News, Beautifully Delivered
        </p>
        <button
          onClick={onToggleDarkMode}
          className="inline-flex items-center gap-1.5 mt-3 cursor-pointer"
          aria-label="Toggle dark mode"
        >
          <svg className={`w-3.5 h-3.5 transition-colors ${!darkMode ? 'text-amber-500' : 'text-ink-muted/40'}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
          <div className={`relative w-8 h-[18px] rounded-full transition-colors ${darkMode ? 'bg-ink-light' : 'bg-rule-light'}`}>
            <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-paper shadow-sm transition-all ${darkMode ? 'left-[15px]' : 'left-[2px]'}`} />
          </div>
          <svg className={`w-3.5 h-3.5 transition-colors ${darkMode ? 'text-blue-300' : 'text-ink-muted/40'}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </button>
      </div>

      {/* Decorative rule */}
      <div className="border-b border-rule-light mx-4" />
      <div className="border-b-2 border-rule mx-4 mt-0.5" />

      {/* Section nav */}
      <nav className="no-print">
        {/* Mobile: full-width grid */}
        <div className="grid grid-cols-3 md:hidden border-b border-rule-light">
          {SECTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onSectionChange(key)}
              className={`py-2.5 text-sm font-garamond tracking-wide transition-colors cursor-pointer border-b-2 ${
                section === key
                  ? 'border-ink text-ink font-semibold'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {/* Desktop: centered row */}
        <div className="hidden md:flex items-center justify-center gap-2 px-4 py-2">
          {SECTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onSectionChange(key)}
              className={`px-3 py-1 text-sm font-garamond tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
                section === key
                  ? 'bg-ink text-paper'
                  : 'text-ink-light hover:text-ink hover:bg-paper-dark'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom rule */}
      <div className="border-b-2 border-rule mx-4" />
    </header>
  )
}
