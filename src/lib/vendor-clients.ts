import { ChatRequest, ChatResponse } from "./types";

function env(name: string): string | undefined {
  return process.env[name];
}

export async function callVendor(req: ChatRequest): Promise<ChatResponse> {
  switch (req.vendor) {
    case "openai":
      return callOpenAI(req);
    case "anthropic":
      return callAnthropic(req);
    case "google":
      return callGoogle(req);
    case "azure":
      return callAzureOpenAI(req);
    default:
      throw new Error("Unknown vendor");
  }
}

async function callOpenAI(req: ChatRequest): Promise<ChatResponse> {
  const apiKey = env("OPENAI_API_KEY");
  if (!apiKey) {
    return { content: "[OpenAI] API key not configured on server." };
  }
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: req.model,
      messages: req.messages,
      temperature: req.temperature ?? 0.6,
      top_p: req.top_p ?? 1,
      max_tokens: req.max_tokens ?? 1024,
    }),
  });
  if (!r.ok) {
    const text = await r.text();
    return { content: `OpenAI error: ${text}` };
  }
  const data = await r.json();
  const choice = data.choices?.[0];
  return {
    content: choice?.message?.content ?? "",
    usage: {
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      totalTokens: data.usage?.total_tokens,
    },
    finishReason: choice?.finish_reason,
  };
}

async function callAnthropic(req: ChatRequest): Promise<ChatResponse> {
  const apiKey = env("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return { content: "[Anthropic] API key not configured on server." };
  }
  const system = req.messages.find((m) => m.role === "system")?.content;
  const messages = req.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: req.model,
      system,
      messages,
      temperature: req.temperature ?? 0.6,
      max_tokens: req.max_tokens ?? 1024,
    }),
  });
  if (!r.ok) {
    const text = await r.text();
    return { content: `Anthropic error: ${text}` };
  }
  const data = await r.json();
  const txt = data.content?.[0]?.text ?? "";
  return { content: txt };
}

async function callGoogle(req: ChatRequest): Promise<ChatResponse> {
  const apiKey = env("GOOGLE_API_KEY");
  if (!apiKey) {
    return { content: "[Google] API key not configured on server." };
  }
  const system = req.messages.find((m) => m.role === "system")?.content;
  const contents = [
    ... (system ? [{ role: "user", parts: [{ text: `System: ${system}` }] }] : []),
    ...req.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
  ];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${req.model}:generateContent?key=${apiKey}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: req.temperature ?? 0.6,
        topP: req.top_p ?? 1,
        maxOutputTokens: req.max_tokens ?? 1024,
      },
    }),
  });
  if (!r.ok) {
    const text = await r.text();
    return { content: `Google error: ${text}` };
  }
  const data = await r.json();
  const txt = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return { content: txt };
}

async function callAzureOpenAI(req: ChatRequest): Promise<ChatResponse> {
  const endpoint = env("AZURE_OPENAI_ENDPOINT");
  const apiKey = env("AZURE_OPENAI_API_KEY");
  const deployment = env("AZURE_OPENAI_DEPLOYMENT") || req.model;
  if (!endpoint || !apiKey) {
    return { content: "[Azure OpenAI] API not configured on server." };
  }
  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      messages: req.messages,
      temperature: req.temperature ?? 0.6,
      top_p: req.top_p ?? 1,
      max_tokens: req.max_tokens ?? 1024,
    }),
  });
  if (!r.ok) {
    const text = await r.text();
    return { content: `Azure OpenAI error: ${text}` };
  }
  const data = await r.json();
  const choice = data.choices?.[0];
  return { content: choice?.message?.content ?? "" };
}
