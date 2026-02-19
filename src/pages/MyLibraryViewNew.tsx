import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyLibrary } from '../features/audio/hooks/useMyLibrary';
import { useShareAudiobook } from '../features/audio/hooks/mutations';
import { SpinnerIcon, FileIcon } from '../components/Icons';

export default function MyLibraryView() {
  const [shareJobId, setShareJobId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emails, setEmails] = useState('');
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openMenuJobId, setOpenMenuJobId] = useState<string | null>(null);

  const myLibraryQuery = useMyLibrary();
  const shareMutation = useShareAudiobook();
  const navigate = useNavigate();

  const books = myLibraryQuery.data || [];
  const loading = myLibraryQuery.isLoading;

  const getShareUrl = (jobId: string) =>
    `${window.location.origin}/shared/${jobId}`;

  /* ------------------ SHARE HANDLER ------------------ */
  const openShareModal = (jobId: string) => {
    setShareJobId(jobId);
    setEmails('');
    setCopied(false);
    setOpenMenuJobId(null);
  };

  /* ------------------ COPY ------------------ */
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (myLibraryQuery.error) {
      setError('Failed to load your library.');
    }
  }, [myLibraryQuery.error]);

  if (loading) {
    return (
      <div className="p-24 flex justify-center">
        <SpinnerIcon className="w-10 h-10 text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 font-bold">
        {error}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileIcon className="w-8 h-8 text-slate-200" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">
          Your bookshelf is empty
        </h3>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">
          Upload your first PDF on the dashboard to start listening.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 px-4 space-y-4">
      {books.map(book => {
        const isMenuOpen = openMenuJobId === book.job_id;

        return (
          <div
            key={book.job_id}
            className="relative w-full p-5 rounded-3xl flex items-center justify-between bg-white border shadow-sm hover:shadow-xl transition-all"
          >
            {/* TITLE + DATE */}
            <button
              onClick={() =>
                navigate(`/my-library/${book.job_id}`, {
                  state: { title: book.title }
                })
              }
              className="flex flex-col text-left flex-grow min-w-0 pr-3"
            >
              <h3 className="text-sm sm:text-lg font-black uppercase truncate">
                {book.title || `Untitled ${book.job_id.slice(0, 4)}`}
              </h3>
              <p className="text-xs text-slate-400 uppercase">
                {new Date(book.created_at).toLocaleDateString()}
              </p>
            </button>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-2">
              {/* DESKTOP BUTTONS (UNCHANGED, JUST RESPONSIVE) */}
              {book.is_owner && (
                <div className="hidden sm:flex items-center gap-3">
                  <button
                    onClick={() => openShareModal(book.job_id)}
                    className="px-4 py-2 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => navigate(`/configure/${book.job_id}`)}
                    className="px-4 py-2 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase"
                  >
                    Manage
                  </button>
                </div>
              )}

              {/* PLAY BUTTON (ALWAYS VISIBLE) */}
              <button
                onClick={() =>
                  navigate(`/my-library/${book.job_id}`, {
                    state: {
                      title:
                        book.title || `Untitled ${book.job_id.slice(0, 4)}`
                    }
                  })
                }
                className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>

              {/* MOBILE VERTICAL DOT MENU */}
              {book.is_owner && (
                <button
                  onClick={() =>
                    setOpenMenuJobId(
                      isMenuOpen ? null : book.job_id
                    )
                  }
                  className="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50"
                >
                  <svg
                    className="w-5 h-5 text-slate-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
              )}
            </div>

            {/* MOBILE DROPDOWN MENU */}
            {book.is_owner && isMenuOpen && (
              <div className="absolute right-4 top-[4.5rem] sm:hidden z-20 w-40 bg-white border rounded-2xl shadow-xl overflow-hidden">
                <button
                  onClick={() => openShareModal(book.job_id)}
                  className="w-full px-4 py-3 text-left text-xs font-black uppercase hover:bg-slate-50"
                >
                  Share
                </button>
                <button
                  onClick={() => {
                    setOpenMenuJobId(null);
                    navigate(`/configure/${book.job_id}`);
                  }}
                  className="w-full px-4 py-3 text-left text-xs font-black uppercase hover:bg-slate-50"
                >
                  Manage
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* ------------------ SHARE MODAL ------------------ */}
      {shareJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShareJobId(null)}
          />

          <div className="relative bg-white w-[90%] max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black uppercase">
              Share Audiobook
            </h3>

            <p className="text-xs text-slate-400 uppercase">
              Invite people by email
            </p>

            <input
              value={emails}
              onChange={e => setEmails(e.target.value)}
              placeholder="user1@email.com, user2@email.com"
              className="w-full px-4 py-3 rounded-xl border text-sm"
            />

            <button
              disabled={sharing}
              onClick={async () => {
                try {
                  setSharing(true);
                  const emailList = emails
                    .split(',')
                    .map(e => e.trim())
                    .filter(Boolean);

                  await shareMutation.mutateAsync({
                    jobId: shareJobId,
                    emails: emailList,
                  });

                  alert('Audiobook shared successfully');
                } catch {
                  alert('Failed to share audiobook');
                } finally {
                  setSharing(false);
                }
              }}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase"
            >
              {sharing ? 'Sharing…' : 'Share'}
            </button>

            <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between gap-2">
              <span className="text-xs font-mono truncate">
                {getShareUrl(shareJobId)}
              </span>
              <button
                onClick={() =>
                  copyToClipboard(getShareUrl(shareJobId))
                }
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <button
              onClick={() => setShareJobId(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
