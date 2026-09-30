import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react';
import ScheduleTab from '@/components/schedule/ScheduleTab';
import CrewTab from '@/components/crew/CrewTab';
import ShotsTab from '@/components/shots/ShotsTab';
import SheetTab from '@/components/sheet/SheetTab';

const TABS = [
  { key: 'schedule', label: 'Schedule' },
  { key: 'crew', label: 'Crew' },
  { key: 'shots', label: 'Shots' },
  { key: 'sheet', label: 'Sheet' },
];

export default function ShootDayDetail() {
  const { id } = useParams();
  const [day, setDay] = useState(null);
  const [tab, setTab] = useState('schedule');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const d = await base44.entities.ShootDay.get(id);
    setDay(d);
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  const updateDay = async (data) => {
    setDay({ ...day, ...data });
    await base44.entities.ShootDay.update(id, data);
  };

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">Loading…</div>;
  if (!day) return <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">Shoot day not found.</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link to="/" className="no-print mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary">
        <ArrowLeft size={14} /> All shoot days
      </Link>

      <div className="mb-5 rounded-xl border border-border bg-card p-4">
        <input
          className="cs-input text-lg font-semibold !px-1"
          value={day.title}
          onChange={e => updateDay({ title: e.target.value })}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground"><Calendar size={11} /> Date</span>
            <input type="date" className="cs-input" value={day.date || ''} onChange={e => updateDay({ date: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground"><MapPin size={11} /> Location</span>
            <input className="cs-input" value={day.location || ''} onChange={e => updateDay({ location: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground"><Clock size={11} /> General call time</span>
            <input type="time" className="cs-input" value={day.general_call_time || ''} onChange={e => updateDay({ general_call_time: e.target.value })} />
          </label>
        </div>
      </div>

      <div className="no-print mb-4 flex gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'schedule' && <ScheduleTab day={day} />}
      {tab === 'crew' && <CrewTab day={day} />}
      {tab === 'shots' && <ShotsTab day={day} />}
      {tab === 'sheet' && <SheetTab day={day} />}
    </div>
  );
}