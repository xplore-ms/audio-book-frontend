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

export default function HomeView() {
  const [step, setStep] = useState<AppStep>("UPLOAD");
  const { user, spendCredits } = useUser();
  const { ensureReady } = useBackend();
  const navigate = useNavigate();
  
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const handleUpload = async (file: File) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await ensureReady();
      const uploadRes = await uploadPdf(file);
      setUploadData(uploadRes);
      setJobId(uploadRes.job_id);
      setStep("CONFIG");
    } catch (e: any) {
      setError(e.response?.data?.detail || "Upload failed. Your file might be too large or you lack credits.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigConfirm = async (startPage: number, isFull: boolean) => {
    if (!uploadData || !jobId) return;
    
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      await ensureReady();
      
      if (isFull) {
        // Use the manual review endpoint
        await requestFullReview(jobId);
        setIsReviewMode(true);
        setStep("SUCCESS");
      } else {
        // Standard automated process
        const pageCount = Math.min(4, uploadData.pages - startPage + 1);
        const endPage = startPage + pageCount - 1;
        const startRes = await startJob(jobId, startPage, endPage);
        setTaskIds(startRes.task_ids);
        spendCredits(1); 
        setIsReviewMode(false);
        setStep("PROCESSING");
      }
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || "Failed to process your request.";
      if (errorMsg.includes("already requested")) {
        // If already requested, we can consider it a "success" state transition to show the pending message
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
        {step === "CONFIG" && uploadData && <ConfigView numPages={uploadData.pages} onConfirm={handleConfigConfirm} isLoading={isLoading} />}
        {step === "PROCESSING" && jobId && <ProcessingView taskIds={taskIds} jobId={jobId} onComplete={() => setStep("SUCCESS")} onError={setError} />}
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