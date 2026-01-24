import React, { useState, useEffect } from 'react';
import { FileIcon } from './Icons';
import { useUser } from '../context/UserContext';

interface ConfigViewProps {
  numPages: number;
  onConfirm: (startPage: number, isFull: boolean, endPage?: number) => void;
  onLowCredits: (required: number) => void;
  isLoading: boolean;
  initialStartPage?: number;
}

export default function ConfigView({ numPages, onConfirm, onLowCredits, isLoading, initialStartPage = 1 }: ConfigViewProps) {
  const [startPage, setStartPage] = useState<number | ''>(initialStartPage);
  const [endPage, setEndPage] = useState<number | ''>(Math.min(initialStartPage + 3, numPages));
  const [isFullReview, setIsFullReview] = useState(false);
  const { user } = useUser();
  const MAX_STANDARD_PAGES = 4;

  useEffect(() => {
    if (!isFullReview) {
    if (startPage === '' || endPage === '') return;

      const currentRange = endPage - startPage + 1;
      if (currentRange > MAX_STANDARD_PAGES) {
        setEndPage(startPage + MAX_STANDARD_PAGES - 1);
      } else if (endPage < startPage) {
        setEndPage(startPage);
      }
    }
  }, [startPage]);

  const handleStartChange = (val: string) => {
    if (val === '') {
      setStartPage('');
      return;
    }
    const num = parseInt(val);
    if (isNaN(num)) return;
    const clamped = Math.max(1, Math.min(num, numPages));
    setStartPage(clamped);
  };

  const handleEndChange = (val: string) => {
    if (val === '') {
      setEndPage('');
      return;
    }
    if (startPage === '') {
      setEndPage('');
      return;
    }
    const num = parseInt(val);
    if (isNaN(num)) return;
    let clamped = Math.max(startPage, Math.min(num, numPages));
    if (clamped - startPage + 1 > MAX_STANDARD_PAGES) {
      clamped = startPage + MAX_STANDARD_PAGES - 1;
    }
    setEndPage(clamped);
  };

  const startNum = startPage === '' ? 0 : startPage;
  const endNum = endPage === '' ? -1 : endPage;
  const effectivePageCount = isFullReview ? numPages : (endNum - startNum + 1);
  const creditCost = startPage === '' ? 0 : effectivePageCount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startPage === '' || endPage === '') return;
    if (user && user.credits < creditCost) {
      onLowCredits(creditCost);
      return;
    }
    onConfirm(startPage, isFullReview, isFullReview ? numPages : endPage);
  };

  return (
    <div className="max-w-xl w-full mx-auto bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 animate-fade-in-up">
      {/* Document Info Bar */}
      <div className="flex items-center gap-5 mb-8 p-5 bg-indigo-50 rounded-3xl border border-indigo-100">
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <FileIcon className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Document Analysis</h3>
          <p className="text-slate-900 font-black truncate leading-none">
            {numPages} <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest ml-1">Total Pages</span>
          </p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-10">
        <button 
          type="button"
          onClick={() => setIsFullReview(false)}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isFullReview ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Select Range
        </button>
        <button 
          type="button"
          onClick={() => setIsFullReview(true)}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isFullReview ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Full Document
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {!isFullReview ? (
          <div className="animate-fade-in space-y-6">
            <div className="text-center space-y-2 mb-8 px-4">
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Automatic Processing (Up to 4 pages)</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Your PDF will be securely stored on our servers for up to <span className="text-indigo-600 font-bold">5 days</span> from the time of upload. 
                This option is best for quick previews or short documents.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-8 rounded-3xl border border-slate-100 group">
               <div className="flex-1 text-center">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Start</p>
                  <input
                    type="number"
                    value={startPage}
                    onChange={e => handleStartChange(e.target.value)}
                    className="w-full text-center text-4xl font-black rounded-2xl border-none bg-transparent py-2 text-indigo-600 outline-none focus:ring-0 tabular-nums"
                  />
               </div>
              <div className="h-10 w-px bg-slate-200" />
               <div className="flex-1 text-center">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">End</p>
                  <input
                    type="number"
                    value={endPage}
                    onChange={e => handleEndChange(e.target.value)}
                    className="w-full text-center text-4xl font-black rounded-2xl border-none bg-transparent py-2 text-indigo-600 outline-none focus:ring-0 tabular-nums"
                  />
               </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-6">
            <div className="text-center space-y-2 mb-8 px-4">
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Manual Review (Full Document Processing)</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Manual Review provides complete document coverage and enhanced audio quality.
              </p>
            </div>

            <div className="p-8 bg-amber-50 border border-amber-100 rounded-[2rem] space-y-4">
               <div className="flex gap-4">
                 <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-amber-500">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                 </div>
                 <div className="text-[13px] text-amber-950 font-medium leading-relaxed">
                   <p className="font-black mb-3 uppercase tracking-tight text-xs">Manual Processing Timeline</p>
                   <ul className="space-y-2 opacity-80 list-disc pl-4">
                     <li>Processing may take some time to begin.</li>
                     <li>Once processing starts, completion typically takes up to <span className="font-bold">3 hours</span>.</li>
                     <li>You’ll be notified by email as soon as processing begins.</li>
                   </ul>
                 </div>
               </div>
            </div>
            <p className="text-center text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] italic">
              Recommended for long documents & premium listening
            </p>
          </div>
        )}

        {/* Price & Balance Bar */}
        <div className="grid grid-cols-2 gap-px bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner">
          <div className="bg-white p-6 text-center">
            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black mb-1">Fee</p>
            <p className="text-2xl font-black text-slate-900 tabular-nums">{creditCost} <span className="text-[10px] text-indigo-500">CR</span></p>
          </div>
          <div className="bg-white p-6 text-center">
            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black mb-1">Balance</p>
            <p className={`text-2xl font-black tabular-nums ${user && user.credits < creditCost ? 'text-red-500' : 'text-slate-900'}`}>
              {user?.credits || 0} <span className="text-[10px] text-slate-300">CR</span>
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-6 rounded-2xl shadow-xl font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-1 active:scale-95 text-xs ${isFullReview ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Initializing...</span>
            </div>
          ) : isFullReview ? 'Request Full Review' : 'Start Processing'}
        </button>
      </form>
    </div>
  );
}