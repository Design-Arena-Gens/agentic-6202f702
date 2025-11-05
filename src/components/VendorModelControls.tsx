"use client";

import { MODELS } from "@/lib/models";
import { Vendor } from "@/lib/types";
import { useMemo } from "react";

export type ControlsState = {
  vendor: Vendor;
  modelId: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
};

export function VendorModelControls({ state, onChange }: {
  state: ControlsState;
  onChange: (next: Partial<ControlsState>) => void;
}) {
  const modelsByVendor = useMemo(() => {
    const map: Record<Vendor, { id: string; label: string }[]> = {
      openai: [], anthropic: [], google: [], azure: []
    };
    for (const m of MODELS) {
      // @ts-expect-error index
      map[m.vendor].push({ id: m.id, label: m.label });
    }
    return map;
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div className="card p-3">
        <label className="text-sm text-slate-300">Vendor</label>
        <select className="input-base mt-1" value={state.vendor} onChange={(e) => onChange({ vendor: e.target.value as Vendor, modelId: modelsByVendor[e.target.value as Vendor][0]?.id })}>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="google">Google</option>
          <option value="azure">Azure OpenAI</option>
        </select>
      </div>
      <div className="card p-3">
        <label className="text-sm text-slate-300">Model</label>
        <select className="input-base mt-1" value={state.modelId} onChange={(e) => onChange({ modelId: e.target.value })}>
          {modelsByVendor[state.vendor].map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>
      <div className="card p-3">
        <label className="text-sm text-slate-300">Temperature: {state.temperature.toFixed(2)}</label>
        <input className="w-full" type="range" min={0} max={2} step={0.01} value={state.temperature} onChange={(e) => onChange({ temperature: parseFloat(e.target.value) })} />
      </div>
      <div className="card p-3">
        <label className="text-sm text-slate-300">Top P: {state.topP.toFixed(2)}</label>
        <input className="w-full" type="range" min={0} max={1} step={0.01} value={state.topP} onChange={(e) => onChange({ topP: parseFloat(e.target.value) })} />
      </div>
      <div className="card p-3">
        <label className="text-sm text-slate-300">Max Tokens: {state.maxTokens}</label>
        <input className="w-full" type="range" min={64} max={4096} step={32} value={state.maxTokens} onChange={(e) => onChange({ maxTokens: parseInt(e.target.value) })} />
      </div>
      <div className="card p-3 md:col-span-2">
        <label className="text-sm text-slate-300">System Prompt</label>
        <textarea className="input-base mt-1 h-28" value={state.systemPrompt} onChange={(e) => onChange({ systemPrompt: e.target.value })} placeholder="You are an expert assistant for aferi??o (calibration) workflows." />
      </div>
    </div>
  );
}
