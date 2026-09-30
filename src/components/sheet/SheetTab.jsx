import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Printer } from 'lucide-react';
import { parseTime, formatTime } from '@/lib/timeUtils';

export default function SheetTab({ day }) {
  const [schedule, setSchedule] = useState([]);
  const [crew, setCrew] = useState([]);
  const [shots, setShots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, c, sh] = await Promise.all([
        base44.entities.ScheduleItem.filter({ shoot_day_id: day.id }, 'order', 200),
        base44.entities.CrewMember.filter({ shoot_day_id: day.id }, 'created_date', 200),
        base44.entities.Shot.filter({ shoot_day_id: day.id }, 'order', 300),
      ]);
      setSchedule(s);
      setCrew(c);
      setShots(sh);
      setLoading(false);
    })();
  }, [day.id]);

  const compute = () => {
    const base = parseTime(day.general_call_time) ?? 8 * 60;
    let t = base;
    return schedule.map((it) => {
      const start = t;
      const end = start + (it.duration || 0);
      t = end;
      return { ...it, start, end };
    });
  };
  const rows = compute();
  const wrap = rows.length ? formatTime(rows[rows.length - 1].end) : day.general_call_time || '—';
  const doneShots = shots.filter((s) => s.done).length;

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d + 'T00:00').toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return d; }
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div>
      <div className="no-print mb-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">A clean one-page call sheet. Print uses A4 layout.</p>
        <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Printer size={16} /> Print
        </button>
      </div>

      <div className="print-sheet mx-auto max-w-[820px] rounded-lg border border-border bg-white p-8 text-black shadow-lg">
        <div className="accent-bar" />
        <div className="flex items-start justify-between border-b-2 border-black pb-3">
          <div>
            <h1 className="font-bold">CALL SHEET</h1>
            <div className="text-[12px] font-semibold uppercase tracking-wide">{day.title}</div>
          </div>
          <div className="text-right text-[11px]">
            <div><span className="text-gray-500">Date:</span> <strong>{fmtDate(day.date)}</strong></div>
            <div><span className="text-gray-500">Call:</span> <strong>{day.general_call_time || '—'}</strong></div>
            <div><span className="text-gray-500">Wrap:</span> <strong>{wrap}</strong></div>
          </div>
        </div>

        <div className="mt-3 text-[11px]">
          <span className="text-gray-500">Location: </span><strong>{day.location || '—'}</strong>
          {day.notes ? <span className="text-gray-500"> · Notes: {day.notes}</span> : null}
        </div>

        <div className="mt-4">
          <h2>Schedule</h2>
          <table>
            <thead>
              <tr><th>Call</th><th>End</th><th>Scene</th><th>Location</th><th>Min</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><strong>{formatTime(r.start)}</strong></td>
                  <td>{formatTime(r.end)}</td>
                  <td>{r.scene || '—'}</td>
                  <td>{r.location || '—'}</td>
                  <td>{r.duration || 0}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="text-gray-400">No schedule blocks.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-6">
          <div>
            <h2>Crew ({crew.length})</h2>
            <table>
              <thead><tr><th>Call</th><th>Name</th><th>Role</th><th>Phone</th></tr></thead>
              <tbody>
                {crew.map((c) => (
                  <tr key={c.id}>
                    <td>{c.call_time || '—'}</td>
                    <td><strong>{c.name || '—'}</strong></td>
                    <td>{c.role || '—'}</td>
                    <td>{c.phone || '—'}</td>
                  </tr>
                ))}
                {crew.length === 0 && <tr><td colSpan={4} className="text-gray-400">No crew.</td></tr>}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Shots ({doneShots}/{shots.length})</h2>
            <table>
              <thead><tr><th>Size</th><th>Move</th><th>Lens</th><th>Note</th></tr></thead>
              <tbody>
                {shots.map((s) => (
                  <tr key={s.id} className={s.done ? 'opacity-40' : ''}>
                    <td><strong>{s.shot_size || '—'}</strong></td>
                    <td>{s.camera_move || '—'}</td>
                    <td>{s.lens || '—'}</td>
                    <td>{s.note || '—'}</td>
                  </tr>
                ))}
                {shots.length === 0 && <tr><td colSpan={4} className="text-gray-400">No shots.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-300 pt-2 text-[9px] text-gray-500">
          Made by GenVidPro, AI Creative Studio, Tel Aviv · genvidpro.com
        </div>
      </div>
    </div>
  );
}