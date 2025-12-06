"use client";

import { useState, useEffect } from "react";

export function useInteriorPrompt() {
  const [customPrompt, setCustomPrompt] = useState("");
  const [roomType, setRoomType] = useState("Phòng khách");
  const [roomStyle, setRoomStyle] = useState("Hiện đại");
  const [lighting, setLighting] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  const [useSketchIntermediate, setUseSketchIntermediate] = useState(true);

  const roomTypeOptions = [
    "Phòng khách",
    "Phòng ngủ",
    "Nhà bếp",
    "Phòng tắm / WC",
    "Ban công",
    "Phòng làm việc",
    "Phòng ăn",
    "Lối vào",
    "... Khác",
  ];

  const roomStyleOptions = [
    "Hiện đại",
    "Tân cổ điển",
    "Wabi-sabi",
    "Tối giản (Minimalism)",
    "Scanvadian",
    "Indochine",
    "Industrial",
    "Bohemian",
    "Modern Classic",
    "Modern Minimalist",
    "... Khác",
  ];

  const lightingOptions = [
    "Ánh sáng ban ngày tự nhiên từ cửa sổ lớn",
    "Ánh sáng đèn vàng ấm cúng buổi tối",
    "Ánh sáng đèn downlight hiện đại, sắc nét",
    "Ánh sáng gián tiếp từ đèn LED hắt trần",
    "Ánh sáng mờ ảo, lãng mạn cho phòng ngủ",
    "Ánh sáng hoàng hôn chiếu xiên qua cửa sổ",
  ];

  const angleOptions = [
    "Góc chụp từ trên cao nhìn xuống toàn bộ không gian phòng",
    "Góc chụp góc 3/4 bên trái bao quát cả căn phòng",
    "Góc chụp góc 3/4 bên phải bao quát cả căn phòng",
    "Góc chụp góc chính diện thẳng vào trung tâm phòng",
    "Góc chụp góc chéo từ cửa ra vào nhìn vào trong phòng",
    "Góc chụp từ phía sau sofa nhìn về hướng cửa sổ",
    "Góc chụp từ trong phòng nhìn ngược ra cửa chính",
    "Góc chụp từ trần nhà thấp xuống tạo chiều sâu không gian",
    "Góc chụp đối xứng cân bằng toàn bộ phòng",
    "Góc chụp từ một góc tường chéo tạo cảm giác rộng",
    "Góc chụp khu vực sofa và bàn trà từ góc nhìn ngang",
    "Góc chụp khu vực kệ tivi và tường trang trí từ góc chính diện",
    "Góc chụp bàn ăn và ghế từ góc nghiêng 45 độ",
    "Góc chụp cửa sổ lớn và ánh sáng tự nhiên tràn vào phòng",
    "Góc chụp góc tường trang trí với tranh nghệ thuật và đèn hắt sáng",
    "Góc chụp góc nhìn về khu vực bếp liên thông với phòng khách",
    "Góc chụp khu vực đọc sách với kệ sách và ghế đơn",
    "Góc chụp thảm trải sàn bao quanh bàn trà",
    "Góc chụp khu vực treo rèm cửa và ánh sáng chiếu vào",
    "Góc chụp chi tiết trần nhà và hệ thống đèn trang trí",
    "Góc chụp cận cảnh sofa với chất liệu vải hoặc da",
    "Góc chụp cận cảnh bàn trà với mặt kính hoặc gỗ",
    "Góc chụp cận cảnh đèn chùm pha lê hoặc đèn thả trần",
    "Góc chụp cận cảnh gối trang trí nhiều màu sắc trên sofa",
    "Góc chụp cận cảnh thảm trải sàn với hoa văn rõ nét",
    "Góc chụp cận cảnh rèm cửa với chất liệu mỏng nhẹ",
    "Góc chụp cận cảnh chậu cây xanh trang trí trong phòng",
    "Góc chụp cận cảnh kệ tivi và đồ trang trí nhỏ",
    "Góc chụp cận cảnh tay vịn ghế và chất liệu gỗ",
    "Góc chụp cận cảnh bề mặt tường với hoa văn hoặc phào chỉ",
  ];

  useEffect(() => {
    const isCustomMode = roomType === "... Khác" || roomStyle === "... Khác";

    if (isCustomMode) {
      setFinalPrompt(customPrompt);
    } else {
      const promptParts = [];

      if (roomType && roomStyle) {
        promptParts.push(
          `tạo ảnh chụp thực tế của một ${roomType} theo phong cách ${roomStyle}`
        );
      }

      if (lighting) {
        promptParts.push(lighting);
      }
      if (customPrompt) {
        promptParts.push(customPrompt);
      }

      setFinalPrompt(promptParts.join(", "));
    }
  }, [roomType, roomStyle, lighting, customPrompt]);

  return {
    customPrompt,
    setCustomPrompt,
    roomType,
    setRoomType,
    roomStyle,
    setRoomStyle,
    lighting,
    setLighting,
    finalPrompt,
    useSketchIntermediate,
    setUseSketchIntermediate,
    roomTypeOptions,
    roomStyleOptions,
    lightingOptions,
    angleOptions,
  };
}
