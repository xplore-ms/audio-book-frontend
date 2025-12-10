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
  const [completedCount, setCompletedCount] = useState(0);
  const [phase, setPhase] = useState<"PROCESS" | "MERGE">("PROCESS");
  const tasksStatusRef = useRef<Record<string, boolean>>({});

  const totalTasks = taskIds.length;
  const percent = Math.round((completedCount / totalTasks) * 100);

  //______________________________________________________________
  // POLLING FOR PAGE PROCESSING
  //______________________________________________________________
  useEffect(() => {
    // Initialize all tasks as incomplete
    taskIds.forEach((tid) => {
      if (!(tid in tasksStatusRef.current)) {
        tasksStatusRef.current[tid] = false;
      }
    });

    const interval = setInterval(async () => {
      const pending = taskIds.filter((id) => !tasksStatusRef.current[id]);

      // All done → Start merge phase
      if (pending.length === 0) {
        clearInterval(interval);
        startMerge();
        return;
      }

      // Poll each pending task
      await Promise.all(
        pending.map(async (tid) => {
          try {
            const status = await getStatus(tid);

            if (status.state === "SUCCESS") {
              tasksStatusRef.current[tid] = true;
            } else if (status.state === "FAILURE") {
              console.warn("Task failed:", tid);
              tasksStatusRef.current[tid] = true; // mark done to skip
            }
          } catch (err) {
            console.error("Polling error:", err);
          }
        })
      );

      // Update UI count
      const done = Object.values(tasksStatusRef.current).filter(Boolean).length;
      setCompletedCount(done);
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

      // Wait 1 second for user-friendly smooth transition
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
              phase === "MERGE" ? "bg-indigo-600 animate-pulse" : "bg-indigo-500"
            }`}
            style={{ width: phase === "PROCESS" ? `${percent}%` : "100%" }}
          ></div>
        </div>
      </div>

      {/* STATUS TEXT */}
      <div className="flex justify-center items-center gap-2 text-slate-600 text-sm">
        <SpinnerIcon className="w-5 h-5 text-indigo-600" />

        {phase === "PROCESS" ? (
          <span>
            Processed{" "}
            <span className="font-semibold text-indigo-700">
              {completedCount}/{totalTasks}
            </span>{" "}
            pages
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
