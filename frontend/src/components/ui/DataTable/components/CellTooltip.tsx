"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
const cn = clsx;

interface CellTooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  maxWidth?: number;
}

export function CellTooltip({ content, children, className, maxWidth = 300 }: CellTooltipProps) {
  const [isTruncated, setIsTruncated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const checkTruncation = () => {
    if (triggerRef.current) {
      const { scrollWidth, clientWidth } = triggerRef.current;
      setIsTruncated(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkTruncation();
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [content]);

  const handleMouseEnter = () => {
    if (!isTruncated || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setIsVisible(true);
  };

  return (
    <div className={cn("dt-cell-tooltip-wrapper", className)}>
      <div
        ref={triggerRef}
        className="dt-cell-truncate"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children || content}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="dt-tooltip-popup"
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            /* allowed-inline */
            style={{
              left: coords.x,
              top: coords.y,
              maxWidth,
            }}
          >
            {content}
            <div className="dt-tooltip-arrow" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CellTooltip;
