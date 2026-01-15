
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message } from '../App';

interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

interface ChatInterfaceProps {
  initialPrompt?: string;
  onClose: () => void;
  locationContext: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const PRESET_INTERESTS = [
  { id: 'history', label: 'History', icon: '🏛️' },
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'nature', label: 'Nature', icon: '🌳' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'nightlife', label: 'Nightlife', icon: '🍸' },
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  initialPrompt, 
  onClose, 
  locationContext,
  messages,
  setMessages
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [localContext, setLocalContext] = useState(locationContext);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempContext, setTempContext] = useState(locationContext);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customPreference, setCustomPreference] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message to UI immediately
    const userMessage: Message = { role: 'user', text };
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const interestLabels = selectedInterests.map(id => PRESET_INTERESTS.find(p => p.id === id)?.label);
      const preferencesContext = [
        ...interestLabels,
        customPreference ? `User custom preference: ${customPreference}` : ''
      ].filter(Boolean).join(', ');

      // Prepare conversation history for the model
      const contents = updatedHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const config: any = {
        systemInstruction: `You are RoamAi, a professional and extremely concise digital travel guide in ${localContext}.
        ${preferencesContext ? `User interests: ${preferencesContext}.` : ''}
        
        RULES:
        1. BE CONCISE. Keep responses to 1-3 short sentences maximum.
        2. NO URLs. Never include links in text.
        3. NO WEIRD SYMBOLS. Avoid asterisks or bullet points. Use clean text.
        4. Use Google Search for current data, but remember our previous conversation.
        5. Just provide the facts or suggestions directly.`,
        tools: [{ googleSearch: {} }]
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents as any,
        config: config
      });

      const candidate = response.candidates?.[0];
      const groundingChunks = candidate?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
      
      const seenUrls = new Set<string>();
      const links = groundingChunks
        ?.filter(chunk => {
          if (chunk.web?.uri && !seenUrls.has(chunk.web.uri)) {
            seenUrls.add(chunk.web.uri);
            return true;
          }
          return false;
        })
        .map(chunk => ({
          title: chunk.web!.title || 'Info',
          url: chunk.web!.uri
        })) || [];

      let cleanText = (response.text || "").replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

      const assistantMessage: Message = {
        role: 'assistant',
        text: cleanText || "I'm having a bit of trouble connecting to my travel database.",
        links: links.length > 0 ? links : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', text: "RoamAi is momentarily offline. Please check your data connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestSpots = () => {
    const interestStr = selectedInterests.length > 0 
      ? ` that match my interest in ${selectedInterests.join(' and ')}` 
      : '';
    sendMessage(`Quickly suggest 3 must-see spots in ${localContext}${interestStr}.`);
  };

  const clearHistory = () => {
    if (confirm("Clear your conversation history?")) {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (initialPrompt) {
      // Only send initial prompt if it's the first time or context changed significantly
      sendMessage(initialPrompt);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleUpdateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempContext.trim()) {
      setLocalContext(tempContext);
      setIsEditingLocation(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
      <header className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-white/95 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 1.5c-4.556 0-8.25 3.694-8.25 8.25s3.694 8.25 8.25 8.25 8.25-3.694 8.25-8.25-3.694-8.25-8.25-8.25ZM8.25 12a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 text-sm">RoamAi</h3>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Assistant</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button 
              onClick={clearHistory}
              className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
              title="Clear History"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          )}
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-zinc-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Simplified Context Area */}
      <div className="bg-white border-b border-zinc-50 flex flex-col pt-3 pb-2">
        <div className="px-6 flex items-center justify-between gap-3 mb-3">
           {!isEditingLocation ? (
            <button 
              onClick={() => setIsEditingLocation(true)}
              className="flex-1 flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-zinc-400">
                <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
              </svg>
              <span className="text-[11px] font-bold text-zinc-600 truncate">{localContext}</span>
            </button>
          ) : (
            <form onSubmit={handleUpdateLocation} className="flex-1 flex items-center gap-2">
              <input 
                autoFocus
                className="flex-1 bg-white border border-zinc-200 rounded-full px-3 py-1 text-[11px] font-bold focus:outline-none"
                value={tempContext}
                onChange={(e) => setTempContext(e.target.value)}
              />
              <button type="submit" className="p-1.5 bg-zinc-900 text-white rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
          )}

          <button 
            onClick={suggestSpots}
            disabled={isLoading}
            className="bg-zinc-900 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tight disabled:opacity-50"
          >
            Find Spots
          </button>
        </div>

        <div className="overflow-x-auto scrollbar-hide flex gap-2 px-6">
          {PRESET_INTERESTS.map((interest) => (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              className={`flex items-center gap-1 whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                selectedInterests.includes(interest.id)
                ? 'bg-zinc-900 border-zinc-900 text-white'
                : 'bg-white border-zinc-100 text-zinc-400'
              }`}
            >
              <span>{interest.icon}</span>
              <span>{interest.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/30">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
            <div className="w-16 h-16 rounded-3xl bg-zinc-100 flex items-center justify-center border border-zinc-200">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.015 9.015 0 010 18M12 3a9.004 9.004 0 00-8.716 6.747M12 3a9.004 9.004 0 018.716 6.747" />
              </svg>
            </div>
            <p className="text-sm font-bold text-zinc-900">Ask RoamAi anything about {localContext}</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-1 duration-200`}>
            <div className={`max-w-[85%] px-4 py-3 shadow-sm ${
              msg.role === 'user' 
              ? 'bg-zinc-900 text-white rounded-2xl rounded-br-none' 
              : 'bg-white text-zinc-800 border border-zinc-100 rounded-2xl rounded-bl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-2xl border border-zinc-100 flex gap-1 items-center">
              <div className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-100 bg-white pb-10">
        <form 
          className="relative flex items-center"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputValue);
          }}
        >
          <input 
            type="text"
            placeholder="Type your question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="w-full bg-zinc-100 border-none rounded-full py-3.5 pl-5 pr-14 text-sm font-medium focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-400"
          />
          <button 
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-1.5 p-2 bg-zinc-900 text-white rounded-full disabled:opacity-20 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
