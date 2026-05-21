import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface UploadAreaProps {
  onImageLoaded: (base64String: string, id: string | null) => void;
  imageUrl: string | null;
  clearImage: () => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onImageLoaded, imageUrl, clearImage }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    // Basic format and size checks
    if (!file.type.startsWith("image/")) {
      setErrorMessage("이미지 파일(*.png, *.jpg, *.jpeg, *.svg)만 지원됩니다.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("파일 사이즈가 너무 큽니다. 5MB 이내의 원본 이미지를 업로드해주세요.");
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onImageLoaded(reader.result, "custom-upload"); // Nullify pre-defined tags
      }
    };
    reader.onerror = () => {
      setErrorMessage("파일을 읽는 중 오류가 발생했습니다.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span>상품 디자인 업로드</span>
          {imageUrl && <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-100"><CheckCircle2 size={10} /> 준비됨</span>}
        </h3>
        {imageUrl && (
          <button
            onClick={clearImage}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 duration-150 flex items-center gap-1 cursor-pointer"
            id="btn-clear-upload"
          >
            <RefreshCw size={12} /> 이미지 초기화
          </button>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={!imageUrl ? triggerInput : undefined}
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-all duration-300 min-h-60 ${
          imageUrl
            ? "border-emerald-200 bg-emerald-50/10 cursor-default"
            : isDragActive
            ? "border-blue-500 bg-blue-50/30 scale-[1.01] cursor-pointer"
            : "border-slate-250 hover:border-blue-500 hover:bg-slate-50/50 cursor-pointer"
        }`}
        id="upload-dropzone"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />

        {imageUrl ? (
          <div className="flex flex-col items-center max-w-sm">
            <div className="relative group rounded-lg overflow-hidden shadow-sm border border-slate-100 max-h-48 mb-4 bg-slate-50 flex items-center justify-center">
              <img
                src={imageUrl}
                alt="상품 원본 디자인"
                className="max-h-48 object-contain transition-all duration-300 transform group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-xs">
              선택된 원본 디자인 에셋
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              이 이미지를 기반으로 AI가 각 마케팅 매체에서의 모습을 일관되게 생성합니다.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center max-w-sm">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-4 shadow-sm border border-blue-100/30">
              <UploadCloud size={20} />
            </div>
            <p className="text-xs font-bold text-slate-700 mb-1">
              디자인 및 로고 파일 끌어서 놓기
            </p>
            <p className="text-[10px] text-slate-400 mb-3">
              또는 이곳을 클릭하여 컴퓨터에서 파일 선택
            </p>
            <span className="text-[9px] text-slate-500 bg-slate-100 px-2 py-1 rounded font-mono leading-none border border-slate-200">
              PNG, JPG, JPEG, SVG 지원 (최대 5MB)
            </span>
          </div>
        )}
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mt-3 flex items-center gap-1.5 p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
