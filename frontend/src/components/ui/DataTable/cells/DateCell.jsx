import { memo } from 'react';

export const DateCell = memo(function DateCell({
  value,
  format = 'short',
  locale = 'en-IN',
  fallback = '—',
}) {
  if (!value) return <span className="text-xs text-[var(--text-muted)]">{fallback}</span>;

  const formatMap = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    numeric: { month: '2-digit', day: '2-digit', year: 'numeric' },
    relative: null,
  };

  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return <span className="text-xs text-[var(--text-muted)]">{fallback}</span>;

    if (format === 'relative') {
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      let relative;
      if (days === 0) relative = 'Today';
      else if (days === 1) relative = 'Yesterday';
      else if (days < 7) relative = `${days}d ago`;
      else if (days < 30) relative = `${Math.floor(days / 7)}w ago`;
      else if (days < 365) relative = `${Math.floor(days / 30)}mo ago`;
      else relative = `${Math.floor(days / 365)}y ago`;
      return <span className="text-xs text-[var(--text-muted)]">{relative}</span>;
    }

    return (
      <span className="text-xs text-[var(--text-muted)]">
        {date.toLocaleDateString(locale, formatMap[format] || formatMap.short)}
      </span>
    );
  } catch {
    return <span className="text-xs text-[var(--text-muted)]">{fallback}</span>;
  }
});
