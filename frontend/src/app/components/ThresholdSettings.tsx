import { Slider } from '@radix-ui/react-slider';

interface ThresholdSettingsProps {
  tempMin: number;
  tempMax: number;
  humidMin: number;
  humidMax: number;
  onTempMinChange: (value: number[]) => void;
  onTempMaxChange: (value: number[]) => void;
  onHumidMinChange: (value: number[]) => void;
  onHumidMaxChange: (value: number[]) => void;
}

export function ThresholdSettings({
  tempMin,
  tempMax,
  humidMin,
  humidMax,
  onTempMinChange,
  onTempMaxChange,
  onHumidMinChange,
  onHumidMaxChange,
}: ThresholdSettingsProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-700">Threshold Settings</h3>
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Min Temperature</label>
            <span className="text-sm font-semibold text-gray-800">{tempMin}°C</span>
          </div>
          <Slider
            value={[tempMin]}
            onValueChange={onTempMinChange}
            max={100}
            step={1}
            className="relative flex w-full touch-none select-none items-center"
          >
            <span className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
              <span className="absolute h-full bg-green-500" style={{ width: `${tempMin}%` }} />
            </span>
            <span className="block h-5 w-5 rounded-full border-2 border-green-500 bg-white shadow transition-colors hover:bg-gray-50" />
          </Slider>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Max Temperature</label>
            <span className="text-sm font-semibold text-gray-800">{tempMax}°C</span>
          </div>
          <Slider
            value={[tempMax]}
            onValueChange={onTempMaxChange}
            max={100}
            step={1}
            className="relative flex w-full touch-none select-none items-center"
          >
            <span className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
              <span className="absolute h-full bg-red-500" style={{ width: `${tempMax}%` }} />
            </span>
            <span className="block h-5 w-5 rounded-full border-2 border-red-500 bg-white shadow transition-colors hover:bg-gray-50" />
          </Slider>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Min Humidity</label>
            <span className="text-sm font-semibold text-gray-800">{humidMin}%</span>
          </div>
          <Slider
            value={[humidMin]}
            onValueChange={onHumidMinChange}
            max={100}
            step={1}
            className="relative flex w-full touch-none select-none items-center"
          >
            <span className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
              <span className="absolute h-full bg-blue-500" style={{ width: `${humidMin}%` }} />
            </span>
            <span className="block h-5 w-5 rounded-full border-2 border-blue-500 bg-white shadow transition-colors hover:bg-gray-50" />
          </Slider>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Max Humidity</label>
            <span className="text-sm font-semibold text-gray-800">{humidMax}%</span>
          </div>
          <Slider
            value={[humidMax]}
            onValueChange={onHumidMaxChange}
            max={100}
            step={1}
            className="relative flex w-full touch-none select-none items-center"
          >
            <span className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
              <span className="absolute h-full bg-blue-500" style={{ width: `${humidMax}%` }} />
            </span>
            <span className="block h-5 w-5 rounded-full border-2 border-blue-500 bg-white shadow transition-colors hover:bg-gray-50" />
          </Slider>
        </div>
            </div>

      {/* Hysteresis Info */}
      <div className="mt-6 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        <p className="font-semibold">Anti-flicker protection enabled</p>
        <p>
          Fans turn ON above max thresholds and turn OFF only when temperature drops{" "}
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
