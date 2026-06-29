import { memo } from 'react';
import { TableActions } from '../components/TableActions';

export const ActionsCell = memo(function ActionsCell({
  onView,
  onEdit,
  onDelete,
  onTogglePower,
  isPowered,
  showPower = false,
}) {
  return (
    <TableActions
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onTogglePower={onTogglePower}
      isPowered={isPowered}
      showPower={showPower}
    />
  );
});
