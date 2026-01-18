import type { ReactNode } from 'react';

const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <div className="max-w-5xl w-full grid md:grid-cols-[1.2fr,1fr] gap-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/30 via-sky-500/20 to-slate-900 border border-slate-800 p-8 shadow-[0_0_80px_rgba(37,99,235,0.35)]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.35),_transparent_55%)]" />
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/60 px-3 py-1 text-xs font-medium text-sky-300 border border-slate-700/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live AI workspace
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            VistaConvo<span className="text-sky-400">.ai</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-md">
            Orchestrate projects, craft prompts, and converse with AI in a focused, dark workspace built for builders.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="px-2 py-1 rounded-full bg-slate-900/70 border border-slate-700/60">MERN</span>
            <span className="px-2 py-1 rounded-full bg-slate-900/70 border border-slate-700/60">JWT Auth</span>
            <span className="px-2 py-1 rounded-full bg-slate-900/70 border border-slate-700/60">OpenAI</span>
          </div>
        </div>
      </div>
      <div className="rounded-3xl bg-slate-950/70 border border-slate-800 p-8 shadow-xl backdrop-blur">
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;