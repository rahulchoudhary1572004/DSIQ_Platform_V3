// components/DAM/DAMAssetPreview.tsx - Hover Preview Component (Apple-Inspired Design)
import React, { FC } from "react";
import { createPortal } from "react-dom";
import { Play, FileText, Music } from "lucide-react";
import { DigitalAsset } from "../../types/dam.types";

interface DAMAssetPreviewProps {
  asset: DigitalAsset;
  show: boolean;
  cardRect?: DOMRect | null;
}

const DAMAssetPreview: FC<DAMAssetPreviewProps> = ({ asset, show, cardRect }) => {
  if (!show || !cardRect) return null;

  // Calculate position - place preview above the card
  const previewHeight = 240;
  const gap = -220; // gap between card and preview
  
  let top = cardRect.top - previewHeight - gap;
  let left = cardRect.left + (cardRect.width / 2);
  
  // Adjust if preview would go off screen
  if (top < 20) {
    top = cardRect.bottom + gap; // Show below if not enough space above
  }
  
  if (left - 180 < 20) {
    left = 20 + 180; // Adjust if too far left
  } else if (left + 180 > window.innerWidth - 20) {
    left = window.innerWidth - 20 - 180; // Adjust if too far right
  }

  const renderContent = () => {
    switch (asset.type?.toLowerCase()) {
      case "image":
        return (
          <div className="relative w-[360px] h-[240px] bg-neutral-950 overflow-hidden">
            <img
              src={asset.url || asset.thumbnail}
              alt={asset.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='240'%3E%3Crect fill='%23374151' width='360' height='240'/%3E%3Ctext x='50%25' y='50%25' font-family='system-ui' font-size='14' fill='%239CA3AF' text-anchor='middle' dy='.3em'%3EImage unavailable%3C/text%3E%3C/svg%3E";
              }}
              style={{ 
                animation: "appleImageReveal 0.6s cubic-bezier(0.32, 0.72, 0, 1) both",
              }}
            />
            
           
          </div>
        );

      case "video":
        return (
          <div className="relative w-[360px] h-[240px] bg-neutral-950 overflow-hidden">
            <video
              src={asset.url}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              onError={(e) => {
                // Hide video element on error and show fallback
                e.currentTarget.style.display = 'none';
              }}
              style={{ 
                animation: "appleImageReveal 0.6s cubic-bezier(0.32, 0.72, 0, 1) both",
              }}
            />
            
          


          
          </div>
        );

      default:
        return (
          <div className="relative w-[360px] h-[240px] bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 flex flex-col items-center justify-center overflow-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}></div>
            
            <div className="w-24 h-24 rounded-3xl bg-white/5 backdrop-blur-sm flex items-center justify-center mb-5 border border-white/10 shadow-2xl relative z-10">
              <div className="text-4xl font-semibold text-white/90 tracking-tight">
                {asset.format.slice(0, 3).toUpperCase()}
              </div>
            </div>
            
            <p className="text-white text-[13px] font-medium text-center truncate w-full px-8 mb-2 tracking-tight relative z-10">
              {asset.name}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-white/50 font-medium relative z-10">
              <span>{asset.format.toUpperCase()}</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span>{asset.size}</span>
            </div>
          </div>
        );
    }
  };

  const previewContent = (
    <>
      {/* Preview Card - Apple Floating Design - No Backdrop */}
      <div
        className="fixed z-[99999]"
        style={{ 
          top: `${top}px`,
          left: `${left}px`,
          transform: 'translateX(-50%)',
          animation: show ? "appleFloatIn 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards" : "appleFloatOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          willChange: 'transform, opacity',
          pointerEvents: 'none',
        }}
      >
        {/* Shadow Layer - Soft & Realistic */}
        <div 
          className="absolute inset-0 rounded-[28px]"
          style={{
            boxShadow: `
              0 0 0 0.5px rgba(255, 255, 255, 0.06),
              0 2px 4px rgba(0, 0, 0, 0.05),
              0 8px 16px rgba(0, 0, 0, 0.1),
              0 16px 32px rgba(0, 0, 0, 0.15),
              0 32px 64px rgba(0, 0, 0, 0.2)
            `,
            filter: 'blur(1px)',
          }}
        />
        
        {/* Main Card with Apple's Signature Rounded Corners */}
        <div 
          className="relative bg-neutral-900/95 backdrop-blur-3xl overflow-hidden"
          style={{
            borderRadius: '28px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          {renderContent()}
        </div>
      </div>

      <style>{`
        @keyframes appleFloatIn {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-8px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        @keyframes appleFloatOut {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-8px) scale(0.96);
          }
        }
        
        @keyframes appleImageReveal {
          0% {
            opacity: 0;
            transform: scale(1.03);
            filter: brightness(1.1) blur(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: brightness(1) blur(0px);
          }
        }
      `}</style>
    </>
  );

  // Render using Portal to escape parent overflow constraints
  return createPortal(previewContent, document.body);
};

export default DAMAssetPreview;
