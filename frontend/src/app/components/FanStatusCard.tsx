import { Fan } from 'lucide-react';

interface FanStatusCardProps {
  fanName: string;
  isOn: boolean;
}

export function FanStatusCard({ fanName, isOn }: FanStatusCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-full p-2 ${isOn ? 'bg-green-100' : 'bg-red-100'}`}>
          <Fan className={isOn ? 'text-green-600' : 'text-red-600'} size={20} />
        </div>
        <span className="font-medium text-gray-700">{fanName}</span>
      </div>
      <span className={`font-bold ${isOn ? 'text-green-600' : 'text-red-600'}`}>
        {isOn ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}
