"use client";

import React from "react";
import type { RenderHistoryItem } from "@/types";
import { Icon } from "@/components/icons/Icon";

interface HistoryPanelProps {
  history: RenderHistoryItem[];
  onClear: () => void;
  onSelect: (item: RenderHistoryItem) => void;
  title: string;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onClear,
  onSelect,
  title,
}) => {
  return (
    <div className="bg-[var(--bg-surface-1)] backdrop-blur-md border border-[var(--border-1)] shadow-2xl shadow-[var(--shadow-color)] p-6 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Icon name="clock" className="w-5 h-5" />
          {title}
        </h2>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-[var(--text-danger)] hover:text-[var(--text-danger-hover)] text-sm font-semibold flex items-center gap-1"
          >
            <Icon name="trash" className="w-4 h-4" />
            Xóa
          </button>
        )}
      </div>
      {history.length > 0 ? (
        <ul className="space-y-3 overflow-y-auto max-h-96 pr-2">
          {history.map((item) => (
            <li
              key={item.id}
              className="bg-[var(--bg-surface-2)] p-3 rounded-md hover:bg-[var(--bg-surface-3)] cursor-pointer transition-colors"
              onClick={() => onSelect(item)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-grow min-w-0 mr-2">
                  <p className="font-semibold text-sm">
                    {item.generatedImages.length} ảnh
                  </p>
                  <p
                    className="text-xs text-[var(--text-secondary)] truncate"
                    title={item.prompt}
                  >
                    {item.prompt}
                  </p>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] self-start flex-shrink-0">
                  {new Date(item.timestamp).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex overflow-x-auto gap-2 pb-1">
                {item.generatedImages.map((image, index) => (
                  <img
                    key={index}
                    src={
                      image.dataUrl ||
                      `data:${image.mimeType};base64,${image.base64}`
                    }
                    alt={`History thumbnail ${index + 1}`}
                    className="w-20 h-20 object-cover rounded flex-shrink-0"
                  />
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-4">
          Chưa có lịch sử render.
        </p>
      )}
    </div>
  );
};
