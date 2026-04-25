import { LucideIcon } from 'lucide-react';

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  icon: LucideIcon;
}

export function SensorCard({ title, value, unit, icon: Icon }: SensorCardProps) {
  const getTemperatureColor = (temp: number) => {
    if (temp < 20) return 'from-blue-400 to-blue-500';
    if (temp < 40) return 'from-cyan-400 to-cyan-500';
    if (temp < 60) return 'from-green-400 to-green-500';
    if (temp < 80) return 'from-yellow-400 to-yellow-500';
    return 'from-orange-400 to-red-500';
  };

  const gradientClass = title.includes('Humidity')
    ? 'from-blue-400 to-blue-500'
    : getTemperatureColor(value);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradientClass} p-6 text-white shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold">{value}</span>
            <span className="text-lg opacity-90">{unit}</span>
          </div>
        </div>
        <div className="opacity-20">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
