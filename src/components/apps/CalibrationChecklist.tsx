"use client";

import { useState } from "react";

export function CalibrationChecklist({ onInsert }: { onInsert: (text: string) => void }) {
  const [device, setDevice] = useState("");
  const [serial, setSerial] = useState("");
  const [items, setItems] = useState(
    [
      { key: "Visual inspection", done: false },
      { key: "Warm-up time observed", done: false },
      { key: "Reference standard verified", done: false },
      { key: "Environmental conditions within limits", done: false },
      { key: "Zeroing/adjustments as required", done: false },
    ] as { key: string; done: boolean }[]
  );

  function toggle(i: number) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, done: !it.done } : it)));
  }

  function addItem() {
    const key = prompt("Checklist item");
    if (key) setItems((prev) => [...prev, { key, done: false }]);
  }

  function generateText() {
    const header = `Calibration checklist for ${device || "[device]"} (S/N ${serial || "[serial]"})`;
    const lines = items.map((it) => `- [${it.done ? "x" : " "}] ${it.key}`).join("\n");
    return `${header}\n\n${lines}`;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-400">Quickly assemble a calibration checklist and insert into chat.</div>
      <input className="input-base" placeholder="Device" value={device} onChange={(e)=> setDevice(e.target.value)} />
      <input className="input-base" placeholder="Serial number" value={serial} onChange={(e)=> setSerial(e.target.value)} />
      <div className="border border-slate-700 rounded-lg divide-y divide-slate-800">
        {items.map((it, i) => (
          <label key={i} className="flex items-center gap-2 p-2">
            <input type="checkbox" checked={it.done} onChange={()=> toggle(i)} />
            <span className="text-sm">{it.key}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" onClick={()=> onInsert(generateText())}>Insert</button>
        <button className="px-3 py-2 rounded bg-slate-700" onClick={addItem}>Add item</button>
      </div>
    </div>
  );
}
