"use client";

import { useState, useEffect } from "react";
import type { RenderHistoryItem, EditHistoryItem } from "@/types";

const saveToStorage = (key: string, data: any[]) => {
  let itemsToSave = data.slice(0, 10);

  try {
    localStorage.setItem(key, JSON.stringify(itemsToSave));
  } catch (e: any) {
    if (
      e.name === "QuotaExceededError" ||
      e.code === 22 ||
      e.name === "NS_ERROR_DOM_QUOTA_REACHED"
    ) {
      console.warn(`Storage limit reached for ${key}. Removing old items...`);
      while (itemsToSave.length > 0) {
        itemsToSave.pop();
        try {
          localStorage.setItem(key, JSON.stringify(itemsToSave));
          break;
        } catch (e2) {
          continue;
        }
      }
    } else {
      console.error(`Failed to save ${key} to localStorage`, e);
    }
  }
};

const loadFromStorage = <T>(key: string): T[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage`, error);
    return [];
  }
};

export function useHistory() {
  const [exteriorHistory, setExteriorHistory] = useState<RenderHistoryItem[]>(
    []
  );
  const [interiorHistory, setInteriorHistory] = useState<RenderHistoryItem[]>(
    []
  );
  const [floorplanHistory, setFloorplanHistory] = useState<RenderHistoryItem[]>(
    []
  );
  const [editHistory, setEditHistory] = useState<EditHistoryItem[]>([]);
  const [utilitiesHistory, setUtilitiesHistory] = useState<RenderHistoryItem[]>(
    []
  );

  // Load from localStorage on mount
  useEffect(() => {
    setExteriorHistory(loadFromStorage("exteriorRenderHistory"));
    setInteriorHistory(loadFromStorage("interiorRenderHistory"));
    setFloorplanHistory(loadFromStorage("floorplanHistory"));
    setEditHistory(loadFromStorage("editHistory"));
    setUtilitiesHistory(loadFromStorage("utilitiesHistory"));
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    saveToStorage("exteriorRenderHistory", exteriorHistory);
  }, [exteriorHistory]);

  useEffect(() => {
    saveToStorage("interiorRenderHistory", interiorHistory);
  }, [interiorHistory]);

  useEffect(() => {
    saveToStorage("floorplanHistory", floorplanHistory);
  }, [floorplanHistory]);

  useEffect(() => {
    saveToStorage("editHistory", editHistory);
  }, [editHistory]);

  useEffect(() => {
    saveToStorage("utilitiesHistory", utilitiesHistory);
  }, [utilitiesHistory]);

  const addToHistory = (
    type: "exterior" | "interior" | "floorplan" | "utilities",
    item: RenderHistoryItem
  ) => {
    const setters = {
      exterior: setExteriorHistory,
      interior: setInteriorHistory,
      floorplan: setFloorplanHistory,
      utilities: setUtilitiesHistory,
    };

    setters[type]((prev) => [item, ...prev]);
  };

  const clearHistory = (
    type: "exterior" | "interior" | "floorplan" | "edit" | "utilities"
  ) => {
    const confirmMessages = {
      exterior: "ngoại thất",
      interior: "nội thất",
      floorplan: "floorplan 3D",
      edit: "chỉnh sửa",
      utilities: "tiện ích",
    };

    if (
      window.confirm(
        `Bạn có chắc muốn xóa toàn bộ lịch sử ${confirmMessages[type]}?`
      )
    ) {
      const setters = {
        exterior: setExteriorHistory,
        interior: setInteriorHistory,
        floorplan: setFloorplanHistory,
        edit: setEditHistory,
        utilities: setUtilitiesHistory,
      };

      setters[type]([]);
    }
  };

  return {
    exteriorHistory,
    interiorHistory,
    floorplanHistory,
    editHistory,
    utilitiesHistory,
    setExteriorHistory,
    setInteriorHistory,
    setFloorplanHistory,
    setEditHistory,
    setUtilitiesHistory,
    addToHistory,
    clearHistory,
  };
}
