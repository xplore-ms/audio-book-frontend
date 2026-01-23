import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyLibrary, shareAudiobook } from '../api/api';
import { SpinnerIcon, FileIcon } from './Icons';
import type { UserAudiobook } from '../types';


export default function MyLibraryView() {
  const [books, setBooks] = useState<UserAudiobook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareJobId, setShareJobId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();


  const getShareUrl = (jobId: string) => {
    return `${window.location.origin}/shared/${jobId}`;
  };

  const handleJob = (jobId: string) => {
    shareAudiobook(jobId)
      .then(() => {
        setShareJobId(jobId);
      })
      .catch(() => {
        setError('Failed to generate shareable link.');
      });
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        <div
          key={book.job_id}
          className="w-full p-5 px-2 rounded-3xl flex items-center justify-between bg-white border shadow-sm hover:shadow-xl transition-all group"
        >
          <button 
            onClick={() =>
              navigate(`/my-library/${book.job_id}`, {
                state: {
                  title: book.title || `Untitled ${book.job_id.slice(0, 4)}`
                }
              })
            }
            className="flex flex-col text-left flex-grow"
          >
            <h3 className="sm:text-lg text-sm font-black text-slate-900 truncate uppercase">
              {book.title || `Untitled ${book.job_id.slice(0, 4)}`}
            </h3>
            <p className="text-xs text-slate-400 uppercase mt-1">
              {new Date(book.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </button>

          <div className="flex items-center gap-3 flex-col sm:flex-row">
            <button
              onClick={() => handleJob(book.job_id)}

              className="px-4 py-2 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              title="Process more pages or request review"
            >
              Share
            </button>
             <button
              onClick={() => navigate(`/configure/${book.job_id}`)}
              className="px-4 py-2 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              title="Process more pages or request review"
            >
              Manage
            </button>
            <button
              onClick={() =>
                navigate(`/my-library/${book.job_id}`, {
                  state: {
                    title: book.title || `Untitled ${book.job_id.slice(0, 4)}`
                  }
                })
              }
               className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </button>
          </div>
          {shareJobId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setShareJobId(null)}
              />

              {/* Modal */}
              <div className="relative bg-white w-[90%] max-w-md rounded-3xl p-6 shadow-2xl">
                <h3 className="text-lg font-black uppercase tracking-tight mb-2">
                  Share Audiobook
                </h3>

                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3 mb-4">
  <svg
    className="w-4 h-4 mt-[2px] shrink-0"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>

  <p className="text-[10px] leading-snug font-bold uppercase tracking-widest">
    Make sure you have permission to share this audiobook.
  </p>
</div>


                <p className="text-xs text-slate-400 uppercase mb-4">
                  Anyone with this link can listen
                </p>

                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between gap-3">
                  <span className="text-xs font-mono text-slate-700 truncate">
                    {getShareUrl(shareJobId)}
                  </span>

                  <button
                    onClick={() => copyToClipboard(getShareUrl(shareJobId))}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <button
                  onClick={() => setShareJobId(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

        </div>
      ))}
    </div>
  );
}