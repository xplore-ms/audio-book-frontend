import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadView from '../components/UploadView';
import { useUploadPdf } from '../features/pdf/hooks/mutations';
import { useUser } from '../context/UserContext';
import { useBackend } from '../context/BackendContext';

export default function HomeView() {
  const { user, refreshUser } = useUser();
  const { ensureReady } = useBackend();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useUploadPdf();

  const handleUpload = async (file: File, title: string) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await ensureReady();
      const uploadRes = await uploadMutation.mutateAsync({ file, title });
      await refreshUser();
      // Navigate to standalone configure page
      navigate(`/configure/${uploadRes.job_id}`);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Upload failed. Your file might be too large or you lack credits.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-12 animate-fade-in-down">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight leading-none">
          PDF to <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Voice</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Professional document conversion powered by Narrio's neural speech engine.
        </p>
      </div>

      {error && (
        <div className="mb-8 mx-auto p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl max-w-xl text-center font-bold animate-shake">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <UploadView onStart={handleUpload} isLoading={isLoading} />
      </div>
    </div>
  );
}