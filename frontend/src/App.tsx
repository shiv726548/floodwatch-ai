import { useEffect, useMemo, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, Polyline, TileLayer } from 'react-leaflet';
import {
  Activity,
  AlertTriangle,
  Bell,
  Clock3,
  Gauge,
  MapPinned,
  Menu,
  Plus,
  Search,
  ShieldAlert,
  UserCircle2,
  Waves,
  Zap,
} from 'lucide-react';

type Incident = {
  id: string;
  title: string;
  category: string;
  status: string;
  severity: string;
  source: string;
  freshness: string;
  lat: number;
  lng: number;
};

type RequestItem = {
  id: string;
  patient: string;
  urgency: string;
  status: string;
  priority: number;
  reason: string[];
  location: string;
  needs: string;
};

type ResourceItem = {
  id: string;
  name: string;
  type: string;
  capacity: number;
  utilization: number;
  stale: boolean;
  status: string;
};

type RouteResult = {
  verified_route: boolean;
  route: {
    path: string[];
    travel_time: number;
    status: string;
    edges: Array<{ from: string; to: string; status: string; travel_time: number; name: string }>;
  } | null;
  alternatives: Array<{ name: string; travel_time: number; status: string; verified: boolean }>;
  alert: string;
  road_status: string;
  closed_segments: string[];
};

const navItems = [
  ['Dashboard', Activity],
  ['Map', MapPinned],
  ['Healthcare', UserCircle2],
  ['Resources', ShieldAlert],
  ['Admin', Gauge],
  ['Demo', Zap],
] as const;

const demoSteps = [
  'Heavy rainfall triggers flood and resident reports.',
  'Landslide report arrives on Hill Link Road as unverified.',
  'Coordinator confirms the closure and route recalculates.',
  'Alternative route slows under traffic delay.',
  'Urgent medical request appears and is prioritized.',
  'Second closure isolates the area and escalates review.',
  'Coordinator records a decision and resolves request.',
];

const statusColors: Record<string, string> = {
  'Awaiting verification': 'bg-amber-500',
  'Reported hazard': 'bg-amber-500',
  'Open according to available information': 'bg-emerald-500',
  'Confirmed closure': 'bg-red-500',
  'Access uncertain': 'bg-violet-500',
  'Data outdated': 'bg-slate-500',
  'Traffic delayed': 'bg-orange-500',
  'Open with traffic delay': 'bg-amber-600',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [role, setRole] = useState('Coordinator');
  const [demoStep, setDemoStep] = useState(0);
  const [dashboard, setDashboard] = useState<any>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [routeData, setRouteData] = useState<RouteResult | null>(null);

  const fetchData = async () => {
    try {
      const [dashRes, requestRes, resourceRes, routeRes] = await Promise.all([
        fetch('http://localhost:8000/api/dashboard'),
        fetch('http://localhost:8000/api/requests'),
        fetch('http://localhost:8000/api/resources'),
        fetch('http://localhost:8000/api/routes?origin=response_base&destination=medical_zone'),
      ]);

      const dash = await dashRes.json();
      const reqs = await requestRes.json();
      const resList = await resourceRes.json();
      const route = await routeRes.json();

      setDashboard(dash);
      setRequests(reqs.requests ?? []);
      setResources(resList.resources ?? []);
      setRouteData(route);
    } catch {
      const fallbacks = {
        banner: 'Simulated demo data — not real emergency information. In a real emergency contact official services.',
        summary: { activeWarnings: 3, roadBlocks: 2, medicalRequests: 4, reliefCenters: 5 },
        incidents: [
          { id: 'INC-1001', title: 'Flooding near River Road', category: 'Flood', status: 'Awaiting verification', severity: 'High', source: 'Public report', freshness: '12 min ago', lat: 23.0225, lng: 72.5714 },
          { id: 'INC-1002', title: 'Landslide warning on Hill Link Road', category: 'Landslide', status: 'Reported hazard', severity: 'Medium', source: 'Model prediction', freshness: '19 min ago', lat: 23.0284, lng: 72.5657 },
          { id: 'INC-1003', title: 'Bridge access partially open', category: 'Road', status: 'Open according to available information', severity: 'Low', source: 'Officially confirmed', freshness: '27 min ago', lat: 23.0305, lng: 72.5798 },
        ],
      };
      setDashboard(fallbacks);
      setRequests([
        { id: 'REQ-1101', patient: 'Asha K.', urgency: 'Critical', status: 'Prioritized', priority: 94, reason: ['Severe dehydration risk', 'Limited access to region', 'Multiple family dependents'], location: 'North Sector', needs: 'Ambulance transfer' },
        { id: 'REQ-1102', patient: 'Ravi M.', urgency: 'High', status: 'Awaiting assignment', priority: 86, reason: ['Older adult', 'Medication required', 'Route affected'], location: 'East Hill', needs: 'Medical escort' },
      ]);
      setResources([
        { id: 'RES-01', name: 'Shelter Alpha', type: 'Shelter', capacity: 120, utilization: 66, stale: false, status: 'Open according to available information' },
        { id: 'RES-02', name: 'Clinic Delta', type: 'Medical', capacity: 36, utilization: 82, stale: false, status: 'Access uncertain' },
      ]);
      setRouteData({
        verified_route: true,
        route: { path: ['response_base', 'north_town', 'east_hill', 'medical_zone'], travel_time: 47, status: 'Open with traffic delay', edges: [{ from: 'response_base', to: 'north_town', status: 'Open according to available information', travel_time: 16, name: 'River Road Connector' }, { from: 'north_town', to: 'east_hill', status: 'Reported hazard', travel_time: 20, name: 'Hill Link Road' }, { from: 'east_hill', to: 'medical_zone', status: 'Open according to available information', travel_time: 12, name: 'Civic Bridge' }] },
        alternatives: [{ name: 'Service detour', travel_time: 61, status: 'Traffic delayed', verified: true }],
        alert: 'Route is not guaranteed safe.',
        road_status: 'Verified accessible route',
        closed_segments: ['R-07'],
      });
    }
  };

  useEffect(() => { fetchData(); }, []);

  const routeStatusText = useMemo(() => {
    if (!routeData) return 'No verified route';
    return routeData.verified_route ? routeData.route?.status ?? 'Open according to available information' : 'No verified route';
  }, [routeData]);

  const triggerDemo = () => {
    setDemoStep((prev) => (prev + 1) % demoSteps.length);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 dark">
      <div className="relative h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.12),_transparent_30%),_linear-gradient(180deg,_#020817,_#0b1220)]">
        <header className="absolute inset-x-0 top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-[1600px] items-center gap-4 px-4 lg:px-8">
            <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 lg:hidden" aria-label="Open menu">
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300 ring-1 ring-teal-400/30">
                <Waves size={18} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Decision support</div>
                <div className="text-lg font-semibold">FloodWatch AI</div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 md:flex">
                <Search size={15} /> Search incidents, roads, shelters
              </div>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50" aria-label="Role switcher">
                <option>Public</option>
                <option>Volunteer</option>
                <option>Coordinator</option>
                <option>Healthcare</option>
                <option>Admin</option>
              </select>
              <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200" aria-label="Notifications"><Bell size={18} /></button>
            </div>
          </div>
        </header>

        <div className="absolute inset-x-0 top-20 z-30 border-b border-white/10 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-100">
          {dashboard?.banner ?? 'Simulated demo data — not real emergency information. In a real emergency contact official services.'}
        </div>

        <aside className="absolute left-4 top-32 bottom-6 z-30 hidden w-72 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl lg:block">
          <div className="border-b border-white/10 p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Operations</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-lg font-semibold">Overview</div>
              <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200"><Menu size={15} /></button>
            </div>
          </div>
          <nav className="space-y-2 p-3">
            {navItems.map(([label, Icon]) => (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${activeTab === label ? 'border-teal-400/30 bg-teal-500/10 text-teal-200' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'}`}
              >
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
                <div className="mt-1 text-2xl font-semibold text-teal-300">{dashboard?.summary?.activeWarnings ?? 3}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-slate-400">Road blocks</div>
                <div className="mt-1 text-2xl font-semibold text-red-400">{dashboard?.summary?.roadBlocks ?? 2}</div>
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

            <div className="relative h-full overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/40 shadow-soft">
              <MapContainer center={[23.025, 72.57]} zoom={13} className="h-full w-full" scrollWheelZoom>
                <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {dashboard?.incidents?.map((incident: Incident) => (
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
                {routeData?.route?.edges && (
                  <Polyline positions={routeData.route.edges.map((edge) => {
                    const points = {
                      response_base: [23.018, 72.568],
                      north_town: [23.027, 72.575],
                      east_hill: [23.032, 72.586],
                      medical_zone: [23.04, 72.578],
                      south_basin: [23.022, 72.592],
                    } as Record<string, [number, number]>;
                    return [points[edge.from], points[edge.to]];
                  })} pathOptions={{ color: '#2dd4bf', weight: 5, opacity: 0.9 }} />
                )}
              </MapContainer>

              <div className="absolute bottom-5 left-5 right-5 z-20 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-400">Route status</div>
                    <div className="flex items-center gap-2 text-xs text-amber-300"><Clock3 size={14} /> Updated 12 min ago</div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className={`status-dot ${statusColors[routeStatusText] ?? 'bg-amber-500'}`} />
                    <div className="font-medium">{routeStatusText}</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-300">{routeData?.alert ?? 'Route is not guaranteed safe.'}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 backdrop-blur-xl">
                  <div className="text-sm text-slate-400">Medical requests</div>
                  <div className="mt-3 text-2xl font-semibold text-teal-300">{dashboard?.summary?.medicalRequests ?? 4}</div>
                  <div className="mt-2 text-sm text-slate-300">Two priority requests require coordinator review.</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 backdrop-blur-xl">
                  <div className="text-sm text-slate-400">Relief resources</div>
                  <div className="mt-3 text-2xl font-semibold text-violet-300">{dashboard?.summary?.reliefCenters ?? 5}</div>
                  <div className="mt-2 text-sm text-slate-300">Capacity and access status updated with stale-signal checks.</div>
                </div>
              </div>
            </div>

            {activeTab !== 'Dashboard' && (
              <div className="absolute right-4 top-32 z-30 hidden w-[420px] rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-soft backdrop-blur-xl xl:block">
                {activeTab === 'Map' && (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Route planner</div>
                        <div className="mt-1 text-lg font-semibold">Accessible route</div>
                      </div>
                      <button className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-sm text-slate-200">Compare</button>
                    </div>
                    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between text-sm text-slate-300"><span>Origin</span><span>Response Base</span></div>
                      <div className="flex items-center justify-between text-sm text-slate-300"><span>Destination</span><span>Medical Zone</span></div>
                      <div className="flex items-center justify-between text-sm text-slate-300"><span>Route time</span><span>{routeData?.route?.travel_time ?? 47} min</span></div>
                      <div className="text-xs text-amber-200">{routeData?.alert ?? 'Route is not guaranteed safe.'}</div>
                    </div>
                  </div>
                )}

                {activeTab === 'Healthcare' && (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Assistance</div>
                        <div className="mt-1 text-lg font-semibold">Priority queue</div>
                      </div>
                      <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-sm text-slate-200"><Plus size={16} /> Add</button>
                    </div>
                    <div className="space-y-3">
                      {requests.map((item) => (
                        <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{item.patient}</div>
                            <span className="rounded-full bg-teal-500/20 px-2 py-1 text-[10px] text-teal-200">{item.urgency}</span>
                          </div>
                          <div className="mt-3 text-xs text-slate-400">Priority score {item.priority}</div>
                          <div className="mt-2 text-sm text-slate-300">{item.reason.join(' • ')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'Resources' && (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Resources</div>
                        <div className="mt-1 text-lg font-semibold">Relief inventory</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {resources.map((item) => (
                        <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{item.name}</div>
                            <span className="rounded-full bg-violet-500/20 px-2 py-1 text-[10px] text-violet-200">{item.type}</span>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-slate-700">
                            <div className="h-2 rounded-full bg-teal-400" style={{ width: `${item.utilization}%` }} />
                          </div>
                          <div className="mt-2 text-xs text-slate-400">{item.utilization}% used • {item.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'Admin' && (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">System</div>
                        <div className="mt-1 text-lg font-semibold">Audit + health</div>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm text-slate-300">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">Status: AI modules degraded, graceful fallback active</div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">Closures excluded from routing: {routeData?.closed_segments.join(', ') ?? 'R-07'}</div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">Latest decision: Coordinator verified closure and escalated access review</div>
                    </div>
                  </div>
                )}

                {activeTab === 'Demo' && (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Scenario</div>
                        <div className="mt-1 text-lg font-semibold">Run Demo</div>
                      </div>
                      <button onClick={triggerDemo} className="rounded-xl bg-teal-500 px-2.5 py-2 text-sm font-medium text-slate-950">Advance</button>
                    </div>
                    <div className="space-y-3 text-sm text-slate-300">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">Step {demoStep + 1}: {demoSteps[demoStep]}</div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">Demo mode: simulated city operations only</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Dashboard' && (
              <div className="absolute right-4 top-32 z-30 hidden w-[420px] rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-soft backdrop-blur-xl xl:block">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Incident feed</div>
                    <div className="mt-1 text-lg font-semibold">Latest reports</div>
                  </div>
                  <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-sm text-slate-200"><Plus size={16} /> Add</button>
                </div>
                <div className="space-y-3">
                  {dashboard?.incidents?.map((incident: Incident) => (
                    <div key={incident.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{incident.title}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{incident.category}</div>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-medium text-white ${statusColors[incident.status] ?? 'bg-slate-500'}`}>{incident.status}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-300">
                        <span className="flex items-center gap-1"><Clock3 size={12} /> {incident.freshness}</span>
                        <span>{incident.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}













