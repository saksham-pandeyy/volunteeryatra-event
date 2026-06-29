import { useState, memo } from 'react';
import { Copy } from 'lucide-react';

export const CopyableCell = memo(function CopyableCell({ text, mono = true }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs ${mono ? 'font-mono' : ''} font-medium text-[var(--text-muted)] cursor-pointer hover:text-[var(--primary)] transition-colors group/copy`}
      onClick={(e) => {
        e.stopPropagation();
        handleCopy();
      }}
    >
      {text}
      <Copy
        size={11}
        className="opacity-0 group-hover/copy:opacity-60 transition-opacity"
      />
      {copied && (
        <span className="text-[10px] text-[var(--success)] font-medium">
          Copied!
        </span>
      )}
    </span>
  );
});
