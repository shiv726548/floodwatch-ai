import type { ReactNode } from 'react';
import { AlertTriangle, Check, Clock3, Radio, ShieldAlert, Sparkles } from 'lucide-react';

const statusMeta: Record<string, { icon: typeof Check; className: string }> = {
  'Confirmed closure': { icon: ShieldAlert, className: 'status-closed' },
  'Reported hazard': { icon: AlertTriangle, className: 'status-hazard' },
  'Awaiting verification': { icon: AlertTriangle, className: 'status-hazard' },
  Verified: { icon: Check, className: 'status-open' },
  'Open according to available information': { icon: Check, className: 'status-open' },
  'Access uncertain': { icon: ShieldAlert, className: 'status-uncertain' },
  'Potentially outdated': { icon: Clock3, className: 'status-outdated' },
  'Data outdated': { icon: Clock3, className: 'status-outdated' },
  'Traffic delayed': { icon: Clock3, className: 'status-delay' },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta[status] ?? { icon: Radio, className: 'status-neutral' };
  const Icon = meta.icon;
  return <span className={`status-badge ${meta.className}`}><Icon size={13} aria-hidden="true" />{status}</span>;
}

export function FreshnessChip({ value }: { value: string }) {
  return <span className="freshness-chip"><Clock3 size={12} aria-hidden="true" />Updated {value}</span>;
}

export function SourceBadge({ source }: { source: string }) {
  const isModel = source === 'Model prediction';
  return <span className={`source-badge ${isModel ? 'source-model' : ''}`}><span className="source-dot" />{source}</span>;
}

export function PriorityBadge({ score, urgency }: { score: number; urgency: string }) {
  return <span className={`priority-badge priority-${urgency.toLowerCase()}`}><Sparkles size={13} aria-hidden="true" />P{score} · {urgency}</span>;
}

export function KpiTile({ label, value, detail, icon, tone, children }: {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
  tone: string;
  children?: ReactNode;
}) {
  return <article className="kpi-tile">
    <div className="kpi-top"><span>{label}</span><span className={`kpi-icon ${tone}`}>{icon}</span></div>
    <div className="kpi-value-row"><strong>{value}</strong>{children}</div>
    <div className="kpi-detail">{detail}</div>
  </article>;
}

export function SectionHeading({ eyebrow, title, description, action }: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return <div className="section-heading">
    <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>
    {action && <div className="section-action">{action}</div>}
  </div>;
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="empty-state"><div className="empty-icon"><Radio size={20} /></div><strong>{title}</strong><span>{detail}</span></div>;
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{children}</section>;
}