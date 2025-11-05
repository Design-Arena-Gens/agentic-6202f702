export type Vendor = "openai" | "anthropic" | "google" | "azure";

export type ChatModel = {
  id: string;
  label: string;
  vendor: Vendor;
  contextWindow?: number;
};

export type ChatMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  createdAt: number;
};

export type Conversation = {
  id: string;
  title: string;
  modelId: string;
  vendor: Vendor;
  temperature: number;
  topP?: number;
  maxTokens?: number;
  systemPrompt?: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

export type ChatRequest = {
  vendor: Vendor;
  model: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
};

export type ChatResponse = {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  finishReason?: string;
};
