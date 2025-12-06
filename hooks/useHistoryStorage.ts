import { useEffect } from "react";
import { saveHistoryToStorage, loadHistoryFromStorage } from "@/lib/utils";

export const useHistoryStorage = <T>(
  key: string,
  history: T[],
  setHistory: (history: T[]) => void
) => {
  // Load on mount
  useEffect(() => {
    const loaded = loadHistoryFromStorage<T>(key);
    if (loaded.length > 0) {
      setHistory(loaded);
    }
  }, [key, setHistory]);

  // Save on change
  useEffect(() => {
    saveHistoryToStorage(key, history);
  }, [key, history]);
};
