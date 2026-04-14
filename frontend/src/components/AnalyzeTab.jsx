import { useRef, useState, useCallback } from 'react'
import { api } from '../api'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

const EMOTIONS_4 = ['기쁨', '당황', '분노', '상처']
const EMOTIONS_7 = ['기쁨', '당황', '분노', '불안', '상처', '슬픔', '중립']
const EMOTION_EMOJI = { 기쁨: '😄', 당황: '😳', 분노: '😡', 상처: '😢', 불안: '😨', 슬픔: '😿', 중립: '😐' }
const EMOTION_COLOR = { 기쁨: '#FBBF24', 당황: '#FB923C', 분노: '#F87171', 상처: '#A78BFA', 불안: '#34D399', 슬픔: '#818CF8', 중립: '#94A3B8' }
const EMOTION_GLOW  = { 기쁨: 'shadow-amber-500/20', 당황: 'shadow-orange-500/20', 분노: 'shadow-red-500/20', 상처: 'shadow-violet-500/20', 불안: 'shadow-emerald-500/20', 슬픔: 'shadow-indigo-500/20', 중립: 'shadow-slate-500/20' }

const MODELS = [
  { id: 'resnet18',                  label: 'ResNet-18 (7cls)',        color: '#22C55E', classes: 7 },
  { id: 'densenet121',               label: 'DenseNet-121',            color: '#60A5FA', classes: 4 },
  { id: 'densenet121_clahe_edge',    label: 'DenseNet-121 + CE',       color: '#34D399', classes: 4 },
  { id: 'efficientnet_b0',           label: 'EfficientNet-B0',         color: '#FB923C', classes: 4 },
  { id: 'efficientnet_b0_clahe_edge',label: 'EfficientNet-B0 + CE',    color: '#C084FC', classes: 4 },
]

function ConfidenceBar({ emotion, score, highlight }) {
  const color = EMOTION_COLOR[emotion] || '#A78BFA'
  return (
    <div className="flex items-center gap-3 mb-2.5 group">
      <span className="w-14 text-xs font-medium shrink-0 flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
        <span className="text-sm">{EMOTION_EMOJI[emotion]}</span>
        <span>{emotion}</span>
      </span>
      <div className="flex-1 h-2.5 rounded-full bg-white/[0.04] overflow-hidden relative">
        <div 
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ 
            width: `${(score * 100).toFixed(1)}%`, 
            background: `linear-gradient(90deg, ${color}90, ${color})`,
            boxShadow: highlight ? `0 0 12px ${color}50` : 'none',
            opacity: highlight ? 1 : 0.35
          }}
        />
      </div>
      <span className="w-12 text-[11px] text-right text-muted-foreground shrink-0 font-mono tabular-nums">
        {(score * 100).toFixed(1)}%
      </span>
    </div>
  )
}

function SingleResult({ result }) {
  const { emotion, emoji, confidence, scores, infer_ms } = result
  const color = EMOTION_COLOR[emotion] || '#A78BFA'
  const glow = EMOTION_GLOW[emotion] || ''
  
  return (
    <Card className={`glass glow-neon animate-slide-up overflow-hidden`}>
      <CardContent className="p-0">
        {/* Hero result */}
        <div className="relative text-center py-8 px-6 overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 50% 30%, ${color}40, transparent 70%)` }} />
          
          <div className="relative z-10">
            <div className="text-7xl mb-3 drop-shadow-2xl" style={{ filter: `drop-shadow(0 0 20px ${color}40)` }}>{emoji}</div>
            <div className="text-3xl font-black tracking-tight" style={{ color }}>{emotion}</div>
            <div className="mt-3 inline-flex items-center gap-2 bg-white/[0.06] rounded-full px-4 py-1.5 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
              신뢰도 <span className="font-bold text-foreground">{(confidence * 100).toFixed(1)}%</span>
              {infer_ms && <span className="ml-1 opacity-50">• {infer_ms}ms</span>}
            </div>
          </div>
        </div>
        
        {/* Scores */}
        <div className="px-5 pb-5 pt-2 border-t border-white/[0.04]">
          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-3">Emotion Scores</h4>
          {Object.keys(scores).map(e => (
            <ConfidenceBar key={e} emotion={e} score={scores[e] ?? 0} highlight={e === emotion} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CompareResult({ results }) {
  return (
    <div className="space-y-3 animate-slide-up">
      <div className="flex items-center justify-between px-1 mb-1">
        <h3 className="text-sm font-bold text-foreground">앙상블 비교 결과</h3>
        <Badge className="bg-[#7C65F6]/15 text-[#A78BFA] border-[#7C65F6]/20 text-[10px]">{results.length} Models</Badge>
      </div>
      
      {results.map((r, idx) => (
        <Card key={r.model_id} className="glass overflow-hidden animate-slide-up" style={{ animationDelay: `${idx * 80}ms` }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-8 rounded-full" style={{ background: `linear-gradient(180deg, ${r.color}, ${r.color}60)` }} />
                <div>
                  <span className="font-semibold text-sm text-foreground">{r.model_label}</span>
                  <div className="text-[10px] text-muted-foreground font-mono">{r.infer_ms}ms inference</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black" style={{ color: EMOTION_COLOR[r.emotion] }}>
                  {r.emoji}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-3 rounded-xl bg-white/[0.03] p-2.5">
              <span className="text-lg font-extrabold" style={{ color: EMOTION_COLOR[r.emotion] }}>{r.emotion}</span>
              <div className="flex-1" />
              <span className="text-base font-bold text-foreground/80 font-mono">{(r.confidence * 100).toFixed(1)}%</span>
            </div>
            
            {EMOTIONS.map(e => (
              <ConfidenceBar key={e} emotion={e} score={r.scores[e] ?? 0} highlight={e === r.emotion} />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function AnalyzeTab() {
  const [mode, setMode]           = useState('upload')
  const [compareMode, setCompare] = useState(false)
  const [selectedModel, setModel] = useState('resnet18')
  const [preview, setPreview]     = useState(null)
  const [file, setFile]           = useState(null)
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState(null)
  const [error, setError]         = useState(null)
  const [faceB64, setFaceB64]     = useState(null)
  const [faceDetected, setFaceDetected] = useState(null)

  const videoRef    = useRef(null)
  const streamRef   = useRef(null)
  const [camActive, setCamActive] = useState(false)

  const onFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError(null)
    setFaceB64(null)
  }

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCamActive(true)
      setResult(null)
      setError(null)
    } catch (e) {
      setError('카메라 접근 권한이 필요합니다.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCamActive(false)
  }, [])

  const captureCamera = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      setFile(blob)
      setPreview(canvas.toDataURL('image/jpeg'))
      setResult(null)
      setFaceB64(null)
      stopCamera()
    }, 'image/jpeg', 0.92)
  }, [stopCamera])

  const switchMode = (m) => {
    setMode(m)
    setResult(null)
    setError(null)
    setPreview(null)
    setFile(null)
    setFaceB64(null)
    if (m !== 'camera' && camActive) stopCamera()
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    setFaceB64(null)
    try {
      let res
      if (compareMode) {
        res = await api.analyzeCompare(file)
        setResult({ type: 'compare', data: res.data.results })
        setFaceB64(res.data.face_b64)
        setFaceDetected(res.data.face_detected)
      } else {
        res = await api.analyze(file, selectedModel)
        setResult({ type: 'single', data: res.data })
        setFaceB64(res.data.face_b64)
        setFaceDetected(res.data.face_detected)
      }
    } catch (e) {
      if (e?.code === 'ERR_NETWORK' || e?.message === 'Network Error') {
        setError('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.')
      } else if (e?.response?.status === 503) {
        setError('모델이 아직 로딩 중입니다. 잠시 후 다시 시도하세요.')
      } else {
        const detail = e?.response?.data?.detail
        setError(detail ? `오류: ${detail}` : `서버 오류 (${e?.response?.status ?? 'unknown'})`)
      }
      console.error('[analyze error]', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-5 py-4 space-y-5">
      {/* Mode Switcher */}
      <div className="glass rounded-2xl p-1 flex gap-1">
        {[
          { key: 'upload', label: '📁 이미지 업로드' },
          { key: 'camera', label: '📷 실시간 웹캠' },
        ].map(m => (
          <button
            key={m.key}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 ${
              mode === m.key 
                ? 'bg-[#7C65F6]/20 text-[#A78BFA] shadow-inner' 
                : 'text-muted-foreground/50 hover:text-muted-foreground'
            }`}
            onClick={() => switchMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Media Viewer */}
      <Card className="glass overflow-hidden border-0 glow-neon">
        <div className="aspect-[4/3] flex items-center justify-center relative">
          {mode === 'camera' ? (
            camActive ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
            ) : preview ? (
              <img src={preview} alt="캡처" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground/30">
                <div className="text-6xl">📷</div>
                <span className="text-xs font-medium tracking-wide">CAMERA READY</span>
              </div>
            )
          ) : preview ? (
            <img src={preview} alt="업로드" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground/30">
              <div className="text-6xl">🖼️</div>
              <span className="text-xs font-medium tracking-wide">DROP IMAGE HERE</span>
            </div>
          )}
          
          {/* Overlay gradient */}
          {(preview || camActive) && (
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a]/60 via-transparent to-transparent pointer-events-none" />
          )}
        </div>
      </Card>

      {/* Camera Controls */}
      {mode === 'camera' && (
        <div className="flex gap-2">
          {!camActive ? (
            <Button className="w-full bg-[#7C65F6] hover:bg-[#6C55E6] text-white font-bold h-12 rounded-xl shadow-lg shadow-[#7C65F6]/25" onClick={startCamera}>
              카메라 켜기
            </Button>
          ) : (
            <>
              <Button className="flex-[2] bg-[#7C65F6] hover:bg-[#6C55E6] text-white font-bold h-12 rounded-xl shadow-lg shadow-[#7C65F6]/25" onClick={captureCamera}>
                📸 촬영
              </Button>
              <Button variant="outline" className="flex-1 glass border-white/10 text-muted-foreground h-12 rounded-xl" onClick={stopCamera}>
                취소
              </Button>
            </>
          )}
        </div>
      )}

      {/* File Upload */}
      {mode === 'upload' && (
        <div>
          <input id="imgUpload" type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          <Button asChild className={`w-full h-12 rounded-xl font-semibold ${preview ? 'glass border-white/10 text-muted-foreground hover:text-foreground' : 'bg-white/[0.06] border border-dashed border-white/10 text-muted-foreground hover:border-[#7C65F6]/40 hover:text-[#A78BFA]'}`}>
            <label htmlFor="imgUpload" className="cursor-pointer">
              {preview ? '🔄 다른 이미지 선택' : '📂 이미지 선택하기'}
            </label>
          </Button>
        </div>
      )}

      {/* Analysis Options */}
      <div className="space-y-3">
        <div className="glass rounded-2xl p-1 flex gap-1">
          <button
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${!compareMode ? 'bg-[#7C65F6]/20 text-[#A78BFA]' : 'text-muted-foreground/50'}`}
            onClick={() => setCompare(false)}
          >단일 모델</button>
          <button
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${compareMode ? 'bg-[#7C65F6]/20 text-[#A78BFA]' : 'text-muted-foreground/50'}`}
            onClick={() => setCompare(true)}
          >M-Ensemble 비교</button>
        </div>

        {!compareMode && (
          <select
            value={selectedModel}
            onChange={e => setModel(e.target.value)}
            className="w-full px-4 py-3 rounded-xl glass border-white/[0.08] text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-[#7C65F6]/50 appearance-none cursor-pointer"
          >
            {MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        )}

        <Button
          className="w-full h-14 rounded-2xl font-bold text-base bg-gradient-to-r from-[#7C65F6] to-[#A78BFA] hover:from-[#6C55E6] hover:to-[#9B7BFA] text-white shadow-xl shadow-[#7C65F6]/30 transition-all duration-300 disabled:opacity-30 disabled:shadow-none"
          disabled={!file || loading}
          onClick={analyze}
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              <span>추론 중...</span>
            </span>
          ) : '🚀 AI 분석 시작'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="animate-slide-up rounded-xl bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Face Detection Status */}
      {faceDetected !== null && (
        <div className={`animate-fade-in rounded-xl p-3 text-xs font-medium border ${
          faceDetected 
            ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400' 
            : 'bg-amber-500/10 border-amber-500/15 text-amber-400'
        }`}>
          {faceDetected ? '👀 얼굴 영역을 정확히 포착했습니다' : '⚠️ 얼굴 미검출 — 중앙 크롭으로 대체 분석'}
        </div>
      )}

      {/* Face Crop Preview */}
      {faceB64 && (
        <div className="animate-fade-in">
          <p className="text-[10px] font-semibold text-muted-foreground/50 mb-2 uppercase tracking-widest">Detected Region</p>
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
            <img src={`data:image/jpeg;base64,${faceB64}`} alt="얼굴" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125" />
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="pt-2">
          {result.type === 'single'
            ? <SingleResult result={result.data} />
            : <CompareResult results={result.data} />}
        </div>
      )}
    </div>
  )
}
