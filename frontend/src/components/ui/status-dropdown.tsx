"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useUpdateEventStatusMutation } from "@/features/events/services";
import { notify } from "@/common/utils";
import type { EventStatus } from "@/common/types";

interface StatusDropdownProps {
  value: EventStatus;
  onChange?: (value: EventStatus) => void;
  eventId?: string;
  disabled?: boolean;
}

const statusOptions: { value: EventStatus; label: string; color: string }[] = [
  { 
    value: "backlog", 
    label: "Backlog", 
    color: "bg-yellow-500/10 !text-yellow-600 border-yellow-500/20", 
  },
  { 
    value: "in_progress", 
    label: "In Progress", 
    color: "bg-blue-500/10 !text-blue-600 border-blue-500/20", 
  },
  { 
    value: "completed", 
    label: "Completed", 
    color: "bg-green-500/10 !text-green-600 border-green-500/20", 
  },
];

export function StatusDropdown({
  value,
  onChange,
  eventId,
  disabled = false,
}: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const [updateStatus, { isLoading }] = useUpdateEventStatusMutation();

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (open) {
      updateCoords();
      window.addEventListener("resize", updateCoords);
      window.addEventListener("scroll", updateCoords);
      return () => {
        window.removeEventListener("resize", updateCoords);
        window.removeEventListener("scroll", updateCoords);
      };
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        (!popoverRef.current || !popoverRef.current.contains(target))
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const currentOption = statusOptions.find((opt) => opt.value === value) || statusOptions[0];

  const handleSelect = async (newStatus: EventStatus) => {
    setOpen(false);
    if (newStatus === value) return;

    if (eventId) {
      // Inline edit mode - trigger mutation wrapped in notify.promise
      const updatePromise = updateStatus({ eventId, status: newStatus }).unwrap();
      notify.promise(updatePromise, {
        loading: `Updating status to ${newStatus === "in_progress" ? "In Progress" : newStatus === "completed" ? "Completed" : "Backlog"}...`,
        success: "Status updated successfully",
        error: "Failed to update status",
      });
    } else if (onChange) {
      // Form mode
      onChange(newStatus);
    }
  };

  const getOptionTextColor = (status: EventStatus) => {
    switch (status) {
      case "backlog":
        return "!text-yellow-600";
      case "in_progress":
        return "!text-blue-600";
      case "completed":
        return "!text-green-600";
      default:
        return "";
    }
  };

  const isInteractionDisabled = disabled || isLoading;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        disabled={isInteractionDisabled}
        onClick={() => setOpen(!open)}
        className={clsx(
          "inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 text-[11px] font-bold border transition-all cursor-pointer select-none",
          currentOption.color,
          isInteractionDisabled && "opacity-60 pointer-events-none"
        )}
        style={{ borderRadius: "5px" }}
      >
        <span className="flex items-center gap-1.5">
          {currentOption.label}
        </span>
        <ChevronDown size={11} className={clsx(getOptionTextColor(value), "transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && createPortal(
        <div 
          ref={popoverRef}
          className="absolute z-[9999] w-[130px] rounded-lg border border-surface-border bg-surface shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            top: `${coords.top + 6}px`,
            left: `${coords.left}px`,
            borderRadius: "6px"
          }}
        >
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={clsx(
                "flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-semibold hover:bg-surface-hover transition-colors cursor-pointer",
                getOptionTextColor(opt.value)
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
