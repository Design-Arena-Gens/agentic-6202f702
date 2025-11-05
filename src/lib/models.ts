import { ChatModel } from "./types";

export const MODELS: ChatModel[] = [
  { id: "gpt-4o-mini", label: "OpenAI GPT-4o Mini", vendor: "openai" },
  { id: "gpt-4o", label: "OpenAI GPT-4o", vendor: "openai" },
  { id: "o4-mini", label: "OpenAI o4-mini", vendor: "openai" },
  { id: "claude-3-5-sonnet-latest", label: "Anthropic Claude 3.5 Sonnet", vendor: "anthropic" },
  { id: "claude-3-5-haiku-latest", label: "Anthropic Claude 3.5 Haiku", vendor: "anthropic" },
  { id: "gemini-1.5-pro", label: "Google Gemini 1.5 Pro", vendor: "google" },
  { id: "gemini-1.5-flash", label: "Google Gemini 1.5 Flash", vendor: "google" },
  { id: "gpt-4o-mini", label: "Azure OpenAI GPT-4o Mini", vendor: "azure" },
];
