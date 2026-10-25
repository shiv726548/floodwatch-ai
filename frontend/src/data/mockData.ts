export type IncidentStatus = 'Awaiting verification' | 'Verified' | 'Confirmed closure' | 'Reported hazard' | 'Open according to available information' | 'Potentially outdated' | 'Access uncertain';

export type Incident = {
  id: string;
  title: string;
  category: 'Flood' | 'Landslide' | 'Road access' | 'Weather';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: IncidentStatus;
  source: 'Public report' | 'Model prediction' | 'Officially confirmed' | 'Simulated';
  freshness: string;
  location: string;
  description: string;
  lat: number;
  lng: number;
  roadId?: string;
};

export type Road = {
  id: string;
  name: string;
  from: string;
  to: string;
  status: string;
  minutes: number;
  points: [number, number][];
};

export type AssistanceRequest = {
  id: string;
  person: string;
  location: string;
  need: string;
  urgency: 'Critical' | 'High' | 'Medium' | 'Low';
  status: string;
  priority: number;
  people: number;
  age: string;
  access: string;
  updated: string;
};

export type Resource = {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  used: number;
  supplies: string[];
  status: string;
  updated: string;
};

const coordinates: [number, number][] = [
  [23.0225, 72.5714], [23.0284, 72.5657], [23.0305, 72.5798],
  [23.0188, 72.5662], [23.0352, 72.5722], [23.0251, 72.5844],
  [23.0382, 72.5884], [23.0165, 72.5801], [23.0311, 72.5618],
  [23.0412, 72.5764], [23.0203, 72.5917], [23.0344, 72.5952],
  [23.0128, 72.5749], [23.0441, 72.5831], [23.0271, 72.6002],
  [23.0197, 72.5573], [23.0472, 72.5691], [23.0363, 72.6044],
  [23.0093, 72.5868], [23.0502, 72.5921], [23.0266, 72.5502],
  [23.0438, 72.6017], [23.0144, 72.5963], [23.0321, 72.6088],
  [23.0551, 72.5802],
];

const incidentRows: Array<[string, Incident['category'], Incident['severity'], IncidentStatus, Incident['source'], string, string, string, string?, number?]> = [
  ['River Road water rise', 'Flood', 'High', 'Awaiting verification', 'Public report', 'North Bank', 'Water is reported across the lower shoulder near the riverside bend.', '12 min ago', 'RD-02'],
  ['Hill Link slope movement', 'Landslide', 'Critical', 'Reported hazard', 'Public report', 'East Hill', 'Unverified debris report on the road linking North Town and East Hill.', '19 min ago', 'RD-05'],
  ['Civic Bridge access update', 'Road access', 'Medium', 'Open according to available information', 'Officially confirmed', 'Civic Quarter', 'Latest field update reports partial access; conditions may change.', '27 min ago', 'RD-08'],
  ['Canal overflow watch', 'Flood', 'High', 'Verified', 'Model prediction', 'Canal Ward', 'Simulated rainfall model indicates rising water near the canal edge.', '34 min ago'],
  ['South Basin pooling', 'Flood', 'Medium', 'Awaiting verification', 'Public report', 'South Basin', 'Standing water reported at two low points along the service lane.', '41 min ago', 'RD-11'],
  ['Market Street drainage', 'Flood', 'Low', 'Verified', 'Officially confirmed', 'Old Market', 'Drainage is slow after sustained rainfall; no road closure confirmed.', '48 min ago'],
  ['West Ridge debris sighting', 'Landslide', 'High', 'Awaiting verification', 'Public report', 'West Ridge', 'Small debris field reported beside the hillside road.', '56 min ago', 'RD-13'],
  ['River footpath waterline', 'Flood', 'Medium', 'Potentially outdated', 'Public report', 'North Bank', 'Earlier waterline report needs a newer field check.', '2 hr ago'],
  ['East Hill access check', 'Road access', 'High', 'Access uncertain', 'Simulated', 'East Hill', 'No recent verified access update after nearby slope reports.', '1 hr ago', 'RD-05'],
  ['South Cutoff closure', 'Road access', 'Critical', 'Confirmed closure', 'Officially confirmed', 'South Basin', 'Coordinator-confirmed closure; segment excluded from route estimates.', '8 min ago', 'RD-12'],
  ['Central rainfall alert', 'Weather', 'High', 'Verified', 'Simulated', 'Central Ward', 'Heavy rainfall watch remains active in this simulated scenario.', '15 min ago'],
  ['North underpass water', 'Flood', 'High', 'Awaiting verification', 'Public report', 'North Town', 'Resident report of water accumulating at underpass entrance.', '22 min ago', 'RD-03'],
  ['Old Mill slope watch', 'Landslide', 'Medium', 'Reported hazard', 'Model prediction', 'Old Mill', 'Model flag for possible slope instability; field verification needed.', '30 min ago', 'RD-09'],
  ['Harbor access status', 'Road access', 'Low', 'Open according to available information', 'Officially confirmed', 'Harbor Ward', 'Latest report indicates access open per available information.', '36 min ago', 'RD-14'],
  ['South levee seepage', 'Flood', 'Critical', 'Awaiting verification', 'Public report', 'South Basin', 'Possible seepage report awaiting coordinator review.', '44 min ago', 'RD-12'],
  ['West Market water report', 'Flood', 'Medium', 'Awaiting verification', 'Public report', 'West Market', 'Duplicate candidate near an earlier Market Street report.', '51 min ago', 'RD-06'],
  ['Cedar Lane access update', 'Road access', 'Medium', 'Potentially outdated', 'Officially confirmed', 'Cedar District', 'Older access information is in conflict with a newer hazard report.', '3 hr ago', 'RD-10'],
  ['Hilltop drainage overflow', 'Flood', 'High', 'Verified', 'Simulated', 'Hilltop', 'Water is reported collecting at the lower switchback.', '1 hr ago', 'RD-05'],
  ['East Channel bank watch', 'Flood', 'Medium', 'Awaiting verification', 'Public report', 'East Channel', 'Bank erosion concern reported near the channel crossing.', '1 hr ago', 'RD-15'],
  ['North Ridge movement', 'Landslide', 'High', 'Reported hazard', 'Public report', 'North Ridge', 'Unverified movement report; avoid interpreting this as an access assessment.', '1 hr ago', 'RD-01'],
  ['Depot Road obstruction', 'Road access', 'Low', 'Verified', 'Officially confirmed', 'Depot Quarter', 'Temporary obstruction cleared according to field update.', '1 hr ago', 'RD-07'],
  ['Pine Ward water level', 'Flood', 'Medium', 'Potentially outdated', 'Public report', 'Pine Ward', 'Report is older than the configured freshness window.', '4 hr ago', 'RD-10'],
  ['East bridge approach', 'Road access', 'High', 'Access uncertain', 'Simulated', 'East Hill', 'Approach access is not confirmed after rainfall.', '1 hr ago', 'RD-08'],
  ['South Ward rainfall alert', 'Weather', 'Medium', 'Verified', 'Simulated', 'South Ward', 'Local rainfall watch for the next coordination period.', '18 min ago'],
  ['Central culvert report', 'Flood', 'Low', 'Awaiting verification', 'Public report', 'Central Ward', 'Report of fast-rising water at a culvert outlet.', '1 hr ago', 'RD-04'],
];

export const incidents: Incident[] = incidentRows.map((row, index) => ({
  id: `INC-${String(2401 + index)}`,
  title: row[0],
  category: row[1],
  severity: row[2],
  status: row[3],
  source: row[4],
  location: row[5],
  description: row[6],
  freshness: row[7],
  roadId: row[8],
  lat: coordinates[index][0],
  lng: coordinates[index][1],
}));

export const roads: Road[] = [
  { id: 'RD-01', name: 'North Ridge Road', from: 'North Town', to: 'Ridge Ward', status: 'Open according to available information', minutes: 16, points: [[23.018, 72.568], [23.023, 72.572], [23.027, 72.575]] },
  { id: 'RD-02', name: 'River Road Connector', from: 'North Town', to: 'North Bank', status: 'Reported hazard', minutes: 18, points: [[23.027, 72.575], [23.024, 72.571], [23.022, 72.571]] },
  { id: 'RD-03', name: 'North Underpass', from: 'North Town', to: 'Central Ward', status: 'Access uncertain', minutes: 11, points: [[23.027, 72.575], [23.03, 72.569], [23.032, 72.566]] },
  { id: 'RD-04', name: 'Canal Service Route', from: 'Central Ward', to: 'Canal Ward', status: 'Open according to available information', minutes: 14, points: [[23.032, 72.566], [23.035, 72.572], [23.039, 72.576]] },
  { id: 'RD-05', name: 'Hill Link Road', from: 'North Town', to: 'East Hill', status: 'Reported hazard', minutes: 20, points: [[23.027, 72.575], [23.031, 72.581], [23.035, 72.588]] },
  { id: 'RD-06', name: 'West Market Avenue', from: 'West Market', to: 'Central Ward', status: 'Open according to available information', minutes: 12, points: [[23.019, 72.557], [23.025, 72.561], [23.032, 72.566]] },
  { id: 'RD-07', name: 'Depot Access Way', from: 'Depot Quarter', to: 'Central Ward', status: 'Data outdated', minutes: 10, points: [[23.031, 72.561], [23.032, 72.566]] },
  { id: 'RD-08', name: 'Civic Bridge', from: 'East Hill', to: 'Civic Quarter', status: 'Open according to available information', minutes: 12, points: [[23.035, 72.588], [23.036, 72.582], [23.04, 72.578]] },
  { id: 'RD-09', name: 'Old Mill Cut', from: 'Old Mill', to: 'East Hill', status: 'Access uncertain', minutes: 17, points: [[23.041, 72.576], [23.038, 72.582], [23.035, 72.588]] },
  { id: 'RD-10', name: 'Cedar Lane', from: 'Cedar District', to: 'South Basin', status: 'Potentially outdated', minutes: 21, points: [[23.044, 72.583], [23.034, 72.59], [23.026, 72.6]] },
  { id: 'RD-11', name: 'South Basin Link', from: 'South Basin', to: 'Canal Ward', status: 'Traffic delayed', minutes: 25, points: [[23.026, 72.6], [23.022, 72.591], [23.035, 72.572]] },
  { id: 'RD-12', name: 'South Cutoff', from: 'South Basin', to: 'East Hill', status: 'Confirmed closure', minutes: 19, points: [[23.026, 72.6], [23.03, 72.594], [23.035, 72.588]] },
  { id: 'RD-13', name: 'West Ridge Road', from: 'West Ridge', to: 'West Market', status: 'Reported hazard', minutes: 15, points: [[23.009, 72.587], [23.014, 72.57], [23.019, 72.557]] },
  { id: 'RD-14', name: 'Harbor Link', from: 'Harbor Ward', to: 'South Ward', status: 'Open according to available information', minutes: 22, points: [[23.047, 72.569], [23.05, 72.58], [23.044, 72.602]] },
  { id: 'RD-15', name: 'East Channel Crossing', from: 'East Channel', to: 'South Ward', status: 'Data outdated', minutes: 18, points: [[23.036, 72.604], [23.027, 72.6], [23.022, 72.591]] },
];

export const requests: AssistanceRequest[] = [
  { id: 'REQ-801', person: 'Resident 04', location: 'East Hill', need: 'Medical transport', urgency: 'Critical', status: 'Needs coordinator review', priority: 94, people: 2, age: '18 min', access: 'Access uncertain', updated: '4 min ago' },
  { id: 'REQ-802', person: 'Household 12', location: 'South Basin', need: 'Evacuation assistance', urgency: 'High', status: 'Awaiting assignment', priority: 86, people: 5, age: '42 min', access: 'Confirmed closure nearby', updated: '8 min ago' },
  { id: 'REQ-803', person: 'Resident 19', location: 'North Bank', need: 'Drinking water', urgency: 'High', status: 'In progress', priority: 78, people: 1, age: '56 min', access: 'Reported hazard nearby', updated: '11 min ago' },
  { id: 'REQ-804', person: 'Household 03', location: 'Canal Ward', need: 'Temporary shelter', urgency: 'Medium', status: 'Awaiting assignment', priority: 66, people: 4, age: '1 hr', access: 'Open per available information', updated: '15 min ago' },
  { id: 'REQ-805', person: 'Resident 27', location: 'Cedar District', need: 'Medication pickup', urgency: 'High', status: 'Prioritized', priority: 73, people: 1, age: '2 hr', access: 'Data outdated', updated: '20 min ago' },
  { id: 'REQ-806', person: 'Household 08', location: 'West Market', need: 'Food and water', urgency: 'Low', status: 'Assigned', priority: 42, people: 3, age: '3 hr', access: 'Open per available information', updated: '23 min ago' },
  { id: 'REQ-807', person: 'Resident 11', location: 'Old Mill', need: 'Welfare check', urgency: 'Medium', status: 'Needs coordinator review', priority: 63, people: 1, age: '37 min', access: 'Access uncertain', updated: '6 min ago' },
  { id: 'REQ-808', person: 'Household 15', location: 'South Ward', need: 'Temporary shelter', urgency: 'Medium', status: 'Resolved', priority: 51, people: 2, age: '4 hr', access: 'Open per available information', updated: '32 min ago' },
  { id: 'REQ-809', person: 'Resident 22', location: 'North Town', need: 'First-aid supplies', urgency: 'Low', status: 'Awaiting assignment', priority: 38, people: 1, age: '2 hr', access: 'Open per available information', updated: '41 min ago' },
  { id: 'REQ-810', person: 'Household 21', location: 'East Channel', need: 'Evacuation assistance', urgency: 'Critical', status: 'Needs coordinator review', priority: 89, people: 4, age: '27 min', access: 'Data outdated', updated: '5 min ago' },
];

export const resources: Resource[] = [
  { id: 'RES-101', name: 'North Civic Shelter', type: 'Shelter', location: 'North Town', capacity: 160, used: 68, supplies: ['Water', 'Blankets', 'Charging'], status: 'Open according to available information', updated: '6 min ago' },
  { id: 'RES-102', name: 'East Hill Clinic', type: 'Medical point', location: 'East Hill', capacity: 42, used: 35, supplies: ['First aid', 'Oral rehydration'], status: 'Access uncertain', updated: '9 min ago' },
  { id: 'RES-103', name: 'Canal Ward Relief Hub', type: 'Relief center', location: 'Canal Ward', capacity: 120, used: 79, supplies: ['Food packs', 'Water', 'Hygiene'], status: 'Open according to available information', updated: '14 min ago' },
  { id: 'RES-104', name: 'South Basin School', type: 'Shelter', location: 'South Basin', capacity: 95, used: 61, supplies: ['Blankets', 'Dry food'], status: 'Data outdated', updated: '3 hr ago' },
  { id: 'RES-105', name: 'Central Supply Depot', type: 'Supply depot', location: 'Central Ward', capacity: 260, used: 133, supplies: ['Water', 'Hygiene', 'Tarpaulins'], status: 'Open according to available information', updated: '21 min ago' },
  { id: 'RES-106', name: 'West Market First Aid', type: 'Medical point', location: 'West Market', capacity: 36, used: 18, supplies: ['First aid', 'Basic medicines'], status: 'Potentially outdated', updated: '2 hr ago' },
];

export const demoSteps = [
  'Heavy rain triggers a flood warning and several resident reports.',
  'A landslide report arrives on Hill Link Road, awaiting verification.',
  'A coordinator confirms the closure; route estimates are recalculated.',
  'Traffic slows an alternative route; comparison times are updated.',
  'An urgent assistance request appears with an explainable priority.',
  'A second closure isolates South Basin and creates an escalation alert.',
  'A coordinator records a decision and resolves the request.',
];

export const statusHistory = [
  { label: 'Submitted', detail: 'Resident report received', time: '09:12' },
  { label: 'Awaiting verification', detail: 'Queued for coordinator review', time: '09:18' },
  { label: 'Field update', detail: 'Conflicting access information noted', time: '09:36' },
];