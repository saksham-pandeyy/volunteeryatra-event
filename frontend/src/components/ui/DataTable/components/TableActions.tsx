"use client";

import { Eye, Edit, Trash2, Power, PowerOff } from "lucide-react";
import clsx from "clsx";
const cn = clsx;

interface ActionItem {
  icon?: any;
  variant?: "danger" | "warning" | "success" | "info" | "primary" | "view";
  disabled?: boolean;
  onClick?: () => void;
  label?: string;
}

interface TableActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onTogglePower?: () => void;
  isPowered?: boolean;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showPower?: boolean;
  viewTitle?: string;
  editTitle?: string;
  deleteTitle?: string;
  powerTitle?: string;
  actions?: ActionItem[];
  className?: string;
}

export function TableActions({
  onView,
  onEdit,
  onDelete,
  onTogglePower,
  isPowered = true,
  showView = true,
  showEdit = true,
  showDelete = true,
  showPower = false,
  viewTitle = "View Details",
  editTitle = "Edit",
  deleteTitle = "Delete",
  powerTitle,
  actions = [],
  className,
}: TableActionsProps) {
  const actualPowerTitle = powerTitle || (isPowered ? "Disable" : "Enable");

  if (actions.length > 0) {
    return (
      <div className={cn("dt-actions", className)}>
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              type="button"
              className={cn(
                "dt-action-btn",
                action.variant === "danger" && "dt-action-danger",
                action.variant === "warning" && "dt-action-warning",
                action.variant === "success" && "dt-action-success",
                action.variant === "info" && "dt-action-info",
                action.variant === "primary" && "dt-action-primary",
                action.variant === "view" && "dt-action-view",
                action.disabled && "dt-action-disabled",
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (!action.disabled) action.onClick?.();
              }}
              title={action.label}
              aria-label={action.label}
              disabled={action.disabled}
            >
              {Icon && <Icon size={18} strokeWidth={1.8} />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("dt-actions", className)}>
      {showView && onView && (
        <button
          type="button"
          className="dt-action-btn dt-action-view"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          title={viewTitle}
          aria-label={viewTitle}
        >
          <Eye size={18} strokeWidth={1.8} />
        </button>
      )}
      {showEdit && onEdit && (
        <button
          type="button"
          className="dt-action-btn dt-action-edit"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title={editTitle}
          aria-label={editTitle}
        >
          <Edit size={18} strokeWidth={1.8} />
        </button>
      )}
      {showPower && onTogglePower && (
        <button
          type="button"
          className={cn(
            "dt-action-btn",
            isPowered ? "dt-action-power--active" : "dt-action-power--inactive",
          )}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePower();
          }}
          title={actualPowerTitle}
          aria-label={actualPowerTitle}
        >
          {isPowered ? (
            <PowerOff size={18} strokeWidth={1.8} />
          ) : (
            <Power size={18} strokeWidth={1.8} />
          )}
        </button>
      )}
      {showDelete && onDelete && (
        <button
          type="button"
          className="dt-action-btn dt-action-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title={deleteTitle}
          aria-label={deleteTitle}
        >
          <Trash2 size={18} strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}

export default TableActions;
