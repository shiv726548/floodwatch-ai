import { useMemo, useState } from 'react';
import L from 'leaflet';
import { MapPinned } from 'lucide-react';
import { Circle, CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip } from 'react-leaflet';
import { incidents, requests, resources, roads, type Incident } from '../data/mockData';

const roadStyle: Record<string, { color: string; dashArray?: string; weight: number }> = {
  'Open according to available information': { color: '#22c55e', weight: 4 },
  'Reported hazard': { color: '#f59e0b', dashArray: '9 8', weight: 4 },
  'Confirmed closure': { color: '#ef4444', weight: 7 },
  'Access uncertain': { color: '#a78bfa', dashArray: '2 8', weight: 5 },
  'Data outdated': { color: '#6b7280', dashArray: '4 7', weight: 4 },
  'Potentially outdated': { color: '#6b7280', dashArray: '4 7', weight: 4 },
  'Traffic delayed': { color: '#f97316', dashArray: '11 6', weight: 4 },
};

const incidentColors: Record<string, string> = {
  Flood: '#32c4b6',
  Landslide: '#e8a849',
  'Road access': '#9c8bef',
  Weather: '#62a4e8',
};

const medicalLocations: [number, number][] = [[23.022, 72.571], [23.035, 72.588], [23.026, 72.6], [23.039, 72.576], [23.019, 72.557], [23.041, 72.576]];
const resourceLocations: [number, number][] = [[23.018, 72.568], [23.035, 72.588], [23.039, 72.576], [23.026, 72.6], [23.032, 72.566], [23.019, 72.557]];

function markerIcon(incident: Incident) {
  const color = incidentColors[incident.category] ?? '#32c4b6';
  const urgent = incident.severity === 'Critical';
  return L.divIcon({
    className: 'incident-marker-wrap',
    html: `<span class="incident-marker ${urgent ? 'is-urgent' : ''}" style="--marker-color:${color}"><span></span></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

type Props = {
  compact?: boolean;
  showIncidents?: boolean;
  showRoads?: boolean;
  showFlood?: boolean;
  showMedical?: boolean;
  showResources?: boolean;
  incidentData?: Incident[];
  confirmedRoads?: string[];
  onIncidentClick?: (incident: Incident) => void;
  selectedIncident?: string;
  demoStep?: number;
};

export function OperationsMap({ compact = false, showIncidents = true, showRoads = true, showFlood = true, showMedical = false, showResources = false, incidentData = incidents, confirmedRoads = [], onIncidentClick, demoStep = -1 }: Props) {
  const [tilesUnavailable, setTilesUnavailable] = useState(false);
  const displayedRoads = useMemo(() => roads.map((road) => {
    if (confirmedRoads.includes(road.id)) return { ...road, status: 'Confirmed closure' };
    if (demoStep >= 5 && road.id === 'RD-05') return { ...road, status: 'Confirmed closure' };
    if (demoStep >= 2 && road.id === 'RD-05') return { ...road, status: 'Confirmed closure' };
    if (demoStep >= 3 && road.id === 'RD-11') return { ...road, status: 'Traffic delayed' };
    return road;
  }), [confirmedRoads, demoStep]);
  const mapIncidents = compact ? incidentData.slice(0, 10) : incidentData;

  return <div className={`ops-map-host ${compact ? 'map-compact' : ''}`}>
    <MapContainer center={[23.031, 72.579]} zoom={13} zoomControl={!compact} scrollWheelZoom={!compact} className="ops-map">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        eventHandlers={{ tileerror: () => setTilesUnavailable(true), tileload: () => setTilesUnavailable(false) }}
      />
      {showFlood && <>
        <Circle center={[23.022, 72.572]} radius={350} pathOptions={{ color: '#42bad0', fillColor: '#42bad0', fillOpacity: 0.12, weight: 1, dashArray: '5 6' }} />
        <Circle center={[23.039, 72.594]} radius={410} pathOptions={{ color: '#42bad0', fillColor: '#42bad0', fillOpacity: 0.09, weight: 1, dashArray: '5 6' }} />
      </>}
      {showRoads && displayedRoads.map((road) => {
        const style = roadStyle[road.status] ?? roadStyle['Open according to available information'];
        return <Polyline key={road.id} positions={road.points} pathOptions={{ ...style, opacity: road.status === 'Confirmed closure' ? 0.98 : 0.78 }}>
          <Tooltip sticky>{road.name} · {road.status}</Tooltip>
        </Polyline>;
      })}
      {demoStep >= 5 && <Circle center={[23.026, 72.6]} radius={570} pathOptions={{ color: '#a78bfa', fillColor: '#a78bfa', fillOpacity: 0.12, dashArray: '2 7', weight: 2 }} />}
      {showIncidents && mapIncidents.map((incident) => <Marker
        key={incident.id}
        position={[incident.lat, incident.lng]}
        icon={markerIcon(incident)}
        eventHandlers={{ click: () => onIncidentClick?.(incident) }}
      >
        <Tooltip direction="top" offset={[0, -8]}>{incident.title}</Tooltip>
      </Marker>)}
        {showMedical && requests.slice(0, 6).map((request, index) => <CircleMarker key={request.id} center={medicalLocations[index]} radius={7} pathOptions={{ color: '#f4f5f6', weight: 1, fillColor: '#ef6b70', fillOpacity: 0.95 }}><Tooltip>{request.need} · simulated request</Tooltip></CircleMarker>)}
        {showResources && resources.map((resource, index) => <CircleMarker key={resource.id} center={resourceLocations[index]} radius={7} pathOptions={{ color: '#f4f5f6', weight: 1, fillColor: '#4dbb91', fillOpacity: 0.95 }}><Tooltip>{resource.name} · simulated resource</Tooltip></CircleMarker>)}
    </MapContainer>
    {tilesUnavailable && <div className="map-fallback"><MapPinned size={17} /><strong>Map tiles unavailable</strong><span>Showing simulated incident and road data without the basemap.</span></div>}
  </div>;
}