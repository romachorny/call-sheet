import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Plus, Calendar, MapPin, Trash2, ChevronRight, Clapperboard } from 'lucide-react';

export default function Home() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', location: '', general_call_time: '08:00' });

  const load = async () => {
    const data = await base44.entities.ShootDay.list('-created_date', 50);
    setDays(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title.trim()) return;
    setCreating(true);
    const created = await base44.entities.ShootDay.create({
      title: form.title.trim(),
      date: form.date || new Date().toISOString().slice(0, 10),
      location: form.location.trim(),
      general_call_time: form.general_call_time || '08:00',
      notes: ''
    });
    setDays([created, ...days]);
    setForm({ title: '', date: '', location: '', general_call_time: '08:00' });
    setCreating(false);
  };

  const remove = async (id) => {
    if (!confirm('Delete this shoot day and all its schedule, crew and shots?')) return;
    await base44.entities.ScheduleItem.deleteMany({ shoot_day_id: id });
    await base44.entities.CrewMember.deleteMany({ shoot_day_id: id });
    await base44.entities.Shot.deleteMany({ shoot_day_id: id });
    await base44.entities.ShootDay.delete(id);
    setDays(days.filter(d => d.id !== id));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Shoot Days</h1>
        <p className="text-sm text-muted-foreground mt-1">Plan your shoot day and share it with the crew.</p>
      </div>

      <div className="mb-8 rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input className="cs-input" placeholder="Day title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <input type="date" className="cs-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <input className="cs-input" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <div className="flex gap-2">
            <input type="time" className="cs-input" value={form.general_call_time} onChange={e => setForm({ ...form, general_call_time: e.target.value })} />
            <button onClick={create} disabled={creating || !form.title.trim()} className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40">
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : days.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No shoot days yet.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {days.map(d => (
            <div key={d.id} className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
              <div className="flex items-start justify-between gap-2">
                <Link to={`/day/${d.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Clapperboard size={15} className="shrink-0" />
                    <h3 className="truncate font-medium text-foreground">{d.title}</h3>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Calendar size={12} /> {d.date || '—'}</div>
                    <div className="flex items-center gap-1.5"><MapPin size={12} /> {d.location || 'No location set'}</div>
                    <div className="text-primary/80">Call: {d.general_call_time || '—'}</div>
                  </div>
                </Link>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => remove(d.id)} className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive">
                    <Trash2 size={15} />
                  </button>
                  <Link to={`/day/${d.id}`} className="rounded p-1 text-muted-foreground transition-colors hover:text-primary">
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}