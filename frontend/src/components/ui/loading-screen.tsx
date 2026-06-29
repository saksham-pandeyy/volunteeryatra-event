"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  minimumDuration?: number;
}

export function LoadingScreen({ minimumDuration = 800 }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, minimumDuration);
    return () => clearTimeout(timer);
  }, [minimumDuration]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <img
          src="/Logo.png"
          alt="Volunteer Yatra"
          className="h-10 w-auto object-contain opacity-70"
        />
        
        <div className="loading-dots-big">
          <span className="loading-dot-big dot-green" />
          <span className="loading-dot-big dot-blue" />
          <span className="loading-dot-big dot-amber" />
          <span className="loading-dot-big dot-rose" />
          <span className="loading-dot-big dot-purple" />
        </div>

        <p className="text-xs text-muted font-medium tracking-wider uppercase animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}

export function NavigationLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => {
      clearTimeout(timer);
      setShow(false);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] h-1 bg-surface-border overflow-hidden">
      <div className="navigation-progress-bar" />
    </div>
  );
}
