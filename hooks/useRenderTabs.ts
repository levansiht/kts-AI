'use client';

import { useState } from 'react';
import type { RenderTabState, RenderTab } from '@/types/app';

const initialTabState: RenderTabState = {
  sourceImage: null,
  referenceImage: null,
  generatedImages: [],
  selectedImageIndex: 0,
};

export function useRenderTabs() {
  const [tabStates, setTabStates] = useState<Record<RenderTab, RenderTabState>>({
    exterior: { ...initialTabState },
    interior: { ...initialTabState },
    floorplan: { ...initialTabState },
  });

  const updateTabState = (tab: RenderTab, update: Partial<RenderTabState>) => {
    setTabStates(prev => ({
      ...prev,
      [tab]: { ...prev[tab], ...update }
    }));
  };

  return { tabStates, setTabStates, updateTabState };
}

