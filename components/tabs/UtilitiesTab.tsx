'use client';

import React from 'react';
import type { SourceImage, RenderHistoryItem, GeneratedPrompts } from '@/types';

interface UtilitiesTabProps {
  onEditRequest: (image: string) => void;
  onStartNewRenderFlow: (image: SourceImage) => void;
  promptFinderImage: SourceImage | null;
  setPromptFinderImage: (image: SourceImage | null) => void;
  promptFinderPrompts: GeneratedPrompts | null;
  setPromptFinderPrompts: (prompts: GeneratedPrompts | null) => void;
  finishMyBuildImage: SourceImage | null;
  setFinishMyBuildImage: (image: SourceImage | null) => void;
  finishMyBuildPrompts: string[] | null;
  setFinishMyBuildPrompts: (prompts: string[] | null) => void;
  finishInteriorImage: SourceImage | null;
  setFinishInteriorImage: (image: SourceImage | null) => void;
  finishInteriorPrompts: string[] | null;
  setFinishInteriorPrompts: (prompts: string[] | null) => void;
  history: RenderHistoryItem[];
  onClearHistory: () => void;
  onGenerationComplete: (prompt: string, images: string[]) => void;
  initialUtility: string | null;
  setInitialUtility: (utility: string | null) => void;
  videoTabSourceImage: SourceImage | null;
  setVideoTabSourceImage: (image: SourceImage | null) => void;
}

export const UtilitiesTab: React.FC<UtilitiesTabProps> = (props) => {
  // Placeholder component - bạn cần implement logic thực tế
  return (
    <div className="bg-[var(--bg-surface-1)] backdrop-blur-md border border-[var(--border-1)] shadow-2xl shadow-[var(--shadow-color)] p-6 rounded-xl">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Utilities Tab</h2>
      <p className="text-[var(--text-secondary)]">Utilities Tab component - cần implement</p>
    </div>
  );
};


