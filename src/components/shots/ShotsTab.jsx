import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Check } from 'lucide-react';

const SIZES = ['WS', 'MS', 'CU', 'ECU', 'OTS', 'POV', '2S', 'Insert'];
const MOVES = ['Static', 'Pan', 'Tilt', 'Dolly', 'Track', 'Handheld', 'Crane', 'Zoom'];

export default function ShotsTab({ day }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await base44.entities.Shot.filter({ shoot_day_id: day.id }, 'order', 300);
    setItems(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, [day.id]);

  const addItem = async () => {
    const order = items.length;
    const created = await base44.entities.Shot.create({ shoot_day_id: day.id, shot_size: 'MS', camera_move: 'Static', lens: '', note: '', done: false, order });
    setItems([...items, created]);
  };

  const updateItem = (id, data) => {
    setItems(items.map((it) => (it.id === id ? { ...it, ...data } : it)));
    base44.entities.Shot.update(id, data);
  };

  const deleteItem = async (id) => {
    await base44.entities.Shot.delete(id);
    setItems(items.filter((it) => it.id !== id));
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const done = items.filter((s) => s.done).length;
  const total = items.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Shot progress</span>
          <span className="font-medium text-primary">{done}/{total} · {pct}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mb-3 flex justify-end">
        <button onClick={addItem} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
          <Plus size={14} /> Add shot
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-[40px_90px_100px_90px_1fr_32px] gap-2 border-b border-border bg-secondary/40 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground">
          <span>Done</span>
          <span>Size</span>
          <span>Move</span>
          <span>Lens</span>
          <span>Note</span>
          <span></span>
        </div>
        {items.map((s, i) => (
          <div key={s.id} className={`grid grid-cols-[40px_90px_100px_90px_1fr_32px] items-center gap-2 border-b border-border px-3 py-1.5 ${s.done ? 'opacity-50' : ''}`}>
            <button onClick={() => updateItem(s.id, { done: !s.done })} className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${s.done ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-transparent hover:border-primary'}`}>
              <Check size={13} />
            </button>
            <select className="cs-input" value={s.shot_size || ''} onChange={(e) => updateItem(s.id, { shot_size: e.target.value })}>
              {SIZES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <select className="cs-input" value={s.camera_move || ''} onChange={(e) => updateItem(s.id, { camera_move: e.target.value })}>
              {MOVES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <input className="cs-input" placeholder="35mm" value={s.lens || ''} onChange={(e) => updateItem(s.id, { lens: e.target.value })} />
            <input className="cs-input" placeholder="Note" value={s.note || ''} onChange={(e) => updateItem(s.id, { note: e.target.value })} />
            <button onClick={() => deleteItem(s.id)} className="flex justify-center text-muted-foreground hover:text-destructive">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="px-3 py-8 text-center text-xs text-muted-foreground">No shots yet. Add the first one.</div>}
      </div>
    </div>
  );
}