export interface SourceImage {
  base64: string;
  mimeType: string;
  dataUrl: string;
  name: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface RenderHistoryItem {
  id: string;
  timestamp: number;
  sourceImage: SourceImage;
  referenceImage?: SourceImage | null;
  generatedImages: SourceImage[];
  prompt: string;
  modelTier?: "free" | "pro";
  imageQuality?: "1K" | "2K" | "4K";
}

export interface EditHistoryItem {
  id: string;
  timestamp: number;
  sourceImage: SourceImage;
  maskImage?: SourceImage;
  resultImage: string | SourceImage;
  prompt: string;
}

export interface GeneratedPrompts {
  medium: string[];
  closeup: string[];
  interior: string[];
}
