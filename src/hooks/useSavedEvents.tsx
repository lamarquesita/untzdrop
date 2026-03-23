"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase, getAuthHeaders } from "@/lib/supabase";

interface SavedEventsContextType {
  savedIds: Set<number>;
  toggle: (eventId: number) => void;
  isLoggedIn: boolean;
}

const SavedEventsContext = createContext<SavedEventsContextType>({
  savedIds: new Set(),
  toggle: () => {},
  isLoggedIn: false,
});

export function SavedEventsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setIsLoggedIn(true);

      const headers = await getAuthHeaders();
      const res = await fetch("/api/saved-events", { headers });
      if (res.ok) {
        const { saved } = await res.json();
        setSavedIds(new Set(saved));
      }
    };

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        load();
      } else {
        setIsLoggedIn(false);
        setSavedIds(new Set());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggle = useCallback(async (eventId: number) => {
    if (!isLoggedIn) return;

    // Optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });

    const headers = await getAuthHeaders();
    await fetch("/api/saved-events", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ event_id: eventId }),
    });
  }, [isLoggedIn]);

  return (
    <SavedEventsContext.Provider value={{ savedIds, toggle, isLoggedIn }}>
      {children}
    </SavedEventsContext.Provider>
  );
}

export function useSavedEvents() {
  return useContext(SavedEventsContext);
}
