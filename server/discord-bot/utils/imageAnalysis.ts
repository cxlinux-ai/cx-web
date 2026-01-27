/**
 * Image & Screenshot Analysis
 *
 * Uses Claude's vision capabilities to analyze images,
 * screenshots, error messages, and UI issues.
 */

import Anthropic from "@anthropic-ai/sdk";
import { Message, Attachment } from "discord.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Supported image types
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

interface ImageAnalysisResult {
  success: boolean;
  analysis: string;
  imageCount: number;
}

/**
 * Check if attachment is a supported image
 */
export function isSupportedImage(attachment: Attachment): boolean {
  const contentType = attachment.contentType || "";
  return SUPPORTED_IMAGE_TYPES.some((type) => contentType.startsWith(type));
}

/**
 * Extract images from a Discord message
 */
export function extractImages(message: Message): Attachment[] {
  return Array.from(message.attachments.values()).filter(isSupportedImage);
}

/**
 * Check if message has images to analyze
 */
export function hasImages(message: Message): boolean {
  return extractImages(message).length > 0;
}

/**
 * Download image and convert to base64
 */
async function imageToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

/**
 * Analyze images in a message using Claude Vision
 */
export async function analyzeImages(
  message: Message,
  userQuestion: string
): Promise<ImageAnalysisResult> {
  const images = extractImages(message);

  if (images.length === 0) {
    return {
      success: false,
      analysis: "",
      imageCount: 0,
    };
  }

  try {
    // Build content array with images
    const content: Anthropic.ContentBlockParam[] = [];

    // Add images (limit to 4 for cost/performance)
    for (const image of images.slice(0, 4)) {
      const base64 = await imageToBase64(image.url);
      const mediaType = (image.contentType || "image/jpeg").split(";")[0] as
        | "image/jpeg"
        | "image/png"
        | "image/gif"
        | "image/webp";

      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: base64,
        },
      });
    }

    // Add user's question
    const questionText = userQuestion || "What's in this image? Please analyze it.";
    content.push({
      type: "text",
      text: questionText,
    });

    // Call Claude with vision
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // Use Sonnet for vision (good balance)
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content,
        },
      ],
      system: `You are a helpful assistant analyzing images for users.
If the image shows an error message or technical issue:
- Identify the error clearly
- Explain what it means in simple terms
- Suggest potential solutions

If it's a screenshot of UI:
- Describe what you see
- Point out any issues or suggestions

If it's a general image:
- Describe it helpfully in context of Cortex Linux if relevant

Keep responses concise but thorough.`,
    });

    const textContent = response.content.find((block) => block.type === "text");
    const analysis = textContent?.type === "text" ? textContent.text : "Unable to analyze image.";

    console.log(`[ImageAnalysis] Analyzed ${images.length} image(s)`);

    return {
      success: true,
      analysis,
      imageCount: images.length,
    };
  } catch (error: any) {
    console.error("[ImageAnalysis] Error:", error.message);
    return {
      success: false,
      analysis: "Sorry, I couldn't analyze the image. Please try again.",
      imageCount: images.length,
    };
  }
}

/**
 * Get image analysis prompt enhancement
 */
export function getImagePromptContext(imageCount: number): string {
  if (imageCount === 0) return "";
  return `\n\n[User has attached ${imageCount} image(s) - analysis included above]`;
}

export default {
  isSupportedImage,
  extractImages,
  hasImages,
  analyzeImages,
  getImagePromptContext,
};
