
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import MapDisplay from './components/MapDisplay';
import ActionButtons from './components/ActionButtons';
import VoiceOverlay from './components/VoiceOverlay';
import ChatInterface from './components/ChatInterface';
import { UserProfile, LocationData } from './types';
import { GoogleGenAI, Type } from "@google/genai";

export interface Message {
  role: 'user' | 'assistant';
  text: string;
  links?: { title: string; url: string }[];
}

export interface POIData {
  name: string;
  lat: number;
  lng: number;
  type: string;
  description?: string;
  address?: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: string;
  imageUrls?: string[];
}

const App: React.FC = () => {
  const [user] = useState<UserProfile>({
    name: 'Saril',
    avatarUrl: 'https://picsum.photos/seed/saril/200',
    status: 'exploring'
  });

  const [location, setLocation] = useState<LocationData & { isLocating: boolean; error: string | null }>({
    city: 'Detecting',
    country: 'Location',
    isLocating: true,
    error: null
  });

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string | undefined>(undefined);
  
  // Discovery Mode State
  const [isDiscoveryMode, setIsDiscoveryMode] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<POIData | null>(null);
  const [isIdentifyingPOI, setIsIdentifyingPOI] = useState(false);

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const lastAiGeocodeCoords = useRef<{ lat: number; lng: number } | null>(null);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a high-accuracy geolocation service. Given latitude: ${lat}, longitude: ${lng}, identify the city and country. Return valid JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              city: { type: Type.STRING },
              country: { type: Type.STRING }
            },
            required: ["city", "country"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      if (result.city && result.country) {
        setLocation({ city: result.city, country: result.country, isLocating: false, error: null });
      }
    } catch (err) {
      console.error('AI Geocoding failed:', err);
      setLocation(prev => ({ ...prev, isLocating: false }));
    }
  };

  const identifyPOI = async (poi: POIData) => {
    setIsIdentifyingPOI(true);
    setSelectedPOI(poi);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Identify the specific point of interest or major landmark at exactly latitude ${poi.lat}, longitude ${poi.lng} in ${location.city}, ${location.country}. Provide high-quality details including rating, opening status, and descriptive images (use high-quality representative Unsplash source URLs based on keywords if real URLs are unavailable).`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              description: { type: Type.STRING },
              address: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              user_ratings_total: { type: Type.INTEGER },
              opening_hours: { type: Type.STRING, description: "Current status, e.g., 'Open until 10 PM' or 'Closed'" },
              imageUrls: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Array of 3-4 high-quality image URLs of the location."
              }
            },
            required: ["name", "type", "description", "address", "rating", "imageUrls"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setSelectedPOI({ ...poi, ...result });
    } catch (err) {
      console.error('POI Identification failed:', err);
      setSelectedPOI({ ...poi, name: "Nearby Landmark", type: "Unknown", description: "Information temporarily unavailable." });
    } finally {
      setIsIdentifyingPOI(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        if (!lastAiGeocodeCoords.current || Math.abs(lastAiGeocodeCoords.current.lat - latitude) > 0.01) {
          lastAiGeocodeCoords.current = { lat: latitude, lng: longitude };
          reverseGeocode(latitude, longitude);
        }
      },
      () => setLocation(prev => ({ ...prev, isLocating: false, error: 'Location Access Denied' })),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-zinc-50 relative overflow-hidden">
      <Header user={user} location={location} />

      <main className="flex-1 flex flex-col justify-center overflow-hidden relative">
        <MapDisplay 
          coords={coords} 
          isDiscoveryMode={isDiscoveryMode}
          setIsDiscoveryMode={setIsDiscoveryMode}
          onPOISelect={identifyPOI}
        />

        {/* POI Info Card Overlay */}
        {selectedPOI && (
          <div className="absolute bottom-6 left-6 right-6 z-50 animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-white rounded-[2.5rem] p-5 shadow-2xl border border-zinc-100 flex flex-col gap-4 overflow-hidden">
              {/* Header Section */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {isIdentifyingPOI ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-zinc-200 border-t-blue-500 animate-spin"></div>
                      <span className="text-sm font-bold text-zinc-400">Scanning Area...</span>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-black text-zinc-900 leading-tight truncate text-lg">{selectedPOI.name}</h4>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{selectedPOI.type}</p>
                    </>
                  )}
                </div>
                <button onClick={() => setSelectedPOI(null)} className="p-2 bg-zinc-50 rounded-full hover:bg-zinc-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-zinc-400">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </div>

              {/* Image Carousel */}
              {!isIdentifyingPOI && selectedPOI.imageUrls && selectedPOI.imageUrls.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide no-scrollbar">
                  {selectedPOI.imageUrls.map((url, i) => (
                    <div key={i} className="flex-none w-48 h-32 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-100">
                      <img src={url} alt={`${selectedPOI.name} ${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Rich Metadata Section */}
              {!isIdentifyingPOI && (
                <div className="flex flex-wrap items-center gap-3">
                  {selectedPOI.rating && (
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-amber-500">
                        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[11px] font-black text-amber-700">{selectedPOI.rating}</span>
                      {selectedPOI.user_ratings_total && (
                        <span className="text-[10px] text-amber-600/70 font-bold">({selectedPOI.user_ratings_total.toLocaleString()})</span>
                      )}
                    </div>
                  )}
                  {selectedPOI.opening_hours && (
                    <div className={`px-2 py-1 rounded-lg border text-[11px] font-black uppercase tracking-tight ${
                      selectedPOI.opening_hours.toLowerCase().includes('open') 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                      : 'bg-zinc-50 border-zinc-100 text-zinc-500'
                    }`}>
                      {selectedPOI.opening_hours}
                    </div>
                  )}
                  {selectedPOI.address && (
                    <div className="flex items-center gap-1 text-zinc-400">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 7.23 7.23 0 0 0 .757.433 5.73 5.73 0 0 0 .281.14l.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[10px] font-bold truncate max-w-[120px]">{selectedPOI.address}</span>
                    </div>
                  )}
                </div>
              )}

              {!isIdentifyingPOI && selectedPOI.description && (
                <p className="text-xs text-zinc-500 leading-relaxed font-medium line-clamp-2">
                  {selectedPOI.description}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => {
                    setInitialChatPrompt(`Tell me more about ${selectedPOI.name} in ${location.city}.`);
                    setIsChatOpen(true);
                  }}
                  className="flex-1 py-3.5 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  Explore with AI
                </button>
                <button 
                  className="px-6 py-3.5 bg-zinc-100 text-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all hover:bg-zinc-200"
                  onClick={() => {
                    setSelectedPOI(null);
                    setIsDiscoveryMode(false);
                  }}
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <ActionButtons 
        onVoiceClick={() => setIsVoiceActive(true)}
        onChatClick={() => setIsChatOpen(true)}
      />
      
      {isVoiceActive && <VoiceOverlay onComplete={(t) => { setIsVoiceActive(false); setInitialChatPrompt(t); setIsChatOpen(true); }} onCancel={() => setIsVoiceActive(false)} />}

      {isChatOpen && (
        <ChatInterface 
          initialPrompt={initialChatPrompt}
          locationContext={`${location.city}, ${location.country}`}
          onClose={() => { setIsChatOpen(false); setInitialChatPrompt(undefined); }}
          messages={chatMessages}
          setMessages={setChatMessages}
        />
      )}
    </div>
  );
};

export default App;
