import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePublicLibrary } from '../features/audio/hooks/usePublicLibrary';
import type { Audiobook } from '../types';
import { SpinnerIcon, FileIcon } from './Icons';


// function InsufficientCreditsModal({ required, current, onClose, onBuy }: { required: number, current: number, onClose: () => void, onBuy: () => void }) {
//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
//       <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full text-center border border-slate-100 animate-fade-in-up">
//         <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
//            <svg className="w-10 h-10 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
//         </div>
//         <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Low Credits</h3>
//         <p className="text-slate-500 mb-8 leading-relaxed">
//           You need <span className="font-bold text-slate-900">{required} credits</span> to unlock this audiobook. You currently have <span className="font-bold text-indigo-600">{current} credits</span>.
//         </p>
//         <div className="flex flex-col gap-3">
//           <button onClick={onBuy} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95">
//             Get More Credits
//           </button>
//           <button onClick={onClose} className="w-full py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl hover:bg-slate-100 transition-all">
//             Maybe Later
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

export default function LibraryViewNew() {
  const [books, setBooks] = useState<Audiobook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const publicLibraryQuery = usePublicLibrary();
  const navigate = useNavigate();

  useEffect(() => {
    if (publicLibraryQuery.data) {
      setBooks(publicLibraryQuery.data);
      setLoading(false);
    }
  }, [publicLibraryQuery.data]);

  useEffect(() => {
    if (publicLibraryQuery.error) setError('Failed to load public library.');
  }, [publicLibraryQuery.error]);

  if (loading)
      return (
        <div className="p-24 flex justify-center">
          <SpinnerIcon className="w-10 h-10 text-indigo-600" />
        </div>
      );
  
    if (error)
      return (
        <div className="p-6 text-center text-red-600 font-bold">{error}</div>
      );
  
    if (books.length === 0)
      return (
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileIcon className="w-8 h-8 text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">
            Your bookshelf is empty
          </h3>
          <p className="text-slate-400 text-sm mb-10 max-w-xs mx-auto font-medium text-center">
            Upload your first PDF on the dashboard to start listening.
          </p>
        </div>
      );
  
    return (
      <div className="max-w-4xl mx-auto pb-24 px-4 sm:px-6 lg:px-8 space-y-4">
        {books.map(book => (
          <button
            key={book.job_id}
            onClick={() => navigate(`/public-library/${book.job_id}`)}
            className="w-full p-5 rounded-3xl flex items-center justify-between bg-white border shadow-sm hover:shadow-xl transition-all"
          >
            <div className="flex flex-col text-left">
              <h3 className="text-lg font-black text-slate-900 truncate uppercase">
                {book.title || `Untitled ${book.job_id.slice(0, 4)}`}
              </h3>
              <p className="text-xs text-slate-400 uppercase mt-1">
                {new Date(book.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </button>
        ))}
      </div>
    );
  }
  