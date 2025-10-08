import { memo, useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

function ContextMenu({
  trigger,
  items = [],
  placement = 'bottom-right',
  className = '',
  ...props
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const placementClasses = {
    'bottom-right': 'top-full left-0',
    'bottom-left': 'top-full right-0',
    'top-right': 'bottom-full left-0',
    'top-left': 'bottom-full right-0'
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleTriggerClick = (event) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item) => {
    item.action?.();
    setIsOpen(false);
  };

  return (
    <div className="relative" {...props}>
      <div ref={triggerRef} onClick={handleTriggerClick}>
        {trigger}
      </div>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />

          <div
            ref={menuRef}
            className={[
              'absolute z-50 min-w-48 overflow-hidden rounded-lg border shadow-lg backdrop-blur-md',
              placementClasses[placement],
              isDark
                ? 'border-white/15 bg-black/80'
                : 'border-slate-200/70 bg-white/95',
              className
            ].join(' ')}
          >
            <div className="py-2">
              {items.map((item, index) => {
                if (item.type === 'separator') {
                  return (
                    <div
                      key={index}
                      className={`my-2 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200/60'}`}
                    />
                  );
                }

                return (
                  <button
                    key={index}
                    className={[
                      'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
                      isDark
                        ? 'text-white/80 hover:bg-white/10 hover:text-white'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900',
                      item.destructive && (isDark ? 'text-red-300 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-50'),
                      item.disabled && 'opacity-50 cursor-not-allowed'
                    ].join(' ')}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                  >
                    {item.icon && (
                      <span className="flex-shrink-0 text-base" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    <span className="flex-1">{item.label}</span>
                    {item.shortcut && (
                      <span className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-400'}`}>
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default memo(ContextMenu);