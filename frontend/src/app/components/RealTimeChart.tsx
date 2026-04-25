import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  time: string;
  inlet: number;
  middle1: number;
  middle2: number;
  outlet: number;
  chamber: number;
  humidity: number;
}

interface RealTimeChartProps {
  data: ChartData[];
}

export function RealTimeChart({ data }: RealTimeChartProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-700">Real-Time Sensor Data</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="inlet" stroke="#ef4444" strokeWidth={2} dot={false} name="Inlet Temp" />
          <Line type="monotone" dataKey="middle1" stroke="#f97316" strokeWidth={2} dot={false} name="Middle 1" />
          <Line type="monotone" dataKey="middle2" stroke="#eab308" strokeWidth={2} dot={false} name="Middle 2" />
          <Line type="monotone" dataKey="outlet" stroke="#22c55e" strokeWidth={2} dot={false} name="Outlet Temp" />
          <Line type="monotone" dataKey="chamber" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Chamber Temp" />
          <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} dot={false} name="Humidity %" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
