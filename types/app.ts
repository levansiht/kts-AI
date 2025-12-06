export type RenderTab = 'exterior' | 'interior' | 'floorplan';
export type AppTab = RenderTab | 'virtual_tour' | 'edit' | 'utilities' | 'upscale';

export interface RenderTabState {
  sourceImage: import('./index').SourceImage | null;
  referenceImage: import('./index').SourceImage | null;
  generatedImages: string[];
  selectedImageIndex: number;
}


