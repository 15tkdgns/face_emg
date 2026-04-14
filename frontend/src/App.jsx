import { useState } from 'react'
import AnalyzeTab    from './components/AnalyzeTab'
import ModelCompareTab from './components/ModelCompareTab'
import PipelineTab   from './components/PipelineTab'
import RealtimeTab   from './components/RealtimeTab'

const TABS = [
  {
    id: 'realtime',
    label: '실시간',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
  },
  {
    id: 'analyze',
    label: '분석',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    ),
  },
  {
    id: 'models',
    label: '성능',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
      </svg>
    ),
  },
  {
    id: 'pipeline',
    label: '파이프라인',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
  },
]

const TAB_HEADER = {
  realtime: { title: '실시간 AI', sub: 'Real-time Detection' },
  analyze:  { title: 'EmotionAI', sub: 'Face Emotion Recognition' },
  models:   { title: '모델 비교', sub: 'Performance Benchmark' },
  pipeline: { title: '파이프라인', sub: 'Data Pipeline' },
}

export default function App() {
  const [tab, setTab] = useState('realtime')

  const header = TAB_HEADER[tab]

  return (
    <div className="flex flex-col h-[100dvh] max-w-[480px] mx-auto relative overflow-hidden animated-bg">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-64 h-64 rounded-full bg-[#7C65F6]/10 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/2 -right-32 w-48 h-48 rounded-full bg-[#A78BFA]/8 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/4 w-56 h-56 rounded-full bg-[#6366f1]/8 blur-[90px]" />

      {/* Header */}
      <header className="relative z-10 px-5 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold gradient-text tracking-tight">
            {header.title}
          </h1>
          <p className="text-[10px] text-muted-foreground/60 font-medium mt-0.5 tracking-wide uppercase">
            {header.sub}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C65F6] to-[#A78BFA] flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-[#7C65F6]/20">
          AI
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-24 hide-scrollbar relative z-10">
        {tab === 'realtime'  && <RealtimeTab />}
        {tab === 'analyze'   && <AnalyzeTab />}
        {tab === 'models'    && <ModelCompareTab />}
        {tab === 'pipeline'  && <PipelineTab />}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[100] px-4 pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
        <div className="glass rounded-2xl flex items-stretch h-14 glow-primary">
          {TABS.map(t => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 bg-transparent border-none cursor-pointer text-[10px] font-semibold transition-all duration-300 relative ${
                  active ? 'text-[#A78BFA]' : 'text-muted-foreground/50 hover:text-muted-foreground'
                }`}
                onClick={() => setTab(t.id)}
              >
                {active && (
                  <div className="absolute -top-0.5 w-6 h-0.5 rounded-full bg-gradient-to-r from-[#7C65F6] to-[#A78BFA]" />
                )}
                <div className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
                  {t.icon}
                </div>
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
