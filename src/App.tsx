/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "./components/Header";
import { PresetProducts } from "./components/PresetProducts";
import { UploadArea } from "./components/UploadArea";
import { MockupSelector, MediumType } from "./components/MockupSelector";
import { HistoryList, DetailModal } from "./components/HistoryList";
import { db, auth } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { Sparkles, RefreshCw, AlertTriangle, Play, HelpCircle, PackageOpen, Image as ImageIcon } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import type { UserProfile, MockupHistory } from "./types";

enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Form states
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [imageSelectId, setImageSelectId] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [selectedMedium, setSelectedMedium] = useState<MediumType>("tshirt");

  // Interaction states
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneratedMockup, setCurrentGeneratedMockup] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [history, setHistory] = useState<MockupHistory[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<MockupHistory | null>(null);

  // AI Instant Slogan & Tabbed Studio states
  const [activeTab, setActiveTab] = useState<"image" | "text">("image");
  const [sloganPrompt, setSloganPrompt] = useState("");
  const [sloganTone, setSloganTone] = useState("trendy"); 
  const [generatedSlogan, setGeneratedSlogan] = useState("");
  const [isGeneratingSlogan, setIsGeneratingSlogan] = useState(false);
  const [sloganError, setSloganError] = useState("");

  // Firestore error handler helper
  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
      },
      operationType,
      path
    };
    console.error("Firestore Error: ", JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  // Listen to Auth State
  useEffect(() => {
    return onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const profile: UserProfile = {
          userId: currentUser.uid,
          displayName: currentUser.displayName || "개발자",
          photoURL: currentUser.photoURL || undefined,
          createdAt: new Date().toISOString()
        };
        setUser(profile);

        // Check if user document already exists, if not write once to fulfill validation check
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          const userSnap = await getDoc(userDocRef);
          if (!userSnap.exists()) {
            await setDoc(userDocRef, {
              userId: currentUser.uid,
              displayName: profile.displayName,
              photoURL: profile.photoURL || "",
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });
  }, []);

  // Listen to Mockup History Stream from Firestore
  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const mockupPath = `users/${user.userId}/mockups`;
    const q = query(collection(db, "users", user.userId, "mockups"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: MockupHistory[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: data.id,
          userId: data.userId,
          originalImage: data.originalImage,
          productName: data.productName,
          productDescription: data.productDescription || "",
          medium: data.medium,
          mockupImage: data.mockupImage,
          prompt: data.prompt || "",
          createdAt: data.createdAt
            ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt)
            : new Date().toISOString()
        });
      });
      setHistory(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, mockupPath);
    });

    return () => unsubscribe();
  }, [user]);

  // Sync slogan input when product name changes initially
  useEffect(() => {
    if (productName && !sloganPrompt) {
      setSloganPrompt(productName);
    }
  }, [productName]);

  // Handle Preset select
  const handleSelectPreset = (url: string, name: string, description: string, id: string) => {
    setOriginalImage(url);
    setImageSelectId(id);
    setProductName(name);
    setProductDescription(description);
    setLastError(null);
  };

  // Handle image upload loaded
  const handleImageLoaded = (base64: string) => {
    setOriginalImage(base64);
    setImageSelectId("custom-upload");
    setLastError(null);
  };

  // Reset current uploader image
  const clearUploadedImage = () => {
    setOriginalImage(null);
    setImageSelectId(null);
    setProductName("");
    setProductDescription("");
  };

  // Google quick popup login trigger
  const triggerGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Popup Auth Error:", error);
    }
  };

  // Delete generated mockup action from history list
  const handleDeleteHistory = async (mockupId: string) => {
    if (!user) return;
    const mockupPath = `users/${user.userId}/mockups/${mockupId}`;
    try {
      if (confirm("이 목업 비주얼 기록을 영구 삭제하시겠습니까?")) {
        await deleteDoc(doc(db, "users", user.userId, "mockups", mockupId));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, mockupPath);
    }
  };

  // Primary Generator Executor Call (Client-side Direct Generation)
  const handleGenerateMockup = async () => {
    if (!originalImage || !productName.trim() || !user) return;
    setIsGenerating(true);
    setLastError(null);
    setCurrentGeneratedMockup(null);

    try {
      // SECURITY WARNING: Calling Gemini API directly from the client exposes the API key configuration.
      // This has been implemented on the client as explicitly requested by USER INTENT ("백엔드 서버는 두지 마").
      // @ts-ignore
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY가 설정되지 않았습니다. AI Studio 또는 .env 환경 설정에서 Secrets를 구성해주세요.");
      }

      // Initialize Gemini Client inside the browser
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Map choice to professional prompts
      let promptText = "";
      switch (selectedMedium) {
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

      // Parse original image url (whether preset svg png or custom upload base64)
      const base64Regex = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/;
      const match = originalImage.match(base64Regex);
      let mimeType = "image/png";
      let base64Data = originalImage;
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }

      // Execute content generation with gemini-2.5-flash-image
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
        throw new Error("이미지 생성 실패: 모델이 적절한 목업 이미지를 반환하지 않았습니다. API 구성을 확인하세요.");
      }

      const generatedImgUrl = `data:image/png;base64,${mockupBase64}`;
      setCurrentGeneratedMockup(generatedImgUrl);

      // Save to Firebase history
      const mockupId = "mock-" + Math.random().toString(36).substring(2, 12);
      const mockupPath = `users/${user.userId}/mockups/${mockupId}`;
      try {
        await setDoc(doc(db, "users", user.userId, "mockups", mockupId), {
          id: mockupId,
          userId: user.userId,
          originalImage,
          productName,
          productDescription,
          medium: selectedMedium,
          mockupImage: generatedImgUrl,
          prompt: promptText,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, mockupPath);
      }
    } catch (err: any) {
      console.error(err);
      setLastError(err.message || "생성 중 에러가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Fast AI Slogan/Text Generation (using gemini-3.5-flash) for instant verification
  const handleGenerateSlogan = async () => {
    const textToUse = sloganPrompt.trim() || productName.trim();
    if (!textToUse) {
      setSloganError("시작할 브랜드 이름이나 키워드가 구성되지 않았습니다.");
      return;
    }
    setIsGeneratingSlogan(true);
    setSloganError("");
    setGeneratedSlogan("");

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY가 설정되지 않았습니다. AI Studio 또는 환경 설정에서 Secrets를 구성해주세요.");
      }

      // Initialize Gemini Client inside the browser
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const voiceTones: Record<string, string> = {
        trendy: "젊은 타겟의 힙하고 세련된 한 줄 슬로건 광고 문구",
        luxury: "고급스럽고 미니멀하며 깊이감 있는 하이엔드 브랜드 카피",
        humorous: "웃음 포인트를 유쾌하게 저격하면서 기발함이 넘치는 반전 문구",
        emotional: "마음을 따스하게 울리고 아늑한 새벽 감성을 불어넣는 힐링 카피"
      };

      const selectedToneText = voiceTones[sloganTone] || voiceTones.trendy;

      const prompt = `
        당신은 실력 있는 브랜드 매니저이자 마케팅 카피라이터입니다.
        아래 제품/브랜드 키워드 정보를 살려 감각 있고 기발한 슬로건과 숏카피를 한글로 추천해 주세요.

        - 대상 키워드: "${textToUse}"
        - 요구 톤앤매너: ${selectedToneText}

        [형식 조건]:
        1. 메인 한줄 카피 3가지 (각각 다르고 개성적일 것)
        2. 이 키워드에 인스타그램 업로드에 추천하는 해시태그 3개
        3. 장황한 인사말이나 서론, 부가설명은 전부 삭제하고, 아주 깔끔하고 감각적인 레이아웃으로 출력해 주세요.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      if (response && response.text) {
        setGeneratedSlogan(response.text);
      } else {
        throw new Error("AI 엔진으로부터 유효한 텍스트 응답을 가져오지 못했습니다.");
      }
    } catch (err: any) {
      console.error(err);
      setSloganError(err.message || "문구 생성 중 에러가 발생했습니다.");
    } finally {
      setIsGeneratingSlogan(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      {/* Header navbar overlay */}
      <Header user={user} loadingAuth={loadingAuth} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Help introductory banner card */}
        <div className="bg-slate-900 text-white rounded-xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-gradient-to-br from-blue-600 to-indigo-800 opacity-20 rounded-full blur-2xl" />
          <div className="space-y-2 text-left relative z-10 max-w-2xl">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight leading-tight flex items-center gap-2">
              <span>나노 바나나 일관성 마케팅 <span className="text-blue-400">비주얼라이저</span></span>🍌
            </h2>
            <p className="text-xs md:text-sm font-medium opacity-80 leading-relaxed text-slate-300">
              업로드한 브랜드 컨셉 이미지나 로고 그래픽을 일관되게 유지하면서 커피 머그잔, 현대식 도심 빌보드 전광판, 데일리 오가닉 티셔츠 등 실제 마케팅 판매 채널에서의 사실감 있는 홍보물로 시뮬레이션하고 영구 보전합니다.
            </p>
          </div>
          <div className="flex shrink-0 gap-3 relative z-10">
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-center min-w-24">
              <span className="block text-lg font-black leading-none text-blue-400">100%</span>
              <span className="text-[10px] opacity-70 mt-1 block">브랜드 일치</span>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-center min-w-24">
              <span className="block text-lg font-black leading-none text-emerald-400">Real</span>
              <span className="text-[10px] opacity-70 mt-1 block">크리에이티브</span>
            </div>
          </div>
        </div>

        {/* Content workflow mapping */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT DESIGN SPACE (Input selectors) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Preset Products helper */}
            <PresetProducts
              onSelect={handleSelectPreset}
              selectedId={imageSelectId}
            />

            {/* 2. Drag and drop file select block */}
            <UploadArea
              onImageLoaded={handleImageLoaded}
              imageUrl={originalImage}
              clearImage={clearUploadedImage}
            />
          </div>

          {/* RIGHT PREVIEW & TRIGGERS (Actions panels) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 3. Parameter and medium selection form */}
            <MockupSelector
              productName={productName}
              setProductName={setProductName}
              productDescription={productDescription}
              setProductDescription={setProductDescription}
              selectedMedium={selectedMedium}
              setSelectedMedium={setSelectedMedium}
              onGenerate={handleGenerateMockup}
              isGenerating={isGenerating}
              hasImage={!!originalImage}
              isLoggedIn={!!user}
              onLoginRequest={triggerGoogleLogin}
            />

            {/* AI Generator & Copywriter Studio Block */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              {/* Tab headers */}
              <div className="flex border-b border-slate-100 pb-1 justify-between items-center">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab("image")}
                    className={`pb-2.5 text-xs font-bold transition-all border-b-2 relative uppercase tracking-wider ${
                      activeTab === "image"
                        ? "text-blue-600 border-blue-600 font-extrabold"
                        : "text-slate-400 border-transparent hover:text-slate-650"
                    }`}
                  >
                    🖼️ 목업 이미지 합성
                  </button>
                  <button
                    onClick={() => setActiveTab("text")}
                    className={`pb-2.5 text-xs font-bold transition-all border-b-2 relative uppercase tracking-wider flex items-center gap-1 ${
                      activeTab === "text"
                        ? "text-blue-600 border-blue-600 font-extrabold"
                        : "text-slate-400 border-transparent hover:text-slate-650"
                    }`}
                  >
                    ✍️ 초고속 홍보 카피라이터
                    <span className="bg-emerald-100 text-emerald-850 text-[8px] font-black px-1.5 py-0.5 rounded-full scale-90 uppercase tracking-normal">
                      Instant (1초)
                    </span>
                  </button>
                </div>
                
                {activeTab === "image" && isGenerating && (
                  <span className="flex h-1.5 w-1.5 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                  </span>
                )}
                {activeTab === "text" && isGeneratingSlogan && (
                  <span className="flex h-1.5 w-1.5 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "image" ? (
                  <motion.div
                    key="image-tab-content"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="space-y-4"
                  >
                    <div className="bg-slate-950 aspect-square rounded-lg overflow-hidden border border-slate-200 shadow-inner relative flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        {isGenerating ? (
                          <motion.div
                            key="generating-spinner"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center max-w-xs px-4 text-center space-y-3.5"
                          >
                            <RefreshCw size={28} className="text-blue-500 animate-spin" />
                            <div>
                              <p className="text-xs font-bold text-white">합성 및 레이아웃 자동화 렌더러 동작 중</p>
                              <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                                에디션 디자인의 투영 각도 파악 및 정밀 머티리얼 광학 매핑 작업을 수행하고 있습니다. 이미지 생성은 보통 15초~30초 가량 소요됩니다.
                              </p>
                            </div>
                          </motion.div>
                        ) : lastError ? (
                          <motion.div
                            key="error-box"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center text-red-400 max-w-xs px-4 text-center space-y-2.5"
                          >
                            <AlertTriangle size={28} className="text-red-500" />
                            <div>
                              <p className="text-xs font-bold text-white">렌더링 오류가 발생했습니다</p>
                              <p className="text-[10px] text-red-300 bg-red-950/40 p-2.5 rounded-lg border border-red-900/40 font-mono mt-1 text-center select-all max-h-36 overflow-y-auto">
                                {lastError}
                              </p>
                            </div>
                          </motion.div>
                        ) : currentGeneratedMockup ? (
                          <motion.div
                            key="mockup-img"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full relative group"
                          >
                            <img
                              src={currentGeneratedMockup}
                              alt="AI generated mockup Output"
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute bottom-3 left-3 bg-emerald-600 text-white px-2.5 py-1 rounded text-[9px] font-extrabold shadow-md select-none tracking-wide">
                              🎉 합성 렌더링 완료!
                            </div>
                          </motion.div>
                        ) : (
                          <div className="flex flex-col items-center text-slate-400 text-center max-w-xs px-4 space-y-2">
                            <ImageIcon size={32} className="opacity-40 text-slate-350" />
                            <p className="text-xs font-bold text-slate-200">목업 디자인 시뮬레이션 대기 중</p>
                            <p className="text-[10px] text-slate-500 leading-normal">
                              왼쪽에서 원본 브랜드 그래픽을 갖춘 뒤, 상단 폼의 &apos;시각화 생성 시작하기&apos; 버튼을 클릭하면 실시간 AI 렌더링 합성이 전개됩니다.
                            </p>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="text-tab-content"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="space-y-4 text-left"
                  >
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 space-y-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                          브랜드 이름 또는 한글 단어 입력
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="예시: 나노 바나나"
                            value={sloganPrompt}
                            onChange={(e) => setSloganPrompt(e.target.value)}
                            className="bg-white border border-slate-200 rounded-md text-xs px-2.5 py-2 w-full outline-none focus:border-blue-500 text-slate-800 font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => setSloganPrompt(productName || "")}
                            className="shrink-0 text-[10px] bg-slate-250 hover:bg-slate-300 text-slate-700 font-extrabold px-2.5 py-2 rounded-md transition-colors"
                          >
                            상품명 복사
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                          수행할 마케팅 문구의 톤 구성
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: "trendy", label: "🔥 MZ 힙한 트렌디" },
                            { id: "luxury", label: "💎 하이엔드 럭셔리" },
                            { id: "humorous", label: "😄 유쾌한 드립전쟁" },
                            { id: "emotional", label: "🌙 아늑한 새벽감성" }
                          ].map((tone) => (
                            <button
                              key={tone.id}
                              type="button"
                              onClick={() => setSloganTone(tone.id)}
                              className={`text-[10px] font-bold py-1.5 px-2.5 rounded-md border text-center transition-all ${
                                sloganTone === tone.id
                                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {tone.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateSlogan}
                        disabled={isGeneratingSlogan}
                        className="w-full text-xs font-extrabold py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        {isGeneratingSlogan ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" />
                            <span>AI 찰나의 고민 중 (1초)...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} />
                            <span>초고속 AI 카피 합성하기 (1초 완료)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Slogan response output board */}
                    <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 min-h-[140px] flex flex-col justify-between">
                      {isGeneratingSlogan ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-center py-4">
                          <RefreshCw size={24} className="text-emerald-500 animate-spin" />
                          <p className="text-[10px] text-emerald-405 font-mono animate-pulse">GENERATING IN REAL-TIME...</p>
                        </div>
                      ) : sloganError ? (
                        <div className="text-red-400 text-center py-4 space-y-1">
                          <AlertTriangle size={18} className="mx-auto text-red-500" />
                          <p className="text-[11px] font-extrabold text-red-400">오류 발생</p>
                          <p className="text-[10px] text-red-300 font-mono">{sloganError}</p>
                        </div>
                      ) : generatedSlogan ? (
                        <div className="space-y-3 flex-1 flex flex-col justify-between">
                          <div className="text-xs text-white leading-relaxed font-medium whitespace-pre-wrap font-sans max-h-48 overflow-y-auto selection:bg-emerald-800 selection:text-white pr-1">
                            {generatedSlogan}
                          </div>
                          
                          <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between">
                            <span className="text-[9px] text-emerald-400 font-extrabold flex items-center gap-1">
                              ⚡ Gemini 3.5 Flash 즉각 응답 성공!
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                // Extract and set back to product description
                                const cleanSlogan = generatedSlogan.replace(/(\*|#|##)/g, "").trim();
                                setProductDescription(cleanSlogan);
                                setActiveTab("image"); // return back and show description
                              }}
                              className="text-[9.5px] font-bold text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors flex items-center gap-1"
                            >
                              💡 본 슬로건을 상품설명에 적용
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-6">
                          <p className="text-xs font-bold text-slate-400">카피라이터 합성 대기 중</p>
                          <p className="text-[9.5px] text-slate-500 max-w-xs mt-1 leading-normal">
                            아이디어가 궁할 땐, 한글 단어나 브랜드명을 입력하고 합성 버튼을 눌러보세요. 1초만에 강력한 AI 연산이 증명됩니다!
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* CLOUD HISTORIES ROW */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          {!user ? (
            <div className="py-8 text-center max-w-sm mx-auto space-y-4">
              <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-200 mx-auto shadow-sm">
                <PackageOpen size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">클라우드 동기화 시스템 연결제안</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  나노 바나나 목업 시뮬레이션 결과 데이터를 Google OAuth 기기로 영구히 마스터 보존하는 계정 로그인 기능입니다.
                </p>
              </div>
              <button
                onClick={triggerGoogleLogin}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-md cursor-pointer transition-colors"
                id="btn-login-history"
              >
                <span>Google 계정 연동하기</span>
              </button>
            </div>
          ) : (
            <HistoryList
              history={history}
              onDelete={handleDeleteHistory}
              onSelectHistory={setSelectedHistoryItem}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50/50 py-6 text-center select-none mt-auto">
        <p className="text-[10px] text-slate-400 font-mono">
          © 2026 나노 바나나 목업 AI 비주얼라이저 (Product Mockup AI Visualizer). Powered by Google Gemini 2.5 Flash Image.
        </p>
      </footer>

      {/* Detail viewer modal */}
      <AnimatePresence>
        {selectedHistoryItem && (
          <DetailModal
            item={selectedHistoryItem}
            onClose={() => setSelectedHistoryItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
