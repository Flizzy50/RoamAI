
import React, { useEffect, useState, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface VoiceOverlayProps {
  onComplete: (transcript: string) => void;
  onCancel: () => void;
}

const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ onComplete, onCancel }) => {
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<'connecting' | 'listening' | 'processing'>('connecting');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Helper: Encode to Base64 (as per GenAI SDK rules)
  function encode(base64: Uint8Array) {
    let binary = '';
    const len = base64.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(base64[i]);
    }
    return btoa(binary);
  }

  // Helper: Create PCM Blob for streaming
  function createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  useEffect(() => {
    let isMounted = true;
    let transcriptionBuffer = '';

    const startLiveSession = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Setup Audio Context
        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioContextRef.current = inputAudioContext;
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const sessionPromise = ai.live.connect({
          /* Fix: Using recommended model for real-time conversation task */
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: {
            onopen: () => {
              if (!isMounted) return;
              setStatus('listening');
              
              const source = inputAudioContext.createMediaStreamSource(stream);
              const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                if (status === 'listening' || status === 'connecting') {
                  const inputData = e.inputBuffer.getChannelData(0);
                  const pcmBlob = createBlob(inputData);
                  sessionPromise.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                  });
                }
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                transcriptionBuffer += text;
                setTranscript(transcriptionBuffer);
              }
              
              // If model detects turn is complete, we can finalize
              if (message.serverContent?.turnComplete && transcriptionBuffer.trim()) {
                finalize(transcriptionBuffer);
              }
            },
            onerror: (e) => {
              console.error('Gemini Live Error:', e);
              if (isMounted) onCancel();
            },
            onclose: () => {
              console.debug('Gemini Live session closed');
            }
          },
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            systemInstruction: "You are transcribing a short travel command. Just listen and transcribe what the user says."
          }
        });

        sessionRef.current = await sessionPromise;

      } catch (err) {
        console.error("Failed to initialize Live API:", err);
        if (isMounted) onCancel();
      }
    };

    const finalize = (finalText: string) => {
      setStatus('processing');
      setTimeout(() => {
        if (isMounted) onComplete(finalText);
      }, 800);
    };

    startLiveSession();

    return () => {
      isMounted = false;
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  const getStatusText = () => {
    switch (status) {
      case 'connecting': return 'Calibrating AI...';
      case 'listening': return 'Listening...';
      case 'processing': return 'Analysing...';
      default: return 'Ready';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-white animate-in fade-in duration-300">
      <div className="flex-1 flex flex-col items-center justify-center gap-12 w-full max-w-sm text-center">
        <div className="relative">
          {/* Animated Pulse Rings */}
          <div className={`absolute inset-0 rounded-full bg-red-500/20 animate-ping scale-150 ${status !== 'listening' ? 'hidden' : ''}`}></div>
          <div className={`absolute inset-0 rounded-full bg-red-500/30 animate-pulse scale-125 ${status !== 'listening' ? 'hidden' : ''}`}></div>
          
          <div className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${status === 'listening' ? 'bg-red-500 shadow-red-500/50 scale-100' : 'bg-zinc-800 scale-90'}`}>
            {status === 'connecting' ? (
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
                <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                <path d="M6 10.5a.75.75 0 0 1 .75.75 5.25 5.25 0 1 0 10.5 0 .75.75 0 0 1 1.5 0 6.75 6.75 0 0 1-6 6.709V21a.75.75 0 0 1-1.5 0v-3.041a6.75 6.75 0 0 1-6-6.709A.75.75 0 0 1 6 10.5Z" />
              </svg>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <h2 className="text-2xl font-bold tracking-tight text-white/90">
            {getStatusText()}
          </h2>
          <div className="min-h-[4rem] px-4">
             {transcript ? (
               <p className="text-xl text-white font-medium animate-in slide-in-from-bottom-2 duration-300">
                 "{transcript}"
               </p>
             ) : (
               <p className="text-zinc-500 italic text-lg">
                 {status === 'listening' ? 'Say something like "Find food nearby"' : 'Initialising secure channel...'}
               </p>
             )}
          </div>
        </div>
      </div>

      <div className="mb-12 flex flex-col items-center gap-4">
        {transcript && status === 'listening' && (
          <button 
            onClick={() => onComplete(transcript)}
            className="px-10 py-4 rounded-full bg-white text-zinc-900 font-bold shadow-xl active:scale-95 transition-all"
          >
            Finished Speaking
          </button>
        )}
        <button 
          onClick={onCancel}
          className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-medium hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default VoiceOverlay;
