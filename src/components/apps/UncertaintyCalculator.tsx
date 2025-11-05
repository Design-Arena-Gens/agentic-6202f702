"use client";

import { useMemo, useState } from "react";

function round(n: number, d = 3) {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
}

export function UncertaintyCalculator({ onInsert }: { onInsert: (text: string) => void }) {
  const [coverage, setCoverage] = useState(2);
  const [components, setComponents] = useState<{ label: string; stdUnc: number }[]>([
    { label: "Repeatability", stdUnc: 0.2 },
    { label: "Resolution", stdUnc: 0.1 },
    { label: "Reference standard", stdUnc: 0.15 },
  ]);

  const combined = useMemo(() => Math.sqrt(components.reduce((s, c) => s + c.stdUnc * c.stdUnc, 0)), [components]);
  const expanded = useMemo(() => combined * coverage, [combined, coverage]);

  function addComponent() {
    const label = prompt("Component label");
    const val = prompt("Standard uncertainty (e.g., 0.05)");
    if (!label || !val) return;
    const num = parseFloat(val);
    if (isNaN(num)) return;
    setComponents((prev) => [...prev, { label, stdUnc: num }]);
  }

  function update(i: number, next: Partial<{ label: string; stdUnc: number }>) {
    setComponents((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...next } : c)));
  }

  function remove(i: number) {
    setComponents((prev) => prev.filter((_, idx) => idx !== i));
  }

  function generateText() {
    const lines = components.map((c) => `- ${c.label}: u = ${c.stdUnc}`).join("\n");
    return `Measurement uncertainty budget\n\n${lines}\n\nCombined std. uncertainty: uc = ${round(combined)}\nCoverage factor: k = ${coverage}\nExpanded uncertainty: U = ${round(expanded)}`;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-400">Compute combined and expanded uncertainty (GUM simplified).</div>
      <div className="card p-2 space-y-2">
        {components.map((c, i) => (
          <div key={i} className="grid grid-cols-5 gap-2 items-center">
            <input className="input-base col-span-3" value={c.label} onChange={(e)=> update(i, { label: e.target.value })} />
            <input className="input-base col-span-1" type="number" step="0.001" value={c.stdUnc} onChange={(e)=> update(i, { stdUnc: parseFloat(e.target.value) })} />
            <button className="col-span-1 px-3 py-2 rounded bg-slate-700" onClick={()=> remove(i)}>Remove</button>
          </div>
        ))}
        <button className="px-3 py-2 rounded bg-slate-700" onClick={addComponent}>Add component</button>
      </div>
      <div className="card p-3">
        <label className="text-sm text-slate-300">Coverage factor k</label>
        <input className="input-base mt-1" type="number" step="0.1" value={coverage} onChange={(e)=> setCoverage(parseFloat(e.target.value))} />
      </div>
      <div className="text-sm">uc = {round(combined)} ? U = {round(expanded)} (k={coverage})</div>
      <button className="btn-primary" onClick={()=> onInsert(generateText())}>Insert</button>
    </div>
  );
}
