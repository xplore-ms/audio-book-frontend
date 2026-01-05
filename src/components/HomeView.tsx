import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadView from './UploadView';
import ConfigView from './ConfigView';
import ProcessingView from './ProcessingView';
import SuccessView from './SuccessView';
import { uploadPdf, startJob, requestFullReview } from '../api/api';
import { useUser } from '../context/UserContext';
import { useBackend } from '../context/BackendContext';
import type { AppStep, UploadResponse } from '../types';

// Minimalistic reusable prompt for low credits
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

export default function HomeView() {
  const [step, setStep] = useState<AppStep>("UPLOAD");
  const { user, refreshUser } = useUser();
  const { ensureReady } = useBackend();
  const navigate = useNavigate();
  
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showLowCredits, setShowLowCredits] = useState<number | null>(null);

  const handleUpload = async (file: File, title: string) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await ensureReady();
      const uploadRes = await uploadPdf(file, title);
      setUploadData(uploadRes);
      setJobId(uploadRes.job_id);
      setStep("CONFIG");
    } catch (e: any) {
      setError(e.response?.data?.detail || "Upload failed. Your file might be too large or you lack credits.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigConfirm = async (startPage: number, isFull: boolean, endPage?: number) => {
    if (!uploadData || !jobId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await ensureReady();
      
      if (isFull) {
        await requestFullReview(jobId);
        await refreshUser(); // Sync credits immediately after backend request
        setIsReviewMode(true);
        setStep("SUCCESS");
      } else {
        // Use the manually selected endPage, defaulting to the 4-page max logic if somehow missing
        const finalEnd = endPage || Math.min(startPage + 3, uploadData.pages);
        const startRes = await startJob(jobId, startPage, finalEnd);
        await refreshUser(); // Sync credits immediately after backend starts job
        setTaskIds(startRes.task_ids);
        setIsReviewMode(false);
        setStep("PROCESSING");
      }
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || "Failed to process your request.";
      if (errorMsg.includes("already requested")) {
        setIsReviewMode(true);
        setStep("SUCCESS");
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {showLowCredits !== null && user && (
        <InsufficientCreditsModal 
          required={showLowCredits} 
          current={user.credits} 
          onClose={() => setShowLowCredits(null)} 
          onBuy={() => navigate('/store')} 
        />
      )}

      {step === "UPLOAD" && (
        <div className="text-center mb-12 animate-fade-in-down">
          <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight leading-none">
            PDF to <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Voice</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Professional document conversion powered by Narrio's neural speech engine.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-8 mx-auto p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl max-w-xl text-center font-bold animate-shake">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        {step === "UPLOAD" && <UploadView onStart={handleUpload} isLoading={isLoading} />}
        {step === "CONFIG" && uploadData && (
          <ConfigView 
            numPages={uploadData.pages} 
            onConfirm={handleConfigConfirm} 
            onLowCredits={(req) => setShowLowCredits(req)}
            isLoading={isLoading} 
          />
        )}
        {step === "PROCESSING" && jobId && <ProcessingView taskIds={taskIds} jobId={jobId} onComplete={() => setStep("SUCCESS")} />}
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
                  onClick={() => setStep("UPLOAD")} 
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all active:scale-95"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <SuccessView onReset={() => setStep("UPLOAD")} onContinue={() => setStep("CONFIG")} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}