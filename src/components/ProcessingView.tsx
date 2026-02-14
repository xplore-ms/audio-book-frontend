import { useEffect, useState } from "react";
import { getJobProgress } from "../api/pdfJobs.api";
import { SpinnerIcon } from "./Icons";

interface ProcessingViewProps {
  jobId: string;
  onComplete: () => void;
}

export default function ProcessingView({ jobId, onComplete }: ProcessingViewProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (done || error) return;

    const interval = setInterval(async () => {
      try {
        const data = await getJobProgress(jobId);

        if (data.status === "failed") {
          setError(data.error || "Processing failed. Please try again.");
          clearInterval(interval);
          return;
        }

        setProgress(data.progress || 0);

        if (data.status === "done") {
          clearInterval(interval);
          setDone(true);
          setTimeout(onComplete, 1000);
        }
      } catch (e) {
        console.error("Progress polling failed", e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, done, error, onComplete]);

  if (error) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl text-center border-l-4 border-red-500">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Processing Failed</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-slate-100 hovering:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (done) return null; // Or some completion view if needed, but parent handles it

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl text-center">
      <h2 className="text-3xl font-bold mb-4">
        {progress < 100 ? "Processing Pages…" : "Finalizing…"}
      </h2>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress</span>
          <span className={progress === 100 ? "text-green-600 font-bold" : ""}>{progress}%</span>
        </div>
        <div className="h-3 bg-indigo-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${progress === 100 ? "bg-green-500" : "bg-indigo-600"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex justify-center items-center gap-2 text-sm text-slate-600">
        {progress < 100 && <SpinnerIcon className="w-5 h-5 text-indigo-600 animate-spin" />}
        {progress < 100 ? "Processing…" : "Almost done!"}
      </div>
    </div>
  );
}
