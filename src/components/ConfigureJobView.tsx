import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConfigView from './ConfigView';
import ProcessingView from './ProcessingView';
import SuccessView from './SuccessView';
import { useUser } from '../context/UserContext';
import { usePdfJob } from '../features/pdf/hooks/usePdfJob';
import { useStartJob, useRequestFullReview, useUpdateJobTitle, useReuploadPdf } from '../features/pdf/hooks/mutations';
import { useBackend } from '../context/BackendContext';
import { SpinnerIcon, UploadIcon, FileIcon } from './Icons';
import type { AppStep } from '../types';



function InsufficientCreditsModal({ required, current, onClose, onBuy }: { required: number, current: number, onClose: () => void, onBuy: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full text-center border border-slate-100 animate-fade-in-up">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
           <svg className="w-10 h-10 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Low Credits</h3>
        <p className="text-slate-500 mb-8 leading-relaxed">
          You need <span className="font-bold text-slate-900">{required} credits</span> for this document. You currently have <span className="font-bold text-indigo-600">{current} credits</span>.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={onBuy} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95">
            Get More Credits
          </button>
          <button onClick={onClose} className="w-full py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl hover:bg-slate-100 transition-all">
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConfigureJobView() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();
  const { ensureReady } = useBackend();

  const [step, setStep] = useState<AppStep>("CONFIG");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showLowCredits, setShowLowCredits] = useState<number | null>(null);
  
  const [isPdfMissing, setIsPdfMissing] = useState(false);
  const [recoveryFile, setRecoveryFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");



  // Use React Query hooks for job metadata and progress
  const pdfJobQuery = usePdfJob(jobId);

  useEffect(() => {
    setIsLoading(pdfJobQuery.isLoading);
    if (pdfJobQuery.data) {
      setTempTitle(pdfJobQuery.data.title || '');
      if (pdfJobQuery.data.status !== 'done') setStep('PROCESSING');
    }
    if (pdfJobQuery.error) {
      const e: any = pdfJobQuery.error;
      if (e?.response?.status === 404) setError('Document session not found.');
      else setError('Failed to load document metadata.');
    }
  }, [pdfJobQuery.data, pdfJobQuery.isLoading, pdfJobQuery.error]);

  const updateTitleMutation = useUpdateJobTitle();
  const handleUpdateTitle = async () => {
    if (!jobId || !tempTitle.trim()) return;
    try {
      await updateTitleMutation.mutateAsync({ jobId, title: tempTitle.trim() });
      setIsEditingTitle(false);
    } catch (err) {
      alert('Failed to update title');
    }
  };

  const reuploadMutation = useReuploadPdf();
  const handleReupload = async () => {
    if (!jobId || !recoveryFile) return;
    setIsLoading(true);
    try {
      await reuploadMutation.mutateAsync({ jobId, file: recoveryFile });
      setIsPdfMissing(false);
      await refreshUser();
      setStep('CONFIG');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Re-upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const startJobMutation = useStartJob();
  const requestFullReviewMutation = useRequestFullReview();

  const handleConfigConfirm = async (startPage: number, isFull: boolean, endPage?: number) => {
    if (!jobId) return;
    
    // Global lock check (redundant but safe)

    setIsLoading(true);
    setError(null);
    try {
      await ensureReady();

      if (isFull) {
        await requestFullReviewMutation.mutateAsync(jobId);
        await refreshUser();
        setIsReviewMode(true);
        setStep('SUCCESS');
      } else {
        const finalEnd = endPage || Math.min(startPage + 3, (pdfJobQuery.data as any)?.pages || 1);
        await startJobMutation.mutateAsync({ jobId, start: startPage, end: finalEnd });
        await refreshUser();
        setIsReviewMode(false);
        setStep('PROCESSING');
      }
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || '';
      if (errorMsg.includes('PDF not found') || errorMsg.includes('expired')) {
        setIsPdfMissing(true);
      } else if (errorMsg.includes('already requested')) {
        setIsReviewMode(true);
        setStep('SUCCESS');
      } else {
        setError(errorMsg || 'Failed to process your request.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessingComplete = () => {
    localStorage.removeItem('narrio_active_processing');
    setStep("SUCCESS");
  };

  if (!jobId) return null;

  // Global Processing Lock View
 

  if (isLoading && step === "CONFIG") {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-slate-400">
        <SpinnerIcon className="w-10 h-10 text-indigo-600 mb-4" />
        <p className="animate-pulse font-bold uppercase tracking-widest text-xs">Accessing Document Session...</p>
      </div>
    );
  }

  if (isPdfMissing) {
    return (
      <div className="max-w-xl w-full mx-auto bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Restore Document</h2>
          <p className="text-slate-500 font-medium">Your PDF has been removed from our server (5-day limit).</p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 text-center">
          <p className="text-red-700 font-bold text-sm">
             <span className="uppercase font-black block mb-1">Warning:</span>
             You must upload the exact same PDF to avoid processing conflicts and audio misalignment.
          </p>
        </div>

        {!recoveryFile ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-4 border-dashed border-slate-100 rounded-[2rem] p-12 text-center hover:border-indigo-400 hover:bg-slate-50 transition-all group"
          >
            <div className="p-4 bg-indigo-50 rounded-2xl w-14 h-14 mx-auto mb-4 group-hover:scale-110 transition-transform">
              <UploadIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="font-black text-slate-900 uppercase text-xs tracking-widest">Select Original PDF</p>
            <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={(e) => e.target.files && setRecoveryFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="space-y-6">
             <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <FileIcon className="w-6 h-6 text-indigo-600" />
                <span className="font-bold text-slate-900 truncate flex-grow">{recoveryFile.name}</span>
                <button onClick={() => setRecoveryFile(null)} className="text-slate-300 hover:text-red-500">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             <button
              onClick={handleReupload}
              className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-indigo-600 transition-all"
             >
              Restore & Continue
             </button>
          </div>
        )}
      </div>
    );
  }

  if (error && step === "CONFIG") {
    return (
      <div className="max-w-xl mx-auto p-12 text-center bg-white rounded-[3rem] shadow-xl border border-red-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase">Error</h2>
        <p className="text-slate-500 mb-8 font-medium">{error}</p>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg">Return Home</button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center py-10">
      {pdfJobQuery.data && step === "CONFIG" && (
        <div className="text-center mb-10 max-w-xl w-full px-4 group">
          {isEditingTitle ? (
            <div className="flex gap-2 items-center">
               <input 
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                autoFocus
                className="w-full text-3xl font-black text-slate-900 bg-white border-2 border-indigo-100 rounded-2xl px-6 py-3 outline-none focus:ring-4 focus:ring-indigo-50"
               />
               <button onClick={handleUpdateTitle} className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 transition-all">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               </button>
               <button onClick={() => { setIsEditingTitle(false); setTempTitle((pdfJobQuery.data as any)?.title || ""); }} className="bg-slate-50 text-slate-400 p-4 rounded-2xl hover:bg-slate-100 transition-all">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
          ) : (
            <div 
              onClick={() => setIsEditingTitle(true)}
              className="inline-flex flex-col items-center cursor-pointer hover:bg-slate-50 p-6 rounded-[2.5rem] transition-all border border-transparent hover:border-slate-100"
            >
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to Edit Title</p>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">
                {(pdfJobQuery.data as any)?.title || "Untitled Document"}
              </h1>
              <div className="w-12 h-1.5 bg-indigo-100 rounded-full mt-4" />
            </div>
          )}
        </div>
      )}

      {showLowCredits !== null && user && (
        <InsufficientCreditsModal 
          required={showLowCredits} 
          current={user.credits} 
          onClose={() => setShowLowCredits(null)} 
          onBuy={() => navigate('/store')} 
        />
      )}

      {step === "CONFIG" && pdfJobQuery.data && (
        <ConfigView 
          numPages={(pdfJobQuery.data as any).pages} 
          onConfirm={handleConfigConfirm} 
          onLowCredits={(req) => setShowLowCredits(req)}
          isLoading={isLoading} 
        />
      )}

      {step === "PROCESSING" && (
        <ProcessingView 
          jobId={jobId} 
          onComplete={handleProcessingComplete} 
        />
      )}

      {step === "SUCCESS" && (
        <div className="w-full flex justify-center">
          {isReviewMode ? (
            <div className="bg-white rounded-[3rem] shadow-2xl p-10 md:p-16 max-w-2xl w-full text-center border border-slate-100 animate-fade-in-up">
              <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                <svg className="w-12 h-12 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">Request Pending</h2>
              <div className="bg-amber-50 text-amber-900 p-6 rounded-2xl border border-amber-100 mb-10 text-left">
                <p className="font-bold mb-2">Success! Your manual review has been queued.</p>
                <p className="text-sm opacity-90">Our team will manually review and narrate your full document. We will send an email once your audiobook is ready for playback.</p>
              </div>
              <button 
                onClick={() => navigate('/')} 
                className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <SuccessView 
              onReset={() => navigate('/')} 
              onContinue={() => setStep("CONFIG")} 
            />
          )}
        </div>
      )}
    </div>
  );
}