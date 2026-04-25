import { Switch } from "@radix-ui/react-switch";

interface FanControlProps {
  fan1: boolean;
  fan2: boolean;
  disabled?: boolean;
  onFan1Change: (checked: boolean) => void;
  onFan2Change: (checked: boolean) => void;
}

export function FanControl({
  fan1,
  fan2,
  disabled = false,
  onFan1Change,
  onFan2Change,
}: FanControlProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-700">
        Manual Fan Controls
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Exhaust Fan 1</span>
          <Switch
            checked={fan1}
            disabled={disabled}
            onCheckedChange={onFan1Change}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1" />
          </Switch>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700">Exhaust Fan 2</span>
          <Switch
            checked={fan2}
            disabled={disabled}
            onCheckedChange={onFan2Change}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1" />
          </Switch>
        </div>
      </div>
    </div>
  );
}