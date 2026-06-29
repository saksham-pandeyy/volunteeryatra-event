import { memo } from 'react';

export const AvatarCell = memo(function AvatarCell({
  name,
  image,
  subtitle,
  size = 'md',
  rounded = 'lg',
}) {
  const initials = (name || '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeMap = { sm: 'w-7 h-7 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' };
  const roundedMap = { sm: 'rounded', md: 'rounded-lg', lg: 'rounded-xl', full: 'rounded-full' };

  return (
    <div className="flex items-center gap-3 py-1">
      <div
        className={`${sizeMap[size] || sizeMap.md} ${roundedMap[rounded] || roundedMap.md} bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 text-white flex items-center justify-center font-medium flex-shrink-0 overflow-hidden`}
      >
        {image ? (
          <img src={image} alt={name} className="object-cover w-full h-full" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className="min-w-0">
        <span className="text-sm font-medium text-[var(--text-primary)] truncate block">
          {name}
        </span>
        {subtitle && (
          <span className="text-[10px] text-[var(--text-muted)] truncate block mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
});
