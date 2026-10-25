import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Bell, Check, ChevronDown,
  ChevronRight, CircleHelp, Clock3, Command, Droplets, FilePlus2, Filter, Gauge,
  HeartPulse, Home, Layers3, Map as MapIcon, MapPinned, Menu, Moon, MoreHorizontal,
  Navigation, Pause, Play, Plus, Radio, Route as RouteIcon, Search, Settings2,
  Shield, ShieldAlert, SlidersHorizontal, Sun, Users, Waves, X,
} from 'lucide-react';
import { demoSteps, incidents as seededIncidents, requests as seededRequests, resources as seededResources, roads as seededRoads, statusHistory, type Incident, type AssistanceRequest, type Resource } from './data/mockData';
import { useAppStore, type DemoRole } from './state/appStore';
import { OperationsMap } from './components/OperationsMap';
import { EmptyState, FreshnessChip, KpiTile, Panel, PriorityBadge, SectionHeading, SourceBadge, StatusBadge } from './components/Ui';

const navigation = [
  { label: 'Dashboard', path: '/', icon: Home },
  { label: 'Map', path: '/map', icon: MapIcon },
  { label: 'Incidents', path: '/incidents', icon: AlertTriangle },
  { label: 'Healthcare', path: '/healthcare', icon: HeartPulse },
  { label: 'Resources', path: '/resources', icon: Layers3 },
  { label: 'Route planner', path: '/routes', icon: RouteIcon },
  { label: 'Admin', path: '/admin', icon: Settings2 },
];

const roleOptions: DemoRole[] = ['Public', 'Volunteer', 'Coordinator', 'Healthcare', 'Admin'];
const roleCanVerify = (role: DemoRole) => role === 'Coordinator' || role === 'Admin';
const visiblePaths: Record<DemoRole, string[]> = {
  Public: ['/', '/map', '/incidents'],
  Volunteer: ['/', '/map', '/incidents', '/resources'],
  Coordinator: navigation.map((item) => item.path),
  Healthcare: ['/', '/healthcare', '/resources', '/routes'],
  Admin: navigation.map((item) => item.path),
};

function App() {
  return <BrowserRouter><OperationsApp /></BrowserRouter>;
}

function OperationsApp() {
  const { role, isLight, demoStep, demoPlaying, isAuthenticated, setRole, toggleTheme, setDemoStep, setDemoPlaying, loginWithGoogle, resetDemo } = useAppStore();
  const [incidents, setIncidents] = useState(seededIncidents);
  const [requests, setRequests] = useState(seededRequests);
  const [resources] = useState(seededResources);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [dialog, setDialog] = useState<'report' | 'request' | null>(null);
  const [toast, setToast] = useState('');
  const [query, setQuery] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const roleNavigation = navigation.filter((item) => visiblePaths[role].includes(item.path));

  useEffect(() => {
    setIncidents((current) => current.map((incident) => incident.id === 'INC-2402'
      ? { ...incident, status: demoStep >= 2 ? 'Confirmed closure' : 'Reported hazard', source: demoStep >= 2 ? 'Officially confirmed' : 'Public report' }
      : incident));
    setRequests((current) => current.map((request) => request.id === 'REQ-801'
      ? { ...request, status: demoStep >= 6 ? 'Resolved' : demoStep >= 4 ? 'Prioritized' : 'Needs coordinator review' }
      : request));
  }, [demoStep]);

  useEffect(() => {
    if (!demoPlaying) return;
    const timer = window.setInterval(() => {
      const next = demoStep < 0 ? 0 : (demoStep + 1) % demoSteps.length;
      setDemoStep(next);
      if (next === 6) setDemoPlaying(false);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [demoPlaying, demoStep, setDemoPlaying, setDemoStep]);

  useEffect(() => {
    document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
  }, [isLight]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const title = navigation.find((item) => item.path === location.pathname)?.label ?? 'Dashboard';
  const confirmedRoads = useMemo(() => incidents.filter((item) => item.status === 'Confirmed closure' && item.roadId).map((item) => item.roadId as string), [incidents]);
  const filteredIncidents = incidents.filter((item) => `${item.title} ${item.location} ${item.category} ${item.id}`.toLowerCase().includes(query.toLowerCase()));

  const submitReport = (report: { category: string; description: string; location: string }) => {
    const newIncident: Incident = {
      id: `INC-${2401 + incidents.length}`,
      title: `${report.category} report near ${report.location}`,
      category: report.category as Incident['category'],
      severity: 'Medium',
      status: 'Awaiting verification',
      source: 'Public report',
      freshness: 'just now',
      location: report.location,
      description: report.description,
      lat: 23.031 + (Math.random() - 0.5) * 0.012,
      lng: 72.579 + (Math.random() - 0.5) * 0.012,
    };
    setIncidents((current) => [newIncident, ...current]);
    setDialog(null);
    setToast('Report submitted for human review. Precise location is not shown publicly.');
  };

  const submitRequest = () => {
    const newRequest: AssistanceRequest = {
      id: `REQ-${801 + requests.length}`,
      person: 'New household',
      location: 'Central Ward',
      need: 'Assistance requested',
      urgency: 'Medium',
      status: 'Needs coordinator review',
      priority: 61,
      people: 2,
      age: 'just now',
      access: 'Access uncertain',
      updated: 'just now',
    };
    setRequests((current) => [newRequest, ...current]);
    setDialog(null);
    setToast('Assistance request recorded for coordinator review.');
  };

  const updateIncident = (incident: Incident, status: Incident['status'], message: string) => {
    setIncidents((current) => current.map((item) => item.id === incident.id ? { ...item, status, source: 'Officially confirmed', freshness: 'just now' } : item));
    setSelectedIncident({ ...incident, status, source: 'Officially confirmed', freshness: 'just now' });
    setToast(message);
  };

  if (!isAuthenticated) {
    return <LoginScreen onGoogleLogin={loginWithGoogle} />;
  }

  return <div className="app-frame" data-theme={isLight ? 'light' : 'dark'}>
    <header className="topbar">
      <NavLink to="/" className="brand" aria-label="FloodWatch AI dashboard">
        <span className="brand-mark"><Waves size={17} /></span>
        <span><strong>FloodWatch AI</strong><small>COORDINATION DESK</small></span>
      </NavLink>
      <div className="topbar-context"><span className="context-dot" /> AHMEDABAD, INDIA · LIVE BASEMAP OVERLAY</div>
      <div className="topbar-actions">
        <label className="global-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search incidents, roads…" aria-label="Search incidents and roads" /><kbd><Command size={10} /> K</kbd></label>
        <label className="role-select-label"><Users size={14} /><select value={role} onChange={(event) => setRole(event.target.value as DemoRole)} aria-label="Demo role"><option value="Public">Public</option><option value="Volunteer">Volunteer</option><option value="Coordinator">Coordinator</option><option value="Healthcare">Healthcare</option><option value="Admin">Admin</option></select><ChevronDown size={13} /></label>
        <div className="notification-wrap"><button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotificationOpen((open) => !open)}><Bell size={17} /><i /></button>
          {notificationOpen && <div className="notification-popover"><strong>Coordination alerts</strong><p><AlertTriangle size={14} /> 3 items need verification</p><p><ShieldAlert size={14} /> South Basin access limited</p><FreshnessChip value="4 min ago" /></div>}
        </div>
        <button className="icon-button theme-button" onClick={toggleTheme} aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}>{isLight ? <Moon size={17} /> : <Sun size={17} />}</button>
      </div>
    </header>

    <div className="simulation-banner"><Radio size={13} /><span>SIMULATED DEMO DATA</span><i />Not real emergency information. In a real emergency, contact official services.</div>

    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar-top"><span className="sidebar-caption">WORKSPACE</span><button className="sidebar-toggle" aria-label="Collapse navigation"><Menu size={16} /></button></div>
      <nav>{roleNavigation.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`} title={label}><Icon size={17} /><span>{label}</span>{label === 'Incidents' && <b className="nav-count">{incidents.filter((item) => item.status === 'Awaiting verification').length}</b>}</NavLink>)}</nav>
      <div className="sidebar-spacer" />
      <div className="shift-card"><span className="shift-indicator" /><div><strong>Demo shift active</strong><small>Simulated data only</small></div><MoreHorizontal size={16} /></div>
      <div className="sidebar-footer"><CircleHelp size={14} /> <span>Decision support only</span></div>
    </aside>

    <main className="main-content" key={location.pathname}>
      <Routes>
        <Route path="/" element={<Dashboard incidents={filteredIncidents} requests={requests} resources={resources} demoStep={demoStep} onReport={() => setDialog('report')} onRequest={() => setDialog('request')} onOpenIncident={setSelectedIncident} onRoute={() => navigate('/routes')} />} />
        <Route path="/map" element={<MapScreen incidents={filteredIncidents} demoStep={demoStep} onOpenIncident={setSelectedIncident} confirmedRoads={confirmedRoads} />} />
        <Route path="/incidents" element={<IncidentsScreen incidents={filteredIncidents} onOpenIncident={setSelectedIncident} onReport={() => setDialog('report')} />} />
        <Route path="/healthcare" element={['Healthcare', 'Coordinator', 'Admin'].includes(role) ? <HealthcareScreen requests={requests} onRequest={() => setDialog('request')} /> : <Navigate to="/" replace />} />
        <Route path="/resources" element={role === 'Public' ? <Navigate to="/" replace /> : <ResourcesScreen resources={resources} />} />
        <Route path="/routes" element={['Healthcare', 'Coordinator', 'Admin'].includes(role) ? <RoutePlanner demoStep={demoStep} /> : <Navigate to="/" replace />} />
        <Route path="/admin" element={roleCanVerify(role) ? <AdminScreen incidents={incidents} /> : <Navigate to="/" replace />} />
      </Routes>
    </main>

    <footer className="bottom-nav" aria-label="Mobile navigation">{roleNavigation.slice(0, 5).map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} aria-label={label} className={({ isActive }) => isActive ? 'mobile-nav-active' : ''}><Icon size={18} /><span>{label}</span></NavLink>)}</footer>

    <DemoControl demoStep={demoStep} demoPlaying={demoPlaying} setDemoStep={setDemoStep} setDemoPlaying={setDemoPlaying} resetDemo={resetDemo} />

    <AnimatePresence>{selectedIncident && <IncidentDrawer incident={selectedIncident} role={role} onClose={() => setSelectedIncident(null)} onUpdate={(status, message) => updateIncident(selectedIncident, status, message)} />}</AnimatePresence>
    {dialog && <FlowDialog type={dialog} onClose={() => setDialog(null)} onSubmitReport={submitReport} onSubmitRequest={submitRequest} />}
    <AnimatePresence>{toast && <motion.div className="toast" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}><Check size={16} />{toast}</motion.div>}</AnimatePresence>
    <span className="sr-only" aria-live="polite">Current page: {title}</span>
  </div>;
}

function LoginScreen({ onGoogleLogin }: { onGoogleLogin: () => void }) {
  return <div className="login-shell">
    <div className="login-card">
      <div className="login-badge"><Waves size={18} /> FloodWatch AI</div>
      <h1>Emergency coordination access</h1>
      <p>Sign in to review flood and landslide response data, road conditions, and healthcare coordination in near real time.</p>
      <button className="login-google" onClick={onGoogleLogin} type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.4 14.7 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 11.5-4.8 11.5-11.6 0-.8-.1-1.4-.2-2.1H12Z" /><path fill="#34A853" d="M3.6 7.5l3.8 2.8c1-1.9 3.1-3.3 5.6-3.3 1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.4 14.7 2.5 12 2.5c-3.6 0-6.7 2.1-8.4 5Z" /><path fill="#FBBC05" d="M3.7 7.5A9.5 9.5 0 0 0 3.2 12c0 1.5.4 2.9 1.1 4.1l3.7-2.9A5.6 5.6 0 0 1 7.5 12c0-.7.1-1.4.3-2l-4.1-2.5Z" /><path fill="#4285F4" d="M12 21.5c2.4 0 4.5-.8 6.1-2.2l-2.8-2.3c-.8.6-1.9 1.1-3.3 1.1-2.5 0-4.6-1.7-5.3-4l-3.7 2.9A9.5 9.5 0 0 0 12 21.5Z" /></svg>
        Continue with Google
      </button>
      <div className="login-divider"><span>or</span></div>
      <button className="button button-secondary full-width" type="button" onClick={onGoogleLogin}>Continue as demo operator</button>
    </div>
  </div>;
}

function Dashboard({ incidents, requests, resources, demoStep, onReport, onRequest, onOpenIncident, onRoute }: {
  incidents: Incident[]; requests: AssistanceRequest[]; resources: Resource[]; demoStep: number;
  onReport: () => void; onRequest: () => void; onOpenIncident: (incident: Incident) => void; onRoute: () => void;
}) {
  const unresolved = requests.filter((request) => request.status !== 'Resolved').length;
  const activeIncidents = incidents.filter((incident) => !['Verified', 'Potentially outdated'].includes(incident.status)).length;
  return <div className="screen dashboard-screen">
    <SectionHeading eyebrow="THURSDAY, OCTOBER 22 · SIMULATED CITY" title="Operations overview" description="A shared picture of reports, access constraints, and assistance needs." action={<div className="heading-actions"><button className="button button-secondary" onClick={onRequest}><HeartPulse size={15} />Request assistance</button><button className="button button-primary" onClick={onReport}><FilePlus2 size={15} />Report incident</button></div>} />
    <div className="kpi-grid">
      <KpiTile label="Active incidents" value={activeIncidents} detail="4 awaiting verification" icon={<AlertTriangle size={16} />} tone="tone-amber"><span className="kpi-trend trend-down"><ArrowDownRight size={13} />12%</span></KpiTile>
      <KpiTile label="Road closures" value={demoStep >= 2 ? 2 : 1} detail="Excluded from route estimates" icon={<ShieldAlert size={16} />} tone="tone-red"><span className="sparkline spark-red"><i /><i /><i /><i /><i /><i /><i /></span></KpiTile>
      <KpiTile label="Access limited" value={demoStep >= 5 ? 2 : 1} detail="Coordinator review required" icon={<MapPinned size={16} />} tone="tone-purple"><span className="kpi-trend trend-warn"><Activity size={13} />Review</span></KpiTile>
      <KpiTile label="Open assistance" value={unresolved} detail="3 priority reviews" icon={<HeartPulse size={16} />} tone="tone-teal"><span className="sparkline spark-teal"><i /><i /><i /><i /><i /><i /><i /></span></KpiTile>
      <KpiTile label="Overdue items" value={3} detail="Older than 60 minutes" icon={<Clock3 size={16} />} tone="tone-gray"><span className="kpi-trend trend-muted">Needs check</span></KpiTile>
    </div>

    {demoStep >= 5 && <div className="escalation-banner"><ShieldAlert size={17} /><div><strong>South Basin access is unconfirmed</strong><span>Multiple assistance requests may be affected. Coordinator review and staging assessment requested.</span></div><button onClick={onRoute}>Review route <ChevronRight size={14} /></button></div>}

    <div className="dashboard-grid">
      <Panel className="map-preview-panel">
        <div className="panel-header"><div><span className="eyebrow">SPATIAL OVERVIEW</span><h2>Incident & access map</h2></div><NavLink to="/map" className="text-link">Open map <ChevronRight size={14} /></NavLink></div>
        <div className="mini-map-wrap"><OperationsMap compact demoStep={demoStep} onIncidentClick={onOpenIncident} /><div className="map-mini-label"><MapPinned size={13} /> AHMEDABAD, INDIA</div><div className="map-mini-legend"><span><i className="legend-line legend-open" />Open per info</span><span><i className="legend-line legend-hazard" />Reported hazard</span><span><i className="legend-line legend-closed" />Confirmed closure</span></div></div>
        <div className="map-preview-footer"><span><span className="live-pip" />Map tiles from OpenStreetMap</span><FreshnessChip value="4 min ago" /></div>
      </Panel>

      <Panel className="warning-panel">
        <div className="panel-header"><div><span className="eyebrow">NEEDS ATTENTION</span><h2>Active warnings <span className="header-count">04</span></h2></div><NavLink to="/incidents" className="text-link">All incidents <ChevronRight size={14} /></NavLink></div>
        <div className="warning-list">{incidents.filter((item) => item.severity === 'Critical' || item.status === 'Awaiting verification').slice(0, 4).map((incident) => <button className="warning-row" key={incident.id} onClick={() => onOpenIncident(incident)}><span className={`incident-type-icon type-${incident.category.toLowerCase().replace(' ', '-')}`}>{incident.category === 'Flood' ? <Droplets size={15} /> : incident.category === 'Landslide' ? <AlertTriangle size={15} /> : <MapPinned size={15} />}</span><span className="warning-copy"><strong>{incident.title}</strong><small>{incident.location} <i /> {incident.id}</small><span className="warning-meta"><SourceBadge source={incident.source} /><FreshnessChip value={incident.freshness} /></span></span><span className={`severity-text severity-${incident.severity.toLowerCase()}`}>{incident.severity}</span><ChevronRight className="row-arrow" size={15} /></button>)}</div>
        <div className="warning-note"><AlertTriangle size={14} /><span>Reports are unverified until reviewed by an authorized coordinator.</span></div>
      </Panel>

      <Panel className="activity-panel">
        <div className="panel-header"><div><span className="eyebrow">COORDINATION LOG</span><h2>Recent activity</h2></div><button className="icon-button tiny-button" aria-label="More activity options"><MoreHorizontal size={17} /></button></div>
        <div className="activity-list">
          <ActivityItem tone="amber" title="Landslide report submitted" detail="Hill Link Road · Public report" time="09:42" />
          <ActivityItem tone="teal" title="Shelter capacity updated" detail="North Civic Shelter · Simulated" time="09:36" />
          <ActivityItem tone="red" title="Road closure confirmed" detail="South Cutoff · Coordinator" time="09:18" />
          <ActivityItem tone="blue" title="Water request prioritized" detail="North Bank · Healthcare desk" time="09:03" />
        </div>
        <NavLink to="/admin" className="activity-link">View audit log <ChevronRight size={13} /></NavLink>
      </Panel>

      <Panel className="reading-panel"><div className="reading-heading"><span className="help-mark"><CircleHelp size={16} /></span><div><span className="eyebrow">DATA CONTEXT</span><h2>How to read this data</h2></div></div><p>Every item includes a source and update time. Old or conflicting reports are marked for review; an open status means only that no closure is currently confirmed.</p><div className="reading-meta"><SourceBadge source="Simulated" /><FreshnessChip value="updated per item" /></div></Panel>
    </div>

    <div className="dashboard-lower"><Panel className="priority-strip"><div className="priority-strip-icon"><HeartPulse size={17} /></div><div><span className="eyebrow">HEALTHCARE COORDINATION</span><strong>{requests.filter((request) => request.urgency === 'Critical' && request.status !== 'Resolved').length} critical requests need human review</strong><small>Prioritization is rule-based and explainable. It does not diagnose or determine treatment.</small></div><NavLink to="/healthcare" className="button button-secondary">Open queue <ChevronRight size={14} /></NavLink></Panel>
      <Panel className="resource-strip"><div className="resource-strip-top"><div><span className="eyebrow">RELIEF CAPACITY</span><strong>{resources.filter((resource) => resource.status === 'Open according to available information').length} resources with current updates</strong></div><NavLink to="/resources" className="text-link">View resources <ChevronRight size={14} /></NavLink></div><div className="capacity-meter"><span style={{ width: '62%' }} /></div><div className="resource-strip-foot"><span>62% aggregate utilization</span><span>Excludes stale resource records</span></div></Panel></div>

    <div className="emergency-note"><Shield size={14} /><span>This prototype is decision support only. It does not dispatch teams, guarantee routes, or replace official emergency services.</span></div>
  </div>;
}

function ActivityItem({ tone, title, detail, time }: { tone: string; title: string; detail: string; time: string }) {
  return <div className="activity-item"><span className={`activity-marker marker-${tone}`}><span /></span><div className="activity-copy"><strong>{title}</strong><small>{detail}</small></div><time>{time}</time></div>;
}

function MapScreen({ incidents, demoStep, onOpenIncident, confirmedRoads }: { incidents: Incident[]; demoStep: number; onOpenIncident: (incident: Incident) => void; confirmedRoads: string[] }) {
  const [showRoads, setShowRoads] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showFlood, setShowFlood] = useState(true);
  const [showMedical, setShowMedical] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [filter, setFilter] = useState('All types');
  const [severity, setSeverity] = useState('Any severity');
  const [verification, setVerification] = useState('Any status');
  const [timeRange, setTimeRange] = useState('24 hours');
  const filtered = incidents.filter((incident) => {
    const categoryMatch = filter === 'All types' || incident.category === filter;
    const severityMatch = severity === 'Any severity' || incident.severity === severity;
    const verificationMatch = verification === 'Any status'
      || (verification === 'Needs verification' && ['Awaiting verification', 'Reported hazard'].includes(incident.status))
      || (verification === 'Confirmed' && ['Verified', 'Confirmed closure'].includes(incident.status));
    const ageMinutes = incident.freshness === 'just now' ? 0 : incident.freshness.includes('hr') ? parseInt(incident.freshness, 10) * 60 : parseInt(incident.freshness, 10);
    const timeMatch = timeRange === '24 hours' || ageMinutes <= (timeRange === '1 hour' ? 60 : 360);
    return categoryMatch && severityMatch && verificationMatch && timeMatch;
  });
  return <div className="screen map-screen"><SectionHeading eyebrow="SITUATIONAL AWARENESS" title="Interactive map" description="Simulated report locations and road-access updates. Status and freshness remain visible at every point." action={<button className="button button-secondary"><Filter size={14} />Filters</button>} />
    <div className="map-toolbar"><div className="filter-chips"><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter by incident type"><option>All types</option><option>Flood</option><option>Landslide</option><option>Road access</option><option>Weather</option></select><select value={severity} onChange={(event) => setSeverity(event.target.value)} aria-label="Filter by severity"><option>Any severity</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select><select value={verification} onChange={(event) => setVerification(event.target.value)} aria-label="Filter by verification status"><option>Any status</option><option>Needs verification</option><option>Confirmed</option></select><select value={timeRange} onChange={(event) => setTimeRange(event.target.value)} aria-label="Filter by time"><option>24 hours</option><option>6 hours</option><option>1 hour</option></select></div><div className="layer-toggles"><button className={`layer-toggle ${showFlood ? 'is-active' : ''}`} onClick={() => setShowFlood(!showFlood)}><Droplets size={13} />Flood layer</button><button className={`layer-toggle ${showIncidents ? 'is-active' : ''}`} onClick={() => setShowIncidents(!showIncidents)}><AlertTriangle size={13} />Incidents</button><button className={`layer-toggle ${showRoads ? 'is-active' : ''}`} onClick={() => setShowRoads(!showRoads)}><RouteIcon size={13} />Road status</button><button className={`layer-toggle ${showMedical ? 'is-active' : ''}`} onClick={() => setShowMedical(!showMedical)}><HeartPulse size={13} />Medical</button><button className={`layer-toggle ${showResources ? 'is-active' : ''}`} onClick={() => setShowResources(!showResources)}><Home size={13} />Relief</button></div></div>
    <div className="map-workspace"><OperationsMap incidentData={filtered} showIncidents={showIncidents} showRoads={showRoads} showFlood={showFlood} showMedical={showMedical} showResources={showResources} demoStep={demoStep} confirmedRoads={confirmedRoads} onIncidentClick={onOpenIncident} /><div className="map-count-pill"><span className="live-pip" />{filtered.length} reports in view</div><div className="map-isolation-tag"><ShieldAlert size={14} />Access limited · South Basin</div><div className="map-legend"><strong>ROAD ACCESS</strong><span><i className="legend-line legend-open" />Open according to available information</span><span><i className="legend-line legend-hazard" />Reported hazard</span><span><i className="legend-line legend-closed" />Confirmed closure</span><span><i className="legend-line legend-uncertain" />Access uncertain</span><small>{confirmedRoads.length} confirmed segment(s) excluded from route estimates</small></div></div>
    <div className="map-bottom-info"><span><MapPinned size={14} /> Real OpenStreetMap basemap · Ahmedabad area reference</span><span><FreshnessChip value="4 min ago" /></span><span>Map fallback shown if tiles fail</span></div>
  </div>;
}

function IncidentsScreen({ incidents, onOpenIncident, onReport }: { incidents: Incident[]; onOpenIncident: (incident: Incident) => void; onReport: () => void }) {
  const [category, setCategory] = useState('All categories');
  const [sortBy, setSortBy] = useState('Newest');
  const visible = incidents.filter((incident) => category === 'All categories' || incident.category === category);
  return <div className="screen"><SectionHeading eyebrow="REPORT INTAKE & VERIFICATION" title="Incident reports" description="Review source, freshness, severity, and verification state before acting." action={<button className="button button-primary" onClick={onReport}><Plus size={15} />Report incident</button>} />
    <Panel className="table-panel"><div className="table-toolbar"><div className="filter-chips"><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Incident category"><option>All categories</option><option>Flood</option><option>Landslide</option><option>Road access</option><option>Weather</option></select><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort incidents"><option>Newest</option><option>Severity</option><option>Oldest</option></select></div><span className="table-count">{visible.length} simulated reports</span></div><div className="table-scroll"><table><thead><tr><th>Report</th><th>Category</th><th>Severity</th><th>Status</th><th>Source</th><th>Updated</th><th /></tr></thead><tbody>{visible.map((incident) => <tr key={incident.id} onClick={() => onOpenIncident(incident)} tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && onOpenIncident(incident)}><td><strong>{incident.title}</strong><small>{incident.location} · <code>{incident.id}</code></small></td><td>{incident.category}</td><td><span className={`severity-text severity-${incident.severity.toLowerCase()}`}>{incident.severity}</span></td><td><StatusBadge status={incident.status} /></td><td><SourceBadge source={incident.source} /></td><td><FreshnessChip value={incident.freshness} /></td><td><ChevronRight size={15} /></td></tr>)}</tbody></table></div></Panel>
  </div>;
}

function HealthcareScreen({ requests, onRequest }: { requests: AssistanceRequest[]; onRequest: () => void }) {
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [explain, setExplain] = useState<string | null>(null);
  const [weightsOpen, setWeightsOpen] = useState(false);
  const columns = ['Needs coordinator review', 'Awaiting assignment', 'In progress', 'Resolved'];
  return <div className="screen"><SectionHeading eyebrow="HEALTHCARE & ASSISTANCE" title="Request coordination" description="Rule-based prioritization supports review; it does not make clinical or rescue decisions." action={<><button className="button button-secondary" onClick={() => setWeightsOpen(true)}><SlidersHorizontal size={14} />Priority rules</button><button className="button button-primary" onClick={onRequest}><Plus size={15} />New request</button></>} />
    <div className="care-caution"><HeartPulse size={15} /><strong>AI does not diagnose.</strong><span>A qualified human responder owns all triage and assistance decisions. Sensitive details are limited in this simulated view.</span></div>
    <div className="care-summary"><div><span>Open requests</span><strong>{requests.filter((item) => item.status !== 'Resolved').length}</strong></div><div><span>Critical urgency</span><strong className="summary-red">{requests.filter((item) => item.urgency === 'Critical' && item.status !== 'Resolved').length}</strong></div><div><span>Access uncertain</span><strong className="summary-purple">{requests.filter((item) => item.access !== 'Open per available information').length}</strong></div><div><span>Unresolved needs</span><strong>{requests.filter((item) => ['Needs coordinator review', 'Awaiting assignment'].includes(item.status)).length}</strong></div></div>
    <div className="view-switch"><button className={view === 'table' ? 'selected' : ''} onClick={() => setView('table')}>Table</button><button className={view === 'kanban' ? 'selected' : ''} onClick={() => setView('kanban')}>Kanban</button><span>Priority reflects urgency, people affected, verification, time open, access constraints, and available resources.</span></div>
    {view === 'table' ? <Panel className="table-panel"><div className="table-scroll"><table><thead><tr><th>Request</th><th>Need</th><th>Urgency / priority</th><th>Access</th><th>Status</th><th>Updated</th><th /></tr></thead><tbody>{requests.map((request) => <tr key={request.id}><td><strong>{request.person}</strong><small>{request.location} · <code>{request.id}</code> · {request.people} people</small></td><td>{request.need}</td><td><button className="priority-explain" onClick={() => setExplain(explain === request.id ? null : request.id)}><PriorityBadge score={request.priority} urgency={request.urgency} /><ChevronDown size={12} />{explain === request.id && <span className="priority-tooltip">Urgency: {request.urgency}<br />People affected: {request.people}<br />Verification: awaiting coordinator<br />Time unresolved: {request.age}<br />Access: {request.access}</span>}</button></td><td><StatusBadge status={request.access === 'Open per available information' ? 'Open according to available information' : request.access} /></td><td><span className="request-state">{request.status}</span></td><td><FreshnessChip value={request.updated} /></td><td><MoreHorizontal size={16} /></td></tr>)}</tbody></table></div></Panel> : <div className="kanban-grid">{columns.map((column) => <div className="kanban-column" key={column}><div className="kanban-heading"><span>{column}</span><b>{requests.filter((item) => item.status === column).length}</b></div>{requests.filter((item) => item.status === column).map((request) => <article className="kanban-card" key={request.id}><div className="kanban-card-top"><code>{request.id}</code><PriorityBadge score={request.priority} urgency={request.urgency} /></div><strong>{request.need}</strong><span>{request.person} · {request.location}</span><StatusBadge status={request.access === 'Open per available information' ? 'Open according to available information' : request.access} /><button className="plain-action" onClick={() => setExplain(explain === request.id ? null : request.id)}>Why this priority? <ChevronDown size={12} /></button>{explain === request.id && <small className="kanban-explain">Urgency, people affected, verification status, time unresolved, access restrictions, and resource availability are considered.</small>}</article>)}</div>)}</div>}
    {weightsOpen && <div className="drawer-backdrop" onClick={() => setWeightsOpen(false)}><aside className="weights-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-header"><div><span className="eyebrow">COORDINATOR SETTINGS</span><h2>Priority weights</h2></div><button className="icon-button" onClick={() => setWeightsOpen(false)} aria-label="Close priority settings"><X size={18} /></button></div><p>Adjust transparent scoring inputs. Changes affect the simulated score only.</p>{['Reported urgency', 'People affected', 'Verification', 'Time unresolved', 'Access restrictions', 'Resource availability'].map((label, index) => <label className="weight-control" key={label}><span>{label}<b>{[30, 20, 15, 10, 20, 5][index]}%</b></span><input type="range" defaultValue={[30, 20, 15, 10, 20, 5][index]} aria-label={`${label} weight`} /></label>)}<button className="button button-primary full-width" onClick={() => setWeightsOpen(false)}>Apply to demo</button></aside></div>}
  </div>;
}

function ResourcesScreen({ resources }: { resources: Resource[] }) {
  const [requestAllocation, setRequestAllocation] = useState('');
  return <div className="screen"><SectionHeading eyebrow="RELIEF INVENTORY" title="Resources & capacity" description="Resource status is simulated; stale information is visibly marked and should not guide access decisions." action={<button className="button button-secondary" onClick={() => setRequestAllocation('Allocation request recorded for review.')}><Plus size={15} />Request allocation</button>} />
    {requestAllocation && <div className="inline-notice"><Check size={14} />{requestAllocation}</div>}
    <div className="resource-grid">{resources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}</div>
    <Panel className="table-panel allocation-panel"><div className="panel-header"><div><span className="eyebrow">REQUESTS & ALLOCATIONS</span><h2>Recent allocation activity</h2></div><button className="filter-chip">All activity <ChevronDown size={12} /></button></div><div className="table-scroll"><table><thead><tr><th>Request</th><th>Resource</th><th>Quantity</th><th>Status</th><th>Updated</th></tr></thead><tbody><tr><td>Water packs · North Bank</td><td>Central Supply Depot</td><td>40 units</td><td><span className="request-state">Coordinator review</span></td><td><FreshnessChip value="12 min ago" /></td></tr><tr><td>Shelter beds · East Hill</td><td>North Civic Shelter</td><td>8 places</td><td><span className="request-state state-complete">Recorded</span></td><td><FreshnessChip value="28 min ago" /></td></tr></tbody></table></div></Panel>
  </div>;
}

function ResourceCard({ resource }: { resource: Resource }) {
  const stale = ['Data outdated', 'Potentially outdated'].includes(resource.status);
  return <article className="resource-card"><div className="resource-card-top"><span className="resource-icon"><Home size={17} /></span><button className="icon-button tiny-button" aria-label={`Options for ${resource.name}`}><MoreHorizontal size={16} /></button></div><div className="resource-name-row"><div><strong>{resource.name}</strong><small>{resource.type} · {resource.location}</small></div><span className={`resource-status ${stale ? 'resource-stale' : ''}`}>{stale ? <><AlertTriangle size={12} />Status uncertain</> : <><Check size={12} />Updated</>}</span></div><div className="resource-capacity-label"><span>Capacity in use</span><strong>{Math.round(resource.used / resource.capacity * 100)}%</strong></div><div className="capacity-meter"><span style={{ width: `${resource.used / resource.capacity * 100}%` }} /></div><div className="resource-people"><span>{resource.used} / {resource.capacity} places</span><FreshnessChip value={resource.updated} /></div><div className="supply-tags">{resource.supplies.map((supply) => <span key={supply}>{supply}</span>)}</div><div className="resource-foot"><StatusBadge status={resource.status} /><SourceBadge source="Simulated" /></div></article>;
}

function RoutePlanner({ demoStep }: { demoStep: number }) {
  const [origin, setOrigin] = useState('Response Base');
  const [destination, setDestination] = useState('East Hill');
  const noRoute = destination === 'South Basin' && demoStep >= 5;
  const delay = demoStep >= 3;
  return <div className="screen"><SectionHeading eyebrow="ACCESS-AWARE ROUTING" title="Route planner" description="Closure-aware route comparison based on the simulated road graph. Access status is not a safety guarantee." />
    <div className="route-layout"><Panel className="route-controls"><div className="eyebrow">PLAN A ROUTE</div><label className="field-label">Origin<select value={origin} onChange={(event) => setOrigin(event.target.value)}><option>Response Base</option><option>North Town</option><option>Central Ward</option></select></label><label className="field-label">Destination<select value={destination} onChange={(event) => setDestination(event.target.value)}><option>East Hill</option><option>South Basin</option><option>Canal Ward</option><option>North Bank</option></select></label><button className="button button-primary full-width"><Navigation size={15} />Compare available routes</button><div className="route-disclaimer"><AlertTriangle size={14} /><span>Route is not guaranteed safe. Confirm current conditions with official sources.</span></div><div className="route-excluded"><strong>Excluded from route estimates</strong>{seededRoads.filter((road) => road.status === 'Confirmed closure' || confirmedByDemo(road.id, demoStep)).map((road) => <span key={road.id}><i />{road.name} · confirmed closure</span>)}</div></Panel>
      <div className="route-results">{noRoute ? <Panel className="no-route-panel"><div className="no-route-icon"><ShieldAlert size={24} /></div><span className="eyebrow">ACCESS LIMITED</span><h2>No verified accessible route</h2><p>All currently modeled connections to {destination} are currently unverified, limited, or have uncertain access. Outstanding assistance requests need coordinator review.</p><div className="no-route-requests"><strong>Needs requiring review</strong><span>2 assistance requests · South Basin</span></div><button className="button button-secondary">Escalated to coordinator <Check size={14} /></button></Panel> : <><RouteResultCard label="Primary estimate" title={`${origin} → ${destination}`} time={delay ? '38 min' : '31 min'} status="Open according to available information" highlighted /><RouteResultCard label="Alternative 01" title="Via Canal Service Route" time={delay ? '46 min' : '39 min'} status={delay ? 'Traffic delayed' : 'Open according to available information'} /><RouteResultCard label="Alternative 02" title="Via Civic Bridge" time="52 min" status="Access uncertain" /></>}<OperationsMap compact demoStep={demoStep} showIncidents={false} /></div></div>
  </div>;
}

function confirmedByDemo(roadId: string, step: number) { return roadId === 'RD-05' && step >= 2; }

function RouteResultCard({ label, title, time, status, highlighted = false }: { label: string; title: string; time: string; status: string; highlighted?: boolean }) {
  return <Panel className={`route-result ${highlighted ? 'route-primary' : ''}`}><div className="route-result-top"><span className="eyebrow">{label}</span><strong className="route-time">{time}<small>est.</small></strong></div><h3>{title}</h3><StatusBadge status={status} /><div className="route-result-foot"><span><Clock3 size={13} /> Estimated travel time</span><span>Route access not guaranteed</span></div><div className="route-result-meta"><SourceBadge source="Simulated" /><FreshnessChip value="4 min ago" /></div></Panel>;
}

function AdminScreen({ incidents }: { incidents: Incident[] }) {
  const [tab, setTab] = useState('Roles & permissions');
  const tabs = ['Roles & permissions', 'Data sources', 'Moderation', 'Audit log', 'System health'];
  return <div className="screen"><SectionHeading eyebrow="GOVERNANCE & SYSTEM STATUS" title="Administration" description="Demo-only access controls, data-source labels, moderation, and audit events." />
    <div className="admin-tabs" role="tablist">{tabs.map((item) => <button role="tab" aria-selected={tab === item} className={tab === item ? 'selected' : ''} key={item} onClick={() => setTab(item)}>{item}</button>)}</div>
    {tab === 'Roles & permissions' && <Panel className="table-panel"><div className="panel-header"><div><span className="eyebrow">DEMO ACCESS</span><h2>Role permissions</h2></div><span className="source-note">UI-only role switching · simulated</span></div><div className="table-scroll"><table><thead><tr><th>Role</th><th>View reports</th><th>Submit reports</th><th>Verify / close</th><th>Manage users</th></tr></thead><tbody>{roleOptions.map((item) => <tr key={item}><td><strong>{item}</strong></td><td>Yes</td><td>{item !== 'Admin' ? 'Yes' : 'Yes'}</td><td>{roleCanVerify(item) ? <span className="yes-mark"><Check size={13} />Authorized</span> : 'No'}</td><td>{item === 'Admin' ? <span className="yes-mark"><Check size={13} />Authorized</span> : 'No'}</td></tr>)}</tbody></table></div></Panel>}
    {tab === 'Data sources' && <div className="source-grid">{[['CWC FloodWatch', 'Manually updated', 'No public open API assumed for this prototype.'], ['IMD alerts', 'Manually updated', 'Official advisories require source verification.'], ['ISRO / NRSC', 'Simulated', 'Satellite-derived layers are not connected.'], ['State disaster authorities', 'Manually updated', 'No agency endpoint is assumed available.'], ['OpenStreetMap', 'Live tiles', 'Map basemap only; not an emergency data source.']].map(([name, state, detail]) => <Panel className="source-card" key={name}><div><Radio size={16} /><strong>{name}</strong></div><span className={`source-state ${state === 'Live tiles' ? 'source-live' : ''}`}>{state}</span><p>{detail}</p></Panel>)}</div>}
    {tab === 'Moderation' && <IncidentQueue incidents={incidents} />}
    {tab === 'Audit log' && <Panel className="table-panel"><div className="table-scroll"><table><thead><tr><th>Time</th><th>Event</th><th>Actor</th><th>Record</th><th>Source</th></tr></thead><tbody><tr><td><code>09:42:18</code></td><td>Incident submitted · awaiting verification</td><td>Public</td><td><code>INC-2402</code></td><td>Public report</td></tr><tr><td><code>09:18:04</code></td><td>Road closure confirmed</td><td>Coordinator</td><td><code>RD-12</code></td><td>Officially confirmed</td></tr><tr><td><code>09:03:51</code></td><td>Assistance priority recalculated</td><td>Rule-based system</td><td><code>REQ-803</code></td><td>Simulated</td></tr></tbody></table></div></Panel>}
    {tab === 'System health' && <div className="health-grid"><HealthCard label="Frontend" value="Operational" detail="Local simulated mode" /><HealthCard label="Map tiles" value="External dependency" detail="Fallback message shown if unavailable" /><HealthCard label="AI preview" value="Optional / mock" detail="Unavailable model does not block report intake" /><HealthCard label="Emergency data feeds" value="Not connected" detail="No live emergency source configured" /></div>}
  </div>;
}

function IncidentQueue({ incidents }: { incidents: Incident[] }) {
  const pending = incidents.filter((incident) => incident.status === 'Awaiting verification' || incident.status === 'Reported hazard');
  return <Panel className="table-panel"><div className="table-scroll"><table><thead><tr><th>Incident</th><th>Severity</th><th>Source</th><th>Status</th><th>Updated</th></tr></thead><tbody>{pending.slice(0, 8).map((incident) => <tr key={incident.id}><td><strong>{incident.title}</strong><small>{incident.location} · {incident.id}</small></td><td>{incident.severity}</td><td><SourceBadge source={incident.source} /></td><td><StatusBadge status={incident.status} /></td><td><FreshnessChip value={incident.freshness} /></td></tr>)}</tbody></table></div></Panel>;
}

function HealthCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <Panel className="health-card"><span className="health-pip" /><span className="eyebrow">{label}</span><strong>{value}</strong><small>{detail}</small></Panel>;
}

function IncidentDrawer({ incident, role, onClose, onUpdate }: { incident: Incident; role: DemoRole; onClose: () => void; onUpdate: (status: Incident['status'], message: string) => void }) {
  const authorized = roleCanVerify(role);
  return <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}><motion.aside className="incident-drawer" initial={{ x: 36 }} animate={{ x: 0 }} exit={{ x: 36 }} transition={{ duration: 0.2 }} onClick={(event) => event.stopPropagation()} aria-label={`Incident details for ${incident.id}`}>
    <div className="drawer-header"><div><span className="eyebrow">INCIDENT DETAILS · <code>{incident.id}</code></span><h2>{incident.title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close incident details"><X size={18} /></button></div>
    <div className="drawer-scroll"><div className="drawer-badges"><StatusBadge status={incident.status} /><span className={`severity-text severity-${incident.severity.toLowerCase()}`}>{incident.severity} severity</span></div><p className="incident-description">{incident.description}</p><div className="detail-pairs"><span>Category<strong>{incident.category}</strong></span><span>Location<strong>{incident.location}</strong></span><span>Report time<strong>{incident.freshness}</strong></span><span>Last update<strong>{incident.freshness}</strong></span></div><div className="detail-source"><SourceBadge source={incident.source} /><FreshnessChip value={incident.freshness} /></div>
      <div className="ai-suggestion"><div><SparklesIcon /><span>MODEL PREDICTION</span></div><strong>Possible water impact on nearby access</strong><p>Confidence 71% · Suggestion only. Not a safety determination.</p><div className="confidence-track"><span style={{ width: '71%' }} /></div><small>Absence of visible hazards does not mean a road is safe.</small></div>
      <div className="drawer-section"><div className="drawer-section-title"><h3>Verification history</h3><button className="text-link">View audit</button></div><div className="history-timeline">{statusHistory.map((item, index) => <div className={`history-item ${index === statusHistory.length - 1 ? 'history-current' : ''}`} key={item.label}><i /><div><strong>{item.label}</strong><span>{item.detail}</span></div><time>{item.time}</time></div>)}</div></div>
      <div className="drawer-section"><h3>Road accessibility impact</h3>{incident.roadId ? <div className="road-impact"><span className="road-impact-icon"><RouteIcon size={15} /></span><div><strong>{seededRoads.find((road) => road.id === incident.roadId)?.name ?? 'Nearby road segment'}</strong><small>Nearest related segment · status is not a safety guarantee</small></div><StatusBadge status={incident.status === 'Confirmed closure' ? incident.status : 'Reported hazard'} /></div> : <p className="muted-copy">No road segment linked; location review may be needed.</p>}</div>
      <div className="drawer-section"><h3>Related reports</h3><div className="related-report"><span className="related-count">2</span><div><strong>Potential duplicate reports nearby</strong><small>Location and text similarity · review before merging</small></div><ChevronRight size={15} /></div></div>
      <div className="drawer-section"><h3>Incident workflow</h3><div className="workflow-stepper">{['Submitted', 'Awaiting verification', 'Verified / rejected', 'Prioritized', 'Assigned', 'In progress', 'Resolved'].map((step, index) => <span className={index < 2 ? 'step-done' : index === 2 ? 'step-current' : ''} key={step}><i>{index < 2 ? <Check size={10} /> : index + 1}</i>{step}</span>)}</div></div>
    </div>
    <div className="drawer-actions">{authorized ? <><button className="button button-secondary" onClick={() => onUpdate('Verified', 'Incident marked verified by coordinator.')}>Verify</button><button className="button button-quiet" onClick={() => onUpdate('Potentially outdated', 'Report marked for follow-up review.')}>Reject / outdated</button>{incident.roadId && <button className="button button-danger" onClick={() => onUpdate('Confirmed closure', 'Closure confirmed. The segment is excluded from route estimates.')}>Confirm closure</button>}</> : <div className="permission-note"><Shield size={14} />Verification and closure actions are limited to Coordinator and Admin roles.</div>}</div>
  </motion.aside></motion.div>;
}

function SparklesIcon() { return <Activity size={15} />; }

function FlowDialog({ type, onClose, onSubmitReport, onSubmitRequest }: { type: 'report' | 'request'; onClose: () => void; onSubmitReport: (report: { category: string; description: string; location: string }) => void; onSubmitRequest: () => void }) {
  const [step, setStep] = useState(0);
  const [location, setLocation] = useState('Central Ward');
  const [category, setCategory] = useState('Flood');
  const [description, setDescription] = useState('');
  const report = type === 'report';
  const steps = report ? ['Location', 'Details', 'Evidence', 'Review'] : ['Location', 'Need', 'Review'];
  const submit = () => report ? onSubmitReport({ category, description: description || 'Resident-submitted report for coordinator review.', location }) : onSubmitRequest();
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><motion.section className="flow-modal" initial={{ opacity: 0, y: 14, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} role="dialog" aria-modal="true" aria-labelledby="flow-title"><div className="modal-header"><div><span className="eyebrow">SIMULATED INTAKE · STEP {step + 1} OF {steps.length}</span><h2 id="flow-title">{report ? 'Report an incident' : 'Request assistance'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close form"><X size={18} /></button></div><div className="form-stepper">{steps.map((item, index) => <span className={index === step ? 'step-active' : index < step ? 'step-complete' : ''} key={item}><i>{index < step ? <Check size={11} /> : index + 1}</i>{item}</span>)}</div>
    {step === 0 && <div className="form-fields"><label className="field-label">Approximate location<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Search a place or landmark" /></label><div className="location-actions"><button className="button button-secondary" onClick={() => setLocation('Map-selected location · approximate')}><MapPinned size={14} />Choose on map</button><button className="button button-secondary" onClick={() => { if (window.confirm('Use your current location for this simulated report?')) setLocation('North Town · approximate'); }}><Navigation size={14} />Use my location</button></div><p className="form-hint"><Shield size={13} />Location permission is optional. Precise location is hidden from public views.</p></div>}
    {step === 1 && <div className="form-fields">{report ? <><label className="field-label">Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Flood</option><option>Landslide</option><option>Road access</option><option>Weather</option></select></label><label className="field-label">What did you observe?<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe what you observed. Avoid personal or health details." rows={4} /></label></> : <><label className="field-label">Assistance needed<select><option>Water and supplies</option><option>Temporary shelter</option><option>Medical transport</option><option>Evacuation assistance</option></select></label><label className="field-label">People affected<select><option>1 person</option><option>2 people</option><option>3–5 people</option><option>6+ people</option></select></label></>}</div>}
    {step === 2 && report && <div className="form-fields"><label className="upload-zone"><input type="file" accept="image/*" /><span className="upload-icon"><Plus size={20} /></span><strong>Add an image (optional)</strong><small>Image stays in this local prototype; no upload service is connected.</small></label><div className="ai-suggestion compact-ai"><div><Activity size={14} /><span>MOCK AI CLASSIFICATION</span></div><strong>Possible flooded road · 71% confidence</strong><p>Preview only. AI output never establishes road access or safety.</p></div></div>}
    {(step === (report ? 3 : 2)) && <div className="review-summary"><div><span>Location</span><strong>{location}</strong></div>{report ? <><div><span>Category</span><strong>{category}</strong></div><div><span>Description</span><strong>{description || 'Resident-submitted report for coordinator review.'}</strong></div></> : <><div><span>Request type</span><strong>Assistance requested</strong></div><div><span>Visibility</span><strong>Limited to authorized coordination roles</strong></div></>}<p><AlertTriangle size={14} />This is simulated information and will be routed to a human review queue only.</p></div>}
    <div className="modal-actions"><button className="button button-quiet" onClick={() => step === 0 ? onClose() : setStep((current) => current - 1)}>{step === 0 ? 'Cancel' : 'Back'}</button>{step < steps.length - 1 ? <button className="button button-primary" onClick={() => setStep((current) => current + 1)}>Continue <ChevronRight size={14} /></button> : <button className="button button-primary" onClick={submit}><Check size={14} />Submit for review</button>}</div>
  </motion.section></div>;
}

function DemoControl({ demoStep, demoPlaying, setDemoStep, setDemoPlaying, resetDemo }: { demoStep: number; demoPlaying: boolean; setDemoStep: (step: number) => void; setDemoPlaying: (playing: boolean) => void; resetDemo: () => void }) {
  const [expanded, setExpanded] = useState(() => typeof window === 'undefined' || !window.matchMedia('(max-width: 600px)').matches);
  const step = Math.max(0, demoStep);
  return <section className={`demo-control ${expanded ? '' : 'demo-collapsed'}`} aria-label="Guided demo controls"><div className="demo-control-header"><button className="demo-title" onClick={() => setExpanded((open) => !open)}><span className="demo-play-icon"><Activity size={14} /></span><span><strong>Guided demo</strong><small>{demoStep < 0 ? 'Ready to play' : `Scenario step ${step + 1} of ${demoSteps.length}`}</small></span><ChevronDown size={13} /></button>{expanded && <button className="icon-button tiny-button" aria-label="Hide demo controls" onClick={() => setExpanded(false)}><X size={14} /></button>}</div>{expanded && <><div className="demo-progress"><span style={{ width: demoStep < 0 ? '0%' : `${((step + 1) / demoSteps.length) * 100}%` }} /></div><p>{demoStep < 0 ? 'Watch the dashboard respond to changing conditions.' : demoSteps[step]}</p><div className="demo-controls"><button className="demo-action demo-main-action" onClick={() => setDemoPlaying(!demoPlaying)} aria-label={demoPlaying ? 'Pause demo' : 'Play demo'}>{demoPlaying ? <Pause size={14} /> : <Play size={14} />}{demoPlaying ? 'Pause' : 'Play'}</button><button className="demo-action" onClick={() => { setDemoStep(demoStep < 0 ? 0 : (step + 1) % demoSteps.length); setDemoPlaying(false); }}>Step <ChevronRight size={13} /></button><button className="demo-action demo-reset" onClick={resetDemo}>Reset</button></div></>}</section>;
}

export default App;