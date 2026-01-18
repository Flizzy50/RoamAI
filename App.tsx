
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import MapDisplay from './components/MapDisplay';
import ActionButtons from './components/ActionButtons';
import VoiceOverlay from './components/VoiceOverlay';
import ChatInterface from './components/ChatInterface';
import ProfileMenu from './components/ProfileMenu';
import SettingsMenu from './components/SettingsMenu';
import QuickSuggestions, { Suggestion } from './components/QuickSuggestions';
import { UserProfile, LocationData, Message, ChatSession } from './types';
import { GoogleGenAI, Type } from "@google/genai";

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

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string | undefined>(undefined);
  
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const lastSuggestionCity = useRef<string | null>(null);

  const [isDiscoveryMode, setIsDiscoveryMode] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<POIData | null>(null);
  const [isIdentifyingPOI, setIsIdentifyingPOI] = useState(false);

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatHistory] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Historical Tour of State College',
      snippet: 'What are the oldest buildings in the university area?',
      date: 'Oct 24, 2023',
      messages: [
        { role: 'user', text: 'What are the oldest buildings in the university area?' },
        { role: 'assistant', text: 'The oldest building is Old Main, completed in 1863. It remains the centerpiece of the campus today.' }
      ]
    },
    {
      id: '2',
      title: 'Lunch in San Francisco',
      snippet: 'Recommend a good sushi place near Market St.',
      date: 'Oct 20, 2023',
      messages: [
        { role: 'user', text: 'Recommend a good sushi place near Market St.' },
        { role: 'assistant', text: 'I recommend Akiko’s Restaurant. It’s highly rated for its authentic experience and fresh omakase.' }
      ]
    }
  ]);

  const lastAiGeocodeCoords = useRef<{ lat: number; lng: number } | null>(null);

  const handleSelectHistoryChat = (session: ChatSession) => {
    setChatMessages(session.messages);
    setIsProfileOpen(false);
    setIsChatOpen(true);
  };

  const fetchQuickSuggestions = async (city: string, country: string) => {
    if (lastSuggestionCity.current === city || !navigator.onLine) return;
    setIsSuggestionsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide 2 short, diverse travel suggestions for things to do or places to visit near ${city}, ${country}. Include an emoji icon for each.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    icon: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "category", "icon", "description"]
                }
              }
            }
          }
        }
      });
      const result = JSON.parse(response.text || '{"suggestions": []}');
      setSuggestions(result.suggestions);
      lastSuggestionCity.current = city;
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setIsSuggestionsLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!navigator.onLine) return;
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
        fetchQuickSuggestions(result.city, result.country);
      }
    } catch (err) {
      console.error('AI Geocoding failed:', err);
      setLocation(prev => ({ ...prev, isLocating: false }));
    }
  };

  const identifyPOI = async (poi: POIData) => {
    if (!navigator.onLine) return;
    setIsIdentifyingPOI(true);
    setSelectedPOI(poi);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Identify the specific point of interest or major landmark at exactly latitude ${poi.lat}, longitude ${poi.lng} in ${location.city}, ${location.country}. Provide high-quality details including rating, opening status, and descriptive images.`,
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
              opening_hours: { type: Type.STRING },
              imageUrls: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }
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
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 3000);
      if (coords) reverseGeocode(coords.lat, coords.lng);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

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
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.geolocation.clearWatch(watchId);
    };
  }, [coords]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-zinc-50 relative overflow-hidden">
      <Header 
        user={user} 
        location={location} 
        onProfileClick={() => setIsProfileOpen(true)}
      />

      {/* Connectivity Status Banner */}
      <div className={`transition-all duration-500 overflow-hidden flex-none z-[5] ${!isOnline || showBackOnline ? 'max-h-12' : 'max-h-0'}`}>
        {showBackOnline ? (
          <div className="bg-emerald-500 text-white py-2 px-6 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Back Online</span>
          </div>
        ) : (
          <div className="bg-zinc-900 text-white py-2 px-6 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-zinc-400">
              <path d="M10.323 11.23a.75.75 0 0 1-1.06 0l-2.47-2.47a.75.75 0 0 1 1.06-1.06l1.94 1.94 1.94-1.94a.75.75 0 1 1 1.06 1.06l-2.47 2.47Z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-4.28-9.72a.75.75 0 0 0 0 1.06l4.28 4.28 4.28-4.28a.75.75 0 1 0-1.06-1.06L10 12.69 6.78 9.47a.75.75 0 0 0-1.06 0Z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">No Connection</span>
          </div>
        )}
      </div>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <MapDisplay 
          coords={coords} 
          isDiscoveryMode={isDiscoveryMode}
          setIsDiscoveryMode={setIsDiscoveryMode}
          onPOISelect={identifyPOI}
        />

        <QuickSuggestions 
          suggestions={suggestions} 
          isLoading={isSuggestionsLoading}
          onSelect={(s) => {
            setInitialChatPrompt(`Tell me about ${s.title} in ${location.city}.`);
            setChatMessages([]); 
            setIsChatOpen(true);
          }}
        />

        {selectedPOI && (
          <div className="absolute inset-x-6 bottom-4 z-50 animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-white rounded-[2.5rem] p-5 shadow-2xl border border-zinc-100 flex flex-col gap-4 overflow-hidden max-h-[70vh]">
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

              {!isIdentifyingPOI && selectedPOI.imageUrls && selectedPOI.imageUrls.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide no-scrollbar flex-none">
                  {selectedPOI.imageUrls.map((url, i) => (
                    <div key={i} className="flex-none w-48 h-32 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-100">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {!isIdentifyingPOI && (
                <div className="flex flex-wrap items-center gap-3">
                  {selectedPOI.rating && (
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-amber-500">
                        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" />
                      </svg>
                      <span className="text-[11px] font-black text-amber-700">{selectedPOI.rating}</span>
                    </div>
                  )}
                  {selectedPOI.opening_hours && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[10px] font-black uppercase">
                      {selectedPOI.opening_hours}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-1 flex-none">
                <button 
                  onClick={() => {
                    setInitialChatPrompt(`Tell me more about ${selectedPOI.name} in ${location.city}.`);
                    setChatMessages([]);
                    setIsChatOpen(true);
                  }}
                  className="flex-1 py-3.5 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                >
                  Explore with AI
                </button>
                <button 
                  className="px-6 py-3.5 bg-zinc-100 text-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest"
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
        onChatClick={() => { setChatMessages([]); setInitialChatPrompt(undefined); setIsChatOpen(true); }}
      />
      
      {isVoiceActive && <VoiceOverlay onComplete={(t) => { setIsVoiceActive(false); setChatMessages([]); setInitialChatPrompt(t); setIsChatOpen(true); }} onCancel={() => setIsVoiceActive(false)} />}

      {isChatOpen && (
        <ChatInterface 
          initialPrompt={initialChatPrompt}
          locationContext={`${location.city}, ${location.country}`}
          onClose={() => { setIsChatOpen(false); setInitialChatPrompt(undefined); }}
          messages={chatMessages}
          setMessages={setChatMessages}
        />
      )}

      {isProfileOpen && (
        <ProfileMenu 
          user={user}
          onClose={() => setIsProfileOpen(false)}
          onOpenSettings={() => {
            setIsSettingsOpen(true);
            setIsProfileOpen(false);
          }}
          chatHistory={chatHistory}
          onSelectChat={handleSelectHistoryChat}
        />
      )}

      {isSettingsOpen && (
        <SettingsMenu 
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
