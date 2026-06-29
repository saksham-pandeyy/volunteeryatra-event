import { useState, useCallback } from "react";

export const useCopyToClipboard = (): [any, (text: string, id: any) => void] => {
  const [copiedId, setCopiedId] = useState<any>(null);

  const copy = useCallback((text: string, id: any) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  return [copiedId, copy];
};
