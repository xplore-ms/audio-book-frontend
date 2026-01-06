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
      .then(data => setBooks(data))
      .catch(() => setError('Failed to load your library.'))
      .finally(() => setLoading(false));
  }, []);

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
          onClick={() => navigate(`/my-library/${book.job_id}`)}
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
