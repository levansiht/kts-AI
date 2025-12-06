"use client";

import { useState, useEffect } from "react";

export function useExteriorPrompt() {
  const [customPrompt, setCustomPrompt] = useState("");
  const [context, setContext] = useState("");
  const [lighting, setLighting] = useState("");
  const [tone, setTone] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("Ảnh chụp thực tế công trình");

  const contextOptions = [
    "Trên một con phố ở Việt Nam",
    "Tại vùng nông thôn Việt Nam",
    "Trong khu đô thị cao cấp ở Việt Nam",
    "Ở ngã 4 của đường phố Việt Nam",
    "Trong khu vườn nhiệt đới thuộc miền quê Việt Nam",
    "Nằm cạnh con đường làng Việt Nam, bao quanh bởi cây xanh hai bên ngôi nhà",
    "Bên trong khu vườn kiểu châu Âu rộng rãi, sang trọng",
    "Trên vùng đồi núi có cảnh quan thơ mộng",
  ];

  const lightingOptions = [
    "Ánh sáng hoàng hôn, đèn nội thất bên trong nhà sáng nhẹ",
    "Bầu trời u ám, ánh sáng overcast, không xuất hiện bóng gắt",
    "Trời vừa mưa xong, mặt đường còn ướt, không khí trong lành",
    "Bình minh buổi sáng với ánh sáng trong trẻo",
    "Ánh sáng ban đêm, trời có trăng sáng",
    "Ánh sáng tự nhiên ban ngày, buổi trưa nắng gắt",
    "Sương mù dày vào buổi sáng sớm, mơ hồ và huyền ảo",
    "Ánh sáng lúc hoàng hôn, đổ bóng kéo dài",
  ];

  const toneOptions = [
    "Đen trắng (Monochrome)",
    "Tone điện ảnh (Cinematic)",
    "Tone tự nhiên – thực tế",
    "Tone ấm áp (Warm & Cozy)",
    "Tone lạnh hiện đại",
    "Vintage / Retro",
    "Tone pastel / mood board",
    "Tone tương lai (Futuristic / Sci-fi)",
    "Tone tạp chí thập niên 90",
  ];

  const angleOptions = [
    "Góc chụp trực diện toàn cảnh mặt tiền căn nhà",
    "Góc chụp 3/4 bên trái, thể hiện cả mặt tiền và hông nhà",
    "Góc chụp 3/4 bên phải, lấy được chiều sâu công trình",
    "Góc chụp từ trên cao nhìn xuống (drone view) toàn cảnh khuôn viên",
    "Góc chụp từ dưới lên (low angle), nhấn mạnh chiều cao và sự bề thế",
    "Góc chụp cận cảnh chi tiết cửa chính và vật liệu mặt tiền",
    "Góc chụp xuyên qua hàng cây/cảnh quan để tạo khung tự nhiên",
    "Góc chụp từ trong nhà nhìn ra sân vườn hoặc cổng",
    "Góc chụp ban đêm với ánh sáng nhân tạo, nhấn mạnh hệ thống đèn",
    "Góc chụp panorama quét ngang, bao trọn bối cảnh và môi trường xung quanh",
    "Góc chụp từ trên xuống (Top-down) như một bản vẽ mặt bằng kiến trúc",
    "Góc chụp cận cảnh chi tiết vật liệu đặc trưng",
    "Góc chụp phản chiếu công trình trên mặt nước",
    "Góc chụp qua khung cửa sổ nhà đối diện",
    "Góc chụp từ ban công nhà đối diện, có các chậu cây làm tiền cảnh",
    "Góc chụp từ người ngồi uống cà phê bên kia đường",
    "Close shot of this image",
  ];

  useEffect(() => {
    const base = "Ảnh chụp thực tế công trình";
    const additionalParts = [customPrompt, context, lighting, tone].filter(
      (p) => p && p.trim() !== ""
    );

    let result = base;
    if (additionalParts.length > 0) {
      result += ", " + additionalParts.join(", ");
    }

    setFinalPrompt(result);
  }, [customPrompt, context, lighting, tone]);

  return {
    customPrompt,
    setCustomPrompt,
    context,
    setContext,
    lighting,
    setLighting,
    tone,
    setTone,
    finalPrompt,
    contextOptions,
    lightingOptions,
    toneOptions,
    angleOptions,
  };
}
