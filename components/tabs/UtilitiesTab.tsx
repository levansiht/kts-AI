"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/icons/Icon";
import type { SourceImage, RenderHistoryItem, GeneratedPrompts } from "@/types";

// ==================== UTILITY TASK DEFINITIONS ====================

interface UtilityTaskDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const UTILITY_TASKS: UtilityTaskDef[] = [
  {
    id: "finish_my_build",
    name: "Hoàn thiện Công trình",
    description:
      "Tải ảnh công trình đang thi công, AI sẽ gợi ý 10 prompt để hoàn thiện theo các style kiến trúc phổ biến tại Việt Nam.",
    icon: "sparkles",
  },
  {
    id: "finish_interior",
    name: "Hoàn thiện Nội thất",
    description:
      "Tải ảnh nội thất thô, AI sẽ gợi ý 10 prompt để hoàn thiện theo các phong cách nội thất phổ biến.",
    icon: "paint-brush",
  },
  {
    id: "improve_render",
    name: "Cải thiện Render (Exterior)",
    description:
      "Tự động cải thiện chất lượng ảnh render ngoại thất: ánh sáng, shadow, texture, môi trường.",
    icon: "magic-wand",
  },
  {
    id: "improve_interior_render",
    name: "Cải thiện Render (Interior)",
    description:
      "Tự động cải thiện chất lượng ảnh render nội thất: ánh sáng, bóng, chi tiết nội thất.",
    icon: "magic-wand",
  },
  {
    id: "create_video",
    name: "Tạo Video từ Ảnh",
    description:
      "Tạo một video ngắn từ ảnh tĩnh với các hiệu ứng chuyển động camera.",
    icon: "film",
  },
  {
    id: "prompt_finder",
    name: "Dò Prompt từ Ảnh Gốc",
    description:
      "Tải lên một ảnh công trình, AI sẽ tự động gợi ý các prompt cho nhiều góc chụp đa dạng (cận cảnh, trung cảnh, nội thất).",
    icon: "viewfinder",
  },
  {
    id: "mood_board",
    name: "Mood Board (4 lighting)",
    description:
      "Tạo 4 phiên bản của cùng một góc nhìn với ánh sáng khác nhau: sáng sớm, ban ngày, hoàng hôn, đêm.",
    icon: "sun",
  },
  {
    id: "google_map_perspective",
    name: "Google Maps → Render",
    description:
      "Chuyển đổi ảnh chụp từ Google Maps thành ảnh render 3D chuyên nghiệp.",
    icon: "map-pin",
  },
  {
    id: "place_furniture",
    name: "Đặt Đồ Nội thất vào Phòng",
    description:
      "Chèn đồ nội thất vào một căn phòng trống hoặc thay thế đồ cũ.",
    icon: "sofa",
  },
  {
    id: "replace_model",
    name: "Thay thế Object bằng Ảnh Ref",
    description:
      "Thay thế một đối tượng trong ảnh gốc bằng một đối tượng từ ảnh tham khảo.",
    icon: "replace",
  },
  {
    id: "change_interior_style",
    name: "Đổi Style Nội thất",
    description:
      "Giữ nguyên layout phòng nhưng thay đổi hoàn toàn phong cách nội thất (Hiện đại, Tân cổ điển, Minimalist...).",
    icon: "palette",
  },
  {
    id: "change_material",
    name: "Đổi vật liệu, màu sơn",
    description:
      "Thay đổi vật liệu hoặc màu sơn cho công trình/nội thất bằng mô tả hoặc ảnh tham khảo texture.",
    icon: "beaker",
  },
  {
    id: "change_style",
    name: "Đổi Style Công Trình",
    description:
      "Giữ nguyên hình khối kiến trúc từ ảnh gốc, nhưng áp dụng một phong cách hoàn toàn mới thông qua mô tả.",
    icon: "arrows-right-left",
  },
  {
    id: "insert_building",
    name: "Chèn công trình vào hiện trạng",
    description:
      "Ghép ảnh công trình của bạn vào một bức ảnh nền hiện trạng một cách chân thực.",
    icon: "photo",
  },
  {
    id: "perspective_from_plan",
    name: "Tạo phối cảnh từ tổng thể",
    description:
      "Tải lên bản vẽ tổng thể (đánh dấu hướng nhìn) và ảnh tham khảo góc chụp để tạo phối cảnh.",
    icon: "viewfinder",
  },
  {
    id: "3d_to_2d",
    name: "Biến ảnh 3D thành bản vẽ 2D",
    description:
      "Chuyển đổi một ảnh render 3D thành một bản vẽ kỹ thuật dạng đường nét.",
    icon: "pencil",
  },
  {
    id: "product_to_technical_drawing",
    name: "Triển khai Sản phẩm Nội thất",
    description:
      "Biến ảnh sản phẩm (ghế, bàn, đèn...) thành bản vẽ kỹ thuật 2D với kích thước tổng thể.",
    icon: "pencil",
  },
  {
    id: "color_floorplan",
    name: "Đổ màu & bóng cho Floorplan",
    description:
      "Thêm màu sắc, vật liệu và bóng đổ để floorplan 2D trông chuyên nghiệp hơn.",
    icon: "brush",
  },
  {
    id: "remove_watermark",
    name: "Xóa Watermark",
    description: "Tự động xóa watermark hoặc văn bản trên ảnh.",
    icon: "x-circle",
  },
];

// ==================== COMPONENTS ====================

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-[var(--bg-surface-1)] backdrop-blur-md border border-[var(--border-1)] shadow-2xl shadow-[var(--shadow-color)] p-6 rounded-xl">
    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
      {title}
    </h2>
    {children}
  </div>
);

// ==================== MAIN COMPONENT ====================

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

export const UtilitiesTab: React.FC<UtilitiesTabProps> = ({
  initialUtility,
  setInitialUtility,
  history,
}) => {
  const [selectedTask, setSelectedTask] = useState<UtilityTaskDef | null>(null);
  const [historyModalItem, setHistoryModalItem] =
    useState<RenderHistoryItem | null>(null);

  useEffect(() => {
    if (initialUtility) {
      const task = UTILITY_TASKS.find((t) => t.id === initialUtility);
      if (task) setSelectedTask(task);
      setInitialUtility(null);
    }
  }, [initialUtility, setInitialUtility]);

  if (selectedTask) {
    return (
      <div>
        <button
          onClick={() => setSelectedTask(null)}
          className="mb-4 flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Icon name="arrow-left" className="w-5 h-5" />
          <span>Quay lại</span>
        </button>
        <Section title={selectedTask.name}>
          <p className="text-[var(--text-secondary)] mb-4">
            {selectedTask.description}
          </p>
          <p className="text-sm text-[var(--text-tertiary)]">
            Chức năng đang được phát triển...
          </p>
        </Section>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-2 text-[var(--text-primary)]">
        Bộ Tiện Ích AI
      </h2>
      <p className="text-center text-[var(--text-secondary)] mb-8">
        Chọn một tác vụ để bắt đầu. ({UTILITY_TASKS.length} tiện ích)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {UTILITY_TASKS.map((task) => (
          <div
            key={task.id}
            onClick={() => setSelectedTask(task)}
            className="bg-[var(--bg-surface-1)] border border-[var(--border-1)] rounded-xl p-6 hover:bg-[var(--bg-surface-2)] hover:border-[var(--border-interactive)] transition-all duration-300 cursor-pointer flex flex-col items-start shadow-lg hover:shadow-[var(--shadow-color)]"
          >
            <div className="bg-indigo-500/10 text-indigo-400 rounded-lg p-2 mb-4">
              <Icon name={task.icon} className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[var(--text-primary)] mb-2">
              {task.name}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] flex-grow">
              {task.description}
            </p>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div className="mt-12">
          <Section title="Lịch Sử Tiện Ích">
            <div className="space-y-2">
              {history.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="bg-[var(--bg-surface-2)] p-3 rounded-md hover:bg-[var(--bg-surface-3)] cursor-pointer transition-colors"
                  onClick={() => setHistoryModalItem(item)}
                >
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {item.generatedImages.length} ảnh
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {item.prompt}
                  </p>
                </div>
              ))}
              {history.length > 5 && (
                <p className="text-xs text-[var(--text-tertiary)] text-center">
                  +{history.length - 5} mục khác
                </p>
              )}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
};
