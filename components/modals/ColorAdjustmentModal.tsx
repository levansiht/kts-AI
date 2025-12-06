'use client';

import React from 'react';

interface ColorAdjustmentModalProps {
  imageUrl: string;
  onClose: () => void;
  onSave: (newImageUrl: string) => void;
}

export const ColorAdjustmentModal: React.FC<ColorAdjustmentModalProps> = ({ imageUrl, onClose, onSave }) => {
  // Placeholder component - bạn cần implement logic thực tế
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[var(--bg-surface-4)]/80 backdrop-blur-lg border border-[var(--border-1)] rounded-xl shadow-2xl max-w-4xl max-h-[90vh] flex flex-col relative" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 p-4">Color Adjustment Modal</h2>
        <p className="text-[var(--text-secondary)] p-4">Color Adjustment Modal component - cần implement</p>
        <button onClick={onClose} className="absolute top-4 right-4 bg-[var(--bg-interactive)] text-white rounded-full p-2">
          Close
        </button>
      </div>
    </div>
  );
};


