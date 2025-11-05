"use client";

import { useState } from "react";

export function CertificateGenerator({ onInsert }: { onInsert: (text: string) => void }) {
  const [company, setCompany] = useState("");
  const [device, setDevice] = useState("");
  const [serial, setSerial] = useState("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [result, setResult] = useState("Pass");

  function generateText() {
    return `Calibration Certificate\n\nCompany: ${company || "[company]"}\nInstrument: ${device || "[device]"}\nSerial: ${serial || "[serial]"}\nDate: ${date}\nValid Until: ${dueDate}\nResult: ${result}\n\nStatement: Instrument was calibrated using traceable standards under controlled environmental conditions. Results are within specified tolerances unless otherwise noted.`;
  }

  return (
    <div className="space-y-2">
      <input className="input-base" placeholder="Company" value={company} onChange={(e)=> setCompany(e.target.value)} />
      <input className="input-base" placeholder="Instrument" value={device} onChange={(e)=> setDevice(e.target.value)} />
      <input className="input-base" placeholder="Serial" value={serial} onChange={(e)=> setSerial(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <div className="card p-2">
          <label className="text-sm text-slate-300">Calibration Date</label>
          <input className="input-base mt-1" type="date" value={date} onChange={(e)=> setDate(e.target.value)} />
        </div>
        <div className="card p-2">
          <label className="text-sm text-slate-300">Valid Until</label>
          <input className="input-base mt-1" type="date" value={dueDate} onChange={(e)=> setDueDate(e.target.value)} />
        </div>
      </div>
      <div className="card p-2">
        <label className="text-sm text-slate-300">Result</label>
        <select className="input-base mt-1" value={result} onChange={(e)=> setResult(e.target.value)}>
          <option>Pass</option>
          <option>Fail</option>
          <option>Adjusted</option>
        </select>
      </div>
      <button className="btn-primary" onClick={()=> onInsert(generateText())}>Insert</button>
    </div>
  );
}
