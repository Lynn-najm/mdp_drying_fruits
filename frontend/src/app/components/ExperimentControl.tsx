import { Play, Square } from 'lucide-react';

interface ExperimentControlProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function ExperimentControl({ isRunning, onStart, onStop }: ExperimentControlProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-700">Experiment Control</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          <span className={`font-semibold ${isRunning ? 'text-green-600' : 'text-gray-500'}`}>
            {isRunning ? 'Running' : 'Not Running'}
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onStart}
            disabled={isRunning}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white shadow transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play size={18} />
            Start
          </button>
          <button
            onClick={onStop}
            disabled={!isRunning}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-medium text-white shadow transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Square size={18} />
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
