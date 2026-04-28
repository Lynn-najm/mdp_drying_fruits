import { useEffect, useState } from "react";

interface ThresholdSettingsProps {
  tempMin: number;
  tempMax: number;
  humidMin: number;
  humidMax: number;
  onTempMinChange: (value: number) => void;
  onTempMaxChange: (value: number) => void;
  onHumidMinChange: (value: number) => void;
  onHumidMaxChange: (value: number) => void;
}

interface RowProps {
  label: string;
  value: number;
  unit: string;
  color: string;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

function ThresholdRow({ label, value, unit, color, min, max, onChange }: RowProps) {
  const [local, setLocal] = useState(String(value));

  useEffect(() => {
    setLocal(String(value));
  }, [value]);

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= min && n <= max) {
      onChange(n);
    } else {
      setLocal(String(value));
    }
  };

  const step = (delta: number) => onChange(Math.min(max, Math.max(min, value + delta)));

  const colorMap: Record<string, string> = {
    green: "border-green-500 text-green-700 hover:bg-green-50 active:bg-green-100",
    red:   "border-red-500   text-red-700   hover:bg-red-50   active:bg-red-100",
    blue:  "border-blue-500  text-blue-700  hover:bg-blue-50  active:bg-blue-100",
  };
  const btn = colorMap[color] ?? colorMap.blue;

  return (
    <div className="flex items-center justify-between gap-4">
      <label className="w-36 shrink-0 text-sm font-medium text-gray-700">{label}</label>

      <div className="flex items-center gap-2">
        <button
          onClick={() => step(-1)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 text-lg font-bold transition-colors ${btn}`}
        >
          −
        </button>

        <div className="relative">
          <input
            type="number"
            value={local}
            min={min}
            max={max}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
              if (e.key === "ArrowUp")   { e.preventDefault(); step(1);  }
              if (e.key === "ArrowDown") { e.preventDefault(); step(-1); }
            }}
            className="w-20 rounded-lg border border-gray-300 py-1.5 pr-8 text-center text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {unit}
          </span>
        </div>

        <button
          onClick={() => step(1)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 text-lg font-bold transition-colors ${btn}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function ThresholdSettings({
  tempMin, tempMax, humidMin, humidMax,
  onTempMinChange, onTempMaxChange, onHumidMinChange, onHumidMaxChange,
}: ThresholdSettingsProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h3 className="mb-6 text-lg font-semibold text-gray-700">Threshold Settings</h3>

      <div className="space-y-5">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Temperature</p>
          <div className="space-y-3">
            <ThresholdRow label="Min" value={tempMin} unit="°C" color="green" min={0}   max={tempMax - 1} onChange={onTempMinChange} />
            <ThresholdRow label="Max" value={tempMax} unit="°C" color="red"   min={tempMin + 1} max={150} onChange={onTempMaxChange} />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Humidity</p>
          <div className="space-y-3">
            <ThresholdRow label="Min" value={humidMin} unit="%" color="blue" min={0}          max={humidMax - 1} onChange={onHumidMinChange} />
            <ThresholdRow label="Max" value={humidMax} unit="%" color="blue" min={humidMin + 1} max={100}       onChange={onHumidMaxChange} />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        <p className="font-semibold">Anti-flicker protection enabled</p>
        <p>
          Fan 1 turns ON above max thresholds and turns OFF only when temperature drops{" "}
          <span className="font-semibold">5°C below max</span> and humidity drops{" "}
          <span className="font-semibold">10% below max</span>.
        </p>
        <div className="mt-2 text-xs text-blue-600">
          <p>Temperature OFF threshold: {tempMax - 5}°C</p>
          <p>Humidity OFF threshold: {humidMax - 10}%</p>
        </div>
      </div>
    </div>
  );
}
