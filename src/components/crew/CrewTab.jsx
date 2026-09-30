import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Phone, Copy, Check } from 'lucide-react';

export default function CrewTab({ day }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    const data = await base44.entities.CrewMember.filter({ shoot_day_id: day.id }, 'created_date', 200);
    setItems(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, [day.id]);

  const addItem = async () => {
    const created = await base44.entities.CrewMember.create({ shoot_day_id: day.id, name: '', role: '', phone: '', call_time: day.general_call_time || '' });
    setItems([...items, created]);
  };

  const updateItem = (id, data) => {
    setItems(items.map((it) => (it.id === id ? { ...it, ...data } : it)));
    base44.entities.CrewMember.update(id, data);
  };

  const deleteItem = async (id) => {
    await base44.entities.CrewMember.delete(id);
    setItems(items.filter((it) => it.id !== id));
  };

  const copyForWhatsApp = async () => {
    const lines = [
      `*${day.title}* — Call Sheet`,
      day.date ? `📅 ${day.date}` : '',
      day.location ? `📍 ${day.location}` : '',
      `⏰ Call: ${day.general_call_time || '—'}`,
      '',
      '*Crew:*',
      ...items.filter((c) => c.name).map((c) => `${c.call_time ? `[${c.call_time}] ` : ''}${c.name}${c.role ? ` — ${c.role}` : ''}${c.phone ? ` · ${c.phone}` : ''}`),
    ].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(lines);
    }
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Tap a phone number to call. Copy the list to paste into WhatsApp.</p>
        <button onClick={copyForWhatsApp} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary">
          {copied ? <><Check size={14} className="text-primary" /> Copied</> : <><Copy size={14} /> Copy for WhatsApp</>}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-[1fr_1fr_1.2fr_70px_32px] gap-2 border-b border-border bg-secondary/40 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground">
          <span>Name</span>
          <span>Role</span>
          <span>Phone</span>
          <span>Call</span>
          <span></span>
        </div>
        {items.map((c) => (
          <div key={c.id} className="grid grid-cols-[1fr_1fr_1.2fr_70px_32px] items-center gap-2 border-b border-border px-3 py-1.5">
            <input className="cs-input" placeholder="Name" value={c.name || ''} onChange={(e) => updateItem(c.id, { name: e.target.value })} />
            <input className="cs-input" placeholder="Role" value={c.role || ''} onChange={(e) => updateItem(c.id, { role: e.target.value })} />
            <div className="flex items-center gap-1.5">
              <input className="cs-input" placeholder="Phone" value={c.phone || ''} onChange={(e) => updateItem(c.id, { phone: e.target.value })} />
              {c.phone && (
                <a href={`tel:${c.phone.replace(/\s+/g, '')}`} className="shrink-0 rounded p-1 text-primary hover:bg-secondary" title="Call">
                  <Phone size={14} />
                </a>
              )}
            </div>
            <input type="time" className="cs-input" value={c.call_time || ''} onChange={(e) => updateItem(c.id, { call_time: e.target.value })} />
            <button onClick={() => deleteItem(c.id)} className="flex justify-center text-muted-foreground hover:text-destructive">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="px-3 py-8 text-center text-xs text-muted-foreground">No crew yet. Add the first member.</div>}
      </div>

      <button onClick={addItem} className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
        <Plus size={14} /> Add crew member
      </button>
    </div>
  );
}