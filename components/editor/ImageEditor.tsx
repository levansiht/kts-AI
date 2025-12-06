"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Icon } from "@/components/icons/Icon";
import { editImage } from "@/services/geminiService";
import type { SourceImage, EditHistoryItem } from "@/types";
import { ImageCompareSlider } from "./ImageCompareSlider";

const dataUrlToSourceImage = (dataUrl: string): SourceImage | null => {
  const match = dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (match && match[1] && match[2]) {
    return { 
      mimeType: match[1], 
      base64: match[2],
      dataUrl: dataUrl,
      name: `image_${Date.now()}.${match[1].split('/')[1]}`,
    };
  }
  return null;
};

const ImageViewerModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-[var(--bg-surface-4)]/80 backdrop-blur-lg border border-[var(--border-1)] rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col relative" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute -top-4 -right-4 bg-[var(--bg-interactive)] text-white rounded-full p-2 hover:bg-[var(--bg-interactive-hover)] transition-transform duration-200 hover:scale-110 z-10" aria-label="Close">
        <Icon name="x-mark" className="w-6 h-6" />
      </button>
      <div className="p-2 flex-grow overflow-auto flex items-center justify-center">
        <img src={imageUrl} alt="Fullscreen view" className="max-w-full max-h-full object-contain rounded-md" />
      </div>
    </div>
  </div>
);

const ZoomEditorModal: React.FC<{
  image: SourceImage;
  initialDrawingData: ImageData | null;
  onClose: () => void;
  onSave: (finalDrawingData: ImageData) => void;
}> = ({ image, initialDrawingData, onClose, onSave }) => {
  const [brushSize, setBrushSize] = useState(40);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const imageEl = new Image();
    imageEl.src = `data:${image.mimeType};base64,${image.base64}`;
    imageEl.onload = () => {
      [imageCanvasRef, drawingCanvasRef].forEach((ref) => {
        if (ref.current) {
          ref.current.width = imageEl.width;
          ref.current.height = imageEl.height;
        }
      });
      const imgCtx = imageCanvasRef.current?.getContext("2d");
      imgCtx?.drawImage(imageEl, 0, 0);
      if (initialDrawingData) {
        const drawCtx = drawingCanvasRef.current?.getContext("2d");
        drawCtx?.putImageData(initialDrawingData, 0, 0);
        setDrawingHistory([initialDrawingData]);
      }
    };
  }, [image, initialDrawingData]);

  const getMousePos = (canvas: HTMLCanvasElement, evt: React.MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (evt.clientX - rect.left) * (canvas.width / rect.width),
      y: (evt.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const pos = getMousePos(drawingCanvasRef.current!, e);
    const ctx = drawingCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const pos = getMousePos(drawingCanvasRef.current!, e);
    const ctx = drawingCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = `rgba(236, 72, 153, 0.7)`;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.closePath();
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setDrawingHistory((prev) => [...prev, imageData]);
    }
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (drawingHistory.length === 0) return;
    const newHistory = drawingHistory.slice(0, -1);
    setDrawingHistory(newHistory);
    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (newHistory.length > 0) {
        ctx.putImageData(newHistory[newHistory.length - 1], 0, 0);
      }
    }
  };

  const handleSave = () => {
    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      const finalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      onSave(finalData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[var(--bg-surface-4)]/90 border border-[var(--border-1)] rounded-xl shadow-2xl w-full h-full flex flex-col relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 p-3 bg-[var(--bg-surface-3)]/50 border-b border-[var(--border-1)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <Icon name="brush" className="w-5 h-5" /> Cỡ Bút:
              <input type="range" min="5" max="150" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-32 accent-indigo-500" />
              <span>{brushSize}px</span>
            </label>
            <button onClick={handleUndo} disabled={drawingHistory.length === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[var(--text-interactive)] bg-[var(--bg-surface-3)] hover:bg-[var(--bg-surface-2)] rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed">
              <Icon name="arrow-uturn-left" className="w-4 h-4" /> Hoàn Tác
            </button>
          </div>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm font-bold text-[var(--text-interactive)] bg-[var(--bg-interactive)] hover:bg-[var(--bg-interactive-hover)] rounded-md transition">
            Lưu & Đóng
          </button>
        </div>
        <div ref={containerRef} className="flex-grow w-full h-full p-4 overflow-auto flex items-center justify-center">
          <div className="relative w-max h-max">
            <canvas ref={imageCanvasRef} className="max-w-full max-h-full object-contain block" />
            <canvas ref={drawingCanvasRef} className="absolute inset-0 w-full h-full object-contain cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} />
          </div>
        </div>
        <button onClick={onClose} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/80 transition">
          <Icon name="x-mark" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

interface ImageEditorProps {
  initialImage: SourceImage | null;
  onClearInitialImage: () => void;
  onEditComplete: (details: { sourceImage: SourceImage; maskImage: SourceImage; prompt: string; resultImage: string }) => void;
  historyItemToRestore: EditHistoryItem | null;
  onHistoryRestored: () => void;
  onCreateVideoRequest: (imageUrl: string) => void;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ initialImage, onClearInitialImage, onEditComplete, historyItemToRestore, onHistoryRestored, onCreateVideoRequest }) => {
  const [image, setImage] = useState<SourceImage | null>(null);
  const [prompt, setPrompt] = useState("");
  const [brushSize, setBrushSize] = useState(40);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isResultFullscreen, setIsResultFullscreen] = useState(false);
  const [isSourceFullscreen, setIsSourceFullscreen] = useState(false);
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [editMode, setEditMode] = useState<"brush" | "rectangle">("brush");
  const [selectionRect, setSelectionRect] = useState<Rect | null>(null);
  const [dragState, setDragState] = useState<{ mode: "none" | "selecting" | "moving" | "resizing"; startPos: { x: number; y: number }; initialRect: Rect | null; activeHandle: string | null }>({
    mode: "none",
    startPos: { x: 0, y: 0 },
    initialRect: null,
    activeHandle: null,
  });
  const sourceImageCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceDrawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceImageUrlForSlider = image ? `data:${image.mimeType};base64,${image.base64}` : null;

  const clearMask = useCallback(() => {
    const canvas = sourceDrawingCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setDrawingHistory([]);
    setSelectionRect(null);
  }, []);

  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(",")[1];
        if (base64) {
          setImage({ 
            base64, 
            mimeType: file.type,
            dataUrl: dataUrl,
            name: file.name,
          });
          setResultImage(null);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert("Vui lòng tải lên một tệp ảnh hợp lệ (PNG, JPG, WEBP).");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const drawImageOnCanvas = useCallback(() => {
    if (!image || !sourceImageCanvasRef.current || !sourceDrawingCanvasRef.current || !sourceContainerRef.current) return;
    const imageEl = new Image();
    imageEl.src = `data:${image.mimeType};base64,${image.base64}`;
    imageEl.onload = () => {
      [sourceImageCanvasRef, sourceDrawingCanvasRef].forEach((ref) => {
        if (ref.current) {
          ref.current.width = imageEl.width;
          ref.current.height = imageEl.height;
        }
      });
      const ctx = sourceImageCanvasRef.current?.getContext("2d");
      ctx?.drawImage(imageEl, 0, 0, imageEl.width, imageEl.height);
      clearMask();
      setZoomLevel(1);
    };
  }, [image, clearMask]);

  useEffect(() => {
    if (initialImage) {
      setImage(initialImage);
      setResultImage(null);
      setPrompt("");
      onClearInitialImage();
    }
  }, [initialImage, onClearInitialImage]);

  useEffect(() => {
    drawImageOnCanvas();
  }, [drawImageOnCanvas]);

  useEffect(() => {
    if (historyItemToRestore) {
      setImage(historyItemToRestore.sourceImage);
      setPrompt(historyItemToRestore.prompt);
      setResultImage(historyItemToRestore.resultImage);
      clearMask();
      onHistoryRestored();
    }
  }, [historyItemToRestore, onHistoryRestored, clearMask]);

  const getMousePos = (canvas: HTMLCanvasElement, evt: MouseEvent | React.MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY,
    };
  };

  const getHandles = (rect: Rect) => {
    const handleSize = 12 * (sourceDrawingCanvasRef.current ? sourceDrawingCanvasRef.current.width / sourceDrawingCanvasRef.current.getBoundingClientRect().width : 1);
    const x = rect.w > 0 ? rect.x : rect.x + rect.w;
    const y = rect.h > 0 ? rect.y : rect.y + rect.h;
    const w = Math.abs(rect.w);
    const h = Math.abs(rect.h);
    return {
      tl: { x: x - handleSize / 2, y: y - handleSize / 2, w: handleSize, h: handleSize, cursor: "nw-resize" },
      tr: { x: x + w - handleSize / 2, y: y - handleSize / 2, w: handleSize, h: handleSize, cursor: "ne-resize" },
      bl: { x: x - handleSize / 2, y: y + h - handleSize / 2, w: handleSize, h: handleSize, cursor: "sw-resize" },
      br: { x: x + w - handleSize / 2, y: y + h - handleSize / 2, w: handleSize, h: handleSize, cursor: "se-resize" },
    };
  };

  const drawSelectionOverlay = useCallback(() => {
    const canvas = sourceDrawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (selectionRect) {
      const { x, y, w, h } = selectionRect;
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.clearRect(x, y, w, h);
      ctx.strokeStyle = "#ec4899";
      ctx.lineWidth = 2 * (canvas.width / canvas.getBoundingClientRect().width);
      ctx.strokeRect(x, y, w, h);
      const handles = getHandles(selectionRect);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#ec4899";
      Object.values(handles).forEach((h) => {
        ctx.fillRect(h.x, h.y, h.w, h.h);
        ctx.strokeRect(h.x, h.y, h.w, h.h);
      });
    }
  }, [selectionRect]);

  useEffect(() => {
    if (editMode === "rectangle") {
      drawSelectionOverlay();
    }
  }, [selectionRect, editMode, drawSelectionOverlay]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const canvas = sourceDrawingCanvasRef.current;
      if (!canvas) return;
      const pos = getMousePos(canvas, e);
      if (editMode === "brush") {
        setIsDrawing(true);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      } else {
        if (selectionRect) {
          const handles = getHandles(selectionRect);
          const handleKeys = Object.keys(handles) as Array<keyof typeof handles>;
          for (const key of handleKeys) {
            const h = handles[key];
            if (pos.x >= h.x && pos.x <= h.x + h.w && pos.y >= h.y && pos.y <= h.y + h.h) {
              setDragState({ mode: "resizing", startPos: pos, initialRect: selectionRect, activeHandle: key });
              return;
            }
          }
          const normX = selectionRect.w > 0 ? selectionRect.x : selectionRect.x + selectionRect.w;
          const normY = selectionRect.h > 0 ? selectionRect.y : selectionRect.y + selectionRect.h;
          const normW = Math.abs(selectionRect.w);
          const normH = Math.abs(selectionRect.h);
          if (pos.x >= normX && pos.x <= normX + normW && pos.y >= normY && pos.y <= normY + normH) {
            setDragState({ mode: "moving", startPos: pos, initialRect: selectionRect, activeHandle: null });
            return;
          }
        }
        setDragState({ mode: "selecting", startPos: pos, initialRect: null, activeHandle: null });
        setSelectionRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
      }
    },
    [editMode, selectionRect]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvas = sourceDrawingCanvasRef.current;
      if (!canvas) return;
      const pos = getMousePos(canvas, e);
      if (editMode === "rectangle") {
        let cursor = "crosshair";
        if (selectionRect) {
          const handles = getHandles(selectionRect);
          const handleKeys = Object.keys(handles) as Array<keyof typeof handles>;
          for (const key of handleKeys) {
            const h = handles[key];
            if (pos.x >= h.x && pos.x <= h.x + h.w && pos.y >= h.y && pos.y <= h.y + h.h) {
              cursor = h.cursor;
              break;
            }
          }
          if (cursor === "crosshair") {
            const normX = selectionRect.w > 0 ? selectionRect.x : selectionRect.x + selectionRect.w;
            const normY = selectionRect.h > 0 ? selectionRect.y : selectionRect.y + selectionRect.h;
            const normW = Math.abs(selectionRect.w);
            const normH = Math.abs(selectionRect.h);
            if (pos.x >= normX && pos.x <= normX + normW && pos.y >= normY && pos.y <= normY + normH) {
              cursor = "move";
            }
          }
        }
        canvas.style.cursor = cursor;
      } else {
        canvas.style.cursor = "crosshair";
      }
      if (editMode === "brush" && isDrawing) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const nativeBrushSize = brushSize * (canvas.width / canvas.getBoundingClientRect().width);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = `rgba(236, 72, 153, 0.7)`;
        ctx.lineWidth = nativeBrushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      } else if (editMode === "rectangle" && dragState.mode !== "none") {
        const dx = pos.x - dragState.startPos.x;
        const dy = pos.y - dragState.startPos.y;
        if (dragState.mode === "selecting") {
          setSelectionRect({
            x: dragState.startPos.x,
            y: dragState.startPos.y,
            w: dx,
            h: dy,
          });
        } else if (dragState.mode === "moving" && dragState.initialRect) {
          setSelectionRect({
            ...dragState.initialRect,
            x: dragState.initialRect.x + dx,
            y: dragState.initialRect.y + dy,
          });
        } else if (dragState.mode === "resizing" && dragState.initialRect && dragState.activeHandle) {
          const ir = dragState.initialRect;
          let newRect = { ...ir };
          const nx = ir.w > 0 ? ir.x : ir.x + ir.w;
          const ny = ir.h > 0 ? ir.y : ir.y + ir.h;
          const nw = Math.abs(ir.w);
          const nh = Math.abs(ir.h);
          switch (dragState.activeHandle) {
            case "tl":
              newRect = { x: nx + dx, y: ny + dy, w: nw - dx, h: nh - dy };
              break;
            case "tr":
              newRect = { x: nx, y: ny + dy, w: nw + dx, h: nh - dy };
              break;
            case "bl":
              newRect = { x: nx + dx, y: ny, w: nw - dx, h: nh + dy };
              break;
            case "br":
              newRect = { x: nx, y: ny, w: nw + dx, h: nh + dy };
              break;
          }
          setSelectionRect(newRect);
        }
      }
    },
    [editMode, isDrawing, brushSize, dragState, selectionRect]
  );

  const handleMouseUp = useCallback(() => {
    if (editMode === "brush" && isDrawing) {
      const canvas = sourceDrawingCanvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.closePath();
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setDrawingHistory((prev) => [...prev, imageData]);
      }
      setIsDrawing(false);
    } else if (editMode === "rectangle") {
      setDragState({ mode: "none", startPos: { x: 0, y: 0 }, initialRect: null, activeHandle: null });
      if (selectionRect) {
        const normX = selectionRect.w > 0 ? selectionRect.x : selectionRect.x + selectionRect.w;
        const normY = selectionRect.h > 0 ? selectionRect.y : selectionRect.y + selectionRect.h;
        const normW = Math.abs(selectionRect.w);
        const normH = Math.abs(selectionRect.h);
        if (normW < 10 || normH < 10) {
          setSelectionRect(null);
          const ctx = sourceDrawingCanvasRef.current?.getContext("2d");
          if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        } else {
          setSelectionRect({ x: normX, y: normY, w: normW, h: normH });
        }
      }
    }
  }, [editMode, isDrawing, selectionRect]);

  const handleUndo = useCallback(() => {
    if (drawingHistory.length === 0) return;
    const newHistory = drawingHistory.slice(0, -1);
    setDrawingHistory(newHistory);
    const canvas = sourceDrawingCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (newHistory.length > 0) {
        ctx.putImageData(newHistory[newHistory.length - 1], 0, 0);
      }
    }
  }, [drawingHistory]);

  const handleZoomSave = useCallback((finalImageData: ImageData) => {
    const canvas = sourceDrawingCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(finalImageData, 0, 0);
      setDrawingHistory((prev) => [...prev, finalImageData]);
    }
    setIsZoomed(false);
  }, []);

  const generateMaskImage = (): SourceImage | null => {
    const drawingCanvas = sourceDrawingCanvasRef.current;
    if (!drawingCanvas) return null;
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = drawingCanvas.width;
    maskCanvas.height = drawingCanvas.height;
    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) return null;
    maskCtx.fillStyle = "black";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.globalCompositeOperation = "source-over";
    maskCtx.drawImage(drawingCanvas, 0, 0);
    maskCtx.globalCompositeOperation = "source-in";
    maskCtx.fillStyle = "white";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    const dataUrl = maskCanvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];
    return { base64, mimeType: "image/png" };
  };

  const handleGenerate = async () => {
    if (!image || !prompt) {
      alert("Vui lòng tải ảnh và nhập mô tả để chỉnh sửa.");
      return;
    }
    setIsLoading(true);
    setResultImage(null);
    try {
      if (editMode === "rectangle") {
        if (!selectionRect || !sourceImageCanvasRef.current) {
          alert("Vui lòng chọn vùng cần sửa trên ảnh.");
          setIsLoading(false);
          return;
        }
        const rx = Math.round(selectionRect.x);
        const ry = Math.round(selectionRect.y);
        const rw = Math.round(selectionRect.w);
        const rh = Math.round(selectionRect.h);
        if (rw < 10 || rh < 10) {
          alert("Vùng chọn quá nhỏ.");
          setIsLoading(false);
          return;
        }
        const canvas = sourceImageCanvasRef.current;
        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = rw;
        cropCanvas.height = rh;
        const cropCtx = cropCanvas.getContext("2d");
        if (!cropCtx) throw new Error("Could not create crop context");
        cropCtx.drawImage(canvas, rx, ry, rw, rh, 0, 0, rw, rh);
        const cropBase64 = cropCanvas.toDataURL(image.mimeType).split(",")[1];
        const cropSource: SourceImage = { base64: cropBase64, mimeType: image.mimeType };
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = rw;
        maskCanvas.height = rh;
        const maskCtx = maskCanvas.getContext("2d");
        if (!maskCtx) throw new Error("Could not create mask context");
        maskCtx.fillStyle = "white";
        maskCtx.fillRect(0, 0, rw, rh);
        const maskBase64 = maskCanvas.toDataURL("image/png").split(",")[1];
        const maskSource: SourceImage = { base64: maskBase64, mimeType: "image/png" };
        const cropResultBase64 = await editImage(cropSource, maskSource, prompt);
        if (cropResultBase64) {
          const stitchCanvas = document.createElement("canvas");
          stitchCanvas.width = canvas.width;
          stitchCanvas.height = canvas.height;
          const stitchCtx = stitchCanvas.getContext("2d");
          if (!stitchCtx) throw new Error("Could not create stitch context");
          stitchCtx.drawImage(canvas, 0, 0);
          const editedCropImg = new Image();
          editedCropImg.src = cropResultBase64;
          await new Promise((r) => (editedCropImg.onload = r));
          stitchCtx.drawImage(editedCropImg, rx, ry, rw, rh);
          const finalResultBase64 = stitchCanvas.toDataURL(image.mimeType);
          setResultImage(finalResultBase64);
          const historyMaskCanvas = document.createElement("canvas");
          historyMaskCanvas.width = canvas.width;
          historyMaskCanvas.height = canvas.height;
          const hmCtx = historyMaskCanvas.getContext("2d");
          if (hmCtx) {
            hmCtx.fillStyle = "black";
            hmCtx.fillRect(0, 0, canvas.width, canvas.height);
            hmCtx.fillStyle = "white";
            hmCtx.fillRect(rx, ry, rw, rh);
            const historyMaskBase64 = historyMaskCanvas.toDataURL("image/png").split(",")[1];
            onEditComplete({
              sourceImage: image,
              maskImage: { base64: historyMaskBase64, mimeType: "image/png" },
              prompt,
              resultImage: finalResultBase64,
            });
          }
        } else {
          throw new Error("AI did not return an image.");
        }
      } else {
        const maskImage = generateMaskImage();
        if (!maskImage) {
          alert("Không thể tạo vùng chọn (mask).");
          return;
        }
        const result = await editImage(image, maskImage, prompt);
        if (result) {
          setResultImage(result);
          onEditComplete({ sourceImage: image, maskImage, prompt, resultImage: result });
        } else {
          throw new Error("API did not return an image.");
        }
      }
    } catch (error) {
      console.error("Image editing failed:", error);
      alert("Đã xảy ra lỗi khi chỉnh sửa ảnh. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueEditing = () => {
    if (!resultImage) return;
    const newSource = dataUrlToSourceImage(resultImage);
    if (newSource) {
      setImage(newSource);
      setResultImage(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {image && (
          <div className="bg-[var(--bg-surface-1)] p-4 rounded-xl border border-[var(--border-1)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => {
                  setEditMode("brush");
                  clearMask();
                }}
                className={`px-4 py-2 text-sm font-medium border border-[var(--border-2)] rounded-l-lg flex items-center gap-2 transition-colors ${
                  editMode === "brush" ? "bg-[var(--bg-interactive)] text-white" : "bg-[var(--bg-surface-3)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]"
                }`}
              >
                <Icon name="brush" className="w-4 h-4" />
                Vẽ Vùng Chọn
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode("rectangle");
                  clearMask();
                }}
                className={`px-4 py-2 text-sm font-medium border border-l-0 border-[var(--border-2)] rounded-r-lg flex items-center gap-2 transition-colors ${
                  editMode === "rectangle" ? "bg-[var(--bg-interactive)] text-white" : "bg-[var(--bg-surface-3)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]"
                }`}
              >
                <Icon name="viewfinder" className="w-4 h-4" />
                Chỉnh Sửa Nâng Cao
              </button>
            </div>
            {editMode === "brush" && (
              <div className="flex items-center gap-2 flex-grow max-w-xs">
                <span className="text-sm text-[var(--text-secondary)] whitespace-nowrap">Cỡ Bút: {brushSize}px</span>
                <input type="range" min="5" max="100" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full h-2 bg-[var(--bg-surface-3)] rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[var(--bg-surface-2)] p-1 rounded-md border border-[var(--border-2)]">
                <button onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.2))} className="p-1.5 hover:bg-[var(--bg-surface-3)] rounded text-[var(--text-primary)]" title="Thu nhỏ">
                  <Icon name="magnifying-glass-minus" className="w-4 h-4" />
                </button>
                <span className="text-xs w-10 text-center font-mono">{Math.round(zoomLevel * 100)}%</span>
                <button onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 5))} className="p-1.5 hover:bg-[var(--bg-surface-3)] rounded text-[var(--text-primary)]" title="Phóng to">
                  <Icon name="magnifying-glass-plus" className="w-4 h-4" />
                </button>
              </div>
              <button onClick={handleUndo} disabled={drawingHistory.length === 0} className="px-3 py-2 text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-surface-3)] hover:bg-[var(--bg-surface-2)] rounded-md transition border border-[var(--border-2)] flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon name="arrow-uturn-left" className="w-4 h-4" /> Undo
              </button>
              <button onClick={clearMask} className="px-3 py-2 text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg-surface-3)] hover:bg-[var(--bg-surface-2)] rounded-md transition border border-[var(--border-2)] disabled:opacity-50">
                Xóa Mask
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--bg-surface-1)] p-6 rounded-xl border border-[var(--border-1)] flex flex-col h-full min-h-[500px]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center justify-between">
              <span>1. Ảnh Gốc & Vùng Sửa</span>
              {image && (
                <div className="flex gap-2">
                  <button onClick={() => setIsSourceFullscreen(true)} className="text-xs px-2 py-1 bg-[var(--bg-surface-3)] hover:bg-[var(--bg-interactive)] rounded text-[var(--text-secondary)] hover:text-white flex items-center gap-1 transition-colors">
                    <Icon name="arrows-expand" className="w-3 h-3" /> Phóng to gốc
                  </button>
                  <button onClick={() => setIsZoomed(true)} className="text-xs px-2 py-1 bg-[var(--bg-surface-3)] hover:bg-[var(--bg-interactive)] rounded text-[var(--text-secondary)] hover:text-white flex items-center gap-1 transition-colors">
                    <Icon name="brush" className="w-3 h-3" /> Chế độ vẽ zoom
                  </button>
                </div>
              )}
            </h2>
            <div className="flex-grow flex items-center justify-center bg-black/20 rounded-lg border border-[var(--border-2)] relative overflow-hidden">
              {image ? (
                <div ref={sourceContainerRef} className="relative w-full h-full overflow-auto flex items-center justify-center">
                  <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center", transition: "transform 0.1s ease-out" }} className="relative">
                    <canvas ref={sourceImageCanvasRef} className="block max-w-full max-h-full object-contain" />
                    <canvas ref={sourceDrawingCanvasRef} className="absolute inset-0 w-full h-full object-contain" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} />
                  </div>
                </div>
              ) : (
                <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`w-full h-full flex flex-col items-center justify-center cursor-pointer transition-colors ${isDraggingOver ? "bg-[var(--bg-surface-2)]" : ""}`}>
                  <Icon name="photo" className="w-16 h-16 text-[var(--text-tertiary)] mb-4" />
                  <p className="text-[var(--text-secondary)] mb-2">Nhấp hoặc kéo tệp vào đây</p>
                  <p className="text-xs text-[var(--text-tertiary)]">PNG, JPG, WEBP</p>
                </div>
              )}
            </div>
            {image && (
              <button onClick={() => { setImage(null); setResultImage(null); }} className="mt-4 w-full bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:bg-[var(--text-danger)] hover:text-white py-2 rounded transition-colors text-sm flex items-center justify-center gap-2">
                <Icon name="trash" className="w-4 h-4" /> Xóa ảnh & làm lại
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
          </div>
          <div className="bg-[var(--bg-surface-1)] p-6 rounded-xl border border-[var(--border-1)] flex flex-col h-full min-h-[500px]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 text-center">2. Kết Quả Chỉnh Sửa</h2>
            <div className="flex-grow bg-black/20 rounded-lg flex items-center justify-center border border-[var(--border-2)] relative overflow-hidden group">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-100"></div>
                  <p className="mt-4 font-semibold text-[var(--text-primary)]">AI đang xử lý...</p>
                </div>
              ) : resultImage ? (
                <>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <ImageCompareSlider beforeImage={sourceImageUrlForSlider} afterImage={resultImage} />
                  </div>
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <button onClick={() => setIsResultFullscreen(true)} className="bg-[var(--bg-surface-3)]/80 backdrop-blur-sm border border-[var(--border-2)] hover:bg-[var(--bg-interactive)] text-[var(--text-primary)] hover:text-[var(--text-interactive)] font-bold text-xs px-3 py-2 rounded-md transition-colors flex items-center gap-1.5" title="Xem Toàn Màn Hình">
                      <Icon name="arrows-expand" className="w-4 h-4" />
                      <span>Phóng To</span>
                    </button>
                    <a href={resultImage} download={`nbox-ai-edited-${Date.now()}.png`} className="bg-[var(--bg-surface-3)]/80 backdrop-blur-sm border border-[var(--border-2)] hover:bg-[var(--bg-interactive)] text-[var(--text-primary)] hover:text-[var(--text-interactive)] font-bold text-xs px-3 py-2 rounded-md transition-colors flex items-center gap-1.5" title="Tải ảnh">
                      <Icon name="download" className="w-4 h-4" />
                      <span>Tải</span>
                    </a>
                    <button onClick={handleContinueEditing} className="bg-[var(--bg-surface-3)]/80 backdrop-blur-sm border border-[var(--border-2)] hover:bg-[var(--bg-interactive)] text-[var(--text-primary)] hover:text-[var(--text-interactive)] font-bold text-xs px-3 py-2 rounded-md transition-colors flex items-center gap-1.5" title="Chỉnh sửa tiếp ảnh này">
                      <Icon name="arrow-path" className="w-4 h-4" />
                      <span>Sửa tiếp</span>
                    </button>
                    <button onClick={() => onCreateVideoRequest(resultImage!)} className="bg-[var(--bg-surface-3)]/80 backdrop-blur-sm border border-[var(--border-2)] hover:bg-[var(--bg-interactive)] text-[var(--text-primary)] hover:text-[var(--text-interactive)] font-bold text-xs px-3 py-2 rounded-md transition-colors flex items-center gap-1.5" title="Tạo Video từ ảnh này">
                      <Icon name="film" className="w-4 h-4" />
                      <span>Tạo Video</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-[var(--text-tertiary)]">
                  <Icon name="sparkles" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>{image ? "Kết quả sẽ xuất hiện ở đây." : "Vui lòng tải lên một ảnh để bắt đầu."}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {image && (
          <div className="bg-[var(--bg-surface-1)] p-6 rounded-xl border border-[var(--border-1)]">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-grow">
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">3. Mô Tả Chỉnh Sửa</label>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ví dụ: thêm một bể bơi, xóa chiếc xe ô tô, đổi tường thành gạch đỏ..." className="w-full bg-[var(--bg-surface-3)] p-4 rounded-lg h-32 resize-none text-sm focus:ring-2 focus:ring-[var(--ring-focus)] focus:outline-none border border-[var(--border-2)]" />
              </div>
              <div className="flex flex-col justify-end gap-3 lg:w-1/4">
                <button onClick={handleGenerate} disabled={isLoading || !image} className="w-full h-14 bg-[var(--bg-interactive)] hover:bg-[var(--bg-interactive-hover)] text-[var(--text-interactive)] font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:bg-[var(--bg-disabled)] disabled:cursor-not-allowed shadow-lg">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>Đang Chỉnh Sửa...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="sparkles" className="w-6 h-6" />
                      <span>{editMode === "rectangle" ? "Sửa Vùng Đã Chọn" : "Bắt Đầu Chỉnh Sửa"}</span>
                    </>
                  )}
                </button>
                <div className="text-xs text-[var(--text-tertiary)] text-center">
                  {editMode === "rectangle" ? <p>Ảnh crop sẽ được chỉnh sửa và <span className="text-[var(--text-accent)] font-semibold">tự động ghép</span> vào ảnh gốc.</p> : "Tô vùng cần sửa và nhấn nút để AI xử lý."}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {isZoomed && image && <ZoomEditorModal image={image} initialDrawingData={drawingHistory.length > 0 ? drawingHistory[drawingHistory.length - 1] : null} onClose={() => setIsZoomed(false)} onSave={handleZoomSave} />}
      {isResultFullscreen && resultImage && <ImageViewerModal imageUrl={resultImage} onClose={() => setIsResultFullscreen(false)} />}
      {isSourceFullscreen && sourceImageUrlForSlider && <ImageViewerModal imageUrl={sourceImageUrlForSlider} onClose={() => setIsSourceFullscreen(false)} />}
    </>
  );
};
