import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Lazy initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY가 설정되지 않았습니다. AI Studio 설정에서 API 키를 등록해주세요.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Global middlewares
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Express backend API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/gemini/generate-mockup", async (req, res): Promise<any> => {
  try {
    const { originalImage, medium, productName, productDescription } = req.body;

    if (!originalImage) {
      return res.status(400).json({ error: "원본 상품 이미지 데이터가 필요합니다." });
    }
    if (!medium) {
      return res.status(400).json({ error: "시각화할 매체 정보가 필요합니다." });
    }

    // Parse base64
    const base64Regex = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/;
    const match = originalImage.match(base64Regex);
    let mimeType = "image/png";
    let base64Data = originalImage;
    if (match) {
      mimeType = match[1];
      base64Data = match[2];
    }

    let promptText = "";
    switch (medium) {
      case "mug":
        promptText = `
          Create a professional close-up product mockup of a white ceramic coffee mug with the provided graphic beautifully printed on its side.
          The mug should be standing elegantly on a clean wooden desk or cafe counter, surrounded by natural daylight and gentle bokeh.
          The graphic must align perfectly with the mug's curvature, look organic and seamlessly fused with the ceramic surface, with subtle reflections.
          Context: Product is named "${productName}". ${productDescription ? `Description: ${productDescription}` : "A gorgeous creative design."}
          Photorealistic, cinematic lighting, 8k resolution, minimalist commercial photoshoot aesthetic.
        `;
        break;
      case "billboard":
        promptText = `
          Showcase the provided graphic advertisement perfectly placed on a massive, modern outdoor digital led billboard.
          The billboard is situated in a vibrant street corner of a futuristic city (like downtown Gangnam or Tokyo) at night, with streetlights, glowing neon storefront signs, and long exposure light trails from city traffic.
          The graphic displays cleanly on the glowing billboard screen with correct spatial perspective, matching the high contrast city environment.
          Context: Product is named "${productName}". ${productDescription ? `Description: ${productDescription}` : "Creative premium brand."}
          Cinematic night photography, architectural scale mockup, ultra realistic details.
        `;
        break;
      case "tshirt":
        promptText = `
          Visualize the provided graphic design printed beautifully onto the front of a high-quality modern organic cotton t-shirt.
          The t-shirt is neatly displayed in a clean, modern lifestyle studio photography setting, either flat-laid on concrete or worn by a stylish model in a minimalistic loft.
          The graphic printed on the t-shirt must display natural fabric folds, cloth texture, showing rich details and realistic physical overlay.
          Context: Product is named "${productName}". ${productDescription ? `Description: ${productDescription}` : "Custom graphic garment."}
          Minimalist streetwear fashion style, professional e-commerce product mockup, high contrast studio lighting.
        `;
        break;
      case "phone_case":
        promptText = `
          Create an industrial design product catalog shot of a premium, glass-finish sleek smartphone case with the provided graphic fully printed on social background.
          The case lies on a neat concrete or slate block tray, lit with elegant white key lights presenting neat shadows.
          The design covers the case surface organically and displays premium touch, with accurate lens framing and physical buttons reflections.
          Context: Product is named "${productName}". ${productDescription ? `Description: ${productDescription}` : "Modern premium tech design."}
          High-end accessory visual, photorealistic render.
        `;
        break;
      case "totebag":
        promptText = `
          Create a minimalist promotional visual of an eco-friendly raw linen canvas tote bag with the provided logo printed cleanly on the front.
          The tote bag is hung on a rustic wooden peg against an off-white plaster wall, under the beautiful shadows of tropical leaves.
          The printed graphic preserves the coarse fabric weave texture for a highly organic and natural eco-fashion appearance.
          Context: Product is named "${productName}". ${productDescription ? `Description: ${productDescription}` : "Minimal brand layout."}
          Scandi-interior lifestyle design, clean, warm earthy warm palette.
        `;
        break;
      default:
        promptText = `
          A professional mockup photo of the design placed on a white promotional product container.
          High-quality, realistic lighting.
        `;
    }

    const ai = getGeminiClient();
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    let mockupBase64 = "";
    const candidates = result.candidates;
    if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          mockupBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!mockupBase64) {
      return res.status(500).json({
        error: "이미지 생성 실패: 모델이 적절한 이미지를 반환하지 않았습니다. API 구성을 확인하세요.",
      });
    }

    res.json({
      success: true,
      mockupImage: `data:image/png;base64,${mockupBase64}`,
      prompt: promptText,
    });
  } catch (err: any) {
    console.error("Gemini Mockup Error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "알 수 없는 에러가 발생했습니다.",
    });
  }
});

// Configure Vite or Static server
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Failed to start server:", err);
});
