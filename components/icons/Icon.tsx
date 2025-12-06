"use client";

import {
  ArrowLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftCircle,
  ArrowRightCircle,
  Bookmark,
  Paintbrush,
  Box,
  MousePointer2,
  Globe,
  Home,
  Image as ImageIcon,
  X,
  XCircle,
  Download,
  Sparkles,
  Upload,
  Trash2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Facebook,
  Clock,
  CheckCircle2,
  Sun,
  Moon,
  Beaker,
  View,
  Film,
  ArrowRightLeft,
  Maximize2,
  SlidersHorizontal,
  Building2,
  Gift,
  type LucideIcon,
} from "lucide-react";
import type { SVGProps } from "react";
import React from "react";

const iconMap: Record<string, LucideIcon> = {
  "arrow-left": ArrowLeft,
  "arrow-up-circle": ArrowUpCircle,
  "arrow-down-circle": ArrowDownCircle,
  "arrow-left-circle": ArrowLeftCircle,
  "arrow-right-circle": ArrowRightCircle,
  bookmark: Bookmark,
  brush: Paintbrush,
  cube: Box,
  "cursor-arrow-rays": MousePointer2,
  globe: Globe,
  home: Home,
  photo: ImageIcon,
  x: X,
  "x-circle": XCircle,
  "x-mark": X,
  download: Download,
  sparkles: Sparkles,
  upload: Upload,
  trash: Trash2,
  "arrow-uturn-left": RotateCcw,
  "arrow-uturn-right": RotateCw,
  "rotate-ccw": RotateCcw,
  "zoom-in": ZoomIn,
  "zoom-out": ZoomOut,
  "magnifying-glass-plus": ZoomIn,
  "magnifying-glass-minus": ZoomOut,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  play: Play,
  pause: Pause,
  facebook: Facebook,
  clock: Clock,
  "check-circle": CheckCircle2,
  sun: Sun,
  moon: Moon,
  beaker: Beaker,
  viewfinder: View,
  film: Film,
  "arrows-right-left": ArrowRightLeft,
  "arrows-expand": Maximize2,
  "adjustments-horizontal": SlidersHorizontal,
  "building-office": Building2,
  gift: Gift,
  tiktok: Globe,
};

// Custom SVG icons for icons not in lucide-react
const customIcons: Record<string, (props: SVGProps<SVGSVGElement>) => React.ReactElement> = {
  "arrow-path": (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691V5.25a3.75 3.75 0 0 0-3.75-3.75H6.75a3.75 3.75 0 0 0-3.75 3.75v4.992m11.667 0-3.181-3.183" />
    </svg>
  ),
  pencil: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  ),
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
}

export function Icon({ name, className = "w-6 h-6", ...props }: IconProps) {
  const LucideIcon = iconMap[name];
  const CustomIcon = customIcons[name];

  if (LucideIcon) {
    return <LucideIcon className={className} {...props} />;
  }

  if (CustomIcon) {
    return <CustomIcon className={className} {...props} />;
  }

  return <Globe className={className} {...props} />;
}
