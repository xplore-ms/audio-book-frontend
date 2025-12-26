import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPublicLibrary } from '../api/api';
import { useUser } from '../context/UserContext';
import type { Audiobook } from '../types';
import { SpinnerIcon } from './Icons';

export default function LibraryView() {
  const [books, setBooks] = useState<Audiobook[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, spendCredits } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicLibrary().then(data => {
      setBooks(data);
      setLoading(false);
    });
  }, []);

  const handleAction = (book: Audiobook) => {
    if (book.isFreeDemo) {
      navigate(`/player/${book.id}`);
      return;
    }

    if (!user) {
      navigate('/signup');
      return;
    }

    // Credits are checked locally first to prevent unnecessary 403s from the backend
    if (user.credits >= book.creditCost) {
      // We spend locally for UI responsiveness; the backend will also deduct on stream request
      spendCredits(book.creditCost);
      navigate(`/player/${book.id}`);
    } else {
      alert(`Insufficient credits. You need ${book.creditCost} credits to unlock this audiobook.`);
      navigate('/store');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 text-slate-400">
      <SpinnerIcon className="w-10 h-10 text-indigo-600 mb-4" />
      <p className="animate-pulse font-medium">Fetching Audio Library...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight leading-none">
            Your Digital <span className="text-indigo-600">Bookshelf.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium">
            Access high-quality narrations from the Narrio collection. Spend credits to unlock full immersive reading.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="pr-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Library Total</p>
            <p className="text-lg font-bold text-slate-900">{books.length} Books</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {books.map(book => (
          <div key={book.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl border border-slate-100 flex flex-col group transition-all duration-500 hover:-translate-y-2">
            <div className="aspect-[3/4] relative overflow-hidden">
              <img src={book.coverUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" alt={book.title} />
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {book.isFreeDemo && (
                  <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                    Free Access
                  </span>
                )}
              </div>

              <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                 <button 
                  onClick={() => handleAction(book)}
                  className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg"
                >
                  Listen Now
                </button>
              </div>
            </div>

            <div className="p-8 flex-grow flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-black text-slate-900 line-clamp-1 mb-1">{book.title}</h3>
                <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest">{book.author}</p>
              </div>
              
              <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-8">{book.description}</p>
              
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Required Credits</span>
                  <span className="font-extrabold text-slate-900 text-lg">{book.isFreeDemo ? 'FREE' : book.creditCost}</span>
                </div>
                
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Format</span>
                  <span className="block font-bold text-slate-600 text-xs">HQ Audio</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && !loading && (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">The shelf is empty</h3>
          <p className="text-slate-500">Check back later or convert your own PDF documents!</p>
        </div>
      )}
    </div>
  );
}