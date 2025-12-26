import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../api/api';
import { FileIcon } from './Icons';

export default function ListenView() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('job_id');
  const [error, setError] = useState<string | null>(null);

  // Pull token from local storage if not in URL
  const token = searchParams.get('token') || localStorage.getItem('narrio_token');

  if (!jobId || !token) {
    return (
      <div className="text-center p-12">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg inline-block mb-4">
          Invalid or Expired Link
        </div>
        <p className="mb-4 text-slate-500">Please access your audio via My Library or your email link.</p>
        <Link to="/" className="text-indigo-600 hover:underline font-bold">Go Home</Link>
      </div>
    );
  }

  // Corrected URLs to match @router.get("/stream/{job_id}") with prefix="/audio"
  const streamUrl = `${API_BASE_URL}/audio/stream/${jobId}?token=${token}`;
  const downloadUrl = `${API_BASE_URL}/audio/download/${jobId}?token=${token}`;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `audiobook-${jobId.slice(0, 6)}.wav`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-down w-full px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Your Audiobook</h1>
        <p className="text-lg text-slate-500">
          Ready to listen. Stream it now or download for offline access.
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-100">
        <div className="flex items-center gap-6 mb-10 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <FileIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xs font-black text-indigo-900 uppercase tracking-[0.2em] mb-1">Narration Ready</h3>
            <p className="text-slate-600 font-bold">Session ID: {jobId.slice(0, 8)}</p>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2rem] border-4 border-slate-800 shadow-inner group">
          <audio 
            controls 
            autoPlay 
            crossOrigin="anonymous"
            className="w-full h-12 focus:outline-none rounded-lg"
            src={streamUrl}
            onError={() => setError("Failed to load audio. The server might be waking up or the link expired.")}
          >
            Your browser does not support the audio element.
          </audio>
        </div>

        {error && (
          <div className="mt-6 text-center text-red-600 text-sm bg-red-50 p-4 rounded-2xl border border-red-100 animate-shake">
            {error}
          </div>
        )}
        
        <div className="mt-10 flex flex-col gap-4">
           <button
            onClick={handleDownload}
            className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
          >
            Download High Quality WAV
          </button>

          <Link 
             to="/my-library" 
             className="w-full py-5 border-2 border-slate-100 text-slate-500 font-black uppercase tracking-widest rounded-2xl text-center hover:bg-slate-50 transition-all"
           >
             Go to My Library
           </Link>
        </div>

        <p className="mt-8 text-center text-slate-400 text-xs font-medium px-4">
          Tip: For the best experience, use the interactive player in My Library to see the text highlighted as you listen.
        </p>
      </div>
    </div>
  );
}