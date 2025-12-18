import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../api/api';
import { FileIcon } from './Icons';

export default function ListenView() {
  const [downloading, setDownloading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="text-center p-12">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg inline-block mb-4">
          Invalid Link
        </div>
        <p className="mb-4">No access token provided.</p>
        <Link to="/" className="text-indigo-600 hover:underline">Go Home</Link>
      </div>
    );
  }

  const handleDownload = async () => {
  try {
    setDownloading(true);

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error("Download failed");
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audiobook.wav";
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    setError("Failed to download audio. The link may have expired.");
  } finally {
    setDownloading(false);
  }
};


  // Construct the stream URL directly
  const streamUrl = `${API_BASE_URL}/api/audio/stream?token=${token}`;
  const downloadUrl = `${API_BASE_URL}/api/audio/download?token=${token}`;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-down w-full">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Your Audiobook</h1>
        <p className="text-lg text-slate-600">
          Ready to listen. Stream it now or download it using the player controls.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="flex items-center gap-4 mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <FileIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Audiobook Ready</h3>
            <p className="text-slate-600 text-sm">Generated via AudioPDF</p>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <audio 
            controls 
            autoPlay 
            className="w-full h-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
            src={streamUrl}
            onError={() => setError("Failed to load audio. The link may have expired.")}
          >
            Your browser does not support the audio element.
          </audio>
        </div>

        {error && (
          <div className="mt-4 text-center text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}
        
        <div className="mt-8 text-center">
           <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center justify-center px-6 py-3 mt-6
                      bg-indigo-600 text-white font-semibold rounded-xl
                      hover:bg-indigo-700 transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? "Downloading..." : "Download Audiobook"}
          </button>

        </div>
        <div className="mt-8 text-center">
           <p className="text-slate-500 text-sm mb-6">
             You can use the three dots (⋮) in the player above to download the file.
           </p>
           <Link 
             to="/" 
             className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-base font-medium rounded-xl text-slate-600 bg-white hover:bg-slate-50 hover:text-indigo-600 transition-colors"
           >
             Convert Another PDF
           </Link>
        </div>
      </div>
    </div>
  );
}