import React, { useState, useRef } from 'react';
import { UploadIcon, FileIcon, SpinnerIcon } from './Icons';
import { useBackend } from '../context/BackendContext';

interface UploadViewProps {
  onStart: (file: File, title: string) => void;
  isLoading: boolean;
}

export default function UploadView({ onStart, isLoading }: UploadViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isWaking } = useBackend();
  
  const MAX_FILE_SIZE_MB = 50;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isWaking) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isWaking) return;
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    if (f.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    if (f.size > MAX_FILE_SIZE_BYTES) {
      alert(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }
    setFile(f);
    // Auto-set title from filename (strip .pdf)
    setTitle(f.name.replace(/\.[^/.]+$/, ""));
  };

  const handleSubmit = () => {
    if (file && title.trim()) {
      onStart(file, title.trim());
    } else {
      alert("Please provide a title for your audiobook.");
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto">
      {!file ? (
        <div
          onClick={() => !isWaking && !isLoading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            cursor-pointer group relative flex flex-col items-center justify-center w-full h-80 
            rounded-[2.5rem] border-4 border-dashed transition-all duration-300 ease-in-out
            bg-white shadow-sm hover:shadow-2xl
            ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[0.98]' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}
            ${isWaking || isLoading ? 'opacity-50 cursor-not-allowed grayscale' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-8">
            <div className={`p-5 rounded-[1.5rem] mb-6 transition-all duration-300 ${isDragging ? 'bg-white shadow-xl rotate-12' : 'bg-indigo-50 group-hover:bg-indigo-100 group-hover:-rotate-3'}`}>
              <UploadIcon className="w-12 h-12 text-indigo-600" />
            </div>
            <p className="mb-2 text-2xl font-black text-slate-800 tracking-tight">
              {isDragging ? 'Drop it here!' : 'Choose your PDF'}
            </p>
            <p className="text-sm text-slate-400 font-medium">
              or drop your document here (Max {MAX_FILE_SIZE_MB}MB)
            </p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="application/pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isWaking || isLoading}
          />
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 animate-fade-in-up">
          <div className="mb-8">
            <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-3 ml-1">Audiobook Title</label>
            <input 
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. My Semester Notes"
              className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-5 mb-10 p-5 bg-indigo-50 rounded-3xl border border-indigo-100 group">
            <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
              <FileIcon className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-indigo-950 truncate italic opacity-60">
                {file.name}
              </p>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} Megabytes
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => !isLoading && setFile(null)}
              className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || isWaking}
            className={`
              w-full flex justify-center items-center gap-3 py-5 px-4 border border-transparent rounded-2xl shadow-xl text-lg font-black uppercase tracking-widest text-white 
              transition-all duration-300
              ${isLoading || isWaking
                ? 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-2xl hover:-translate-y-1 active:scale-95'}
            `}
          >
            {isLoading ? (
              <>
                <SpinnerIcon className="w-5 h-5" />
                <span>Uploading...</span>
              </>
            ) : (
              'Upload & Analyze'
            )}
          </button>
        </div>
      )}
    </div>
  );
}