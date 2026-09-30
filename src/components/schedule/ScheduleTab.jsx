import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { parseTime, formatTime } from '@/lib/timeUtils';

export default function ScheduleTab({ day }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await base44.entities.ScheduleItem.filter({ shoot_day_id: day.id }, 'order', 200);
    setItems(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, [day.id]);

  const compute = () => {
    const base = parseTime(day.general_call_time) ?? 8 * 60;
    let t = base;
    return items.map((it) => {
      const start = t;
      const dur = it.duration || 0;
      const end = start + dur;
      t = end;
      return { ...it, start, end };
    });
  };
  const rows = compute();

  const addItem = async () => {
    const order = items.length;
    const created = await base44.entities.ScheduleItem.create({ shoot_day_id: day.id, scene: '', location: '', duration: 30, order });
    setItems([...items, created]);
  };

  const updateItem = (id, data) => {
    setItems(items.map((it) => (it.id === id ? { ...it, ...data } : it)));
    base44.entities.ScheduleItem.update(id, data);
  };

  const deleteItem = async (id) => {
    await base44.entities.ScheduleItem.delete(id);
    setItems(items.filter((it) => it.id !== id));
  };

  const onDragEnd = async (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const next = Array.from(items);
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    setItems(next);
    await base44.entities.ScheduleItem.bulkUpdate(next.map((it, i) => ({ id: it.id, order: i })));
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Times recalculate from the day's call time and each block's duration. Drag rows to reorder.</p>
        <button onClick={addItem} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
          <Plus size={14} /> Add block
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-[28px_70px_1fr_1fr_72px_32px] gap-2 border-b border-border bg-secondary/40 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground">
          <span></span>
          <span>Call</span>
          <span>Scene</span>
          <span>Location</span>
          <span className="text-right">Min</span>
          <span></span>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="schedule">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {rows.map((r, i) => (
                  <Draggable key={r.id} draggableId={r.id} index={i}>
                    {(prov, snapshot) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        className={`grid grid-cols-[28px_70px_1fr_1fr_72px_32px] items-center gap-2 border-b border-border px-3 py-1.5 ${snapshot.isDragging ? 'bg-secondary/60' : ''}`}
                      >
                        <span {...prov.dragHandleProps} className="flex justify-center text-muted-foreground cursor-grab active:cursor-grabbing hover:text-primary">
                          <GripVertical size={15} />
                        </span>
                        <div className="text-xs font-medium text-primary">
                          <div>{formatTime(r.start)}</div>
                          <div className="text-[10px] text-muted-foreground">{formatTime(r.end)}</div>
                        </div>
                        <input className="cs-input" placeholder="Scene #" value={r.scene || ''} onChange={(e) => updateItem(r.id, { scene: e.target.value })} />
                        <input className="cs-input" placeholder="Location" value={r.location || ''} onChange={(e) => updateItem(r.id, { location: e.target.value })} />
                        <input type="number" min={0} className="cs-input text-right" value={r.duration ?? 0} onChange={(e) => updateItem(r.id, { duration: parseInt(e.target.value, 10) || 0 })} />
                        <button onClick={() => deleteItem(r.id)} className="flex justify-center text-muted-foreground hover:text-destructive">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {rows.length === 0 && <div className="px-3 py-8 text-center text-xs text-muted-foreground">No blocks yet. Add the first one.</div>}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>Wrap:</span>
        <span className="font-medium text-primary">{rows.length ? formatTime(rows[rows.length - 1].end) : '--:--'}</span>
      </div>
    </div>
  );
}