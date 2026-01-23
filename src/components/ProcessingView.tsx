import { useEffect, useRef, useState } from "react";
import { getStatus } from "../api/api";
import { SpinnerIcon } from "./Icons";

interface ProcessingViewProps {
  taskIds: string[];
  jobId: string;
  onComplete: () => void;
}

export default function ProcessingView({
  taskIds,
  onComplete,
}: ProcessingViewProps) {
  const tasksProgressRef = useRef<Record<string, number>>({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  const totalTasks = taskIds.length;
  const percent = Math.round(overallProgress);

  useEffect(() => {
    if (!taskIds.length || hasCompleted) return;

    // Initialize progress map
    taskIds.forEach((tid) => {
      if (tasksProgressRef.current[tid] === undefined) {
        tasksProgressRef.current[tid] = 0;
      }
    });

    const interval = setInterval(async () => {
      try {
        const statuses = await Promise.all(
          taskIds.map((tid) => getStatus(tid))
        );

        let completedCount = 0;

        statuses.forEach((status, index) => {
          const tid = taskIds[index];

          if (status.state === "SUCCESS") {
            tasksProgressRef.current[tid] = 100;
            completedCount++;
          } else if (status.state === "FAILURE") {
            console.error(`Task ${tid} failed`, status.result);
            tasksProgressRef.current[tid] = 100;
            completedCount++;
          } else {
            // Best-effort progress (only works if you emit meta.percent)
            const pct =
              typeof status.result?.percent === "number"
                ? status.result.percent
                : 0;

            tasksProgressRef.current[tid] = Math.max(
              tasksProgressRef.current[tid],
              pct
            );
          }
        });

        const values = Object.values(tasksProgressRef.current);
        const avg =
          values.length > 0
            ? values.reduce((s, v) => s + v, 0) / values.length
            : 0;

        setOverallProgress(avg);

        // ✅ Authoritative completion
        if (completedCount === taskIds.length) {
          clearInterval(interval);
          setHasCompleted(true);

          // Small UX delay so bar reaches 100%
          setTimeout(() => {
            onComplete();
          }, 1500);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [taskIds, onComplete, hasCompleted]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl border border-slate-100 text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
        Processing Pages…
      </h2>

      <p className="text-slate-500 mb-8 text-sm">
        Extracting text and generating narration. Audio is automatically merged
        on completion.
      </p>

      <div className="w-full px-4 mb-10">
        <div className="flex justify-between mb-2">
          <span className="text-xs uppercase px-2 py-1 text-indigo-700 bg-indigo-100 rounded-full font-bold">
            Narration Generation
          </span>
          <span className="text-xs font-semibold text-indigo-700">
            {percent}%
          </span>
        </div>

        <div className="h-3 bg-indigo-100 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-700 bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="flex justify-center items-center gap-2 text-slate-600 text-sm bg-slate-50 py-3 px-6 rounded-2xl inline-flex">
        <SpinnerIcon className="w-5 h-5 text-indigo-600" />
        <span>
          Converting{" "}
          <span className="font-bold text-indigo-700">{totalTasks}</span> pages…
        </span>
      </div>
    </div>
  );
}
