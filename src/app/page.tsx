import { ChatUI } from "@/components/ChatUI";

export default function Page() {
  return (
    <div className="flex-1">
      <header className="border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="font-semibold">Agentic Chat ? Aferi??o</div>
        <a className="text-sm text-slate-400 hover:text-slate-200" href="https://vercel.com" target="_blank" rel="noreferrer">Deployed on Vercel</a>
      </header>
      <ChatUI />
    </div>
  );
}
