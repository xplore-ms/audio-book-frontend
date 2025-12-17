import React, { useState } from 'react';
import { FileIcon } from './Icons';

interface ConfigViewProps {
  numPages: number;
  onConfirm: (startPage: number) => void;
  isLoading: boolean;
  initialStartPage?: number;
}

export default function ConfigView({ numPages, onConfirm, isLoading, initialStartPage = 1 }: ConfigViewProps) {
  // Allow string state to support empty input during typing
  // Use initialStartPage prop, default to 1 if not provided
  const [startPage, setStartPage] = useState<number | string>(initialStartPage);
  const MAX_PAGES = 4;

  // Resolve current value to a valid number for display logic
  const numericVal = typeof startPage === 'string' ? (parseInt(startPage) || 0) : startPage;
  // Clamp for calculation purposes (e.g. endPage display)
  // If user types 0 or empty, we default to 1 for the preview
  const effectiveStart = numericVal < 1 ? 1 : Math.min(numericVal, numPages);

  // Calculate end page: Start + 3 (e.g., 1+3=4, range 1,2,3,4)
  // But clamped to numPages
  const endPage = Math.min(effectiveStart + MAX_PAGES - 1, numPages);
  const pageCount = endPage - effectiveStart + 1;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Allow clearing the input
    if (val === '') {
      setStartPage('');
      return;
    }

    // Parse and set if number
    const parsed = parseInt(val);
    if (!isNaN(parsed)) {
      setStartPage(parsed);
    }
  };

  const handleBlur = () => {
    // On blur, validate and clamp the value within bounds
    let val = typeof startPage === 'string' ? parseInt(startPage) : startPage;
    
    if (isNaN(val) || val < 1) {
      val = 1;
    } else if (val > numPages) {
      val = numPages;
    }
    setStartPage(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(effectiveStart);
  };

  return (
    <div className="max-w-xl w-full mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-100 animate-fade-in-up">
      {/* Header info about the file */}
      <div className="flex items-center gap-4 mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <FileIcon className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">PDF Analysis Complete</h3>
          <p className="text-slate-600">Found <span className="font-bold text-slate-900">{numPages}</span> pages in your document.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <label htmlFor="startPage" className="block text-lg font-medium text-slate-900 mb-2">
            Which page should we start reading from?
          </label>
          <p className="text-slate-500 mb-6 text-sm">
            Due to high demand, the free plan processes up to <span className="font-bold text-indigo-600">{MAX_PAGES} pages</span> at a time.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div className="relative">
              <input
                type="number"
                id="startPage"
                min={1}
                max={numPages}
                value={startPage}
                onChange={handleChange}
                onBlur={handleBlur}
                className="block w-32 text-center text-3xl font-bold rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-2 text-indigo-600 bg-white border"
              />
              <span className="block text-center mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Page</span>
            </div>

            <div className="text-slate-400 font-medium">➔</div>

            <div className="relative">
               <div className="flex items-center justify-center w-32 h-[62px] text-center text-3xl font-bold rounded-lg border-slate-200 bg-slate-100 text-slate-500 border cursor-not-allowed">
                 {endPage}
               </div>
               <span className="block text-center mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">End Page</span>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-slate-600">
            Converting <span className="font-bold">{pageCount}</span> page{pageCount !== 1 ? 's' : ''}.
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white 
            transition-all duration-200
            ${isLoading 
              ? 'bg-indigo-300 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'}
          `}
        >
          {isLoading ? 'Starting Conversion...' : 'Start Conversion'}
        </button>
      </form>
    </div>
  );
}