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

  useEffect(() => {
    if (done) return;

    const interval = setInterval(async () => {
      try {
        const data = await getJobProgress(jobId);

        setProgress(data.progress || 0);
        console.log("Job progress:", data);
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
  }, [jobId, done, onComplete]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl text-center">
      <h2 className="text-3xl font-bold mb-4">Processing Pages…</h2>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-3 bg-indigo-100 rounded-full">
          <div
            className="h-full bg-indigo-600 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex justify-center items-center gap-2 text-sm text-slate-600">
        <SpinnerIcon className="w-5 h-5 text-indigo-600" />
        Processing…
      </div>
    </div>
  );
}
