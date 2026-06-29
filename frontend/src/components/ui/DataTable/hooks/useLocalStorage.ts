import { useState, useCallback, useEffect } from "react";

export function useLocalStorage<T>(key: string | null, initialValue: T): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!key) return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (key) {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch {
        // Fail silently
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      if (key) {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch {
      // Fail silently
    }
  }, [key, initialValue]);

  useEffect(() => {
    if (!key) return;
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}
