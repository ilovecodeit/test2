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
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center">
        <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-3 border border-slate-100">
          <Layout size={18} />
        </div>
        <h4 className="text-xs font-bold text-slate-800">생성된 시각화 히스토리가 없습니다</h4>
        <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
          목업 매체를 설계하고 생성 버튼을 누르면 인공지능이 렌더링한 디자인 결과물이 여기에 실시간 자동저장됩니다.
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
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
          <span>나의 클라우드 생성 보관함</span>
          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2 py-0.5 rounded-full font-mono">
            {history.length} ITEMS
          </span>
        </h3>
        <p className="text-[10px] text-slate-400">Firebase 실시간 스토리지 보안 보관</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white rounded-xl border border-slate-200 p-3.5 hover:border-blue-600 hover:shadow-md transition-all duration-300 shadow-sm"
            style={{ contentVisibility: "auto" }}
          >
            {/* Image Preview Container */}
            <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-100 relative mb-3">
              <img
                src={item.mockupImage}
                alt={item.productName}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-102 transition-all duration-300"
                referrerPolicy="no-referrer"
              />

              {/* Badges Overlay */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                <span className="text-[9px] font-bold bg-slate-900/95 text-white px-2.5 py-1 rounded shadow-sm border border-slate-800">
                  {getMediumLabel(item.medium)}
                </span>
              </div>

              {/* Action Overlays */}
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <button
                  onClick={() => onSelectHistory(item)}
                  className="w-9 h-9 rounded-full bg-white text-slate-900 hover:bg-blue-600 hover:text-white flex items-center justify-center shadow-md transition-all scale-95 group-hover:scale-100 duration-200 cursor-pointer"
                  title="자세히 보기"
                  id={`btn-view-${item.id}`}
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="w-9 h-9 rounded-full bg-white text-rose-600 hover:bg-rose-50 flex items-center justify-center shadow-md transition-all scale-95 group-hover:scale-100 duration-200 cursor-pointer"
                  title="삭제하기"
                  id={`btn-delete-${item.id}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* General Info */}
            <div className="px-0.5 text-left">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-800 truncate">
                  {item.productName}
                </h4>
                <div className="flex items-center gap-1 text-[9px] text-slate-400 shrink-0 select-none font-mono">
                  <Calendar size={9} />
                  <span>{new Date(item.createdAt).toLocaleDateString("ko-KR")}</span>
                </div>
              </div>
              {item.productDescription && (
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-1 leading-snug">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-4xl w-full flex flex-col md:flex-row relative border border-slate-200">
        
        {/* Absolute Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-250 flex items-center justify-center text-slate-500 duration-150 transition-colors shadow-sm cursor-pointer"
          id="btn-close-modal"
        >
          <X size={16} />
        </button>

        {/* Generated Image side */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center p-6 relative min-h-80 md:min-h-[460px]">
          <img
            src={item.mockupImage}
            alt={item.productName}
            className="max-h-[420px] object-contain shadow-2xl rounded-lg"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-800 shadow-lg text-left">
            <span className="text-[9px] font-bold text-[#c084fc] font-mono tracking-wider">GEMINI AI INTEGRATION</span>
            <h5 className="text-[11px] font-extrabold text-white mt-0.5">합성 시뮬레이터 렌더 결과물</h5>
          </div>
        </div>

        {/* Info panel side */}
        <div className="w-full md:w-[360px] p-6 lg:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 bg-slate-50/50">
          <div className="space-y-6 text-left">
            <div>
              <span className="inline-block text-[9px] bg-blue-50 text-blue-700 border border-blue-100 font-extrabold px-2.5 py-1 rounded mb-2.5 uppercase tracking-wide">
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
              <h3 className="text-base font-extrabold text-slate-800 leading-tight">
                {item.productName}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                작성일: {new Date(item.createdAt).toLocaleString("ko-KR")}
              </p>
            </div>

            {item.productDescription && (
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">상품 디테일 설명</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-150 shadow-sm">
                  {item.productDescription}
                </p>
              </div>
            )}

            {/* Original Input Thumbnail */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">원본 디자인 소스</h4>
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-150 shadow-sm">
                <div className="w-12 h-12 rounded overflow-hidden bg-slate-950 border border-slate-200 shrink-0">
                  <img
                    src={item.originalImage}
                    alt="Original"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-slate-700 leading-none">일관성 체크용 데이터</h5>
                  <p className="text-[9px] text-slate-400 mt-1 leading-none font-mono">
                    NANO BANANA MODEL v2
                  </p>
                </div>
              </div>
            </div>

            {/* Generating Prompt info */}
            {item.prompt && (
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">AI 렌더링 프롬프트</h4>
                <p className="text-[9px] text-slate-400 leading-relaxed bg-slate-900 hover:text-white transition-colors duration-200 p-3 rounded-lg font-mono block max-h-24 overflow-y-auto">
                  {item.prompt}
                </p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-200 mt-6">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 py-3 rounded-lg shadow-md cursor-pointer transition-all duration-300"
              id="btn-download-mockup"
            >
              <Download size={13} />
              <span>디바이스 다운로드</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
