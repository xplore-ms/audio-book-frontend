import { useEffect, useState, useRef } from "react";
import { getStatus } from "../api/api";
import { SpinnerIcon } from "./Icons";

interface ProcessingViewProps {
  taskIds: string[];
  jobId: string;
  onComplete: () => void;
  onError: (msg: string) => void;
}

export default function ProcessingView({
  taskIds,
  onComplete,
  onError,
}: ProcessingViewProps) {
  const [overallProgress, setOverallProgress] = useState(0);
  const tasksProgressRef = useRef<Record<string, number>>({});

  const totalTasks = taskIds.length;
  const percent = Math.round(overallProgress);

  useEffect(() => {
    taskIds.forEach((tid) => {
      if (!(tid in tasksProgressRef.current)) {
        tasksProgressRef.current[tid] = 0;
      }
    });

    const interval = setInterval(async () => {
      try {
        await Promise.all(
          taskIds.map(async (tid) => {
            if (tasksProgressRef.current[tid] === 100) return;

            const status = await getStatus(tid);

            if (status.state === "PROGRESS") {
              tasksProgressRef.current[tid] = status.result?.percent ?? 0;
            }
            if (status.state === "SUCCESS") {
              tasksProgressRef.current[tid] = 100;
            }
            if (status.state === "FAILURE") {
              tasksProgressRef.current[tid] = 100; // Skip failed tasks to allow progress
            }
          })
        );

        const values = Object.values(tasksProgressRef.current) as number[];
        const avg = values.length > 0
          ? values.reduce((sum: number, v: number) => sum + v, 0) / values.length
          : 0;

        setOverallProgress(avg);

        if (values.every((v) => v === 100)) {
          clearInterval(interval);
          // Backend auto-merges after page tasks, so we can wrap up
          setTimeout(() => {
            onComplete();
          }, 2000);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [taskIds, onComplete]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl border border-slate-100 text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
        Processing Pages…
      </h2>

      <p className="text-slate-500 mb-8 text-sm">
        Extracting text and generating narration. Audio is automatically merged on completion.
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
          Converting <span className="font-bold text-indigo-700">{totalTasks}</span> pages…
        </span>
      </div>
    </div>
  );
}