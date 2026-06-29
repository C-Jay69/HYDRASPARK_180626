import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, AlertTriangle, Users, CheckCircle, XCircle,
  MapPin, Bell, Radio, QrCode, Download, UserCheck, Activity
} from "lucide-react";
import { api } from "../../lib/api";

interface CheckIn {
  id: string;
  userName: string;
  userId: string;
  time: string;
  zone: string;
  status: string;
}

interface Incident {
  id: string;
  userName: string;
  userId: string;
  type: string;
  details: string;
  severity: string;
  timestamp: string;
  status: "active" | "resolved";
}

interface HeatZone {
  zone: string;
  count: number;
  capacity: number;
}

export default function MarshalDashboard() {
  const userId = localStorage.getItem("userId") || "";
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [liveFeed, setLiveFeed] = useState<string[]>([]);
  const [heatZones, setHeatZones] = useState<HeatZone[]>([
    { zone: "Entrance", count: 0, capacity: 30 },
    { zone: "Main Floor", count: 0, capacity: 80 },
    { zone: "Bar Area", count: 0, capacity: 40 },
    { zone: "VIP Section", count: 0, capacity: 20 },
    { zone: "Rooftop", count: 0, capacity: 50 },
    { zone: "Exit", count: 0, capacity: 20 },
  ]);
  const [totalCapacity] = useState(150);
  const [incidentForm, setIncidentForm] = useState(false);
  const [newIncident, setNewIncident] = useState({ userName: "", type: "missed_checkin", details: "" });
  const pollingRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    loadFeed();
    pollingRef.current = setInterval(loadFeed, 15000);
    return () => clearInterval(pollingRef.current);
  }, []);

  async function loadFeed() {
    try {
      const data = await api.get("/guardian/marshal/feed");
      setCheckins(data.checkins || []);
      setIncidents(data.alerts || []);
    } catch {}
  }

  async function resolve(id: string) {
    await api.post(`/guardian/marshal/resolve/${id}`);
    setIncidents((prev) => prev.map((i) => i.id === id ? { ...i, status: "resolved" } : i));
  }

  async function reportIncident() {
    try {
      await api.post("/guardian/marshal/incident", newIncident);
      setIncidentForm(false);
      setNewIncident({ userName: "", type: "missed_checkin", details: "" });
      loadFeed();
    } catch (err: any) {
      alert(err.message || "Failed to report");
    }
  }

  function simulateCheckin() {
    const names = ["Alex M.", "Jordan K.", "Sam R.", "Taylor B.", "Casey W."];
    const zones = ["Entrance", "Main Floor", "Bar Area", "VIP Section", "Rooftop"];
    const name = names[Math.floor(Math.random() * names.length)];
    const zone = zones[Math.floor(Math.random() * zones.length)];

    const entry: CheckIn = {
      id: crypto.randomUUID(),
      userName: name,
      userId: crypto.randomUUID(),
      time: new Date().toISOString(),
      zone,
      status: "checked_in",
    };

    setCheckins((prev) => [entry, ...prev]);
    setLiveFeed((prev) => [`${name} checked into ${zone}`, ...prev].slice(0, 30));
    setHeatZones((prev) =>
      prev.map((z) => z.zone === zone ? { ...z, count: Math.min(z.count + 1, z.capacity) } : z)
    );
  }

  const activeIncidents = incidents.filter((i) => i.status === "active");
  const checkedIn = checkins.length;
  const fillRate = Math.round((checkedIn / totalCapacity) * 100);

  return (
    <div className="min-h-screen bg-black text-white font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <header className="bg-[#0a0a0a] border-b border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-500" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">
                Marshal Command Center
              </h1>
              <p className="text-xs text-gray-500">HydraSpark Safety Operations</p>
            </div>
            <span className="flex items-center gap-1 text-xs bg-green-900/40 border border-green-500/30 text-green-400 px-3 py-1 rounded-full ml-2">
              <Radio className="w-3 h-3 animate-pulse" /> LIVE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIncidentForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/30 transition"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Incident
            </button>
            {activeIncidents.length > 0 && (
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                {activeIncidents.length}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Capacity", value: totalCapacity, icon: Users, color: "blue", sub: "max attendees" },
            { label: "Checked In", value: checkedIn, icon: UserCheck, color: "green", sub: `${fillRate}% fill rate` },
            { label: "No Shows", value: Math.max(0, checkedIn - 5), icon: XCircle, color: "red", sub: "not arrived" },
            { label: "Active Incidents", value: activeIncidents.length, icon: AlertTriangle, color: "orange", sub: activeIncidents.length === 0 ? "all clear" : "need attention" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-[#111] border border-gray-800 rounded-xl p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-gray-600 text-xs mt-1">{stat.sub}</p>
                </div>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400 opacity-70`} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: Check-in Feed + QR */}
          <div className="lg:col-span-2 space-y-6">

            {/* QR Check-in */}
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-cyan-400" />
                  Check-in Station
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={simulateCheckin}
                    className="text-xs px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition"
                  >
                    + Simulate Check-in
                  </button>
                  <button className="text-xs px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition flex items-center gap-1">
                    <Download className="w-3 h-3" /> Export
                  </button>
                </div>
              </div>

              {/* Capacity bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Venue Capacity</span>
                  <span>{checkedIn} / {totalCapacity} ({fillRate}%)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <motion.div
                    animate={{ width: `${fillRate}%` }}
                    className={`h-2 rounded-full transition-all ${
                      fillRate > 90 ? "bg-red-500" : fillRate > 70 ? "bg-amber-400" : "bg-gradient-to-r from-purple-500 to-cyan-400"
                    }`}
                  />
                </div>
              </div>

              {/* Live feed */}
              <div className="max-h-64 overflow-y-auto space-y-1">
                <AnimatePresence>
                  {liveFeed.length === 0 && (
                    <p className="text-gray-600 text-sm text-center py-8">Waiting for check-ins...</p>
                  )}
                  {liveFeed.map((entry, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 py-1.5 border-b border-gray-900"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{entry}</span>
                      <span className="text-xs text-gray-600 ml-auto">{new Date().toLocaleTimeString()}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Heat Map */}
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-purple-400" />
                Venue Heat Map
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {heatZones.map((zone) => {
                  const pct = zone.count / zone.capacity;
                  const color = pct > 0.85 ? "#ef4444" : pct > 0.6 ? "#f59e0b" : "#a855f7";
                  return (
                    <div
                      key={zone.zone}
                      className="rounded-xl p-4 border border-gray-800 relative overflow-hidden"
                    >
                      <div
                        className="absolute inset-0 opacity-20 transition-all duration-500"
                        style={{ background: color, transform: `scaleY(${pct})`, transformOrigin: "bottom" }}
                      />
                      <div className="relative">
                        <p className="text-xs text-gray-400">{zone.zone}</p>
                        <p className="text-xl font-bold text-white mt-1">{zone.count}</p>
                        <p className="text-xs text-gray-600">/ {zone.capacity} cap</p>
                        {pct > 0.85 && (
                          <span className="text-xs text-red-400 font-semibold">CROWDED</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Incidents + Guardian */}
          <div className="space-y-6">

            {/* Active Incidents */}
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
              <h2 className="font-semibold flex items-center gap-2 text-red-400 mb-4">
                <AlertTriangle className="w-5 h-5" />
                Active Incidents
                {activeIncidents.length > 0 && (
                  <span className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                    {activeIncidents.length}
                  </span>
                )}
              </h2>
              {activeIncidents.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto text-gray-700 mb-3" />
                  <p className="text-gray-500 text-sm">No active incidents</p>
                  <p className="text-gray-700 text-xs mt-1">All clear ✓</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeIncidents.map((inc) => (
                    <div key={inc.id} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-red-300 text-sm">{inc.userName}</p>
                        <span className="text-xs text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full">
                          {inc.type?.replace(/_/g, " ")}
                        </span>
                      </div>
                      {inc.details && <p className="text-gray-400 text-xs mb-3">{inc.details}</p>}
                      <div className="flex gap-2">
                        <button
                          onClick={() => resolve(inc.id)}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 transition"
                        >
                          Resolve
                        </button>
                        <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30 transition">
                          Contact EMS
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Guardian Spark Status */}
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-cyan-400" />
                Guardian Status
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Active check-ins</span>
                  <span className="text-green-400 font-bold">{checkedIn} / {totalCapacity}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-cyan-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${fillRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Next window: 15 min</span>
                  <span>Auto-alert: 30 min</span>
                </div>
                <button className="w-full mt-2 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-sm hover:bg-purple-500/30 transition">
                  Send Mass Safety Check
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Report Modal */}
      <AnimatePresence>
        {incidentForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#111] border border-red-500/30 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Report Incident
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Attendee name"
                  value={newIncident.userName}
                  onChange={(e) => setNewIncident({ ...newIncident, userName: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white text-sm"
                />
                <select
                  value={newIncident.type}
                  onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white text-sm"
                >
                  <option value="missed_checkin">Missed Check-in</option>
                  <option value="medical">Medical Emergency</option>
                  <option value="fight">Altercation</option>
                  <option value="harassment">Harassment</option>
                  <option value="other">Other</option>
                </select>
                <textarea
                  placeholder="Details..."
                  rows={3}
                  value={newIncident.details}
                  onChange={(e) => setNewIncident({ ...newIncident, details: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIncidentForm(false)}
                  className="flex-1 py-2.5 bg-gray-800 text-gray-400 rounded-xl text-sm hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={reportIncident}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition"
                >
                  Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
