
import React, { createContext, useContext, useState, useEffect } from 'react';
import { wakeBackend, checkBackendReady } from '../api/api';
import { SpinnerIcon } from '../components/Icons';

interface BackendContextType {
  isReady: boolean;
  isWaking: boolean;
  ensureReady: () => Promise<void>;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

// Using React.PropsWithChildren to ensure children are correctly typed and recognized in JSX usage (e.g., in index.tsx)
export function BackendProvider({ children }: React.PropsWithChildren<{}>) {
  const [isReady, setIsReady] = useState(false);
  const [isWaking, setIsWaking] = useState(false);

  // Silent wake on mount
  useEffect(() => {
    wakeBackend();
    // Pre-check readiness
    checkBackendReady().then(ready => {
      if (ready) setIsReady(true);
    });
  }, []);

  const ensureReady = async (): Promise<void> => {
    // Check current status
    const ready = await checkBackendReady();
    if (ready) {
      setIsReady(true);
      return;
    }

    // Start waking process
    setIsWaking(true);
    setIsReady(false);

    return new Promise((resolve) => {
      const poll = async () => {
        const stillChecking = await checkBackendReady();
        if (stillChecking) {
          setIsReady(true);
          setIsWaking(false);
          resolve();
        } else {
          setTimeout(poll, 3000);
        }
      };
      poll();
    });
  };

  return (
    <BackendContext.Provider value={{ isReady, isWaking, ensureReady }}>
      {children}
      
      {/* Waking Overlay */}
      {isWaking && (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in p-6 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center max-w-sm">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 relative">
              <SpinnerIcon className="w-8 h-8 text-indigo-600" />
              <div className="absolute inset-0 bg-indigo-600/10 animate-ping rounded-2xl" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Backend is Waking Up</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Our servers are starting up to process your request. This usually takes 15-30 seconds.
            </p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-600 animate-[loading_20s_ease-in-out_infinite]" style={{ width: '40%' }} />
            </div>
            <style>{`
              @keyframes loading {
                0% { width: 5%; }
                50% { width: 85%; }
                100% { width: 95%; }
              }
            `}</style>
          </div>
        </div>
      )}
    </BackendContext.Provider>
  );
}

export const useBackend = () => {
  const context = useContext(BackendContext);
  if (!context) throw new Error('useBackend must be used within BackendProvider');
  return context;
};
