export const dataUrlToSourceImage = (dataUrl: string) => {
  const match = dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (match && match[1] && match[2]) {
    return { mimeType: match[1], base64: match[2] };
  }
  return null;
};

export const saveHistoryToStorage = (key: string, history: unknown[]): void => {
  const itemsToSave = history.slice(0, 10);

  try {
    localStorage.setItem(key, JSON.stringify(itemsToSave));
  } catch (e: unknown) {
    const error = e as { name?: string; code?: number };
    if (
      error.name === "QuotaExceededError" ||
      error.code === 22 ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED"
    ) {
      console.warn(`Storage limit reached for ${key}. Removing old items...`);
      const items = [...itemsToSave];
      while (items.length > 0) {
        items.pop();
        try {
          localStorage.setItem(key, JSON.stringify(items));
          break;
        } catch {
          continue;
        }
      }
    } else {
      console.error(`Failed to save ${key} to localStorage`, e);
    }
  }
};

export const loadHistoryFromStorage = <T>(key: string): T[] => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage`, error);
  }
  return [];
};
