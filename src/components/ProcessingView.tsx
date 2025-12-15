import { useEffect, useState, useRef } from "react";
import { getStatus, mergeJob } from "../api/api";
import { SpinnerIcon } from "./Icons";

interface ProcessingViewProps {
  taskIds: string[];
  jobId: string;
  onComplete: () => void;
  onError: (msg: string) => void;
}

export default function ProcessingView({
  taskIds,
  jobId,
  onComplete,
  onError,
}: ProcessingViewProps) {
  const [overallProgress, setOverallProgress] = useState(0);
  const [phase, setPhase] = useState<"PROCESS" | "MERGE">("PROCESS");

  // Stores per-task progress (0–100)
  const tasksProgressRef = useRef<Record<string, number>>({});

  const totalTasks = taskIds.length;
  const percent = Math.round(overallProgress);

  //______________________________________________________________
  // POLLING FOR PAGE PROCESSING (REAL-TIME)
  //______________________________________________________________
  useEffect(() => {
    // Initialize progress for all tasks
    taskIds.forEach((tid) => {
      if (!(tid in tasksProgressRef.current)) {
        tasksProgressRef.current[tid] = 0;
      }
    });

    const interval = setInterval(async () => {
      try {
        await Promise.all(
          taskIds.map(async (tid) => {
            // Skip finished tasks
            if (tasksProgressRef.current[tid] === 100) return;

            const status = await getStatus(tid);

            if (status.state === "PROGRESS") {
              tasksProgressRef.current[tid] =
                status.result?.percent ?? 0;
            }

            if (status.state === "SUCCESS") {
              tasksProgressRef.current[tid] = 100;
            }

            if (status.state === "FAILURE") {
              console.warn("Task failed:", tid);
              tasksProgressRef.current[tid] = 100;
            }
          })
        );

        // Compute average progress across all pages
        const values = Object.values(tasksProgressRef.current);
        const avg =
          values.reduce((sum, v) => sum + v, 0) / values.length;

        setOverallProgress(avg);

        // All pages finished → merge
        if (values.every((v) => v === 100)) {
          clearInterval(interval);
          startMerge();
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [taskIds]);

  //______________________________________________________________
  // MERGE PHASE
  //______________________________________________________________
  const startMerge = async () => {
    setPhase("MERGE");

    try {
      await mergeJob(jobId);

      // Small delay for smooth UX
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (err) {
      console.error(err);
      onError("Failed to merge audio files");
    }
  };

  //______________________________________________________________
  // UI COMPONENT
  //______________________________________________________________
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl border border-slate-100 text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
        {phase === "PROCESS" ? "Processing Pages…" : "Merging Audio…"}
      </h2>

      <p className="text-slate-500 mb-8 text-sm">
        {phase === "PROCESS"
          ? "Extracting text and generating narration for each page."
          : "Combining all generated audio files into one audiobook."}
      </p>

      {/* PROGRESS BAR */}
      <div className="w-full px-4 mb-10">
        <div className="flex justify-between mb-2">
          <span className="text-xs uppercase px-2 py-1 text-indigo-700 bg-indigo-100 rounded-full">
            {phase === "PROCESS" ? "Page Conversion" : "Finalizing Audio"}
          </span>

          <span className="text-xs font-semibold text-indigo-700">
            {phase === "PROCESS" ? `${percent}%` : "Merging…"}
          </span>
        </div>

        <div className="h-2 bg-indigo-100 rounded overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${
              phase === "MERGE"
                ? "bg-indigo-600 animate-pulse"
                : "bg-indigo-500"
            }`}
            style={{ width: phase === "PROCESS" ? `${percent}%` : "100%" }}
          />
        </div>
      </div>

      {/* STATUS TEXT */}
      <div className="flex justify-center items-center gap-2 text-slate-600 text-sm">
        <SpinnerIcon className="w-5 h-5 text-indigo-600" />

        {phase === "PROCESS" ? (
          <span>
            Processing{" "}
            <span className="font-semibold text-indigo-700">
              {totalTasks}
            </span>{" "}
            pages…
          </span>
        ) : (
          <span className="font-medium text-indigo-700">
            Merging pages into a single audiobook…
          </span>
        )}
      </div>
    </div>
  );
}
