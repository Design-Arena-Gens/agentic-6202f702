"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { ChatMessage, Conversation, Vendor } from "@/lib/types";
import { VendorModelControls, ControlsState } from "./VendorModelControls";
import { AppsPanel } from "./apps/AppsPanel";

function defaultControls(): ControlsState {
  return {
    vendor: "openai",
    modelId: "gpt-4o-mini",
    temperature: 0.6,
    topP: 1,
    maxTokens: 1024,
    systemPrompt: "You are an expert assistant for aferi??o (calibration) workflows.",
  };
}

function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("conversations");
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

function saveConversations(convos: Conversation[]) {
  localStorage.setItem("conversations", JSON.stringify(convos));
}

export function ChatUI() {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations());
  const [currentId, setCurrentId] = useState<string>(() => conversations[0]?.id ?? "");
  const [controls, setControls] = useState<ControlsState>(defaultControls());
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const current = useMemo(() => conversations.find((c) => c.id === currentId), [conversations, currentId]);

  useEffect(() => {
    if (!current && conversations.length) {
      setCurrentId(conversations[0].id);
    }
  }, [conversations, current]);

  function createConversation(initialUserText?: string) {
    const now = Date.now();
    const sysMsg: ChatMessage | undefined = controls.systemPrompt
      ? { id: nanoid(), role: "system", content: controls.systemPrompt, createdAt: now }
      : undefined;
    const userMsg: ChatMessage | undefined = initialUserText
      ? { id: nanoid(), role: "user", content: initialUserText, createdAt: now }
      : undefined;
    const c: Conversation = {
      id: nanoid(),
      title: initialUserText?.slice(0, 40) || "New Chat",
      modelId: controls.modelId,
      vendor: controls.vendor as Vendor,
      temperature: controls.temperature,
      topP: controls.topP,
      maxTokens: controls.maxTokens,
      systemPrompt: controls.systemPrompt,
      messages: [sysMsg, userMsg].filter(Boolean) as ChatMessage[],
      createdAt: now,
      updatedAt: now,
    };
    setConversations((prev) => [c, ...prev]);
    setCurrentId(c.id);
  }

  async function sendMessage(text?: string) {
    const content = typeof text === "string" ? text : input.trim();
    if (!content) return;
    setIsSending(true);

    if (!current) {
      createConversation(content);
      setInput("");
      setIsSending(false);
      // Auto-send assistant after creation
      setTimeout(() => sendMessage(""), 50);
      return;
    }

    const now = Date.now();
    const userMsg: ChatMessage = { id: nanoid(), role: "user", content, createdAt: now };
    const updated = conversations.map((c) =>
      c.id === current.id
        ? { ...c, messages: [...c.messages, userMsg], updatedAt: now, title: c.title === "New Chat" ? content.slice(0, 40) : c.title }
        : c
    );
    setConversations(updated);
    setInput("");

    const convo = updated.find((c) => c.id === current.id)!;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor: convo.vendor,
        model: convo.modelId,
        messages: convo.messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: convo.temperature,
        top_p: convo.topP,
        max_tokens: convo.maxTokens,
      }),
    });
    const data = await res.json();

    const assistantMsg: ChatMessage = {
      id: nanoid(),
      role: "assistant",
      content: data?.content || "(No response)",
      createdAt: Date.now(),
    };
    setConversations((prev) => prev.map((c) => (c.id === current.id ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: Date.now() } : c)));
    setIsSending(false);
  }

  function updateControls(next: Partial<ControlsState>) {
    setControls((c) => ({ ...c, ...next }));
    if (current) {
      setConversations((prev) => prev.map((cv) => (cv.id === current.id ? { ...cv, ...next } as any : cv)));
    }
  }

  function removeConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (id === currentId) setCurrentId(conversations[1]?.id ?? "");
  }

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [current?.messages.length]);

  return (
    <div className="flex flex-1 min-h-0">
      <aside className="w-72 bg-surface border-r border-slate-800 p-3 flex flex-col gap-3">
        <button className="btn-primary" onClick={() => createConversation()}>New Chat</button>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {conversations.map((c) => (
            <button key={c.id} className={`text-left p-3 rounded-lg border ${c.id===currentId?"border-primary bg-muted":"border-slate-800 bg-surface hover:bg-muted"}`} onClick={() => setCurrentId(c.id)}>
              <div className="text-sm font-medium truncate">{c.title}</div>
              <div className="text-xs text-slate-400">{c.vendor} ? {c.modelId}</div>
              <div className="mt-2 text-xs text-slate-500">{new Date(c.updatedAt).toLocaleString()}</div>
              <div className="mt-2"><button className="text-xs text-red-400" onClick={(e)=>{e.stopPropagation(); removeConversation(c.id);}}>Delete</button></div>
            </button>
          ))}
        </div>
        <div>
          <AppsPanel onInsert={(text)=> sendMessage(text)} />
        </div>
      </aside>
      <main className="flex-1 p-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="xl:col-span-2 card p-4 flex flex-col min-h-[60vh]">
          <div className="flex-1 overflow-y-auto">
            {!current && <div className="text-slate-400">Start a new chat to begin.</div>}
            {current && (
              <div className="space-y-4">
                {current.messages.map((m) => (
                  <div key={m.id} className={`p-3 rounded-lg ${m.role === "user" ? "bg-muted" : m.role === "system" ? "bg-surface border border-slate-700" : "bg-surface"}`}>
                    <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">{m.role}</div>
                    <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          <div className="mt-3">
            <form onSubmit={(e)=>{e.preventDefault(); sendMessage();}} className="flex gap-2">
              <input className="input-base flex-1" placeholder="Type your message..." value={input} onChange={(e)=> setInput(e.target.value)} />
              <button className="btn-primary" disabled={isSending}>{isSending?"Sending...":"Send"}</button>
            </form>
          </div>
        </section>
        <section className="card p-4 h-fit">
          <VendorModelControls state={controls} onChange={updateControls} />
        </section>
      </main>
    </div>
  );
}
