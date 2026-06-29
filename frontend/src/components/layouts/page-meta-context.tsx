"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface PageMeta {
  title?: string;
  subtitle?: string;
  headerExtra?: ReactNode;
  backHref?: string;
}

interface PageMetaContextValue {
  pageMeta: PageMeta;
  setPageMeta: (meta: PageMeta) => void;
}

const PageMetaContext = createContext<PageMetaContextValue>({
  pageMeta: {},
  setPageMeta: () => {},
});

export function PageMetaProvider({ children }: { children: ReactNode }) {
  const [pageMeta, setPageMeta] = useState<PageMeta>({});
  return (
    <PageMetaContext.Provider value={{ pageMeta, setPageMeta }}>
      {children}
    </PageMetaContext.Provider>
  );
}

export function usePageMeta() {
  return useContext(PageMetaContext).pageMeta;
}

/**
 * Renders nothing, but declares page-level meta (title, subtitle, headerExtra, backHref)
 * to be consumed by the parent AuthenticatedLayout.
 *
 * Usage at the top of any page component:
 *   <SetPageMeta title="Events" headerExtra={<Button>Create</Button>} />
 */
export function SetPageMeta({ title, subtitle, headerExtra, backHref }: PageMeta) {
  const { setPageMeta } = useContext(PageMetaContext);

  useEffect(() => {
    setPageMeta({ title, subtitle, headerExtra, backHref });
    return () => setPageMeta({});
  }, [title, subtitle, headerExtra, backHref, setPageMeta]);

  return null;
}
