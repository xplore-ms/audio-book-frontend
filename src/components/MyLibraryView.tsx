import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyLibrary } from '../api/api';
import { SpinnerIcon, FileIcon } from './Icons';
import type { UserAudiobook } from '../types';

export default function MyLibraryView() {
  const [books, setBooks] = useState<UserAudiobook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyLibrary()
      .then(data => {
        setBooks(data);
        setLoading(false);
      })
      .catch(_ => {
        setError("Failed to load your library. Please try again later.");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 text-slate-400">
      <SpinnerIcon className="w-10 h-10 text-indigo-600 mb-4" />
      <p className="animate-pulse font-medium">Opening your bookshelf...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight leading-none">
            My <span className="text-indigo-600">Conversions.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium">
            Your personal collection of documents transformed into lifelike audio.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
             <FileIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="pr-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Audiobooks</p>
            <p className="text-xl font-black text-slate-900">{books.length}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-center mb-8">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {books.map((book) => (
          <div 
            key={book.job_id} 
            className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
            onClick={() => navigate(`/player/${book.job_id}`)}
          >
            <div className="flex items-center gap-6 mb-8">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 font-black">
                     MP3
                  </div>
               </div>
               <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-slate-900 truncate tracking-tight">
                    {book.title || `Audiobook ${book.job_id.slice(0, 6)}`}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    ID: {book.job_id.slice(0, 8)}
                  </p>
               </div>
            </div>

            <div className="space-y-4 mb-8">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">File Size</span>
                  <span className="text-slate-900 font-bold">{book.final_size_mb.toFixed(2)} MB</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Format</span>
                  <span className="text-indigo-600 font-black uppercase tracking-tighter">HQ Neural WAV</span>
               </div>
            </div>

            <button className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs group-hover:bg-indigo-600 transition-colors shadow-lg">
               Play Audio
            </button>
          </div>
        ))}
      </div>

      {books.length === 0 && !loading && (
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Your library is empty.</h3>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">Upload a PDF on the home screen to start building your personal audio collection.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            Convert My First PDF
          </button>
        </div>
      )}
    </div>
  );
}