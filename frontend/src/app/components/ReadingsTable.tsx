interface Reading {
  id: number;
  timestamp: string;

  inlet_temperature: number;
  middle1_temperature: number;
  middle2_temperature: number;
  outlet_temperature: number;
  chamber_temperature: number;

  humidity: number;

  fan1: boolean;
  fan2: boolean;

  control_mode: string;
}

interface ReadingsTableProps {
  readings: Reading[];
}

export function ReadingsTable({ readings }: ReadingsTableProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-700">Readings History</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Time</th>

              <th className="px-4 py-3 text-left">Inlet</th>
              <th className="px-4 py-3 text-left">Mid 1</th>
              <th className="px-4 py-3 text-left">Mid 2</th>
              <th className="px-4 py-3 text-left">Outlet</th>
              <th className="px-4 py-3 text-left">Chamber</th>

              <th className="px-4 py-3 text-left">Humidity</th>

              <th className="px-4 py-3 text-left">Fan 1</th>
              <th className="px-4 py-3 text-left">Fan 2</th>

              <th className="px-4 py-3 text-left">Mode</th>
            </tr>
          </thead>

          <tbody>
            {readings.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{r.id}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(r.timestamp).toLocaleTimeString("en-LB", {
                      timeZone: "Asia/Beirut",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                  })}
                </td>

                <td className="px-4 py-3">{r.inlet_temperature}</td>
                <td className="px-4 py-3">{r.middle1_temperature}</td>
                <td className="px-4 py-3">{r.middle2_temperature}</td>
                <td className="px-4 py-3">{r.outlet_temperature}</td>
                <td className="px-4 py-3">{r.chamber_temperature}</td>

                <td className="px-4 py-3">{r.humidity}%</td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                      r.fan1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.fan1 ? "ON" : "OFF"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                      r.fan2 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.fan2 ? "ON" : "OFF"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                      (r.control_mode ?? "unknown") === "auto"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {(r.control_mode ?? "unknown").toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}