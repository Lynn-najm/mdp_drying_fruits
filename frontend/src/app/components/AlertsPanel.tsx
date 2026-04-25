import { AlertTriangle, Info } from 'lucide-react';

interface Alert {
  id: number;
  message: string;
  timestamp: string;
  type: 'critical' | 'warning' | 'info';
}

interface AlertsPanelProps {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'info':
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="text-red-500" size={18} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={18} />;
      case 'info':
        return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-700">Alerts</h3>
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500">No alerts</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex gap-3 rounded border-l-4 p-3 ${getAlertColor(alert.type)}`}
            >
              <div className="flex-shrink-0">{getAlertIcon(alert.type)}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                <p className="mt-1 text-xs text-gray-500">{alert.timestamp}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
