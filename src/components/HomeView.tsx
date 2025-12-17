import { useState } from 'react';
import UploadView from './UploadView';
import ConfigView from './ConfigView';
import ProcessingView from './ProcessingView';
import SuccessView from './SuccessView';
import { uploadPdf, startJob } from '../api/api';
import type { AppStep, UploadResponse } from '../types';

export default function HomeView() {
  const [step, setStep] = useState<AppStep>("UPLOAD");
  
  // Data State
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  
  // Track the last page processed
  const [lastProcessedPage, setLastProcessedPage] = useState<number>(0);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Upload the file
  const handleUpload = async (file: File, userEmail: string) => {
    setIsLoading(true);
    setError(null);
    setEmail(userEmail);
    setLastProcessedPage(0);

    try {
      const uploadRes = await uploadPdf(file, userEmail);
      setUploadData(uploadRes);
      setJobId(uploadRes.job_id);
      setStep("CONFIG");
    } catch (e: any) {
      console.error(e);
      setError("An error occurred during upload. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Configure range and start job
  const handleConfigConfirm = async (startPage: number) => {
    if (!uploadData) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const MAX_PAGES = 4;
      const endPage = Math.min(startPage + MAX_PAGES - 1, uploadData.num_pages);
      setLastProcessedPage(endPage);

      const startRes = await startJob(uploadData.job_id, uploadData.remote_pdf_path, startPage, endPage);
      setTaskIds(startRes.task_ids);
      setStep("PROCESSING");
    } catch (e: any) {
      console.error(e);
      setError("Failed to start processing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessingComplete = () => {
    setStep("SUCCESS");
  };

  const handleContinue = () => {
    setStep("CONFIG");
    setTaskIds([]);
    setError(null);
  };

  const handleReset = () => {
    setStep("UPLOAD");
    setUploadData(null);
    setJobId(null);
    setTaskIds([]);
    setEmail('');
    setLastProcessedPage(0);
    setError(null);
  };

  return (
    <>
      {/* Header Text (Only show on Upload step) */}
      {step === "UPLOAD" && (
        <div className="text-center mb-12 max-w-2xl mx-auto animate-fade-in-down">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            PDF to Audio Converter
          </h1>
          <p className="text-lg text-slate-600">
            Transform your documents into high-quality audiobooks using AI. 
            Listen on the go, anytime, anywhere.
          </p>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="mb-6 mx-auto p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg max-w-xl w-full text-center">
          {error}
        </div>
      )}

      {/* Converter Views */}
      <div className="w-full flex justify-center">
        {step === "UPLOAD" && (
          <UploadView onStart={handleUpload} isLoading={isLoading} />
        )}

        {step === "CONFIG" && uploadData && (
          <ConfigView 
            numPages={uploadData.num_pages} 
            onConfirm={handleConfigConfirm}
            isLoading={isLoading}
            initialStartPage={lastProcessedPage > 0 ? lastProcessedPage + 1 : 1}
          />
        )}

        {step === "PROCESSING" && jobId && (
          <ProcessingView 
            taskIds={taskIds} 
            jobId={jobId} 
            onComplete={handleProcessingComplete} 
            onError={(msg) => setError(msg)}
          />
        )}

        {step === "SUCCESS" && (
          <SuccessView 
            email={email} 
            onReset={handleReset} 
            onContinue={handleContinue}
          />
        )}
      </div>
    </>
  );
}