import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callVendor } from "@/lib/vendor-clients";
import { ChatRequest } from "@/lib/types";

const schema = z.object({
  vendor: z.enum(["openai", "anthropic", "google", "azure"]),
  model: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    })
  ),
  temperature: z.number().optional(),
  top_p: z.number().optional(),
  max_tokens: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data as ChatRequest;
    const result = await callVendor(data);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
