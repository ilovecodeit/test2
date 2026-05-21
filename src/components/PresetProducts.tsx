import React from "react";
import { Sparkles, Bot, Sunset } from "lucide-react";

interface PresetItem {
  id: string;
  name: string;
  description: string;
  svg: string;
  bgColor: string;
  borderColorClass: string;
}

// Custom SVGs which will serve as pristine mockup sources
const PRESETS: PresetItem[] = [
  {
    id: "nano-banana",
    name: "나노 바나나 메카닉 로고",
    description: "미래형 웨어러블 디바이스 및 스마트 브랜딩을 위한 사이버네틱 옐로우 바나나 에디션 로고.",
    bgColor: "bg-slate-50/50 hover:bg-slate-50/80 hover:border-slate-300",
    borderColorClass: "border-slate-100",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#0f172a" rx="30"/>
      <!-- Glowing grids -->
      <path d="M 0,100 L 400,100 M 0,200 L 400,200 M 0,300 L 400,300 M 100,0 L 100,400 M 200,0 L 200,400 M 300,0 L 300,400" stroke="#1f2937" stroke-width="1.5" />
      
      <!-- Tech circuit path -->
      <path d="M 80,120 Q 150,150 200,130 T 320,160" fill="none" stroke="#3b82f6" stroke-width="2" stroke-dasharray="5,5" opacity="0.6" />
      <circle cx="80" cy="120" r="4" fill="#3b82f6" />
      <circle cx="320" cy="160" r="4" fill="#3b82f6" />

      <!-- Golden Cyber Banana -->
      <path d="M 120,310 C 130,230 190,130 290,100 C 270,120 220,180 200,270 C 180,240 160,250 120,310 Z" fill="url(#bananaGrad)" filter="url(#glow)"/>
      <path d="M 115,315 L 125,300" stroke="#b45309" stroke-width="6" stroke-linecap="round"/>
      <path d="M 285,105 Q 305,90 315,95" stroke="#b45309" stroke-width="8" stroke-linecap="round" fill="none"/>

      <!-- Glowing eye / core -->
      <circle cx="210" cy="180" r="12" fill="#10b981" />
      <circle cx="210" cy="180" r="4" fill="#ffffff" />
      
      <!-- Circuits on banana -->
      <path d="M 180,240 L 160,210 L 140,210" fill="none" stroke="#22d3ee" stroke-width="3" stroke-linecap="round"/>
      <circle cx="140" cy="210" r="3" fill="#22d3ee" />

      <path d="M 230,160 L 250,140" fill="none" stroke="#22d3ee" stroke-width="3" stroke-linecap="round"/>
      <circle cx="250" cy="140" r="3" fill="#22d3ee" />

      <!-- Outer text -->
      <text x="200" y="360" font-family="'JetBrains Mono', monospace" font-size="20" fill="#3b82f6" font-weight="bold" text-anchor="middle" letter-spacing="4">NANO BANANA v2.5</text>
      <text x="200" y="380" font-family="'Inter', sans-serif" font-size="11" fill="#9ca3af" text-anchor="middle" letter-spacing="1">CYBERNETIC HARVEST</text>

      <defs>
        <linearGradient id="bananaGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="50%" stop-color="#60a5fa" />
          <stop offset="100%" stop-color="#2563eb" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>`
  },
  {
    id: "cyber-robot",
    name: "네온 알파 로봇 에셋",
    description: "귀여우면서도 기하학적인 인공지능 마스코트 일러스트레이션으로 하이테크 브랜드용 그래픽.",
    bgColor: "bg-slate-50/50 hover:bg-slate-50/80 hover:border-slate-300",
    borderColorClass: "border-slate-100",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#0f172a" rx="30"/>
      <!-- Hexagon network background -->
      <polygon points="200,60 280,105 280,195 200,240 120,195 120,105" fill="none" stroke="#1e293b" stroke-width="2"/>
      <polygon points="200,100 250,130 250,180 200,210 150,180 150,130" fill="none" stroke="#1e293b" stroke-width="1" />

      <!-- Ears / Antennas -->
      <path d="M 120,150 L 90,130" stroke="#06b6d4" stroke-width="8" stroke-linecap="round"/>
      <circle cx="90" cy="130" r="10" fill="#22d3ee" />
      <path d="M 280,150 L 310,130" stroke="#06b6d4" stroke-width="8" stroke-linecap="round"/>
      <circle cx="310" cy="130" r="10" fill="#22d3ee" />

      <!-- Robot Body -->
      <rect x="130" y="140" width="140" height="130" rx="40" fill="url(#robGrad)" stroke="#38bdf8" stroke-width="4"/>
      
      <!-- Glowing Face Plate -->
      <rect x="150" y="160" width="100" height="70" rx="20" fill="#020617" />
      
      <!-- Neon Eyes -->
      <ellipse cx="180" cy="195" rx="10" ry="14" fill="#22d3ee" />
      <ellipse cx="180" cy="195" rx="4" ry="6" fill="#ffffff" />
      
      <ellipse cx="220" cy="195" rx="10" ry="14" fill="#22d3ee" />
      <ellipse cx="220" cy="195" rx="4" ry="6" fill="#ffffff" />

      <!-- Cute blush -->
      <circle cx="165" cy="215" r="5" fill="#f43f5e" opacity="0.6"/>
      <circle cx="235" cy="215" r="5" fill="#f43f5e" opacity="0.6"/>

      <!-- Mouth wave -->
      <path d="M 195,215 Q 200,222 205,215" fill="none" stroke="#22d3ee" stroke-width="3" stroke-linecap="round"/>

      <!-- Tech Specs label -->
      <text x="200" y="340" font-family="'JetBrains Mono', monospace" font-size="22" fill="#22d3ee" font-weight="bold" text-anchor="middle" letter-spacing="3">ALPHA BOT v1</text>
      <text x="200" y="365" font-family="'Inter', sans-serif" font-size="11" fill="#64748b" text-anchor="middle">INTELLIGENT AGENT MOCKUP</text>

      <defs>
        <linearGradient id="robGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
      </defs>
    </svg>`
  },
  {
    id: "retro-sunset",
    name: "레트로 웨이브 선셋",
    description: "80년대 신스웨이브 분위기의 원형 하프톤 태양 및 산맥 실루엣 네온 일러스트레이션 브랜딩.",
    bgColor: "bg-slate-50/50 hover:bg-slate-50/80 hover:border-slate-300",
    borderColorClass: "border-slate-100",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#1e1b4b" rx="30"/>
      
      <!-- Retro grid flow -->
      <g stroke="#4f46e5" stroke-width="1.5" opacity="0.4">
        <line x1="200" y1="200" x2="0" y2="400" />
        <line x1="200" y1="200" x2="80" y2="400" />
        <line x1="200" y1="200" x2="160" y2="400" />
        <line x1="200" y1="200" x2="240" y2="400" />
        <line x1="200" y1="200" x2="320" y2="400" />
        <line x1="200" y1="200" x2="400" y2="400" />
        
        <line x1="0" y1="260" x2="400" y2="260" />
        <line x1="0" y1="300" x2="400" y2="300" />
        <line x1="0" y1="350" x2="400" y2="350" />
      </g>

      <!-- Retro Sun with slice slots -->
      <path d="M 120,200 A 80,80 0 0,1 280,200 L 120,200 Z" fill="url(#sunGrad)"/>
      <rect x="110" y="205" width="180" height="8" fill="#1e1b4b" />
      <rect x="110" y="185" width="180" height="5" fill="#1e1b4b" />
      <rect x="110" y="165" width="180" height="3" fill="#1e1b4b" />
      <rect x="110" y="145" width="180" height="2" fill="#1e1b4b" />

      <!-- Cyber Mountain Vector -->
      <polygon points="50,260 120,180 180,220 280,140 370,260" fill="url(#mountGrad)" opacity="0.9" stroke="#da77f2" stroke-width="2" />
      <polygon points="120,260 190,190 250,230 320,170 390,260" fill="url(#mountGrad2)" opacity="0.7" stroke="#f43f5e" stroke-width="1.5" />

      <!-- Brand Typography -->
      <text x="200" y="330" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="28" fill="#fda4af" text-anchor="middle" letter-spacing="6">RETROWAVE</text>
      <text x="200" y="355" font-family="'JetBrains Mono', monospace" font-size="11" fill="#a5b4fc" text-anchor="middle" letter-spacing="2">SYNTHETIC FUTURE DESIGN</text>

      <defs>
        <linearGradient id="sunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f43f5e" />
          <stop offset="30%" stop-color="#ec4899" />
          <stop offset="75%" stop-color="#f43f5e" />
          <stop offset="100%" stop-color="#e11d48" />
        </linearGradient>
        <linearGradient id="mountGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#4c1d95" />
          <stop offset="100%" stop-color="#1e1b4b" />
        </linearGradient>
        <linearGradient id="mountGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#881337" />
          <stop offset="100%" stop-color="#1e1b4b" />
        </linearGradient>
      </defs>
    </svg>`
  }
];

const svgToPng = (svgString: string, size: number = 400): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    try {
      const encodedSvg = btoa(encodeURIComponent(svgString).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
      img.src = `data:image/svg+xml;base64,${encodedSvg}`;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, size, size);
          try {
            const pngUrl = canvas.toDataURL("image/png");
            resolve(pngUrl);
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error("Could not get 2D canvas context"));
        }
      };
      img.onerror = (err) => {
        reject(new Error("Failed to load SVG into Image: " + err));
      };
    } catch (err) {
      reject(err);
    }
  });
};

interface PresetProductsProps {
  onSelect: (imageUrl: string, name: string, description: string, id: string) => void;
  selectedId: string | null;
}

export const PresetProducts: React.FC<PresetProductsProps> = ({ onSelect, selectedId }) => {
  const handleSelect = async (preset: PresetItem) => {
    try {
      const pngUrl = await svgToPng(preset.svg);
      onSelect(pngUrl, preset.name, preset.description, preset.id);
    } catch (error) {
      console.error("Failed to convert SVG to PNG, fallback to SVG URL:", error);
      const svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(preset.svg)}`;
      onSelect(svgUrl, preset.name, preset.description, preset.id);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-blue-500 fill-blue-100" />
        <h3 className="text-sm font-bold text-slate-800">무료 디자인 프리셋 자산 선택</h3>
      </div>
      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
        디자인 소스가 없으시다면 나노 바나나가 준비한 독보적인 메카닉과 신스웨이브 시각 테마 자산을 활용해 브랜드 시뮬레이션을 즉시 생성해 보실 수 있습니다.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PRESETS.map((preset) => {
          const isSelected = selectedId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset)}
              className={`flex flex-col text-left rounded-xl border p-3.5 transition-all duration-300 cursor-pointer ${preset.bgColor} ${
                isSelected
                  ? "border-blue-600 bg-white ring-4 ring-blue-100/50 scale-[1.01] shadow-md"
                  : preset.borderColorClass
              }`}
              style={{ contentVisibility: "auto" }}
              id={`preset-${preset.id}`}
            >
              {/* Render SVG inside the box */}
              <div
                className="w-full aspect-square rounded-lg overflow-hidden mb-3.5 bg-slate-950 border border-slate-100 shadow-sm relative"
                dangerouslySetInnerHTML={{ __html: preset.svg }}
              />

              <div className="flex items-center justify-between mb-1.5 pt-0.5">
                <span className="text-xs font-bold text-slate-800">{preset.name}</span>
                {preset.id === "nano-banana" && (
                  <span className="text-[9px] bg-blue-600 font-extrabold text-white px-1.5 py-0.5 rounded">🍌 추천</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
