import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { SourceImage } from "@/types";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("NEXT_PUBLIC_GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const INTERIOR_SKETCH_PROMPT =
  "Biến đổi hình ảnh nội thất này thành một bản phác thảo kiến trúc nghệ thuật vẽ tay. Phong cách phải là một bức tranh màu nước đẹp mắt trên nền các đường nét mực tinh tế. Nhấn mạnh cảm giác 'vẽ tay' với các mảng màu nước loang, phóng khoáng và các vệt cọ có thể nhìn thấy. Kết quả cuối cùng phải trông giống như một bản phác thảo ý tưởng chuyên nghiệp, không phải là một bản render kỹ thuật số sạch sẽ. Điều cực kỳ quan trọng là phải bảo tồn chính xác bố cục phòng, đồ nội thất và bảng màu cốt lõi từ hình ảnh gốc, nhưng diễn giải lại mọi thứ thông qua phương tiện phác thảo màu nước nghệ thuật này.";

/**
 * Extracts the base64 image data from a Gemini API response.
 * @param response - The response object from the API.
 * @returns The base64 encoded image string, or null if not found.
 */
const extractBase64Image = (
  response: GenerateContentResponse
): string | null => {
  if (!response.candidates || response.candidates.length === 0) {
    return null;
  }
  const candidate = response.candidates[0];
  if (!candidate || !candidate.content || !candidate.content.parts) {
    return null;
  }
  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
};

/**
 * Gets the dimensions of an image from a base64 string.
 * @param base64 - The base64 string of the image.
 * @param mimeType - The mime type of the image.
 * @returns A promise that resolves to the width and height.
 */
const getImageDimensions = (
  base64: string,
  mimeType: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = (e) => reject(e);
    img.src = `data:${mimeType};base64,${base64}`;
  });
};

/**
 * Calculates the closest supported aspect ratio for Gemini Pro Vision.
 * @param width - The width of the image.
 * @param height - The height of the image.
 * @returns The closest aspect ratio string.
 */
const getClosestAspectRatio = (width: number, height: number): string => {
  const targetRatio = width / height;
  const supported = [
    { name: "1:1", ratio: 1 },
    { name: "4:3", ratio: 4 / 3 },
    { name: "3:4", ratio: 3 / 4 },
    { name: "16:9", ratio: 16 / 9 },
    { name: "9:16", ratio: 9 / 16 },
  ];

  let closest = supported[0];
  let minDiff = Math.abs(targetRatio - closest.ratio);

  for (const option of supported) {
    const diff = Math.abs(targetRatio - option.ratio);
    if (diff < minDiff) {
      minDiff = diff;
      closest = option;
    }
  }

  return closest.name;
};

/**
 * Describes an interior design image to generate a prompt.
 * @param sourceImage - The source image object.
 * @returns A promise that resolves to a descriptive string.
 */
export const describeInteriorImage = async (
  sourceImage: SourceImage
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured.");
  }

  const engineeredPrompt =
    "Analyze the provided image of a room. Your response must be a concise prompt in Vietnamese, suitable for regenerating a photorealistic version of the image. The prompt must start with the exact phrase: 'tạo ảnh chụp thực tế của căn phòng...'. Following that phrase, briefly describe the room's key materials and lighting to achieve a realistic photographic look. Keep the description short and focused.";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        {
          inlineData: {
            data: sourceImage.base64,
            mimeType: sourceImage.mimeType,
          },
        },
        { text: engineeredPrompt },
      ],
    },
  });

  return response.text?.trim() || "";
};

/**
 * Describes a masterplan image to generate a prompt.
 * @param sourceImage - The source image object.
 * @returns A promise that resolves to a descriptive string.
 */
export const describeMasterplanImage = async (
  sourceImage: SourceImage
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured.");
  }

  const engineeredPrompt =
    "Analyze the provided 2D masterplan image. Your response must be a concise prompt in Vietnamese, suitable for generating a photorealistic 3D render of the project. The prompt must start with the exact phrase: 'Biến masterplan này thành ảnh chụp dự án...'. Following that phrase, briefly describe the project's key features like 'khu nghỉ dưỡng ven biển', 'khu đô thị hiện đại', 'công viên trung tâm' based on the drawing. Keep the description short and focused.";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        {
          inlineData: {
            data: sourceImage.base64,
            mimeType: sourceImage.mimeType,
          },
        },
        { text: engineeredPrompt },
      ],
    },
  });

  return response.text?.trim() || "";
};

/**
 * Generates multiple images based on a source image and a text prompt.
 * @param sourceImage - The source image object containing base64 data and mimeType.
 * @param prompt - The text prompt to guide the image generation.
 * @param renderType - The type of render, either 'exterior', 'interior', 'floorplan', or 'masterplan'.
 * @param count - The number of images to generate.
 * @param aspectRatio - The desired aspect ratio for the output images.
 * @param referenceImage - An optional reference image for style, tone, and mood.
 * @param isAnglePrompt - A boolean to indicate if the prompt is for changing the angle.
 * @param useRawPrompt - A boolean to indicate if the provided prompt should be used as-is, without further engineering.
 * @param modelTier - The model tier to use ('free' or 'pro').
 * @param quality - The quality/resolution of the output image ('1K', '2K', '4K').
 * @returns A promise that resolves to an array of base64 image URLs.
 */
export const generateImages = async (
  sourceImage: SourceImage,
  prompt: string,
  renderType: "exterior" | "interior" | "floorplan" | "masterplan",
  count: number,
  aspectRatio: string,
  referenceImage: SourceImage | null = null,
  isAnglePrompt: boolean = false,
  useRawPrompt: boolean = false,
  modelTier: "free" | "pro" = "free",
  quality: "1K" | "2K" | "4K" = "1K"
): Promise<string[]> => {
  // Ensure API key is fresh for Pro model calls which might require user-selected key
  const currentApiKey = process.env.API_KEY;
  if (!currentApiKey) {
    throw new Error("API_KEY is not configured.");
  }
  // Create a new instance to pick up potential key changes (though process.env is usually static,
  // AI Studio environment might inject it dynamically)
  const currentAi = new GoogleGenAI({ apiKey: currentApiKey });

  // Pre-calculate dimensions if needed for Auto aspect ratio
  let detectedAspectRatio: string | undefined;
  if (modelTier === "pro" && aspectRatio === "Auto") {
    try {
      const dim = await getImageDimensions(
        sourceImage.base64,
        sourceImage.mimeType
      );
      detectedAspectRatio = getClosestAspectRatio(dim.width, dim.height);
    } catch (e) {
      console.warn("Failed to detect image dimensions", e);
    }
  }

  const generationPromises = Array(count)
    .fill(0)
    .map(async () => {
      let textPart = { text: prompt };
      const parts: any[] = [
        {
          inlineData: {
            data: sourceImage.base64,
            mimeType: sourceImage.mimeType,
          },
        },
      ];

      if (referenceImage) {
        parts.push({
          inlineData: {
            data: referenceImage.base64,
            mimeType: referenceImage.mimeType,
          },
        });
      }

      if (useRawPrompt) {
        // Use the prompt as-is from the caller.
      } else if (isAnglePrompt) {
        let subject: string;
        let sketchType: string;
        switch (renderType) {
          case "exterior":
            subject = "building";
            sketchType = "architectural sketch";
            break;
          case "interior":
            subject = "room";
            sketchType = "interior sketch";
            break;
          case "masterplan":
            subject = "masterplan";
            sketchType = "3D render";
            break;
          case "floorplan":
            subject = "room";
            sketchType = "3D interior render";
            break;
          default:
            subject = "room";
            sketchType = "interior sketch";
            break;
        }
        textPart.text = `The user wants to change the camera angle of the provided ${sketchType}. Render the exact same ${subject} from the image, but from this new perspective: "${prompt}". The prompt's main goal is to define the camera shot, not to add new content to the scene.`;
      } else if (renderType === "masterplan") {
        textPart.text = `You are an expert 3D architectural visualizer specializing in large-scale masterplans. Your task is to convert the provided 2D masterplan drawing into a photorealistic 3D aerial or bird's-eye view render. The user's request for the specific camera angle and mood is: "${prompt}". Create a beautiful and realistic image based on these instructions, accurately representing the layout of buildings, landscapes, roads, and water bodies.`;
      } else if (renderType === "floorplan") {
        if (referenceImage) {
          textPart.text = `The user's prompt is: "${prompt}". You are an expert 3D architectural visualizer. Your task is to convert the provided 2D floorplan (first image) into a photorealistic 3D interior render. You MUST adhere strictly to the layout from the floorplan. The second image is a reference for style ONLY. You must apply the mood, lighting, materials, and color palette from this second image to the room generated from the floorplan. It is forbidden to copy any structural elements or furniture layout from the style reference image. The final render should be from a human-eye level perspective inside the room.`;
        } else {
          textPart.text = `You are an expert 3D architectural visualizer. Your task is to convert the provided 2D floorplan image into a photorealistic 3D interior render, viewed from a human-eye level perspective inside the room. Adhere strictly to the layout, dimensions, and placement of walls, doors, and windows as shown in the floorplan. The user's request is: "${prompt}". Create a beautiful and realistic image based on these instructions.`;
        }
      } else if (referenceImage) {
        const subjectType = renderType === "exterior" ? "building" : "room";
        const shotType =
          renderType === "exterior" ? "exterior shot" : "interior shot";
        textPart.text = `The user's prompt is: "${prompt}". You are creating a realistic architectural render. The first image is the architectural sketch. You MUST use the exact structure, form, and layout from this first sketch. The second image is a reference for style ONLY. You must apply the mood, lighting, and color palette from the second image to the ${subjectType} from the first sketch. It is forbidden to copy any shapes, objects, architectural elements, or scene composition (like window frames or foreground elements) from the second style-reference image. The final render must be an ${shotType} based on the user's prompt.`;
      } else if (renderType === "interior") {
        textPart.text = `You are an expert 3D architectural visualizer specializing in photorealistic interior renders. Your task is to convert the provided interior design sketch or image into a high-quality, realistic photograph. The user's specific request is: "${prompt}". Create a beautiful and realistic image based on these instructions, paying close attention to materials, lighting, and atmosphere to achieve a convincing result.`;
      } else {
        textPart.text = prompt;
      }

      // Handle Aspect Ratio and Model Configuration
      const modelName =
        modelTier === "pro"
          ? "gemini-3-pro-image-preview"
          : "gemini-2.5-flash-image";
      const config: any = {
        responseModalities: [Modality.IMAGE],
      };

      if (modelTier === "pro") {
        // Pro model supports configuration via imageConfig
        config.imageConfig = {
          imageSize: quality,
        };
        if (aspectRatio && aspectRatio !== "Auto") {
          config.imageConfig.aspectRatio = aspectRatio;
        } else if (detectedAspectRatio) {
          config.imageConfig.aspectRatio = detectedAspectRatio;
        }
      } else {
        // Free/Flash model uses prompt engineering for aspect ratio
        if (aspectRatio && aspectRatio !== "Auto") {
          textPart.text += `. The final image must have a ${aspectRatio} aspect ratio`;
        }
      }

      parts.push(textPart);

      const response = await currentAi.models.generateContent({
        model: modelName,
        contents: { parts },
        config: config,
      });
      return extractBase64Image(response);
    });

  const results = await Promise.all(generationPromises);

  return results.filter((result): result is string => result !== null);
};

/**
 * Upscales an image to a target resolution using a descriptive prompt.
 * @param sourceImage - The source image object containing base64 data and mimeType.
 * @param target - The target resolution, either '2k' or '4k'.
 * @param model - The model tier to use, 'flash' (default, free) or 'pro' (Nano Banana Pro).
 * @returns A promise that resolves to the base64 URL of the upscaled image.
 */
export const upscaleImage = async (
  sourceImage: SourceImage,
  target: "2k" | "4k",
  model: "flash" | "pro" = "flash"
): Promise<string | null> => {
  const currentApiKey = process.env.API_KEY;
  if (!currentApiKey) {
    throw new Error("API_KEY is not configured.");
  }

  const currentAi = new GoogleGenAI({ apiKey: currentApiKey });

  // Force 'pro' model if target is 2k or 4k because flash doesn't support high resolution settings
  // and to ensure aspect ratio preservation which is better handled by Pro.
  const effectiveModel = target === "2k" || target === "4k" ? "pro" : model;
  const isPro = effectiveModel === "pro";
  const modelName = isPro
    ? "gemini-3-pro-image-preview"
    : "gemini-2.5-flash-image";

  const prompt = `Upscale this image to ${target.toUpperCase()} resolution. Enhance details, sharpness, and clarity. IMPORTANT: Preserve the exact aspect ratio and composition of the original image. Do not crop or distort. Make it photorealistic.`;

  const config: any = {
    responseModalities: [Modality.IMAGE],
  };

  if (isPro) {
    // Detect aspect ratio of source image to preserve it
    try {
      const dimensions = await getImageDimensions(
        sourceImage.base64,
        sourceImage.mimeType
      );
      const ratio = getClosestAspectRatio(dimensions.width, dimensions.height);
      config.imageConfig = {
        imageSize: target.toUpperCase(), // '2K' or '4K'
        aspectRatio: ratio,
      };
    } catch (e) {
      console.warn(
        "Failed to detect image dimensions, defaulting aspect ratio.",
        e
      );
      config.imageConfig = {
        imageSize: target.toUpperCase(),
      };
    }
  }

  const response = await currentAi.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        {
          inlineData: {
            data: sourceImage.base64,
            mimeType: sourceImage.mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: config,
  });

  return extractBase64Image(response);
};

/**
 * Edits an image based on a source image, a mask, and a text prompt.
 * @param sourceImage - The original image to be edited.
 * @param maskImage - A black and white image where white indicates the area to edit.
 * @param prompt - The text prompt describing the desired edit.
 * @returns A promise that resolves to the base64 URL of the edited image.
 */
export const editImage = async (
  sourceImage: SourceImage,
  maskImage: SourceImage,
  prompt: string
): Promise<string | null> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured.");
  }

  const engineeredPrompt = `You are an expert photo editor. You will receive an original image, a mask image, and a text prompt. Your task is to edit the original image *exclusively* within the white area defined by the mask. The black area of the mask represents the parts of the image that MUST remain completely untouched. The user's instruction for the edit is: "${prompt}". Whether this involves adding a new object, removing an existing one, or altering features, confine all changes strictly to the masked region. The final output should be a photorealistic image where the edits are seamlessly blended with the surrounding, unchanged areas.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          inlineData: {
            data: sourceImage.base64,
            mimeType: sourceImage.mimeType,
          },
        },
        {
          inlineData: { data: maskImage.base64, mimeType: maskImage.mimeType },
        },
        { text: engineeredPrompt },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  return extractBase64Image(response);
};

/**
 * Generates an image purely from a text prompt.
 * @param prompt - The text prompt to guide the image generation.
 * @returns A promise that resolves to a base64 image URL.
 */
export const generateImageFromText = async (
  prompt: string
): Promise<string | null> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured.");
  }

  const response = await ai.models.generateImages({
    model: "imagen-4.0-generate-001",
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: "image/jpeg",
      aspectRatio: "1:1",
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    const generatedImage = response.generatedImages[0];
    const base64ImageBytes = generatedImage?.image?.imageBytes;
    if (base64ImageBytes) {
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
  }

  return null;
};

/**
 * Generates a list of diverse prompts based on a source image.
 * @param sourceImage The source architectural image.
 * @returns A promise that resolves to an object containing categorized prompts.
 */
export const generatePromptsFromImage = async (
  sourceImage: SourceImage
): Promise<{ medium: string[]; closeup: string[]; interior: string[] }> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured.");
  }

  const engineeredPrompt = `Analyze the provided architectural image. Based on its style, materials, and environment, generate a list of diverse and creative prompts for photorealistic renders. Your response must be a JSON object.

  Follow these instructions precisely:
  1.  **Cảnh trung (Medium Shots):** Generate exactly 5 prompts describing medium shots around the building. Focus on angles like the main entrance, garden, garage area, or patio.
  2.  **Cảnh cận (Artistic Close-ups):** Generate exactly 10 prompts for artistic, detailed close-up shots. Be creative. Think about textures, light and shadow, depth of field, and storytelling. Examples: "close-up of a water droplet on a leaf in the foreground with the building blurred in the background," or "detailed shot of the wood grain on the front door under the warm evening light."
  3.  **Cảnh nội thất (Interior Shots):** Generate exactly 5 plausible prompts for interior scenes, inferring the style from the exterior. Describe the mood, lighting, and key furniture. Examples: "a cozy living room with a fireplace, looking out the main window during a rainy day," or "a minimalist bedroom with soft morning light filtering through linen curtains."

  All prompts must be in Vietnamese.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", // Using flash to avoid 429 Resource Exhausted errors
    contents: {
      parts: [
        {
          inlineData: {
            data: sourceImage.base64,
            mimeType: sourceImage.mimeType,
          },
        },
        { text: engineeredPrompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          medium: {
            type: Type.ARRAY,
            description: "5 medium shot prompts in Vietnamese.",
            items: { type: Type.STRING },
          },
          closeup: {
            type: Type.ARRAY,
            description: "10 artistic close-up prompts in Vietnamese.",
            items: { type: Type.STRING },
          },
          interior: {
            type: Type.ARRAY,
            description: "5 interior shot prompts in Vietnamese.",
            items: { type: Type.STRING },
          },
        },
        required: ["medium", "closeup", "interior"],
      },
    },
  });

  try {
    const jsonText = response.text?.trim() || "";
    const parsedJson = JSON.parse(jsonText);

    // Basic validation
    if (parsedJson.medium && parsedJson.closeup && parsedJson.interior) {
      return parsedJson;
    } else {
      throw new Error("Generated JSON is missing required keys.");
    }
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini:", response.text);
    throw new Error("The AI returned an invalid response format.");
  }
};

/**
 * Generates a video based on a text prompt and an optional source image.
 * @param prompt - The text prompt to guide the video generation.
 * @param sourceImage - An optional source image to base the video on.
 * @param onStatusUpdate - A callback function to report progress.
 * @returns A promise that resolves to a local blob URL for the video.
 */
export const generateVideo = async (
  prompt: string,
  sourceImage: SourceImage | null,
  onStatusUpdate: (status: string) => void
): Promise<string | null> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured.");
  }

  onStatusUpdate("Bắt đầu yêu cầu tạo video...");

  let operation;
  const videoParams: any = {
    model: "veo-3.1-fast-generate-preview",
    prompt: prompt,
    config: {
      numberOfVideos: 1,
    },
  };

  if (sourceImage) {
    videoParams.image = {
      imageBytes: sourceImage.base64,
      mimeType: sourceImage.mimeType,
    };
  }

  operation = await ai.models.generateVideos(videoParams);

  onStatusUpdate(
    "Yêu cầu đã được gửi. Đang chờ AI xử lý. Quá trình này có thể mất vài phút."
  );

  // Polling for the result
  let pollCount = 0;
  while (!operation.done) {
    // Wait for 10 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 10000));
    pollCount++;
    onStatusUpdate(
      `Đang kiểm tra tiến độ lần thứ ${pollCount}... Vui lòng kiên nhẫn.`
    );
    operation = await ai.operations.getVideosOperation({
      operation: operation,
    });
  }

  onStatusUpdate("Xử lý hoàn tất! Đang tải video...");

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (downloadLink) {
    const response = await fetch(`${downloadLink}&key=${API_KEY}`);
    if (!response.ok) {
      onStatusUpdate("Tải video thất bại.");
      throw new Error("Failed to download video file.");
    }
    const videoBlob = await response.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    onStatusUpdate("Sẵn sàng để xem!");
    return videoUrl;
  }

  return null;
};

export type TourMoveType =
  | "pan-left"
  | "pan-right"
  | "pan-up"
  | "pan-down"
  | "orbit-left"
  | "orbit-right"
  | "zoom-in"
  | "zoom-out";

/**
 * Generates a new image for the virtual tour based on a camera movement command.
 * @param sourceImage The current image in the tour.
 * @param moveType The type of camera movement (pan, orbit, zoom).
 * @param magnitude The amount to move (e.g., degrees for pan/orbit).
 * @returns A promise that resolves to the base64 URL of the new image.
 */
export const generateVirtualTourImage = async (
  sourceImage: SourceImage,
  moveType: TourMoveType,
  magnitude: number
): Promise<string | null> => {
  let prompt = "";
  const magnitudeText =
    {
      15: "a small amount",
      30: "a moderate amount",
      45: "a large amount",
    }[magnitude as 15 | 30 | 45] || `${magnitude} degrees`;

  const baseInstruction =
    "You are a virtual camera operator. Re-render the provided scene from a new perspective based on the following precise instruction. You must maintain the exact same photorealistic style, architectural details, materials, lighting, and atmosphere as the original image.";

  switch (moveType) {
    case "pan-left":
      prompt = `${baseInstruction} INSTRUCTION: PAN LEFT ${magnitude} DEGREES. This is a pure yaw rotation from a fixed camera position, as if on a tripod. Do not move the camera's location.`;
      break;
    case "pan-right":
      prompt = `${baseInstruction} INSTRUCTION: PAN RIGHT ${magnitude} DEGREES. This is a pure yaw rotation from a fixed camera position, as if on a tripod. Do not move the camera's location.`;
      break;
    case "pan-up":
      prompt = `${baseInstruction} INSTRUCTION: TILT UP ${magnitude} DEGREES. This is a pure pitch rotation from a fixed camera position, as if on a tripod. Do not move the camera's location.`;
      break;
    case "pan-down":
      prompt = `${baseInstruction} INSTRUCTION: TILT DOWN ${magnitude} DEGREES. This is a pure pitch rotation from a fixed camera position, as if on a tripod. Do not move the camera's location.`;
      break;
    case "orbit-left":
      prompt = `${baseInstruction} INSTRUCTION: ORBIT LEFT ${magnitude} DEGREES. The camera's physical position must move. Circle the camera to the left around the scene's central subject, keeping it in frame. Do not change camera height or lens properties.`;
      break;
    case "orbit-right":
      prompt = `${baseInstruction} INSTRUCTION: ORBIT RIGHT ${magnitude} DEGREES. The camera's physical position must move. Circle the camera to the right around the scene's central subject, keeping it in frame. Do not change camera height or lens properties.`;
      break;
    case "zoom-in":
      prompt = `${baseInstruction} INSTRUCTION: OPTICAL ZOOM IN (${magnitudeText}). The camera's physical position MUST NOT change. Decrease the lens's field of view to magnify the center of the image.`;
      break;
    case "zoom-out":
      prompt = `${baseInstruction} INSTRUCTION: OPTICAL ZOOM OUT (${magnitudeText}). The camera's physical position MUST NOT change. Increase the lens's field of view to make the scene appear farther away.`;
      break;
  }

  const images = await generateImages(
    sourceImage,
    prompt,
    "exterior",
    1,
    "Auto",
    null,
    false,
    true
  );
  return images.length > 0 ? images[0] : null;
};

/**
 * Generates four mood images for a building sketch at different times of day.
 * @param sourceImage - The source architectural sketch.
 * @returns A promise that resolves to an array of 4 base64 image URLs.
 */
export const generateMoodImages = async (
  sourceImage: SourceImage
): Promise<string[]> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured.");
  }

  const prompts = [
    "Ảnh chụp thực tế của công trình từ bản sketch, bối cảnh ban ngày lúc 10 giờ sáng với nắng gắt và bóng đổ sắc nét.",
    "Ảnh chụp thực tế của công trình từ bản sketch, bối cảnh giữa trưa lúc 11 giờ, trời nhiều mây (overcast) với ánh sáng mềm, khuếch tán và không có nắng trực tiếp.",
    "Ảnh chụp thực tế của công trình từ bản sketch, trong buổi hoàng hôn lúc 4 giờ chiều với ánh sáng vàng ấm và bóng đổ dài.",
    "Ảnh chụp thực tế của công trình từ bản sketch, trong giờ xanh (blue hour) khoảng 6 giờ tối, với ánh sáng xanh đậm và đèn nội thất được bật sáng.",
  ];

  // Call generateImages for each prompt. We want 1 image per prompt.
  const generationPromises = prompts.map((prompt) =>
    generateImages(
      sourceImage,
      prompt,
      "exterior",
      1,
      "Auto",
      null,
      false,
      true
    )
  );

  const results = await Promise.all(generationPromises);

  // Each call to generateImages returns an array (e.g., ['image_url']), so we flatten the result.
  const flattenedResults = results.flat();

  if (flattenedResults.length < 4) {
    console.warn("Expected 4 images, but received " + flattenedResults.length);
  }

  return flattenedResults.filter((result): result is string => result !== null);
};

/**
 * Improves an exterior render by isolating, sketchifying, and re-rendering it.
 * @param sourceImage The original render image.
 * @param finalPrompt The complete prompt for the final render.
 * @param onProgress Callback for progress updates.
 * @returns A promise that resolves to the base64 URL of the improved image.
 */
export const improveExteriorRender = async (
  sourceImage: SourceImage,
  finalPrompt: string,
  onProgress: (message: string, currentImage: string | null) => void
): Promise<string | null> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured.");
  }

  // --- Step 1: Isolate the building ---
  onProgress(
    "Bước 1/3: Đang tách công trình khỏi nền...",
    `data:${sourceImage.mimeType};base64,${sourceImage.base64}`
  );
  const isolationPrompt =
    "Perform a precise architectural cutout of the main building. Your goal is to isolate the building and its integral features while removing the surrounding background. You MUST keep the main building structure, any attached gates or fences, and plants that are physically on balconies or integrated planters. You MUST completely remove all background elements: this includes the sky, the ground/grass, separate trees in the yard or on the street, cars, and other neighboring objects. The final output must be the isolated building and its integral parts on a pure white background (#FFFFFF). Ensure the cutout has clean, sharp edges.";
  const isolatedImages = await generateImages(
    sourceImage,
    isolationPrompt,
    "exterior",
    1,
    "Auto",
    null,
    false,
    true
  );
  if (!isolatedImages || isolatedImages.length === 0) {
    throw new Error("Step 1 failed: Could not isolate the building.");
  }
  const isolatedImageSrc = isolatedImages[0];
  onProgress("Bước 1/3: Đã tách xong công trình.", isolatedImageSrc);

  const isolatedImage: SourceImage = {
    base64: isolatedImageSrc.split(",")[1],
    mimeType:
      isolatedImageSrc.match(/data:(image\/[a-z]+);/)?.[1] || "image/png",
    dataUrl: isolatedImageSrc,
    name: "isolated.png",
  };

  // --- Step 2: Convert to sketch ---
  onProgress("Bước 2/3: Đang chuyển đổi sang dạng sketch...", isolatedImageSrc);
  const sketchPrompt =
    "Convert this image of an isolated building into a full-color architectural sketch. The entire image should adopt a hand-drawn style, resembling a drawing made with colored pencils and fine-line ink pens. It must be vibrant and artistic, not a simple black and white line drawing. Preserve the building's overall form and primary color palette, but render everything completely in this colored sketch aesthetic.";
  const sketchImages = await generateImages(
    isolatedImage,
    sketchPrompt,
    "exterior",
    1,
    "Auto",
    null,
    false,
    true
  );
  if (!sketchImages || sketchImages.length === 0) {
    throw new Error("Step 2 failed: Could not convert to sketch.");
  }
  const sketchImageSrc = sketchImages[0];
  onProgress("Bước 2/3: Đã chuyển đổi sang sketch.", sketchImageSrc);

  const sketchImage: SourceImage = {
    base64: sketchImageSrc.split(",")[1],
    mimeType: sketchImageSrc.match(/data:(image\/[a-z]+);/)?.[1] || "image/png",
    dataUrl: sketchImageSrc,
    name: "sketch.png",
  };

  // --- Step 3: Re-render with new context ---
  onProgress("Bước 3/3: Đang render lại với bối cảnh mới...", sketchImageSrc);

  const finalImages = await generateImages(
    sketchImage,
    finalPrompt,
    "exterior",
    1,
    "Auto",
    null,
    false,
    false
  );
  if (!finalImages || finalImages.length === 0) {
    throw new Error("Step 3 failed: Could not re-render the image.");
  }
  const finalImageSrc = finalImages[0];
  onProgress("Hoàn thành!", finalImageSrc);

  return finalImageSrc;
};

/**
 * Improves an interior render by converting it to a sketch and re-rendering it with new parameters.
 * @param sourceImage The original render image.
 * @param finalPrompt The complete prompt for the final render.
 * @param onProgress Callback for progress updates.
 * @returns A promise that resolves to the base64 URL of the improved image.
 */
export const improveInteriorRender = async (
  sourceImage: SourceImage,
  finalPrompt: string,
  onProgress: (message: string, currentImage: string | null) => void
): Promise<string | null> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured.");
  }

  // --- Step 1: Convert to sketch ---
  onProgress(
    "Bước 1/2: Đang chuyển đổi sang dạng sketch...",
    `data:${sourceImage.mimeType};base64,${sourceImage.base64}`
  );
  const sketchImages = await generateImages(
    sourceImage,
    INTERIOR_SKETCH_PROMPT,
    "interior",
    1,
    "Auto",
    null,
    false,
    true
  );
  if (!sketchImages || sketchImages.length === 0) {
    throw new Error("Step 1 failed: Could not convert to sketch.");
  }
  const sketchImageSrc = sketchImages[0];
  onProgress("Bước 1/2: Đã chuyển đổi sang sketch.", sketchImageSrc);

  const sketchImage: SourceImage = {
    base64: sketchImageSrc.split(",")[1],
    mimeType: sketchImageSrc.match(/data:(image\/[a-z]+);/)?.[1] || "image/png",
    dataUrl: sketchImageSrc,
    name: "sketch.png",
  };

  // --- Step 2: Re-render with new context ---
  onProgress(
    "Bước 2/2: Đang render lại với các tùy chọn mới...",
    sketchImageSrc
  );
  const finalImages = await generateImages(
    sketchImage,
    finalPrompt,
    "interior",
    1,
    "Auto",
    null,
    false,
    false
  );
  if (!finalImages || finalImages.length === 0) {
    throw new Error("Step 2 failed: Could not re-render the image.");
  }
  const finalImageSrc = finalImages[0];
  onProgress("Hoàn thành!", finalImageSrc);

  return finalImageSrc;
};

/**
 * Generates an interior render using a two-step process: sketch conversion then re-rendering.
 * @param sourceImage The original interior image.
 * @param prompt The final prompt describing the desired output.
 * @param count The number of images to generate.
 * @param aspectRatio The desired aspect ratio.
 * @param referenceImage An optional reference image for style.
 * @param onProgress Callback for progress updates.
 * @param modelTier The model tier to use ('free' or 'pro').
 * @param quality The quality/resolution of the output image ('1K', '2K', '4K').
 * @returns A promise that resolves to an array of base64 image URLs.
 */
export const generateInteriorRenderTwoStep = async (
  sourceImage: SourceImage,
  prompt: string,
  count: number,
  aspectRatio: string,
  referenceImage: SourceImage | null = null,
  onProgress: (message: string, currentImage: string | null) => void,
  modelTier: "free" | "pro" = "free",
  quality: "1K" | "2K" | "4K" = "1K"
): Promise<string[]> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured.");
  }

  // --- Step 1: Convert to Sketch ---
  onProgress(
    "Bước 1/2: Đang chuyển đổi sang dạng sketch...",
    `data:${sourceImage.mimeType};base64,${sourceImage.base64}`
  );

  // Use default settings for the intermediate sketch step to ensure consistent sketch style
  const sketchResult = await generateImages(
    sourceImage,
    INTERIOR_SKETCH_PROMPT,
    "interior",
    1,
    "Auto",
    null,
    false,
    true
  );

  if (!sketchResult || sketchResult.length === 0) {
    throw new Error(
      "Failed to convert the source image to a sketch in step 1."
    );
  }

  const sketchImageSrc = sketchResult[0];
  onProgress("Bước 2/2: Đang render từ ảnh sketch...", sketchImageSrc);

  const sketchImage: SourceImage = {
    base64: sketchImageSrc.split(",")[1],
    mimeType: sketchImageSrc.match(/data:(image\/[a-z]+);/)?.[1] || "image/png",
    dataUrl: sketchImageSrc,
    name: "sketch.png",
  };

  // --- Step 2: Render from Sketch ---
  // Use the requested modelTier and quality for the final photorealistic render
  const finalImages = await generateImages(
    sketchImage,
    prompt,
    "interior",
    count,
    aspectRatio,
    referenceImage,
    false,
    false,
    modelTier,
    quality
  );

  onProgress("Hoàn thành!", finalImages.length > 0 ? finalImages[0] : null);

  return finalImages;
};

/**
 * Generates 10 stylistic prompts for completing an unfinished building.
 * @param sourceImage - The source image of the construction site.
 * @returns A promise that resolves to an array of 10 prompt strings.
 */
export const generateCompletionPrompts = async (
  sourceImage: SourceImage
): Promise<string[]> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured.");
  }

  const engineeredPrompt = `Analyze the provided image of an unfinished construction site in Vietnam. Your goal is to suggest ways to complete it. Generate exactly 10 diverse and creative prompts in Vietnamese for photorealistic renders. The prompts must describe popular architectural styles for residential houses in Vietnam (e.g., Modern, Neoclassical, Indochine, Tropical, Tube House styles). Each prompt must start with 'Ảnh chụp thực tế hoàn thiện công trình'. Your response must be a JSON object with a single key "prompts" which is an array of 10 strings.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", // Changed from pro to flash
    contents: {
      parts: [
        {
          inlineData: {
            data: sourceImage.base64,
            mimeType: sourceImage.mimeType,
          },
        },
        { text: engineeredPrompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prompts: {
            type: Type.ARRAY,
            description: "10 completion prompts in Vietnamese.",
            items: { type: Type.STRING },
          },
        },
        required: ["prompts"],
      },
    },
  });

  try {
    const jsonText = response.text?.trim() || "";
    const parsedJson = JSON.parse(jsonText);

    if (
      parsedJson.prompts &&
      Array.isArray(parsedJson.prompts) &&
      parsedJson.prompts.length > 0
    ) {
      return parsedJson.prompts;
    } else {
      throw new Error("Generated JSON is missing the 'prompts' array.");
    }
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini:", response.text);
    throw new Error("The AI returned an invalid response format.");
  }
};

/**
 * Generates 10 stylistic prompts for completing an unfinished interior room.
 * @param sourceImage - The source image of the empty room.
 * @returns A promise that resolves to an array of 10 prompt strings.
 */
export const generateInteriorCompletionPrompts = async (
  sourceImage: SourceImage
): Promise<string[]> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured.");
  }

  const engineeredPrompt = `Analyze the provided image of an unfinished, empty room in Vietnam. Your goal is to suggest ways to furnish and complete it. Generate exactly 10 diverse and creative prompts in Vietnamese for photorealistic interior renders. The prompts must describe popular interior design styles in Vietnam (e.g., Modern, Indochine, Scandinavian, Minimalist, Wabi-sabi, Neoclassical). Each prompt must start with 'Hoàn thiện nội thất căn phòng theo phong cách'. Your response must be a JSON object with a single key "prompts" which is an array of 10 strings.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", // Changed from pro to flash
    contents: {
      parts: [
        {
          inlineData: {
            data: sourceImage.base64,
            mimeType: sourceImage.mimeType,
          },
        },
        { text: engineeredPrompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prompts: {
            type: Type.ARRAY,
            description: "10 interior completion prompts in Vietnamese.",
            items: { type: Type.STRING },
          },
        },
        required: ["prompts"],
      },
    },
  });

  try {
    const jsonText = response.text?.trim() || "";
    const parsedJson = JSON.parse(jsonText);

    if (
      parsedJson.prompts &&
      Array.isArray(parsedJson.prompts) &&
      parsedJson.prompts.length > 0
    ) {
      return parsedJson.prompts;
    } else {
      throw new Error("Generated JSON is missing the 'prompts' array.");
    }
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini:", response.text);
    throw new Error("The AI returned an invalid response format.");
  }
};

/**
 * Simplified wrapper for single image generation
 */
export async function generateImage(params: {
  sourceImageBase64: string;
  referenceImageBase64?: string;
  prompt: string;
  modelType: "free" | "pro";
  targetWidth: number;
  targetHeight: number;
}): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const sourceImage: SourceImage = {
      base64:
        params.sourceImageBase64.split(",")[1] || params.sourceImageBase64,
      mimeType: "image/png",
      dataUrl: params.sourceImageBase64,
      name: "source.png",
    };

    const referenceImage = params.referenceImageBase64
      ? {
          base64:
            params.referenceImageBase64.split(",")[1] ||
            params.referenceImageBase64,
          mimeType: "image/png",
          dataUrl: params.referenceImageBase64,
          name: "reference.png",
        }
      : null;

    let imageQuality: "1K" | "2K" | "4K" = "1K";
    if (params.targetWidth >= 4096 || params.targetHeight >= 4096) {
      imageQuality = "4K";
    } else if (params.targetWidth >= 2048 || params.targetHeight >= 2048) {
      imageQuality = "2K";
    }

    const results = await generateImages(
      sourceImage,
      params.prompt,
      "exterior",
      1,
      "1:1",
      referenceImage,
      false,
      false,
      params.modelType,
      imageQuality
    );

    if (results && results.length > 0) {
      return { success: true, imageUrl: results[0] };
    } else {
      return { success: false, error: "No image generated" };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
