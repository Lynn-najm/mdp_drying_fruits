import { LayoutDashboard, Thermometer, BarChart3, Bell, FlaskConical, Settings, Download, Database, Wifi } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  alertCount: number;
}

export function Sidebar({ activeView, onViewChange, alertCount }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'readings', label: 'Readings', icon: Thermometer },
    { id: 'charts', label: 'Charts', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: alertCount },
    { id: 'experiment', label: 'Experiment', icon: FlaskConical },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'export', label: 'Export Data', icon: Download },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="p-6">
        <h1 className="text-xl font-bold">🔥 Drying System</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
              activeView === item.id
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <item.icon size={20} />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold">
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Database size={14} className="text-green-500" />
            <span>Database: Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi size={14} className="text-green-500" />
            <span>Sensors: Active</span>
          </div>
          <div className="mt-2 text-gray-500">
            Last update: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
