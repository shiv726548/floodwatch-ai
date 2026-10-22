import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Bell, Clock3, Gauge, MapPinned, Menu, Plus, Search, ShieldAlert, UserCircle2, Wave, Zap } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer, Circle } from 'react-leaflet';
import { useEffect, useState } from 'react';

const incidentSeed = [
  {
    id: 'INC-1001',
    title: 'Flooding near River Road',
    category: 'Flood',
    status: 'Awaiting verification',
    severity: 'High',
    source: 'Public report',
    freshness: '12 min ago',
    lat: 23.0225,
    lng: 72.5714,
  },
  {
    id: 'INC-1002',
    title: 'Landslide warning on Hill Link Road',
    category: 'Landslide',
    status: 'Reported hazard',
    severity: 'Medium',
    source: 'Model prediction',
    freshness: '19 min ago',
    lat: 23.0284,
    lng: 72.5657,
  },
  {
    id: 'INC-1003',
    title: 'Bridge access partially open',
    category: 'Road',
    severity: 'Low',
    status: 'Open according to available information',
    source: 'Officially confirmed',
    freshness: '27 min ago',
    lat: 23.0305,
    lng: 72.5798,
  },
];

const statusColors: Record<string, string> = {
  'Awaiting verification': 'bg-amber-500',
  'Reported hazard': 'bg-amber-500',
  'Open according to available information': 'bg-emerald-500',
  'Confirmed closure': 'bg-red-500',
  'Access uncertain': 'bg-violet-500',
  'Data outdated': 'bg-slate-500',
};

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeRole, setActiveRole] = useState('Coordinator');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard')
      .then((res) => res.json())
      .then((payload) => setData(payload))
      .catch(() => {
        setData({
          banner: 'Simulated demo data — not real emergency information. In a real emergency contact official services.',
          summary: {
            activeWarnings: 3,
            roadBlocks: 2,
            medicalRequests: 4,
            reliefCenters: 5,
          },
          incidents: incidentSeed,
        });
      });
  }, []);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100">
        <div className="relative h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.12),_transparent_30%),_linear-gradient(180deg,_#020817,_#0b1220)]">
          <header className="absolute inset-x-0 top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
            <div className="mx-auto flex h-20 max-w-[1600px] items-center gap-4 px-4 lg:px-8">
              <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 lg:hidden" aria-label="Open menu">
                <Menu size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300 ring-1 ring-teal-400/30">
                  <Wave size={18} />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Decision support</div>
                  <div className="text-lg font-semibold">FloodWatch AI</div>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 md:flex">
                  <Search size={15} />
                  Search incidents, roads, shelters
                </div>

                <select
                  value={activeRole}
                  onChange={(e) => setActiveRole(e.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  aria-label="Role switcher"
                >
                  <option>Public</option>
                  <option>Volunteer</option>
                  <option>Coordinator</option>
                  <option>Healthcare</option>
                  <option>Admin</option>
                </select>

                <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200" aria-label="Notifications">
                  <Bell size={18} />
                </button>
                <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200" aria-label="Toggle theme" onClick={() => setDarkMode((v) => !v)}>
                  <Zap size={18} />
                </button>
              </div>
            </div>
          </header>

          <div className="absolute inset-x-0 top-20 z-30 border-b border-white/10 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-100">
            {data?.banner ?? 'Simulated demo data — not real emergency information. In a real emergency contact official services.'}
          </div>

          <aside className="absolute left-4 top-32 bottom-6 z-30 hidden w-72 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl lg:block">
            <div className="border-b border-white/10 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Operations</div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-lg font-semibold">Overview</div>
                <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200">
                  <Menu size={15} />
                </button>
              </div>
            </div>

            <nav className="space-y-2 p-3">
              {[
                ['Dashboard', Activity],
                ['Map', MapPinned],
                ['Incidents', AlertTriangle],
                ['Healthcare', UserCircle2],
                ['Routes', Gauge],
                ['Resources', ShieldAlert],
              ].map(([label, Icon]) => (
                <button key={label} className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10">
                  <Icon size={16} className="text-teal-300" />
                  {label}
                </button>
              ))}
            </nav>

            <div className="mt-4 border-t border-white/10 p-4">
              <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">Live status</div>
              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs text-slate-400">Active warnings</div>
                  <div className="mt-1 text-2xl font-semibold text-teal-300">{data?.summary?.activeWarnings ?? 3}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs text-slate-400">Road blocks</div>
                  <div className="mt-1 text-2xl font-semibold text-red-400">{data?.summary?.roadBlocks ?? 2}</div>
                </div>
              </div>
            </div>
          </aside>

          <main className="absolute inset-0 pt-24 pb-4 pl-0 lg:pl-80">
            <div className="relative h-full px-4 md:px-6">
              <div className="map-float-panel">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/75 p-3 shadow-soft backdrop-blur-xl">
                  <button className="rounded-xl bg-teal-500 px-3 py-2 text-sm font-medium text-slate-950">Report Incident</button>
                  <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">Request Assistance</button>
                  <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">Flood overlay</button>
                  <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">Road status</button>
                  <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">Medical</button>
                  <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">Relief</button>
                </div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative h-full overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/40 shadow-soft">
                <MapContainer center={[23.025, 72.57]} zoom={13} className="h-full w-full" scrollWheelZoom>
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {incidentSeed.map((incident) => (
                    <div key={incident.id}>
                      <Circle center={[incident.lat, incident.lng]} radius={220} pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.12, opacity: 0.8 }} />
                      <Marker position={[incident.lat, incident.lng]}>
                        <Popup>
                          <div className="space-y-1 text-sm">
                            <div className="font-semibold">{incident.title}</div>
                            <div>{incident.category}</div>
                            <div>{incident.status}</div>
                          </div>
                        </Popup>
                      </Marker>
                    </div>
                  ))}
                </MapContainer>

                <div className="absolute bottom-5 left-5 right-5 z-20 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-400">Route status</div>
                      <div className="flex items-center gap-2 text-xs text-amber-300"><Clock3 size={14} /> Updated 12 min ago</div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="status-dot bg-amber-500" />
                      <div className="font-medium">Reported hazard</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">Hill Link Road is under review; route remains unverified.</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 backdrop-blur-xl">
                    <div className="text-sm text-slate-400">Medical requests</div>
                    <div className="mt-3 text-2xl font-semibold text-teal-300">{data?.summary?.medicalRequests ?? 4}</div>
                    <div className="mt-2 text-sm text-slate-300">Two priority requests require coordinator review.</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 backdrop-blur-xl">
                    <div className="text-sm text-slate-400">Relief resources</div>
                    <div className="mt-3 text-2xl font-semibold text-violet-300">{data?.summary?.reliefCenters ?? 5}</div>
                    <div className="mt-2 text-sm text-slate-300">Capacity and access status updated with stale-signal checks.</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </main>

          <div className="absolute right-4 top-32 z-30 hidden w-96 rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-soft backdrop-blur-xl xl:block">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Incident feed</div>
                <div className="mt-1 text-lg font-semibold">Latest reports</div>
              </div>
              <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-sm text-slate-200">
                <Plus size={16} />
                Add
              </button>
            </div>

            <div className="space-y-3">
              {data?.incidents?.map((incident: any) => (
                <motion.div key={incident.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{incident.title}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{incident.category}</div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-medium text-white ${statusColors[incident.status] ?? 'bg-slate-500'}`}>
                      {incident.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1"><Clock3 size={12} /> {incident.freshness ?? '12 min ago'}</span>
                    <span>{incident.source}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
