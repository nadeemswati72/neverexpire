import { useEffect, useState } from 'react'

const STEPS = [
  { icon: '📷', text: 'Reading document image' },
  { icon: '🔍', text: 'Detecting document type' },
  { icon: '📅', text: 'Extracting expiry dates' },
  { icon: '🔢', text: 'Reading document number' },
  { icon: '✨', text: 'Finalising extraction' },
]

export default function AiExtractingAnimation({ filename }: { filename?: string }) {
  const [activeStep, setActiveStep] = useState(0)
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setActiveStep(s => (s + 1) % STEPS.length)
    }, 2200)
    const dotTimer = setInterval(() => {
      setDots(d => d.length >= 3 ? '.' : d + '.')
    }, 500)
    return () => { clearInterval(stepTimer); clearInterval(dotTimer) }
  }, [])

  return (
    <div style={{ padding: '28px 20px', textAlign: 'center' }}>
      <style>{`
        @keyframes ne-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52,201,186,0.5); }
          50% { transform: scale(1.06); box-shadow: 0 0 0 14px rgba(52,201,186,0); }
        }
        @keyframes ne-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ne-scan {
          0% { top: 8%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 88%; opacity: 0; }
        }
        @keyframes ne-step-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ne-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      {/* Main orb */}
      <div style={{ position: 'relative', width: 110, height: 110, margin: '0 auto 28px' }}>
        {/* Outer spinning ring */}
        <div style={{
          position: 'absolute', inset: -10,
          borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: '#34c9ba',
          borderRightColor: 'rgba(52,201,186,0.3)',
          animation: 'ne-spin 1.2s linear infinite',
        }} />
        {/* Second ring opposite */}
        <div style={{
          position: 'absolute', inset: -18,
          borderRadius: '50%',
          border: '2px solid transparent',
          borderBottomColor: 'rgba(52,201,186,0.5)',
          borderLeftColor: 'rgba(52,201,186,0.2)',
          animation: 'ne-spin 2s linear infinite reverse',
        }} />
        {/* Core circle */}
        <div style={{
          width: 110, height: 110, borderRadius: '50%',
          background: 'linear-gradient(135deg, #15203a 0%, #1e2d50 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40,
          animation: 'ne-pulse 2s ease-in-out infinite',
          position: 'relative', overflow: 'hidden',
          border: '2px solid rgba(52,201,186,0.4)',
        }}>
          🤖
          {/* Scan line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, transparent 0%, rgba(52,201,186,0.9) 40%, #34c9ba 50%, rgba(52,201,186,0.9) 60%, transparent 100%)',
            animation: 'ne-scan 1.8s ease-in-out infinite',
            borderRadius: 2,
          }} />
        </div>
      </div>

      {/* Title */}
      <div style={{ fontSize: 18, fontWeight: 800, color: '#15203a', marginBottom: 4 }}>
        Claude AI is reading your document{dots}
      </div>
      <div style={{ fontSize: 12, color: '#8a9ab5', marginBottom: 24 }}>
        {filename ? `📎 ${filename.length > 40 ? filename.slice(0, 37) + '…' : filename}` : 'Processing upload…'}
      </div>

      {/* Active step */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: 'rgba(52,201,186,0.1)',
        border: '1px solid rgba(52,201,186,0.3)',
        borderRadius: 99, padding: '10px 20px',
        marginBottom: 24,
        animation: 'ne-step-in 0.3s ease-out',
        key: activeStep,
      }}>
        <span style={{ fontSize: 20 }}>{STEPS[activeStep].icon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#22a99c' }}>{STEPS[activeStep].text}</span>
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === activeStep ? 24 : 8,
            height: 8, borderRadius: 99,
            background: i === activeStep ? '#34c9ba' : 'rgba(30,45,80,0.12)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background: 'rgba(30,45,80,0.08)', borderRadius: 99, height: 4, overflow: 'hidden', maxWidth: 280, margin: '0 auto 16px' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #34c9ba, #22a99c)',
          borderRadius: 99,
          animation: 'ne-bar 11s linear forwards',
          width: '0%',
        }} />
      </div>

      <div style={{ fontSize: 11, color: '#b0bfd0' }}>Powered by Claude AI · Usually takes 5–15 seconds</div>
    </div>
  )
}
