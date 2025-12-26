import React, { useState } from 'react';
import { FileIcon } from './Icons';
import { useUser } from '../context/UserContext';

interface ConfigViewProps {
  numPages: number;
  onConfirm: (startPage: number, isFull: boolean) => void;
  isLoading: boolean;
  initialStartPage?: number;
}

export default function ConfigView({ numPages, onConfirm, isLoading, initialStartPage = 1 }: ConfigViewProps) {
  const [startPage, setStartPage] = useState<number | string>(initialStartPage);
  const [isFullReview, setIsFullReview] = useState(false);
  const { user } = useUser();
  const MAX_FREE_PAGES = 4;

  const numericVal = typeof startPage === 'string' ? (parseInt(startPage) || 0) : startPage;
  const effectiveStart = numericVal < 1 ? 1 : Math.min(numericVal, numPages);

  const endPage = isFullReview ? numPages : Math.min(effectiveStart + MAX_FREE_PAGES - 1, numPages);
  const pageCount = endPage - effectiveStart + 1;
  const creditCost = isFullReview ? pageCount : 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && user.credits < creditCost) {
      alert("Insufficient credits. Please top up in the store.");
      return;
    }
    onConfirm(effectiveStart, isFullReview);
  };

  return (
    <div className="max-w-xl w-full mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-100 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <FileIcon className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Document Loaded</h3>
          <p className="text-slate-600"><span className="font-bold text-slate-900">{numPages}</span> total pages.</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-8">
        <button 
          type="button"
          onClick={() => setIsFullReview(false)}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isFullReview ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Standard (4 Pages)
        </button>
        <button 
          type="button"
          onClick={() => setIsFullReview(true)}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isFullReview ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Full Review (Manual)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {!isFullReview ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4">Reading Range</label>
            <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
               <input
                type="number"
                value={startPage}
                onChange={e => setStartPage(e.target.value)}
                className="w-20 text-center text-2xl font-bold rounded-lg border-slate-300 py-2 text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-slate-400 font-bold">➔</span>
              <div className="w-20 h-[52px] flex items-center justify-center text-2xl font-bold bg-slate-200 rounded-lg text-slate-500">
                {endPage}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-amber-50 border border-amber-100 rounded-xl space-y-4">
             <div className="flex gap-3">
               <div className="flex-shrink-0 w-6 h-6 text-amber-600">
                  <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
               </div>
               <div className="text-sm text-amber-900 leading-relaxed font-medium">
                 <p className="font-bold mb-1 uppercase tracking-tight">Manual Processing Required</p>
                 Please ensure you have enough credits ({numPages} credits for this file) before the process. Your document will be manually processed.
               </div>
             </div>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-xl">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Total Cost</p>
            <p className="text-xl font-bold">{creditCost} Credits</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Your Balance</p>
            <p className={`text-xl font-bold ${user && user.credits < creditCost ? 'text-red-400' : 'text-green-400'}`}>
              {user?.credits || 0}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-4 rounded-xl shadow-lg font-black uppercase tracking-widest transition-transform active:scale-95 ${isFullReview ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? 'Processing Request...' : isFullReview ? 'Request Full Review' : 'Start Conversion'}
        </button>
      </form>
    </div>
  );
}