import { useState, useEffect } from 'react';
import UploadView from './components/UploadView';
import ConfigView from './components/ConfigView';
import ProcessingView from './components/ProcessingView';
import SuccessView from './components/SuccessView';
import HowItWorks from './components/HowItWorks';
// import About from './components/About';
import Donate from './components/Donate';
import { uploadPdf, startJob } from './api/api';
import type { AppStep, AppView, UploadResponse } from './types';

export default function App() {
  const [view, setView] = useState<AppView>("HOME");
  const [step, setStep] = useState<AppStep>("UPLOAD");
  
  // Data State
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen for custom navigation events from child components
  useEffect(() => {
    const handleNavHome = () => setView("HOME");
    window.addEventListener('nav-home', handleNavHome);
    return () => window.removeEventListener('nav-home', handleNavHome);
  }, []);

  // Step 1: Upload the file
  const handleUpload = async (file: File, userEmail: string) => {
    setIsLoading(true);
    setError(null);
    setEmail(userEmail);

    try {
      const uploadRes = await uploadPdf(file, userEmail);
      setUploadData(uploadRes);
      setJobId(uploadRes.job_id);
      
      // Move to configuration step
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
      // Calculate end page (Start + 3, but not exceeding total pages)
      const MAX_PAGES = 4;
      const endPage = Math.min(startPage + MAX_PAGES - 1, uploadData.num_pages);

      const startRes = await startJob(uploadData.job_id, uploadData.remote_pdf_path, startPage, endPage);
      setTaskIds(startRes.task_ids);

      // Move to processing
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

  const handleReset = () => {
    setStep("UPLOAD");
    setUploadData(null);
    setJobId(null);
    setTaskIds([]);
    setEmail('');
    setError(null);
  };

  const NavLink = ({ targetView, label }: { targetView: AppView, label: string }) => (
    <button 
      onClick={() => setView(targetView)}
      className={`transition-colors ${view === targetView ? 'text-indigo-600 font-semibold' : 'hover:text-indigo-600'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Navigation / Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <button onClick={() => setView("HOME")} className="flex-shrink-0 flex items-center gap-2 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:bg-indigo-700 transition-colors">
                A
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">AudioPDF</span>
            </button>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-500">
              <NavLink targetView={"HOME"} label="Converter" />
              <NavLink targetView={"HOW_IT_WORKS"} label="How it works" />
              {/* <NavLink targetView={"ABOUT"} label="About" /> */}
              
              {/* Pricing with Tooltip */}
              <div className="group relative">
                <button className="hover:text-indigo-600 transition-colors cursor-default">Pricing</button>
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Coming Soon
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </div>

              <button 
                onClick={() => setView("DONATE")}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors"
              >
                Donate
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-indigo-50 to-transparent -z-10 pointer-events-none" />
        
        <div className="w-full max-w-7xl mx-auto">
          {view === "HOME" && (
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
                  <SuccessView email={email} onReset={handleReset} />
                )}
              </div>
            </>
          )}

          {view === "HOW_IT_WORKS" && <HowItWorks />}
          {/* {view === "ABOUT" && <About />} */}
          {view === "DONATE" && <Donate />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} AudioPDF. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button onClick={() => setView("HOME")} className="hover:text-indigo-600">Home</button>
            {/* <button onClick={() => setView("ABOUT")} className="hover:text-indigo-600">About</button> */}
            <button onClick={() => setView("DONATE")} className="hover:text-indigo-600">Donate</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
