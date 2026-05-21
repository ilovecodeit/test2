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
import { Sparkles, RefreshCw, AlertTriangle, Play, HelpCircle, PackageOpen } from "lucide-react";
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

  // Handle Preset select
  const handleSelectPreset = (url: string, name: string, description: string) => {
    setOriginalImage(url);
    // Extract ID based on URL text
    if (url.includes("nano-banana")) {
      setImageSelectId("nano-banana");
    } else if (url.includes("cyber-robot")) {
      setImageSelectId("cyber-robot");
    } else {
      setImageSelectId("retro-sunset");
    }
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

  // Primary Generator Executor Call
  const handleGenerateMockup = async () => {
    if (!originalImage || !productName.trim() || !user) return;
    setIsGenerating(true);
    setLastError(null);
    setCurrentGeneratedMockup(null);

    try {
      const res = await fetch("/api/gemini/generate-mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalImage,
          medium: selectedMedium,
          productName,
          productDescription
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "나노 바나나 목업 시뮬레이션 서버 연산 도중 에러 발생");
      }

      const responseData = await res.json();
      if (responseData.success && responseData.mockupImage) {
        setCurrentGeneratedMockup(responseData.mockupImage);

        // Instant write to user history database in firestore
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
            mockupImage: responseData.mockupImage,
            prompt: responseData.prompt,
            createdAt: serverTimestamp() // server time is mandatory
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, mockupPath);
        }
      } else {
        throw new Error("서버 응답에 유효한 목업 이미지 바이트가 존재하지 않습니다.");
      }
    } catch (err: any) {
      console.error(err);
      setLastError(err.message || "생성 중 에러가 발생했습니다.");
    } finally {
      setIsGenerating(false);
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

            {/* AI Generator Realtime output block */}
            {(isGenerating || currentGeneratedMockup || lastError) && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center space-y-4">
                <h4 className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 border-b border-slate-100 pb-2.5 uppercase tracking-wider">
                  <span>실시간 AI 합성 렌더링 시뮬레이션</span>
                  {isGenerating && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>}
                </h4>

                <div className="bg-slate-950 aspect-square rounded-lg overflow-hidden border border-slate-200 shadow-inner relative flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div
                        key="generating-spinner"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center max-w-xs px-4 space-y-3.5"
                      >
                        <RefreshCw size={28} className="text-blue-500 animate-spin" />
                        <div>
                          <p className="text-xs font-bold text-white">합성 및 레이아웃 자동화 렌더러 동작 중</p>
                          <p className="text-[10px] text-slate-400 mt-1 lines-clamp-3 leading-relaxed">
                            에디션 디자인의 투영 각도 파악 및 정밀 머티리얼 광학 매핑 작업을 수행하고 있습니다. 최대 약 1분이 소요될 수 있습니다.
                          </p>
                        </div>
                      </motion.div>
                    ) : lastError ? (
                      <motion.div
                        key="error-box"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center text-red-400 max-w-xs px-4 space-y-2.5"
                      >
                        <AlertTriangle size={28} className="text-red-500" />
                        <div>
                          <p className="text-xs font-bold text-white">서버 오류가 발생했습니다</p>
                          <p className="text-[10px] text-red-300 bg-red-950/40 p-2.5 rounded-lg border border-red-900/30 font-mono mt-1 text-center select-all max-h-36 overflow-y-auto">
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
                        style={{ contentVisibility: "auto" }}
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
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            )}
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
