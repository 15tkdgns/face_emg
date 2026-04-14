import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../api'

// ── 감정 정의 (백엔드 7클래스와 매핑) ─────────────────────────────
// 백엔드 EMOTIONS_7 = ['기쁨', '당황', '분노', '불안', '상처', '슬픔', '중립']
const EMOTIONS = [
  { key: '기쁨', label: '기쁨',   emoji: '😄', color: '#FBBF24', bg: 'bg-amber-400',   bgLight: 'bg-amber-100' },
  { key: '당황', label: '당황',   emoji: '😳', color: '#A78BFA', bg: 'bg-violet-400',  bgLight: 'bg-violet-100' },
  { key: '분노', label: '분노',   emoji: '😡', color: '#F87171', bg: 'bg-red-400',     bgLight: 'bg-red-100' },
  { key: '불안', label: '불안',   emoji: '😨', color: '#34D399', bg: 'bg-emerald-400', bgLight: 'bg-emerald-100' },
  { key: '상처', label: '상처',   emoji: '😢', color: '#60A5FA', bg: 'bg-blue-400',    bgLight: 'bg-blue-100' },
  { key: '슬픔', label: '슬픔',   emoji: '😿', color: '#818CF8', bg: 'bg-indigo-400',  bgLight: 'bg-indigo-100' },
  { key: '중립', label: '중립',   emoji: '😐', color: '#94A3B8', bg: 'bg-slate-400',   bgLight: 'bg-slate-100' },
]

const ZERO_SCORES = EMOTIONS.reduce((a, e) => ({ ...a, [e.key]: 0 }), {})

// ── 개별 감정 Progress Bar ────────────────────────────────────────
function EmotionBar({ emotion, value, rank }) {
  const isDominant = rank <= 1
  const pct = Math.round(value * 100)

  return (
    <div className="flex items-center gap-3 py-1.5 group">
      <motion.div
        className="text-xl w-7 text-center shrink-0"
        animate={{ scale: isDominant ? [1, 1.15, 1] : 1 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {emotion.emoji}
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs font-semibold text-slate-700">{emotion.label}</span>
          <motion.span
            className="text-xs font-bold tabular-nums text-slate-500"
            key={pct}
            initial={{ opacity: 0.5, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {pct}%
          </motion.span>
        </div>

        <div className={`h-3 w-full rounded-full overflow-hidden ${emotion.bgLight}`}>
          <motion.div
            className={`h-full rounded-full ${emotion.bg}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              boxShadow: isDominant ? `0 0 12px ${emotion.color}60` : 'none',
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────
export default function RealtimeTab() {
  const [cameraOn, setCameraOn]       = useState(false)
  const [scores, setScores]           = useState(ZERO_SCORES)
  const [inferMs, setInferMs]         = useState(null)
  const [error, setError]             = useState(null)
  const [modelInfo, setModelInfo]     = useState(null)
  const [selectedModel, setSelectedModel] = useState('resnet18')
  const [availableModels, setAvailableModels] = useState([])
  const [showModelPicker, setShowModelPicker] = useState(false)
  const selectedModelRef = useRef('resnet18')

  const intervalRef  = useRef(null)
  const videoRef     = useRef(null)
  const streamRef    = useRef(null)
  const canvasRef    = useRef(document.createElement('canvas'))
  const processingRef = useRef(false)

  // 로드 가능한 모델 목록 가져오기
  useEffect(() => {
    api.models().then(res => {
      const loaded = (res.data.models || []).filter(m => m.loaded)
      setAvailableModels(loaded)
      if (loaded.length > 0 && !loaded.find(m => m.id === selectedModel)) {
        setSelectedModel(loaded[0].id)
        selectedModelRef.current = loaded[0].id
      }
    }).catch(() => {})
  }, [])

  // selectedModel 변경 시 ref도 동기화
  useEffect(() => {
    selectedModelRef.current = selectedModel
  }, [selectedModel])

  // 순위 계산
  const sorted = [...EMOTIONS]
    .map(e => ({ key: e.key, value: scores[e.key] ?? 0 }))
    .sort((a, b) => b.value - a.value)
  const rankMap = {}
  sorted.forEach((s, i) => { rankMap[s.key] = i })

  const topEmotion = sorted[0]
  const topEmotionDef = EMOTIONS.find(e => e.key === topEmotion?.key)

  // ── 프레임 캡처 → API 호출 ──────────────────────────────────────
  const captureAndAnalyze = useCallback(async () => {
    if (processingRef.current) return // 이전 요청 아직 진행 중
    const video = videoRef.current
    if (!video || video.readyState < 2) return

    processingRef.current = true
    try {
      const canvas = canvasRef.current
      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d').drawImage(video, 0, 0)

      const imageB64 = canvas.toDataURL('image/jpeg', 0.7)
      const res = await api.analyzeBase64(imageB64, selectedModelRef.current)
      const data = res.data

      // scores는 { '기쁨': 0.95, '당황': 0.02, ... } 형태
      if (data.scores) {
        setScores(data.scores)
        setInferMs(data.infer_ms)
        setError(null)
        if (!modelInfo) {
          setModelInfo({
            model: data.model_id,
            classes: data.num_classes,
          })
        }
      }
    } catch (e) {
      if (e?.code === 'ERR_NETWORK') {
        setError('백엔드 서버에 연결할 수 없습니다')
      }
      console.error('[realtime] analyze error:', e)
    } finally {
      processingRef.current = false
    }
  }, [modelInfo])

  // 카메라 시작
  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      streamRef.current = stream
      setCameraOn(true)
    } catch (e) {
      setError('카메라 접근 권한이 필요합니다')
      console.error('[realtime] camera error:', e)
    }
  }, [])

  // cameraOn 상태 변경 시 video에 stream 연결
  useEffect(() => {
    if (cameraOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})

      // 1초마다 프레임 캡처 → AI 분석
      intervalRef.current = setInterval(() => {
        captureAndAnalyze()
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [cameraOn, captureAndAnalyze])

  // 카메라 정지
  const stopCamera = useCallback(() => {
    setCameraOn(false)
    clearInterval(intervalRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setScores(ZERO_SCORES)
    setInferMs(null)
  }, [])

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <div className="px-4 py-5 flex flex-col items-center">
      {/* Card Container */}
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl shadow-black/10 overflow-hidden border border-slate-100">

        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight">실시간 감정 분석</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-slate-400 font-medium">Real-time Emotion Recognition</p>
              {modelInfo && (
                <span className="text-[8px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded-full border border-emerald-100">
                  {modelInfo.model} · {modelInfo.classes}cls
                </span>
              )}
            </div>
          </div>
          <AnimatePresence>
            {cameraOn && topEmotionDef && topEmotion.value > 0.05 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-1.5 bg-slate-50 rounded-full px-3 py-1.5 border border-slate-100"
              >
                <span className="text-lg">{topEmotionDef.emoji}</span>
                <span className="text-xs font-bold" style={{ color: topEmotionDef.color }}>
                  {topEmotionDef.label}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Webcam Area */}
        <div className="px-4 pb-3">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900">
            {/* video는 항상 DOM에 존재 — cameraOn에 따라 보이기/숨기기 */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover -scale-x-100 ${
                cameraOn ? 'block' : 'hidden'
              }`}
            />

            {cameraOn ? (
              <>
                {/* Live indicator */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 z-10">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-red-500"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  <span className="text-white text-[10px] font-bold tracking-wider">LIVE</span>
                </div>
                {/* Inference time */}
                {inferMs && (
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 z-10">
                    <span className="text-white/80 text-[10px] font-mono">{inferMs}ms</span>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <div className="text-5xl mb-3 opacity-30">📷</div>
                <p className="text-slate-400 text-sm font-medium">카메라가 꺼져 있습니다</p>
                <p className="text-slate-300 text-[10px] mt-1">아래 버튼을 눌러 시작하세요</p>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mb-3 rounded-xl bg-red-50 border border-red-100 p-3">
            <p className="text-red-500 text-xs font-medium">{error}</p>
          </div>
        )}

        {/* Emotion Bars */}
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emotion Analysis</h3>
            {cameraOn && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1"
              >
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] text-emerald-500 font-semibold">AI 분석중</span>
              </motion.div>
            )}
          </div>

          <div className="space-y-0.5">
            {EMOTIONS.map(emotion => (
              <EmotionBar
                key={emotion.key}
                emotion={emotion}
                value={scores[emotion.key] ?? 0}
                rank={rankMap[emotion.key]}
              />
            ))}
          </div>
        </div>

        {/* Model Selector */}
        {availableModels.length > 0 && (
          <div className="px-5 pb-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">AI Model</label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value)
                  setModelInfo(null) // 모델 변경 시 배지 초기화
                }}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition-all cursor-pointer"
              >
                {availableModels.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Camera Toggle */}
        <div className="px-5 pb-5 pt-2">
          <button
            onClick={cameraOn ? stopCamera : startCamera}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              cameraOn
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-[0.98]'
                : 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]'
            }`}
          >
            {cameraOn ? (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/><polygon points="23 7 16 12 23 17 23 7"/>
                  <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2.5"/>
                </svg>
                카메라 끄기
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/><polygon points="23 7 16 12 23 17 23 7"/>
                </svg>
                카메라 켜기
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-[9px] text-muted-foreground/30 mt-4 font-medium tracking-widest">
        EmotionAI · ResNet-18 · 7-class model
      </p>
    </div>
  )
}
