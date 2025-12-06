"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/Icon";
import TabButton from "@/components/ui/TabButton";
import type { AppTab } from "@/types/app";
import type { SourceImage } from "@/types";
import { useRenderTabs } from "@/hooks/useRenderTabs";
import { useExteriorPrompt } from "@/hooks/useExteriorPrompt";
import { useInteriorPrompt } from "@/hooks/useInteriorPrompt";
import { useFloorplanPrompt } from "@/hooks/useFloorplanPrompt";
import { useHistory } from "@/hooks/useHistory";
import { useModelSelection } from "@/hooks/useModelSelection";
import { useUpscale } from "@/hooks/useUpscale";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { RenderTab } from "@/components/tabs/RenderTab";
import { UpscaleTab } from "@/components/tabs/UpscaleTab";
import { UtilitiesTab } from "@/components/tabs/UtilitiesTab";
import { VirtualTourTab } from "@/components/tabs/VirtualTourTab";
import { ImageEditor } from "@/components/editor/ImageEditor";
import { UpscaleModal } from "@/components/modals/UpscaleModal";

interface MainAppProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  theme: string;
  setTheme: (
    theme: "dark" | "light" | "orange" | "green" | "architect" | "xmas"
  ) => void;
  onBackToHome: () => void;
}

export default function MainApp({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  onBackToHome,
}: MainAppProps) {
  // Tab states
  const { tabStates, updateTabState } = useRenderTabs();

  // Prompt management hooks
  const exteriorPrompt = useExteriorPrompt();
  const interiorPrompt = useInteriorPrompt();
  const floorplanPrompt = useFloorplanPrompt();

  // History management
  const history = useHistory();

  // Model and quality selection
  const modelSelection = useModelSelection();

  // Upscale functionality
  const upscale = useUpscale();

  // Image generation for each tab
  const exteriorGeneration = useImageGeneration();
  const interiorGeneration = useImageGeneration();
  const floorplanGeneration = useImageGeneration();

  // Editor state
  const [imageForEditing, setImageForEditing] = useState<SourceImage | null>(
    null
  );

  // Theme selector state
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);

  // Additional states for RenderTab
  const [upscalingIndex, setUpscalingIndex] = useState<number | null>(null);
  const [progressState, setProgressState] = useState<{
    message: string;
    image: string | null;
  } | null>(null);
  const [numImages, setNumImages] = useState(4);
  const [aspectRatio, setAspectRatio] = useState("Auto");

  // Handle source image upload
  const handleSourceImageUpload = (
    tab: "exterior" | "interior" | "floorplan",
    image: SourceImage
  ) => {
    updateTabState(tab, { sourceImage: image });
  };

  // Handle reference image upload
  const handleReferenceImageUpload = (
    tab: "exterior" | "interior" | "floorplan",
    image: SourceImage
  ) => {
    updateTabState(tab, { referenceImage: image });
  };

  // Handle source image remove
  const handleSourceImageRemove = (
    tab: "exterior" | "interior" | "floorplan"
  ) => {
    updateTabState(tab, { sourceImage: null });
  };

  // Handle reference image remove
  const handleReferenceImageRemove = (
    tab: "exterior" | "interior" | "floorplan"
  ) => {
    updateTabState(tab, { referenceImage: null });
  };

  // Handle exterior generation
  const handleExteriorGenerate = async () => {
    const sourceImage = tabStates.exterior.sourceImage;
    if (!sourceImage) return;

    await exteriorGeneration.generateImages({
      sourceImage,
      referenceImage: tabStates.exterior.referenceImage,
      prompt: exteriorPrompt.finalPrompt,
      modelTier: modelSelection.modelTier,
      imageQuality: modelSelection.imageQuality,
      numberOfImages: 4,
      onComplete: (images) => {
        // Save to history
        if (images.length > 0) {
          history.addToHistory("exterior", {
            id: Date.now().toString(),
            sourceImage,
            referenceImage: tabStates.exterior.referenceImage,
            generatedImages: images,
            prompt: exteriorPrompt.finalPrompt,
            timestamp: Date.now(),
            modelTier: modelSelection.modelTier,
            imageQuality: modelSelection.imageQuality,
          });
        }

        // Update tab state
        updateTabState("exterior", {
          generatedImages: images.map((img) => img.dataUrl),
        });
      },
    });
  };

  // Handle interior generation
  const handleInteriorGenerate = async () => {
    const sourceImage = tabStates.interior.sourceImage;
    if (!sourceImage) return;

    await interiorGeneration.generateImages({
      sourceImage,
      referenceImage: tabStates.interior.referenceImage,
      prompt: interiorPrompt.finalPrompt,
      modelTier: modelSelection.modelTier,
      imageQuality: modelSelection.imageQuality,
      numberOfImages: 4,
      onComplete: (images) => {
        // Save to history
        if (images.length > 0) {
          history.addToHistory("interior", {
            id: Date.now().toString(),
            sourceImage,
            referenceImage: tabStates.interior.referenceImage,
            generatedImages: images,
            prompt: interiorPrompt.finalPrompt,
            timestamp: Date.now(),
            modelTier: modelSelection.modelTier,
            imageQuality: modelSelection.imageQuality,
          });
        }

        // Update tab state
        updateTabState("interior", {
          generatedImages: images.map((img) => img.dataUrl),
        });
      },
    });
  };

  // Handle floorplan generation
  const handleFloorplanGenerate = async () => {
    const sourceImage = tabStates.floorplan.sourceImage;
    if (!sourceImage) return;

    await floorplanGeneration.generateImages({
      sourceImage,
      referenceImage: tabStates.floorplan.referenceImage,
      prompt: floorplanPrompt.finalPrompt,
      modelTier: modelSelection.modelTier,
      imageQuality: modelSelection.imageQuality,
      numberOfImages: 4,
      onComplete: (images) => {
        // Save to history
        if (images.length > 0) {
          history.addToHistory("floorplan", {
            id: Date.now().toString(),
            sourceImage,
            referenceImage: tabStates.floorplan.referenceImage,
            generatedImages: images,
            prompt: floorplanPrompt.finalPrompt,
            timestamp: Date.now(),
            modelTier: modelSelection.modelTier,
            imageQuality: modelSelection.imageQuality,
          });
        }

        // Update tab state
        updateTabState("floorplan", {
          generatedImages: images.map((img) => img.dataUrl),
        });
      },
    });
  };

  // Handle upscale confirmation
  const handleUpscaleConfirm = async (targetQuality: "2K" | "4K") => {
    const upscaledImage = await upscale.handleUpscale(
      targetQuality,
      modelSelection.modelTier
    );

    if (upscaledImage) {
      // You can add upscaled image to history or show in a modal
      console.log("Upscaled image:", upscaledImage);
    }
  };

  // Handle edit request
  const handleEditRequest = (imageUrl: string) => {
    // Convert image URL to SourceImage format
    const sourceImage: SourceImage = {
      base64: imageUrl.split(",")[1] || "",
      mimeType: "image/png",
      dataUrl: imageUrl,
      name: `edit_${Date.now()}.png`,
    };
    setImageForEditing(sourceImage);
    setActiveTab("edit");
  };

  // Handle edit complete
  const handleEditComplete = (details: {
    sourceImage: SourceImage;
    maskImage: SourceImage;
    prompt: string;
    resultImage: string;
  }) => {
    // Save to utilities history (since edit is part of utilities workflow)
    history.addToHistory("utilities", {
      id: Date.now().toString(),
      sourceImage: details.sourceImage,
      generatedImages: [
        {
          base64: details.resultImage.split(",")[1] || "",
          mimeType: "image/png",
          dataUrl: details.resultImage,
          name: `edited_${Date.now()}.png`,
        },
      ],
      prompt: details.prompt,
      timestamp: Date.now(),
      modelTier: modelSelection.modelTier,
      imageQuality: modelSelection.imageQuality,
    });

    setImageForEditing(null);
  };

  // Helper function to convert dataUrl to SourceImage
  const dataUrlToSourceImage = (dataUrl: string): SourceImage | null => {
    const match = dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
    if (!match) return null;
    return {
      base64: match[2],
      mimeType: match[1],
      dataUrl: dataUrl,
      name: `image_${Date.now()}.png`,
    };
  };

  // Handle upscale for generated images
  const handleImageUpscale = async (index: number, target: "2k" | "4k") => {
    const tab = activeTab as "exterior" | "interior" | "floorplan";
    const imageUrl = tabStates[tab].generatedImages[index];
    if (!imageUrl) return;

    const imageToUpscale = dataUrlToSourceImage(imageUrl);
    if (!imageToUpscale) {
      alert("Định dạng ảnh không hợp lệ để upscale.");
      return;
    }

    setUpscalingIndex(index);
    try {
      const targetUpperCase = target.toUpperCase() as "2K" | "4K";
      const upscaledImage = await upscale.handleUpscale(targetUpperCase, "pro");
      if (upscaledImage) {
        // Update the image in generated images - upscaledImage is SourceImage, need dataUrl
        const newImages = [...tabStates[tab].generatedImages];
        newImages[index] = upscaledImage.dataUrl;
        updateTabState(tab, { generatedImages: newImages });
      }
    } catch (error) {
      console.error("Upscale failed:", error);
      alert(`Đã xảy ra lỗi khi upscale ảnh lên ${target.toUpperCase()}`);
    } finally {
      setUpscalingIndex(null);
    }
  };

  // Handle change angle
  const handleChangeAngle = (index: number) => {
    const tab = activeTab as "exterior" | "interior" | "floorplan";
    const imageUrl = tabStates[tab].generatedImages[index];
    if (!imageUrl) return;

    const imageToUse = dataUrlToSourceImage(imageUrl);
    if (imageToUse) {
      updateTabState(tab, {
        sourceImage: imageToUse,
        referenceImage: null,
      });
      // Scroll to angle section would go here
    }
  };

  // Handle fullscreen
  const handleFullscreen = (index: number) => {
    // This would open a fullscreen modal - to be implemented
    console.log("Fullscreen image at index:", index);
  };

  // Handle create video request
  const handleCreateVideoRequest = (imageUrl: string) => {
    const imageToUse = dataUrlToSourceImage(imageUrl);
    if (imageToUse) {
      // Navigate to utilities with video creation
      setActiveTab("utilities");
      console.log("Create video from image:", imageToUse);
    }
  };

  // Handle color adjustment request
  const handleColorAdjustmentRequest = (imageUrl: string) => {
    console.log("Color adjustment for:", imageUrl);
    // To be implemented
  };

  // Handle clear history for a tab
  const handleClearHistory = (tab: "exterior" | "interior" | "floorplan") => {
    const tabNames = {
      exterior: "ngoại thất",
      interior: "nội thất",
      floorplan: "mặt bằng",
    };
    if (
      window.confirm(
        `Bạn có chắc muốn xóa toàn bộ lịch sử render ${tabNames[tab]}?`
      )
    ) {
      // Clear history for the specific tab
      history.clearHistory(tab);
    }
  };

  // Handle select history item
  const handleSelectHistoryItem = (
    item: any,
    tab: "exterior" | "interior" | "floorplan"
  ) => {
    updateTabState(tab, {
      generatedImages: item.generatedImages.map((img: any) => img.dataUrl),
      selectedImageIndex: 0,
    });
  };

  // Handle select image index
  const handleSelectImageIndex = (
    tab: "exterior" | "interior" | "floorplan",
    index: number
  ) => {
    updateTabState(tab, { selectedImageIndex: index });
  };

  // Update generate handlers to use numImages and aspectRatio
  const handleGenerateWithPrompt = async (
    tab: "exterior" | "interior" | "floorplan",
    prompt: string,
    isAngleChange: boolean = false
  ) => {
    const sourceImage = tabStates[tab].sourceImage;
    if (!sourceImage) return;

    const generation =
      tab === "exterior"
        ? exteriorGeneration
        : tab === "interior"
        ? interiorGeneration
        : floorplanGeneration;

    await generation.generateImages({
      sourceImage,
      referenceImage: isAngleChange ? null : tabStates[tab].referenceImage,
      prompt,
      modelTier: modelSelection.modelTier,
      imageQuality: modelSelection.imageQuality,
      numberOfImages: numImages,
      onComplete: (images) => {
        if (images.length > 0) {
          history.addToHistory(tab, {
            id: Date.now().toString(),
            sourceImage,
            referenceImage: tabStates[tab].referenceImage,
            generatedImages: images,
            prompt,
            timestamp: Date.now(),
            modelTier: modelSelection.modelTier,
            imageQuality: modelSelection.imageQuality,
          });

          updateTabState(tab, {
            generatedImages: images.map((img) => img.dataUrl),
          });
        }
      },
    });
  };
  return (
    <div className="min-h-screen p-8 fade-in-up relative pb-24">
      <header className="text-center mb-10 relative">
        {/* Back Button */}
        <button
          onClick={onBackToHome}
          className="absolute top-0 left-0 z-50 p-2 bg-[var(--bg-surface-1)] hover:bg-[var(--bg-surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full transition-colors border border-[var(--border-1)] group"
          title="Quay lại trang chủ"
        >
          <Icon
            name="arrow-left"
            className="w-6 h-6 group-hover:-translate-x-1 transition-transform"
          />
        </button>

        <h1 className="text-3xl md:text-4xl font-bold tracking-wider text-[var(--text-primary)] uppercase font-montserrat">
          <span className="text-[var(--text-accent)]">NBOX.AI</span> RENDERING
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-3 tracking-widest">
          Created by Trần Minh Nhật - NBOX.AI - SĐT 0979.038.564
        </p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <a
            href="https://academy.nboxvietnam.vn/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors p-1"
            title="Website NBOX Academy"
          >
            <Icon name="globe" className="w-5 h-5" />
          </a>
          <a
            href="https://www.facebook.com/tran.minh.nhat.406322"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors p-1"
            title="Facebook"
          >
            <Icon name="facebook" className="w-5 h-5" />
          </a>
          <a
            href="https://www.tiktok.com/@nbox.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors p-1"
            title="TikTok"
          >
            <Icon name="tiktok" className="w-5 h-5" />
          </a>
        </div>

        {/* Expanding Theme Selector */}
        <div
          className="absolute top-0 right-0"
          onMouseLeave={() => setIsThemeSelectorOpen(false)}
        >
          <div className="flex items-center justify-end bg-[var(--bg-surface-1)] border border-[var(--border-1)] rounded-full shadow-lg">
            {/* Expanding options container */}
            <div
              className={`flex items-center transition-all duration-300 ease-in-out overflow-hidden ${
                isThemeSelectorOpen ? "max-w-2xl" : "max-w-0"
              }`}
            >
              <div className="flex items-center gap-1 pl-3 pr-2 whitespace-nowrap">
                {/* Dark */}
                <button
                  onClick={() => setTheme("dark")}
                  className="group flex items-center gap-1.5 p-2 rounded-full hover:bg-[var(--bg-surface-2)] text-left text-[var(--text-primary)] transition-colors"
                >
                  <Icon
                    name="moon"
                    className="w-5 h-5 text-indigo-400 transition-transform duration-200 ease-in-out group-hover:scale-125"
                  />
                  <span className="font-semibold text-sm text-[var(--text-secondary)] transition-colors duration-200 group-hover:text-[var(--text-accent)]">
                    Dark
                  </span>
                </button>
                {/* Light */}
                <button
                  onClick={() => setTheme("light")}
                  className="group flex items-center gap-1.5 p-2 rounded-full hover:bg-[var(--bg-surface-2)] text-left text-[var(--text-primary)] transition-colors"
                >
                  <Icon
                    name="sun"
                    className="w-5 h-5 text-amber-500 transition-transform duration-200 ease-in-out group-hover:scale-125"
                  />
                  <span className="font-semibold text-sm text-[var(--text-secondary)] transition-colors duration-200 group-hover:text-[var(--text-accent)]">
                    Light
                  </span>
                </button>
                {/* Orange */}
                <button
                  onClick={() => setTheme("orange")}
                  className="group flex items-center gap-1.5 p-2 rounded-full hover:bg-[var(--bg-surface-2)] text-left text-[var(--text-primary)] transition-colors"
                >
                  <Icon
                    name="sparkles"
                    className="w-5 h-5 text-orange-400 transition-transform duration-200 ease-in-out group-hover:scale-125"
                  />
                  <span className="font-semibold text-sm text-[var(--text-secondary)] transition-colors duration-200 group-hover:text-[var(--text-accent)]">
                    Orange
                  </span>
                </button>
                {/* Green */}
                <button
                  onClick={() => setTheme("green")}
                  className="group flex items-center gap-1.5 p-2 rounded-full hover:bg-[var(--bg-surface-2)] text-left text-[var(--text-primary)] transition-colors"
                >
                  <Icon
                    name="beaker"
                    className="w-5 h-5 text-lime-400 transition-transform duration-200 ease-in-out group-hover:scale-125"
                  />
                  <span className="font-semibold text-sm text-[var(--text-secondary)] transition-colors duration-200 group-hover:text-[var(--text-accent)]">
                    Green
                  </span>
                </button>
                {/* Architect */}
                <button
                  onClick={() => setTheme("architect")}
                  className="group flex items-center gap-1.5 p-2 rounded-full hover:bg-[var(--bg-surface-2)] text-left text-[var(--text-primary)] transition-colors"
                >
                  <Icon
                    name="building-office"
                    className="w-5 h-5 text-cyan-400 transition-transform duration-200 ease-in-out group-hover:scale-125"
                  />
                  <span className="font-semibold text-sm text-[var(--text-secondary)] transition-colors duration-200 group-hover:text-[var(--text-accent)]">
                    Architect
                  </span>
                </button>
                {/* X-MAS */}
                <button
                  onClick={() => setTheme("xmas")}
                  className="group flex items-center gap-1.5 p-2 rounded-full hover:bg-[var(--bg-surface-2)] text-left text-[var(--text-primary)] transition-colors"
                >
                  <Icon
                    name="gift"
                    className="w-5 h-5 text-rose-500 transition-transform duration-200 ease-in-out group-hover:scale-125"
                  />
                  <span className="font-semibold text-sm text-[var(--text-secondary)] transition-colors duration-200 group-hover:text-[var(--text-accent)]">
                    X-mas
                  </span>
                </button>
              </div>
            </div>

            {/* Trigger Button */}
            <button
              className="p-2 rounded-full hover:bg-[var(--bg-surface-2)] transition-colors flex-shrink-0 z-10"
              aria-label="Change theme"
              onMouseEnter={() => setIsThemeSelectorOpen(true)}
            >
              {theme === "dark" && (
                <Icon name="moon" className="w-6 h-6 text-indigo-400" />
              )}
              {theme === "light" && (
                <Icon name="sun" className="w-6 h-6 text-amber-500" />
              )}
              {theme === "orange" && (
                <Icon name="sparkles" className="w-6 h-6 text-orange-400" />
              )}
              {theme === "green" && (
                <Icon name="beaker" className="w-6 h-6 text-lime-400" />
              )}
              {theme === "architect" && (
                <Icon
                  name="building-office"
                  className="w-6 h-6 text-cyan-400"
                />
              )}
              {theme === "xmas" && (
                <Icon name="gift" className="w-6 h-6 text-rose-500" />
              )}
            </button>
          </div>
        </div>

        {/* Model Tier Selector - Below Theme Selector */}
        <div className="absolute top-14 right-0 z-40">
          <div className="bg-[var(--bg-surface-1)] border border-[var(--border-1)] rounded-full p-1 flex shadow-xl">
            <button
              onClick={() => modelSelection.setModelTier("free")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                modelSelection.modelTier === "free"
                  ? "bg-[var(--bg-interactive)] text-white shadow-md"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Nano Free
            </button>
            <button
              onClick={() => modelSelection.setModelTier("pro")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                modelSelection.modelTier === "pro"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon name="sparkles" className="w-3 h-3" />
              Nano Pro
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center border-b border-[var(--border-2)] mb-8 overflow-x-auto">
          <TabButton
            label="Render Ngoại Thất"
            icon="photo"
            isActive={activeTab === "exterior"}
            onClick={() => setActiveTab("exterior")}
          />
          <TabButton
            label="Render Nội Thất"
            icon="home"
            isActive={activeTab === "interior"}
            onClick={() => setActiveTab("interior")}
          />
          <TabButton
            label="Floorplan to 3D"
            icon="cube"
            isActive={activeTab === "floorplan"}
            onClick={() => setActiveTab("floorplan")}
          />
          <TabButton
            label="Tham Quan Ảo"
            icon="cursor-arrow-rays"
            isActive={activeTab === "virtual_tour"}
            onClick={() => setActiveTab("virtual_tour")}
          />
          <TabButton
            label="Chỉnh Sửa Ảnh"
            icon="brush"
            isActive={activeTab === "edit"}
            onClick={() => setActiveTab("edit")}
          />
          <TabButton
            label="Upscale"
            icon="arrow-up-circle"
            isActive={activeTab === "upscale"}
            onClick={() => setActiveTab("upscale")}
          />
          <TabButton
            label="Tiện Ích Khác"
            icon="bookmark"
            isActive={activeTab === "utilities"}
            onClick={() => setActiveTab("utilities")}
          />
        </div>

        <main>
          {activeTab === "exterior" && (
            <RenderTab
              type="exterior"
              sourceImage={tabStates.exterior.sourceImage}
              referenceImage={tabStates.exterior.referenceImage}
              generatedImages={tabStates.exterior.generatedImages}
              selectedImageIndex={tabStates.exterior.selectedImageIndex}
              history={history.exteriorHistory}
              onSourceImageUpload={(img) =>
                handleSourceImageUpload("exterior", img)
              }
              onReferenceImageUpload={(img) =>
                handleReferenceImageUpload("exterior", img)
              }
              onSourceImageRemove={() => handleSourceImageRemove("exterior")}
              onReferenceImageRemove={() =>
                handleReferenceImageRemove("exterior")
              }
              onGenerate={(prompt, isAngle) =>
                handleGenerateWithPrompt("exterior", prompt, isAngle)
              }
              onSelectImageIndex={(idx) =>
                handleSelectImageIndex("exterior", idx)
              }
              onChangeAngle={handleChangeAngle}
              onFullscreen={handleFullscreen}
              onUpscale={handleImageUpscale}
              onEditRequest={handleEditRequest}
              onCreateVideoRequest={handleCreateVideoRequest}
              onColorAdjustmentRequest={handleColorAdjustmentRequest}
              onClearHistory={() => handleClearHistory("exterior")}
              onSelectHistoryItem={(item) =>
                handleSelectHistoryItem(item, "exterior")
              }
              isGenerating={exteriorGeneration.isGenerating}
              upscalingIndex={upscalingIndex}
              progressState={progressState}
              modelTier={modelSelection.modelTier}
              imageQuality={modelSelection.imageQuality}
              onModelTierChange={modelSelection.setModelTier}
              onImageQualityChange={modelSelection.setImageQuality}
              numImages={numImages}
              onNumImagesChange={setNumImages}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
            />
          )}

          {activeTab === "interior" && (
            <RenderTab
              type="interior"
              sourceImage={tabStates.interior.sourceImage}
              referenceImage={tabStates.interior.referenceImage}
              generatedImages={tabStates.interior.generatedImages}
              selectedImageIndex={tabStates.interior.selectedImageIndex}
              history={history.interiorHistory}
              onSourceImageUpload={(img) =>
                handleSourceImageUpload("interior", img)
              }
              onReferenceImageUpload={(img) =>
                handleReferenceImageUpload("interior", img)
              }
              onSourceImageRemove={() => handleSourceImageRemove("interior")}
              onReferenceImageRemove={() =>
                handleReferenceImageRemove("interior")
              }
              onGenerate={(prompt, isAngle) =>
                handleGenerateWithPrompt("interior", prompt, isAngle)
              }
              onSelectImageIndex={(idx) =>
                handleSelectImageIndex("interior", idx)
              }
              onChangeAngle={handleChangeAngle}
              onFullscreen={handleFullscreen}
              onUpscale={handleImageUpscale}
              onEditRequest={handleEditRequest}
              onCreateVideoRequest={handleCreateVideoRequest}
              onColorAdjustmentRequest={handleColorAdjustmentRequest}
              onClearHistory={() => handleClearHistory("interior")}
              onSelectHistoryItem={(item) =>
                handleSelectHistoryItem(item, "interior")
              }
              isGenerating={interiorGeneration.isGenerating}
              upscalingIndex={upscalingIndex}
              progressState={progressState}
              modelTier={modelSelection.modelTier}
              imageQuality={modelSelection.imageQuality}
              onModelTierChange={modelSelection.setModelTier}
              onImageQualityChange={modelSelection.setImageQuality}
              numImages={numImages}
              onNumImagesChange={setNumImages}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
            />
          )}

          {activeTab === "floorplan" && (
            <RenderTab
              type="floorplan"
              sourceImage={tabStates.floorplan.sourceImage}
              referenceImage={tabStates.floorplan.referenceImage}
              generatedImages={tabStates.floorplan.generatedImages}
              selectedImageIndex={tabStates.floorplan.selectedImageIndex}
              history={history.floorplanHistory}
              onSourceImageUpload={(img) =>
                handleSourceImageUpload("floorplan", img)
              }
              onReferenceImageUpload={(img) =>
                handleReferenceImageUpload("floorplan", img)
              }
              onSourceImageRemove={() => handleSourceImageRemove("floorplan")}
              onReferenceImageRemove={() =>
                handleReferenceImageRemove("floorplan")
              }
              onGenerate={(prompt, isAngle) =>
                handleGenerateWithPrompt("floorplan", prompt, isAngle)
              }
              onSelectImageIndex={(idx) =>
                handleSelectImageIndex("floorplan", idx)
              }
              onChangeAngle={handleChangeAngle}
              onFullscreen={handleFullscreen}
              onUpscale={handleImageUpscale}
              onEditRequest={handleEditRequest}
              onCreateVideoRequest={handleCreateVideoRequest}
              onColorAdjustmentRequest={handleColorAdjustmentRequest}
              onClearHistory={() => handleClearHistory("floorplan")}
              onSelectHistoryItem={(item) =>
                handleSelectHistoryItem(item, "floorplan")
              }
              isGenerating={floorplanGeneration.isGenerating}
              upscalingIndex={upscalingIndex}
              progressState={progressState}
              modelTier={modelSelection.modelTier}
              imageQuality={modelSelection.imageQuality}
              onModelTierChange={modelSelection.setModelTier}
              onImageQualityChange={modelSelection.setImageQuality}
              numImages={numImages}
              onNumImagesChange={setNumImages}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
            />
          )}

          {activeTab === "virtual_tour" && (
            <VirtualTourTab
              setActiveTab={setActiveTab}
              setImageForEditing={setImageForEditing}
              onCreateVideoRequest={() => {
                console.log("Virtual tour video request");
              }}
            />
          )}

          {activeTab === "edit" && (
            <ImageEditor
              initialImage={imageForEditing}
              onClearInitialImage={() => setImageForEditing(null)}
              onEditComplete={handleEditComplete}
              historyItemToRestore={null}
              onHistoryRestored={() => {}}
              onCreateVideoRequest={() => {
                console.log("Edit video request");
              }}
            />
          )}

          {activeTab === "upscale" && <UpscaleTab />}

          {activeTab === "utilities" && (
            <UtilitiesTab
              onEditRequest={handleEditRequest}
              onStartNewRenderFlow={() => {
                setActiveTab("exterior");
              }}
              promptFinderImage={null}
              setPromptFinderImage={() => {}}
              promptFinderPrompts={null}
              setPromptFinderPrompts={() => {}}
              finishMyBuildImage={null}
              setFinishMyBuildImage={() => {}}
              finishMyBuildPrompts={null}
              setFinishMyBuildPrompts={() => {}}
              finishInteriorImage={null}
              setFinishInteriorImage={() => {}}
              finishInteriorPrompts={null}
              setFinishInteriorPrompts={() => {}}
              history={history.exteriorHistory
                .concat(history.interiorHistory)
                .concat(history.floorplanHistory)
                .concat(history.utilitiesHistory)}
              onClearHistory={() => {
                history.clearHistory("exterior");
                history.clearHistory("interior");
                history.clearHistory("floorplan");
                history.clearHistory("edit");
                history.clearHistory("utilities");
              }}
              onGenerationComplete={() => {}}
              initialUtility={null}
              setInitialUtility={() => {}}
              videoTabSourceImage={null}
              setVideoTabSourceImage={() => {}}
            />
          )}
        </main>

        {/* Upscale Modal */}
        {upscale.isUpscaleModalOpen && upscale.imageToUpscale && (
          <UpscaleModal
            image={upscale.imageToUpscale}
            onClose={upscale.closeUpscaleModal}
            onUpscale={handleUpscaleConfirm}
            isLoading={upscale.upscaleLoading}
            progress={upscale.upscaleProgress}
          />
        )}
      </div>
    </div>
  );
}
