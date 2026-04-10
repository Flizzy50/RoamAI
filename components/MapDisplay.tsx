
import React, { useState, useEffect, useRef } from 'react';

interface MapDisplayProps {
  coords: { lat: number; lng: number } | null;
  onPOISelect?: (data: { name: string; lat: number; lng: number; type: string }) => void;
  isDiscoveryMode: boolean;
  setIsDiscoveryMode: (active: boolean) => void;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ coords, onPOISelect, isDiscoveryMode, setIsDiscoveryMode }) => {
  const [fixedCoords, setFixedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (coords && !fixedCoords) {
      setFixedCoords(coords);
    }
  }, [coords, fixedCoords]);

  const handleMapClick = (e: React.MouseEvent) => {
    if (!isDiscoveryMode || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelectedPoint({ x, y });

    if (onPOISelect && fixedCoords) {
      onPOISelect({
        name: "Identifying Place...",
        lat: fixedCoords.lat + (Math.random() - 0.5) * 0.01,
        lng: fixedCoords.lng + (Math.random() - 0.5) * 0.01,
        type: "searching"
      });
    }
  };

  return (
    <div className="px-6 flex-none w-full max-h-[36vh] min-h-[260px] relative">
      <style>
        {`
          @keyframes map-breathing {
            0%, 100% { transform: scale(1); box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            50% { transform: scale(1.005); box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
          }
          .animate-map-breathing {
            animation: map-breathing 8s ease-in-out infinite;
          }
          .map-ui-shield {
            pointer-events: ${isDiscoveryMode ? 'none' : 'auto'};
            background: transparent;
            position: absolute;
            z-index: 20;
          }
          @keyframes poi-pulse {
            0% { transform: scale(0.5); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
          }
          .poi-selection-ring {
            animation: poi-pulse 1.5s ease-out infinite;
          }
        `}
      </style>
      
      <div 
        ref={containerRef}
        onClick={handleMapClick}
        className={`relative w-full h-full rounded-[2.5rem] bg-zinc-100 overflow-hidden border-2 transition-all duration-500 ease-in-out ${
          isDiscoveryMode ? 'border-blue-500 shadow-2xl shadow-blue-100 cursor-crosshair' : 'border-zinc-200/50 shadow-lg'
        } animate-map-breathing`}
      >
        
        {fixedCoords ? (
          <div className="relative w-full h-full">
            {/* The Iframe - Aggressive cropping of Google Maps UI elements */}
            <div className={`absolute top-[-220px] left-[-220px] w-[calc(100%+440px)] h-[calc(100%+440px)] transition-opacity duration-300 ${isDiscoveryMode ? 'opacity-60 grayscale' : 'opacity-100'}`}>
              <iframe
                title="Real-time Location"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ 
                  border: 0, 
                  filter: 'grayscale(0.3) contrast(1.1) brightness(1.02) saturate(0.8)',
                  pointerEvents: isDiscoveryMode ? 'none' : 'auto'
                }}
                src={`https://maps.google.com/maps?q=${fixedCoords.lat},${fixedCoords.lng}&z=15&ie=UTF8&iwloc=&output=embed`}
                allowFullScreen
              ></iframe>
            </div>

            {!isDiscoveryMode && (
              <>
                <div className="map-ui-shield top-0 left-0 right-0 h-16"></div>
                <div className="map-ui-shield bottom-0 left-0 right-0 h-12"></div>
                <div className="map-ui-shield top-0 bottom-0 left-0 w-8"></div>
                <div className="map-ui-shield top-0 bottom-0 right-0 w-8"></div>
              </>
            )}

            {isDiscoveryMode && (
              <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                <div className="w-12 h-12 border border-blue-500/30 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                </div>
                
                {selectedPoint && (
                  <div 
                    className="absolute z-50 transition-all duration-300 ease-out"
                    style={{ left: selectedPoint.x, top: selectedPoint.y }}
                  >
                    <div className="relative flex items-center justify-center">
                      <div className="poi-selection-ring absolute w-10 h-10 border-2 border-blue-500 rounded-full"></div>
                      <div className="w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100">
             <div className="w-10 h-10 border-4 border-zinc-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-blue-500/5 to-transparent border-[6px] border-white/40 rounded-[2.5rem]"></div>

        <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
          <button 
            onClick={() => setIsDiscoveryMode(!isDiscoveryMode)}
            className={`px-4 py-2 rounded-full backdrop-blur-md border transition-all flex items-center gap-2 shadow-lg active:scale-95 ${
              isDiscoveryMode 
                ? 'bg-blue-500 border-blue-400 text-white' 
                : 'bg-white/80 border-white text-zinc-900'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isDiscoveryMode ? 'Discovery Active' : 'Explore Mode'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapDisplay;
