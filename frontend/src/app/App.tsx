import { useEffect, useMemo, useState } from "react";
import { Activity, Thermometer, Wind } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { SensorCard } from "./components/SensorCard";
import { FanStatusCard } from "./components/FanStatusCard";
import { HumidityGauge } from "./components/HumidityGauge";
import { FanControl } from "./components/FanControl";
import { ControlMode } from "./components/ControlMode";
import { ThresholdSettings } from "./components/ThresholdSettings";
import { ExperimentControl } from "./components/ExperimentControl";
import { AlertsPanel } from "./components/AlertsPanel";
import { RealTimeChart } from "./components/RealTimeChart";
import { ReadingsTable } from "./components/ReadingsTable";

const API_URL = "https://mdp-drying-fruits-api.onrender.com";

type Reading = {
  id: number;
  inlet_temperature: number;
  middle1_temperature: number;
  middle2_temperature: number;
  outlet_temperature: number;
  chamber_temperature: number;
  humidity: number;
  fan1_on: boolean;
  fan2_on: boolean;
  control_mode: string;
  experiment_id: number | null;
  timestamp: string;
};

type Alert = {
  id: number;
  type: string;
  message: string;
  timestamp: string;
};

type Settings = {
  manual_mode: boolean;

  forced_fan1_on: boolean;
  forced_fan2_on: boolean;

  temp_min: number;
  temp_max: number;
  humidity_min: number;
  humidity_max: number;
};

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");

  const [latest, setLatest] = useState<Reading | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [isExperimentRunning, setIsExperimentRunning] = useState(false);
  const [currentExperiment, setCurrentExperiment] = useState<any>(null);

  const [experiments, setExperiments] = useState<any[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string>("");

  const SENSOR_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

  const isSensorActive =
    latest?.timestamp &&
    Date.now() - new Date(latest.timestamp + "Z").getTime() < SENSOR_TIMEOUT_MS;

  const systemStatus = isSensorActive ? "System Online" : "Waiting for ESP data";


  const fetchBackendData = async () => {
    try {
      const [latestRes, readingsRes, alertsRes, settingsRes, experimentRes, experimentsRes] = await Promise.all([

        fetch(`${API_URL}/api/readings/latest`),
        fetch(`${API_URL}/api/readings`),
        fetch(`${API_URL}/api/alerts`),
        fetch(`${API_URL}/api/settings`),
        fetch(`${API_URL}/api/experiment/current`),
        fetch(`${API_URL}/api/experiments`)
      ]);

      const latestData = await latestRes.json();
      setLatest(latestData ?? null);
      setReadings(await readingsRes.json());
      setAlerts(await alertsRes.json());
      setSettings(await settingsRes.json());
      const experimentData = await experimentRes.json();
      setCurrentExperiment(experimentData);
      setIsExperimentRunning(experimentData.running);
      setExperiments(await experimentsRes.json());
    } catch (error) {
      console.error("Failed to fetch backend data:", error);
    }
  };



  useEffect(() => {
    fetchBackendData();
    const interval = setInterval(fetchBackendData, 3000);
    return () => clearInterval(interval);
  }, []);

  const isManualMode = settings?.manual_mode ?? false;

  const fan1On = isManualMode
    ? settings?.forced_fan1_on ?? false
    : latest?.fan1_on ?? false;

  const fan2On = isManualMode
    ? settings?.forced_fan2_on ?? false
    : latest?.fan2_on ?? false;

const sensorData = {
  inlet: latest?.inlet_temperature ?? 0,
  middle1: latest?.middle1_temperature ?? 0,
  middle2: latest?.middle2_temperature ?? 0,
  outlet: latest?.outlet_temperature ?? 0,
  avgCollector: latest
    ? Math.round(
        (
          latest.inlet_temperature +
          latest.middle1_temperature +
          latest.middle2_temperature +
          latest.outlet_temperature
        ) / 4
      )
    : 0,
  chamberTemp: latest?.chamber_temperature ?? 0,
  humidity: latest?.humidity ?? 0,
};

const chartData = useMemo(() => {
  return readings.slice(-30).map((r) => ({
    time: new Date(r.timestamp + "Z").toLocaleTimeString("en-LB", {
      timeZone: "Asia/Beirut",
      hour: "2-digit",
      minute: "2-digit",
    }),
    inlet: r.inlet_temperature,
    middle1: r.middle1_temperature,
    middle2: r.middle2_temperature,
    outlet: r.outlet_temperature,
    chamber: r.chamber_temperature,
    humidity: r.humidity,
  }));
}, [readings]);

  const tableReadings = readings
  .slice()
  .reverse()
  .map((r) => ({
    id: r.id,
    timestamp: r.timestamp,

    inlet_temperature: r.inlet_temperature,
    middle1_temperature: r.middle1_temperature,
    middle2_temperature: r.middle2_temperature,
    outlet_temperature: r.outlet_temperature,
    chamber_temperature: r.chamber_temperature,

    humidity: r.humidity,

    fan1: r.fan1_on,
    fan2: r.fan2_on,

    control_mode: r.control_mode ?? "unknown",
  }));

  const uiAlerts = alerts.map((a) => ({
    id: a.id,
    message: a.message,
    timestamp: a.timestamp,
    type: a.type.includes("high") || a.type.includes("low")
      ? ("critical" as const)
      : ("info" as const),
  }));

  const updateSettings = async (payload: Partial<Settings>) => {
    await fetch(`${API_URL}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await fetchBackendData();
  };

const handleFan1Control = async (state: boolean) => {
  await fetch(`${API_URL}/api/control/fan1?state=${state}`, {
    method: "POST",
  });

  await fetchBackendData();
};

const handleFan2Control = async (state: boolean) => {
  await fetch(`${API_URL}/api/control/fan2?state=${state}`, {
    method: "POST",
  });

  await fetchBackendData();
};

const handleManualModeChange = async (manual: boolean) => {
  await fetch(`${API_URL}/api/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ manual_mode: manual }),
  });

  await fetchBackendData();
};

  const handleStartExperiment = async () => {

  const testId = prompt("Enter test ID:", `TEST-${Date.now()}`);

  if (!testId) return;

  if (testId.includes("/")) {
    alert("Test ID cannot contain '/' — please use a different name.");
    return;
  }

  await fetch(`${API_URL}/api/experiment/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      test_id: testId,
    }),
  });

  setIsExperimentRunning(true);
  await fetchBackendData();
};

const handleStopExperiment = async () => {
  await fetch(`${API_URL}/api/experiment/stop`, {
    method: "POST",
  });

  setIsExperimentRunning(false);
  await fetchBackendData();
};


const exportAllCsv = () => {
  window.open(`${API_URL}/api/export/csv`, "_blank");
};


const exportSelectedExperimentCsv = () => {
  if (!selectedExperiment) {
    alert("Select an experiment first");
    return;
  }

  window.open(
  `${API_URL}/api/export/csv/experiment/${selectedExperiment}`,
  "_blank"
);
};



  return (
    <div className="flex h-screen w-full bg-gray-50">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        alertCount={alerts.length}
        latest={latest}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Solar Air Heater Dashboard
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                isSensorActive ? "bg-green-500" : "bg-gray-400"
                  }`}
                  />
              <span className="text-sm text-gray-600">{systemStatus}</span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {activeView === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <SensorCard
                  title="Inlet Temperature"
                  value={Math.round(sensorData.inlet)}
                  unit="°C"
                  icon={Thermometer}
                />
                <SensorCard
                  title="Middle 1 Temperature"
                  value={Math.round(sensorData.middle1)}
                  unit="°C"
                  icon={Thermometer}
                />
                <SensorCard
                  title="Middle 2 Temperature"
                  value={Math.round(sensorData.middle2)}
                  unit="°C"
                  icon={Thermometer}
                />
                <SensorCard
                  title="Outlet Temperature"
                  value={Math.round(sensorData.outlet)}
                  unit="°C"
                  icon={Thermometer}
                />
                <SensorCard
                  title="Avg Collector Temp"
                  value={Math.round(sensorData.avgCollector)}
                  unit="°C"
                  icon={Activity}
                />
                <SensorCard
                 title="Chamber Temperature"
                 value={Math.round(sensorData.chamberTemp)}
                 unit="°C"
                 icon={Thermometer}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="flex flex-col gap-4">
                  <div className="flex-1 rounded-xl bg-white p-6 shadow-md">
                    <h3 className="mb-4 text-lg font-semibold text-gray-700">
                      Fan Status
                    </h3>
                    <div className="space-y-3">
                      <FanStatusCard fanName="Exhaust Fan 1" isOn={fan1On} />
                      <FanStatusCard fanName="Exhaust Fan 2" isOn={fan2On} />
                    </div>
                  </div>

                  <ExperimentControl
                    isRunning={isExperimentRunning}
                    onStart={handleStartExperiment}
                    onStop={handleStopExperiment}
                  />
                </div>

                <HumidityGauge value={Math.round(sensorData.humidity)} />

                <div className="flex flex-col gap-4">
                  <FanControl
                  fan1={fan1On}
                  fan2={fan2On}
                  disabled={!isManualMode}
                  onFan1Change={handleFan1Control}
                  onFan2Change={handleFan2Control}
                />

                  <ControlMode
                    isManual={isManualMode}
                    onChange={handleManualModeChange}
                  />
                </div>
              </div>

              {settings && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <ThresholdSettings
                    tempMin={settings.temp_min}
                    tempMax={settings.temp_max}
                    humidMin={settings.humidity_min}
                    humidMax={settings.humidity_max}
                    onTempMinChange={(val) =>
                      updateSettings({ temp_min: val[0] })
                    }
                    onTempMaxChange={(val) =>
                      updateSettings({ temp_max: val[0] })
                    }
                    onHumidMinChange={(val) =>
                      updateSettings({ humidity_min: val[0] })
                    }
                    onHumidMaxChange={(val) =>
                      updateSettings({ humidity_max: val[0] })
                    }
                  />

                  <AlertsPanel alerts={uiAlerts} />
                </div>
              )}

              <RealTimeChart data={chartData} />
            </div>
          )}

          {activeView === "readings" && <ReadingsTable readings={tableReadings} />}

          {activeView === "charts" && (
            <div className="space-y-6">
              <RealTimeChart data={chartData} />
              <div className="rounded-xl bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">
                  Sensor Development Over Time
                </h3>
                <RealTimeChart data={chartData} />
              </div>
            </div>
          )}

          {activeView === "alerts" && <AlertsPanel alerts={uiAlerts} />}

          {activeView === "experiment" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ExperimentControl
                isRunning={isExperimentRunning}
                onStart={handleStartExperiment}
                onStop={handleStopExperiment}
              />

              <div className="rounded-xl bg-white p-6 shadow-md">
                  <h3 className="mb-4 text-lg font-semibold text-gray-700">
                    Experiment Details
                  </h3>

                  <p className="text-sm text-gray-600">
                    Experiment ID: {currentExperiment?.test_id ?? "No active experiment"}
                  </p>

                  <p className="text-sm text-gray-600">
                    Status: {currentExperiment?.running ? "Running" : "Stopped"}
                  </p>
                </div>
            </div>
          )}

          {activeView === "settings" && settings && (
            <ThresholdSettings
              tempMin={settings.temp_min}
              tempMax={settings.temp_max}
              humidMin={settings.humidity_min}
              humidMax={settings.humidity_max}
              onTempMinChange={(val) => updateSettings({ temp_min: val[0] })}
              onTempMaxChange={(val) => updateSettings({ temp_max: val[0] })}
              onHumidMinChange={(val) =>
                updateSettings({ humidity_min: val[0] })
              }
              onHumidMaxChange={(val) =>
                updateSettings({ humidity_max: val[0] })
              }
            />
          )}

          {activeView === "export" && (
                    <div className="rounded-xl bg-white p-6 shadow-md">
                      <h3 className="mb-4 text-lg font-semibold text-gray-700">
                        Export Data
                      </h3>

                      <p className="mb-4 text-sm text-gray-600">
                        Download sensor readings and experiment data as CSV.
                      </p>

                      {/* SELECT EXPERIMENT */}
                      <select
                        value={selectedExperiment}
                        onChange={(e) => setSelectedExperiment(e.target.value)}
                        className="mb-4 w-full rounded-lg border px-3 py-2"
                      >
                        <option value="">Select Experiment</option>
                        {experiments.map((exp) => (
                          <option key={exp.id} value={String(exp.id)}>
                            {exp.test_id} ({exp.status})
                          </option>
                        ))}
                      </select>

                      {/* BUTTONS */}
                      <div className="flex flex-col gap-3">

                        <button
                          onClick={exportAllCsv}
                          className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-medium text-white shadow hover:bg-blue-600"
                        >
                          <Wind size={20} />
                          Export All Data
                        </button>

                        <button
                          onClick={exportSelectedExperimentCsv}
                          className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-medium text-white shadow hover:bg-green-600"
                        >
                          <Wind size={20} />
                          Export Selected Experiment
                        </button>

                      </div>
                    </div>
                  )}
        </main>
      </div>
    </div>
  );
}