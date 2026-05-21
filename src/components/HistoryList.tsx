import React from "react";
import { Trash2, Calendar, Layout, Eye, Download, X } from "lucide-react";
import type { MockupHistory } from "../types";

interface HistoryListProps {
  history: MockupHistory[];
  onDelete: (id: string) => void;
  onSelectHistory: (item: MockupHistory) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onDelete, onSelectHistory }) => {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mx-auto mb-3 border border-gray-100">
          <Layout size={20} />
        </div>
        <h4 className="text-xs font-bold text-gray-800">생성된 비주얼 히스토리가 없습니다</h4>
        <p className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
          목업 매체를 설계하고 생성 버튼을 누르면 나노 바나나 메카닉 AI 결과물이 여기에 클라우드 자동저장됩니다!
        </p>
      </div>
    );
  }

  const getMediumLabel = (medium: string) => {
    switch (medium) {
      case "mug":
        return "☕ 머그잔 목업";
      case "billboard":
        return "🏙️ 야간 전광판";
      case "tshirt":
        return "👕 티셔츠 에셋";
      case "phone_case":
        return "📱 스마트폰 케이스";
      case "totebag":
        return "🛍️ 토트 가방";
      default:
        return "📦 상품 목업";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
          <span>나의 클라우드 생성 보관함</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
            {history.length}개 저장됨
          </span>
        </h3>
        <p className="text-[10px] text-gray-400">Firebase와 연동되어 실시간 암호화 보관됩니다.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white rounded-2xl border border-gray-150 p-3 hover:border-gray-900 transition-all duration-300 shadow-sm hover:shadow-md"
            style={{ contentVisibility: "auto" }}
          >
            {/* Image Preview Container */}
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-950 border border-gray-100 relative mb-3">
              <img
                src={item.mockupImage}
                alt={item.productName}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                referrerPolicy="no-referrer"
              />

              {/* Badges Overlay */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                <span className="text-[9px] font-extrabold bg-gray-900/90 text-white px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm">
                  {getMediumLabel(item.medium)}
                </span>
              </div>

              {/* Action Overlays */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <button
                  onClick={() => onSelectHistory(item)}
                  className="w-10 h-10 rounded-full bg-white text-gray-900 hover:bg-amber-400 hover:text-amber-950 flex items-center justify-center shadow-md transition-all scale-95 group-hover:scale-100 duration-200 cursor-pointer"
                  title="자세히 보기"
                  id={`btn-view-${item.id}`}
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="w-10 h-10 rounded-full bg-white text-red-600 hover:bg-red-50 flex items-center justify-center shadow-md transition-all scale-95 group-hover:scale-100 duration-200 cursor-pointer"
                  title="삭제하기"
                  id={`btn-delete-${item.id}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* General Info */}
            <div className="px-1 text-left">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-extrabold text-gray-900 truncate">
                  {item.productName}
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0 select-none">
                  <Calendar size={10} />
                  <span>{new Date(item.createdAt).toLocaleDateString("ko-KR")}</span>
                </div>
              </div>
              {item.productDescription && (
                <p className="text-[10px] text-gray-500 line-clamp-1 mt-1 leading-snug">
                  {item.productDescription}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Modal details viewer Component
interface DetailModalProps {
  item: MockupHistory | null;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = item.mockupImage;
    link.download = `${item.productName}_${item.medium}_mockup.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full flex flex-col md:flex-row relative border border-gray-100">
        
        {/* Absolute Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-150 border border-gray-100 flex items-center justify-center text-gray-500 duration-150 transition-colors shadow-sm cursor-pointer"
          id="btn-close-modal"
        >
          <X size={18} />
        </button>

        {/* Generated Image side */}
        <div className="flex-1 bg-gray-950 flex items-center justify-center p-6 relative min-h-80 md:min-h-[460px]">
          <img
            src={item.mockupImage}
            alt={item.productName}
            className="max-h-[420px] object-contain shadow-2xl rounded-2xl"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 shadow-lg text-left">
            <span className="text-[10px] font-bold text-amber-400">NANO BANANA AI</span>
            <h5 className="text-xs font-bold text-white mt-0.5">최종 생성 목업 결과물</h5>
          </div>
        </div>

        {/* Info panel side */}
        <div className="w-full md:w-[360px] p-6 lg:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50/30">
          <div className="space-y-6 text-left">
            <div>
              <span className="inline-block text-[9px] bg-amber-100 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full mb-1.5 uppercase tracking-wide">
                {item.medium === "mug"
                  ? "☕ 머그잔"
                  : item.medium === "billboard"
                  ? "🏙️ 전광판 광고"
                  : item.medium === "tshirt"
                  ? "👕 티셔츠 의류"
                  : item.medium === "phone_case"
                  ? "📱 테크 케이스"
                  : "🛍️ 에코백 백"}
              </span>
              <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                {item.productName}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">
                작성일: {new Date(item.createdAt).toLocaleString("ko-KR")}
              </p>
            </div>

            {item.productDescription && (
              <div>
                <h4 className="text-xs font-bold text-gray-600 mb-1">상품 디테일 설명</h4>
                <p className="text-xs text-gray-500 leading-relaxed bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  {item.productDescription}
                </p>
              </div>
            )}

            {/* Original Input Thumbnail */}
            <div>
              <h4 className="text-xs font-bold text-gray-600 mb-1.5">원본 디자인 소스</h4>
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-950 border border-gray-100 shrink-0">
                  <img
                    src={item.originalImage}
                    alt="Original"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-gray-800">일관성 체크용 데이터</h5>
                  <p className="text-[9px] text-gray-400 mt-0.5 leading-none">
                    나노 바나나 일관성 모델을 사용함
                  </p>
                </div>
              </div>
            </div>

            {/* Generating Prompt info */}
            {item.prompt && (
              <div>
                <h4 className="text-xs font-bold text-gray-600 mb-1">AI 렌더링 프롬프트</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed bg-gray-900 hover:text-white transition-colors duration-200 p-3 rounded-xl font-mono block max-h-24 overflow-y-auto">
                  {item.prompt}
                </p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 mt-6 flex gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-extrabold text-white bg-gray-900 hover:bg-amber-500 hover:text-amber-950 py-3 rounded-xl shadow-md cursor-pointer transition-all duration-300"
              id="btn-download-mockup"
            >
              <Download size={14} />
              <span>디바이스 다운로드</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
