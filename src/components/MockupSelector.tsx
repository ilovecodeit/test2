import React from "react";
import { Sparkles, ShoppingBag, Layout, Image as ImageIcon } from "lucide-react";

export type MediumType = "mug" | "billboard" | "tshirt" | "phone_case" | "totebag";

interface MediumOption {
  id: MediumType;
  emoji: string;
  name: string;
  description: string;
  badge: string;
}

const MEDIUMS: MediumOption[] = [
  {
    id: "tshirt",
    emoji: "👕",
    name: "프리미엄 코튼 티셔츠",
    description: "로프트 스튜디오에 배치된 심플 화이트 티셔츠 목업",
    badge: "의류 광고"
  },
  {
    id: "mug",
    emoji: "☕",
    name: "세라믹 커피 머그잔",
    description: "테이블 위 감성적인 아침 분위기가 흐르는 머그잔 목업",
    badge: "생활 굿즈"
  },
  {
    id: "billboard",
    emoji: "🏙️",
    name: "도심 전광판 (빌보드)",
    description: "화려한 미래 도심의 야경 속에 배치된 거대 스크린 광고",
    badge: "옥외 광고"
  },
  {
    id: "phone_case",
    emoji: "📱",
    name: "글로시 휴대폰 케이스",
    description: "미니멀 스팟조명 아래 정밀 앵글로 배치된 기기 에셋 목업",
    badge: "테크 주변기기"
  },
  {
    id: "totebag",
    emoji: "🛍️",
    name: "에코 린넨 토트백",
    description: "감성적인 나무 가구와 나뭇잎 햇살자가 내려앉은 에코백 목업",
    badge: "잡화 패션"
  }
];

interface MockupSelectorProps {
  productName: string;
  setProductName: (val: string) => void;
  productDescription: string;
  setProductDescription: (val: string) => void;
  selectedMedium: MediumType;
  setSelectedMedium: (val: MediumType) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  hasImage: boolean;
  isLoggedIn: boolean;
  onLoginRequest: () => void;
}

export const MockupSelector: React.FC<MockupSelectorProps> = ({
  productName,
  setProductName,
  productDescription,
  setProductDescription,
  selectedMedium,
  setSelectedMedium,
  onGenerate,
  isGenerating,
  hasImage,
  isLoggedIn,
  onLoginRequest
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
        <Layout size={18} className="text-blue-600" />
        <h3 className="text-sm font-bold text-slate-800">목업 디자인 및 매체 설계</h3>
      </div>

      {/* Product Information Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="input-product-name">
            상품 개발명 (필수)
          </label>
          <input
            id="input-product-name"
            type="text"
            required
            placeholder="예시: 나노 바나나 무선 충전 패드"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full text-xs font-medium px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100/40 bg-slate-50/50 hover:bg-white text-slate-800 transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5" htmlFor="input-product-desc">
            상품 추가 상세 정보 (선택)
          </label>
          <textarea
            id="input-product-desc"
            placeholder="예시: 옐로우 앤 블랙 하이테크 미래주의 패셔너블한 분위기를 전달하는 소형 전자기기 크리에이티브."
            rows={2}
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            className="w-full text-xs font-medium px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100/40 bg-slate-50/50 hover:bg-white text-slate-800 transition-all placeholder:text-slate-400 resize-none font-sans"
          />
        </div>
      </div>

      {/* Grid of medium select cards */}
      <div className="space-y-3">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">시뮬레이션할 브랜드 매체 선택</label>
        <div className="grid grid-cols-1 gap-2.5">
          {MEDIUMS.map((med) => {
            const isSelected = selectedMedium === med.id;
            return (
              <button
                key={med.id}
                onClick={() => setSelectedMedium(med.id)}
                className={`flex items-center justify-between text-left p-3.5 rounded-xl border cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/10 shadow-sm font-semibold"
                    : "border-slate-100 hover:border-slate-200 bg-white"
                }`}
                id={`medium-${med.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-xl w-10 h-10 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100">
                    {med.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 leading-tight">{med.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-500"
                      }`}>
                        {med.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{med.description}</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-250"
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2">
        {!isLoggedIn ? (
          <button
            onClick={onLoginRequest}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white transition-all duration-300 shadow-lg shadow-blue-100/10 cursor-pointer"
            id="btn-login-to-generate"
          >
            <span>Google 로그인 후 생성하기</span>
          </button>
        ) : (
          <button
            onClick={onGenerate}
            disabled={isGenerating || !hasImage || !productName.trim()}
            className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-3.5 px-4 rounded-xl text-white transition-all duration-300 shadow-md ${
              isGenerating
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200"
                : !hasImage
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200"
                : !productName.trim()
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200"
                : "bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/10 scale-100 active:scale-[0.98] cursor-pointer"
            }`}
            id="btn-generate-mockup"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>시각화 생성 실행 중...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>시각화 생성 시작하기</span>
              </>
            )}
          </button>
        )}
        {!hasImage && isLoggedIn && (
          <p className="text-[10px] text-rose-500 font-medium text-center mt-2.5">
            * 상단 프리셋 에셋을 선택하거나 컴퓨터 파일 업로드를 수행해주세요.
          </p>
        )}
        {hasImage && !productName.trim() && isLoggedIn && (
          <p className="text-[10px] text-blue-600 font-medium text-center mt-2.5">
            * 상품 개발명을 입력해야 시뮬레이션 생성이 활성화됩니다.
          </p>
        )}
      </div>
    </div>
  );
};
