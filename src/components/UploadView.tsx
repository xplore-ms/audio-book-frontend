import React, { useState, useRef } from 'react';
import { UploadIcon, FileIcon } from './Icons';

interface UploadViewProps {
  onStart: (file: File, email: string) => void;
  isLoading: boolean;
}

export default function UploadView({ onStart, isLoading }: UploadViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const MAX_FILE_SIZE_MB = 50;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && email) {
      onStart(file, email);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto">
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            cursor-pointer group relative flex flex-col items-center justify-center w-full h-80 
            rounded-3xl border-4 border-dashed transition-all duration-200 ease-in-out
            bg-white shadow-sm hover:shadow-lg
            ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}
          `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-white' : 'bg-indigo-50 group-hover:bg-indigo-100'}`}>
              <UploadIcon className="w-10 h-10 text-indigo-600" />
            </div>
            <p className="mb-2 text-xl font-semibold text-slate-700">
              {isDragging ? 'Drop PDF here' : 'Select PDF file'}
            </p>
            <p className="text-sm text-slate-500">
              or drop PDF here (Max {MAX_FILE_SIZE_MB}MB)
            </p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="application/pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 animate-fade-in">
          <div className="flex items-center gap-4 mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <FileIcon className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-indigo-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-indigo-600">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => setFile(null)}
              className="text-slate-400 hover:text-red-500 text-sm font-medium px-2 py-1"
            >
              Change
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Where should we send the audio?
              </label>
              <input
                type="email"
                id="email"
                required
                placeholder="name@example.com"
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 text-slate-900 bg-slate-50 border"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">
                We'll email you the download link once processing is complete.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className={`
                w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white 
                transition-all duration-200
                ${isLoading || !email 
                  ? 'bg-indigo-300 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'}
              `}
            >
              {isLoading ? 'Uploading...' : 'Upload & Continue'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}