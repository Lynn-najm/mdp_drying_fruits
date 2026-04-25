import { Switch } from "@radix-ui/react-switch";

interface ControlModeProps {
  isManual: boolean;
  onChange: (checked: boolean) => void;
}

export function ControlMode({ isManual, onChange }: ControlModeProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-700">
        Control Mode
      </h3>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-gray-700">
            {isManual ? "Manual Mode" : "Auto Mode"}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {isManual
              ? "Manual fan controls are enabled"
              : "Fans are controlled based on threshold settings"}
          </p>
        </div>

        <Switch
          checked={isManual}
          onCheckedChange={onChange}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors data-[state=checked]:bg-yellow-400 data-[state=unchecked]:bg-gray-400"
        >
          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1" />
        </Switch>
      </div>
    </div>
  );
}