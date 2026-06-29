import { memo } from 'react';

export const CurrencyCell = memo(function CurrencyCell({
  value,
  prefix = '$',
  suffix = '',
  compact = false,
  decimals = 1,
  divisor = 1,
  unit = '',
  className = '',
  fallback = '0',
}) {
  if (value === undefined || value === null) {
    return <span className={`text-sm font-medium text-[var(--text-primary)] ${className}`}>{fallback}</span>;
  }

  const num = Number(value) / divisor;
  let formatted;

  if (compact && num >= 1000000) {
    formatted = `${(num / 1000000).toFixed(decimals)}M`;
  } else if (compact && num >= 1000) {
    formatted = `${(num / 1000).toFixed(decimals)}K`;
  } else {
    formatted = num.toFixed(decimals);
  }

  const display = `${prefix}${formatted}${suffix}${unit ? ' ' + unit : ''}`;

  return (
    <span className={`value-sm ${className}`}>
      {display}
    </span>
  );
});
