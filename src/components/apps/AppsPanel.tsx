"use client";

import { useState } from "react";
import { CalibrationChecklist } from "./CalibrationChecklist";
import { UncertaintyCalculator } from "./UncertaintyCalculator";
import { CertificateGenerator } from "./CertificateGenerator";

export function AppsPanel({ onInsert }: { onInsert: (text: string) => void }) {
  const [tab, setTab] = useState<"checklist" | "uncertainty" | "certificate">("checklist");
  return (
    <div className="card p-3">
      <div className="text-sm font-semibold mb-2">Power Apps (Aferi??o)</div>
      <div className="flex gap-2 text-xs mb-3">
        <button className={`px-2 py-1 rounded ${tab==='checklist'?'bg-primary':''}`} onClick={()=> setTab("checklist")}>Checklist</button>
        <button className={`px-2 py-1 rounded ${tab==='uncertainty'?'bg-primary':''}`} onClick={()=> setTab("uncertainty")}>Uncertainty</button>
        <button className={`px-2 py-1 rounded ${tab==='certificate'?'bg-primary':''}`} onClick={()=> setTab("certificate")}>Certificate</button>
      </div>
      {tab === "checklist" && <CalibrationChecklist onInsert={onInsert} />}
      {tab === "uncertainty" && <UncertaintyCalculator onInsert={onInsert} />}
      {tab === "certificate" && <CertificateGenerator onInsert={onInsert} />}
    </div>
  );
}
