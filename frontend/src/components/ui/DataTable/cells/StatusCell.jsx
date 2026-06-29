import { memo } from 'react';
import { StatusDropdown } from '@components/ui';

export const StatusCell = memo(function StatusCell({
  value,
  options,
  onChange,
  size = 'sm',
}) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <StatusDropdown
        value={value}
        options={options}
        onChange={onChange}
        size={size}
      />
    </div>
  );
});
