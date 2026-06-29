"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

/**
 * Subscribes to real-time changes on events & participants tables.
 * Calls onRefresh() whenever a change is detected, so the parent
 * hook can re-fetch dashboard stats without polling.
 */
export function useRealtimeStats(onRefresh: () => void) {
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => onRefreshRef.current()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants" },
        () => onRefreshRef.current()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
