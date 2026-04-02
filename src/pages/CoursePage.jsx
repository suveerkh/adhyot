import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  HiOutlineArrowLeft, HiOutlineCheck, HiOutlineX,
  HiOutlineChevronDown, HiOutlineChevronUp,
  HiOutlineLightBulb, HiOutlineClipboardList, HiOutlineAcademicCap,
  HiOutlineStar, HiOutlineEye, HiOutlineKey,
  HiOutlineViewList, HiOutlineTable, HiOutlineChartBar, HiOutlineBookOpen,
  HiOutlineDocument, HiOutlineVideoCamera, HiOutlinePlus,
  HiOutlineCollection, HiOutlineSave, HiOutlineLockClosed,
} from 'react-icons/hi'
import supabase from '../supabaseClient'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-yaml'
import 'prism-themes/themes/prism-vsc-dark-plus.css'

// ─── Theme ────────────────────────────────────────────────────────────────────
const OG  = '#E8590C'
const OG2 = '#ff7c35'
const OG3 = '#c2410c'
const OGB = '#FFF3EC'
const OGL = '#fcd9c0'

// ─── Circle Progress ──────────────────────────────────────────────────────────
function CircleProgress({ pct = 0, size = 52, stroke = 4 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#2a2020" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={pct === 100 ? '#22c55e' : OG} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {pct === 100
          ? <HiOutlineCheck size={size * 0.3} style={{ color: '#22c55e' }} />
          : <span style={{ fontSize: size * 0.22, fontWeight: 700, color: pct > 0 ? OG : '#555', lineHeight: 1 }}>{pct}%</span>
        }
      </div>
    </div>
  )
}

// ─── Block renderers ──────────────────────────────────────────────────────────
function BlockTopics({ c }) {
  if (!c?.topics?.length) return null
  return (
    <div style={{ background: `linear-gradient(135deg, ${OGB}, #fff8f5)`, borderRadius: 14, padding: '20px 24px', border: `1.5px solid ${OGL}`, borderLeft: `5px solid ${OG}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <HiOutlineEye size={16} style={{ color: OG }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', fontFamily: "'Georgia', serif" }}>{c.intro || 'In this lesson, you will learn:'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
        {c.topics.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', background: '#fff', borderRadius: 9, border: `1px solid ${OGL}`, animation: `fadeUp 0.4s ease ${i * 0.07}s both` }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
            <span style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 500 }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BlockText({ c }) {
  if (!c?.html) return null
  return <div dangerouslySetInnerHTML={{ __html: c.html }} style={{ fontSize: 15, lineHeight: 1.85, color: '#1A1A1A', fontFamily: 'system-ui' }} className="prose-content" />
}

function BlockVideo({ c }) {
  const getEmbed = (url) => {
    if (!url) return null
    if (url.includes('youtube.com/watch')) return url.replace('watch?v=', 'embed/')
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/')
    if (url.includes('vimeo.com/')) return url.replace('vimeo.com/', 'player.vimeo.com/video/')
    return url
  }
  if (!c?.url) return null
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '16/9', background: '#000', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      {(c.url.includes('youtube') || c.url.includes('youtu.be') || c.url.includes('vimeo'))
        ? <iframe src={getEmbed(c.url)} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
        : <video src={c.url} controls style={{ width: '100%', height: '100%' }} />}
    </div>
  )
}

const CALLOUT_STYLES = {
  tip:       { icon: HiOutlineLightBulb, bg: OGB,       border: OGL,      text: OG3,       accent: OG       },
  note:      { icon: HiOutlineLightBulb, bg: '#fff8f5', border: '#fbbf87', text: '#92400e', accent: '#f97316' },
  warning:   { icon: HiOutlineStar,      bg: '#fffbeb', border: '#fcd34d', text: '#78350f', accent: '#d97706' },
  important: { icon: HiOutlineX,         bg: '#fef2f2', border: '#fca5a5', text: '#7f1d1d', accent: '#ef4444' },
}
function BlockCallout({ c }) {
  if (!c?.body) return null
  const s = CALLOUT_STYLES[c.variant] || CALLOUT_STYLES.tip
  return (
    <div style={{ padding: '16px 20px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, borderLeft: `4px solid ${s.accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <s.icon size={16} style={{ color: s.accent, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: s.text }}>{c.title || c.variant}</span>
      </div>
      <p style={{ fontSize: 14, color: s.text, margin: 0, lineHeight: 1.7 }}>{c.body}</p>
    </div>
  )
}

// ─── Prism ────────────────────────────────────────────────────────────────────
const PRISM_LANG_MAP = {
  javascript: 'javascript', typescript: 'typescript', python: 'python',
  java: 'java', csharp: 'csharp', bash: 'bash', sql: 'sql',
  html: 'markup', css: 'css', json: 'json', yaml: 'yaml',
  xml: 'markup', plaintext: 'plaintext',
}
function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function usePrismHighlight(code, language) {
  return useMemo(() => {
    if (!code) return ''
    const lang = PRISM_LANG_MAP[language] || 'plaintext'
    try {
      const grammar = Prism.languages[lang] || Prism.languages.plaintext
      return Prism.highlight(code, grammar, lang)
    } catch { return escapeHtml(code) }
  }, [code, language])
}
const LANG_COLORS = {
  javascript: '#f7df1e', typescript: '#3178c6', python: '#3572A5',
  java: '#b07219', csharp: '#178600', bash: '#89e051', sql: '#e38c00',
  html: '#e34c26', css: '#563d7c', json: '#292929', yaml: '#cb171e',
  xml: '#e34c26', plaintext: '#9ca3af',
}
function BlockCode({ c }) {
  const [copied, setCopied] = useState(false)
  const lang = PRISM_LANG_MAP[c?.language] || 'plaintext'
  const highlighted = usePrismHighlight(c?.code, c?.language)
  const dotColor = LANG_COLORS[c?.language] || '#9ca3af'
  const copy = () => { navigator.clipboard.writeText(c.code || ''); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  if (!c?.code) return null
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #1e293b', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
      <div style={{ background: '#1a1f2e', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #0f172a' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{c.language || 'code'}</span>
          {c.caption && <span style={{ fontSize: 11, color: '#475569', marginLeft: 4 }}>— {c.caption}</span>}
        </div>
        <button onClick={copy} style={{ fontSize: 11, fontWeight: 600, color: copied ? '#22c55e' : '#64748b', background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 5, padding: '3px 10px', cursor: 'pointer', transition: 'all 0.2s' }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className={`language-${lang}`} style={{ background: '#1e1e1e', margin: 0, padding: '18px 20px', overflowX: 'auto', fontSize: 13.5, lineHeight: 1.75, fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace" }}>
        <code className={`language-${lang}`} dangerouslySetInnerHTML={{ __html: highlighted || escapeHtml(c.code || '') }} style={{ fontFamily: 'inherit', fontSize: 'inherit', background: 'none', color: 'inherit' }} />
      </pre>
    </div>
  )
}

function BlockSteps({ c }) {
  if (!c?.steps?.length) return null
  return (
    <div>
      {c.title && <div style={{ fontSize: 16, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 20 }}>{c.title}</div>}
      {c.steps.map((step, i) => (
        <div key={step.id || i} style={{ display: 'flex', gap: 16, animation: `fadeUp 0.4s ease ${i * 0.08}s both` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px rgba(232,89,12,0.35)` }}>{i + 1}</div>
            {i < c.steps.length - 1 && <div style={{ width: 2, flexGrow: 1, minHeight: 20, background: `linear-gradient(180deg, ${OGL}, transparent)`, margin: '4px 0' }} />}
          </div>
          <div style={{ flex: 1, paddingBottom: i < c.steps.length - 1 ? 20 : 0, paddingTop: 6 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#08060d', marginBottom: step.body ? 5 : 0 }}>{step.heading}</div>
            {step.body && <div style={{ fontSize: 14, color: '#6b6375', lineHeight: 1.7 }}>{step.body}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

function BlockConcepts({ c }) {
  if (!c?.concepts?.length) return null
  return (
    <div>
      {c.title && <div style={{ fontSize: 16, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 16 }}>{c.title}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {c.concepts.map((con, i) => (
          <div key={con.id || i} style={{ background: OGB, borderRadius: 12, padding: '14px 16px', border: `1px solid ${OGL}`, borderLeft: `3px solid ${OG}`, animation: `fadeUp 0.4s ease ${i * 0.07}s both` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: OG, marginBottom: 6 }}>{con.term}</div>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{con.definition}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BlockComparison({ c }) {
  if (!c?.headers?.length) return null
  return (
    <div>
      {c.title && <div style={{ fontSize: 16, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 14 }}>{c.title}</div>}
      <div style={{ overflowX: 'auto', borderRadius: 12, border: `1.5px solid ${OGL}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: `linear-gradient(135deg, ${OG}, ${OG2})` }}>
              {c.headers.map((h, i) => <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#fff', minWidth: 130 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {(c.rows || []).map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : OGB }}>
                {row.map((cell, ci) => <td key={ci} style={{ padding: '11px 16px', borderBottom: `1px solid ${OGL}`, color: '#1A1A1A' }}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BlockTimeline({ c }) {
  if (!c?.items?.length) return null
  const stepColors = ['#E8590C', '#f97316', '#fb923c', '#c2410c', '#ea580c', '#f59e0b', '#d97706']
  return (
    <div>
      {c.title && <div style={{ fontSize: 16, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 20 }}>{c.title}</div>}
      {c.items.map((item, i) => (
        <div key={item.id || i} style={{ display: 'flex', gap: 18, alignItems: 'flex-start', animation: `fadeUp 0.4s ease ${i * 0.09}s both` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: stepColors[i % stepColors.length], color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${stepColors[i % stepColors.length]}50` }}>{i + 1}</div>
            {i < c.items.length - 1 && <div style={{ width: 2, height: 32, background: `linear-gradient(180deg, ${stepColors[i % stepColors.length]}, ${OGL})`, margin: '3px 0' }} />}
          </div>
          <div style={{ flex: 1, paddingTop: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#08060d' }}>{item.label}</span>
              {item.tag && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 100, background: OGB, color: OG, border: `1px solid ${OGL}` }}>{item.tag}</span>}
            </div>
            {item.description && <p style={{ fontSize: 13, color: '#6b6375', lineHeight: 1.6, margin: '5px 0 16px 0' }}>{item.description}</p>}
            {!item.description && <div style={{ height: 16 }} />}
          </div>
        </div>
      ))}
    </div>
  )
}

function BlockPDF({ c }) {
  if (!c?.url) return null
  return (
    <a href={c.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: OGB, borderRadius: 12, border: `1.5px solid ${OGL}`, textDecoration: 'none', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#ffe8d6'; e.currentTarget.style.borderColor = OG }}
      onMouseLeave={e => { e.currentTarget.style.background = OGB; e.currentTarget.style.borderColor = OGL }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 10, background: `linear-gradient(135deg, ${OG}, ${OG2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <HiOutlineBookOpen size={20} style={{ color: '#fff' }} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#08060d' }}>{c.description || 'Download Resource'}</div>
        <div style={{ fontSize: 12, color: OG, marginTop: 2 }}>Click to open →</div>
      </div>
    </a>
  )
}

function BlockSummary({ c }) {
  if (!c?.points?.length) return null
  return (
    <div style={{ background: `linear-gradient(135deg, ${OGB}, #fff8f5)`, borderRadius: 14, padding: '20px 24px', border: `1.5px solid ${OGL}`, borderLeft: `5px solid ${OG}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <HiOutlineStar size={18} style={{ color: OG }} />
        <span style={{ fontSize: 16, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif" }}>{c.title || 'Key Points to Remember'}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {c.points.map((pt, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', background: '#fff', borderRadius: 10, border: `1px solid ${OGL}`, animation: `fadeUp 0.4s ease ${i * 0.07}s both` }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
            <span style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 1.65 }}>{pt}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Quiz Block ───────────────────────────────────────────────────────────────
function BlockQuiz({ c, isAssessment, onComplete }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState([])
  const [done, setDone] = useState(false)
  const [animOut, setAnimOut] = useState(false)

  const questions = c?.questions || []
  const q = questions[current]
  const color = isAssessment ? '#dc2626' : '#7c3aed'
  const colorBg = isAssessment ? '#fef2f2' : '#f5f3ff'
  const colorBorder = isAssessment ? '#fecaca' : '#ddd6fe'

  const submit = () => { if (selected === null) return; setRevealed(true) }

  const next = () => {
    const newAnswers = [...answers, { question: q.question, selected, correct: q.correct, isCorrect: selected === q.correct }]
    setAnimOut(true)
    setTimeout(() => {
      setAnimOut(false)
      if (current + 1 >= questions.length) {
        setAnswers(newAnswers)
        setDone(true)
        const score = Math.round((newAnswers.filter(a => a.isCorrect).length / questions.length) * 100)
        if (onComplete) onComplete(score >= (c.pass_score || 70), score)
      } else {
        setCurrent(current + 1); setSelected(null); setRevealed(false); setAnswers(newAnswers)
      }
    }, 350)
  }

  if (!questions.length) return null
  const score = done ? Math.round((answers.filter(a => a.isCorrect).length / questions.length) * 100) : 0
  const passed = score >= (c.pass_score || 70)

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: `1.5px solid ${colorBorder}`, boxShadow: `0 4px 24px ${color}15` }}>
      <div style={{ background: color, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isAssessment ? <HiOutlineAcademicCap size={18} style={{ color: '#fff' }} /> : <HiOutlineClipboardList size={18} style={{ color: '#fff' }} />}
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{c.title || (isAssessment ? 'Final Assessment' : 'Quiz')}</span>
        </div>
        {!done && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {questions.map((_, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < current ? '#fff' : i === current ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s', transform: i === current ? 'scale(1.3)' : 'scale(1)' }} />
              ))}
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{current + 1}/{questions.length}</span>
          </div>
        )}
      </div>
      <div style={{ background: colorBg, padding: '28px 24px' }}>
        {!done ? (
          <div style={{ animation: animOut ? 'slideOut 0.35s ease forwards' : 'slideIn 0.4s ease both' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#08060d', marginBottom: 22, lineHeight: 1.5, fontFamily: "'Georgia', serif" }}>Q{current + 1}. {q.question}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {q.options.map((opt, i) => {
                let bg = '#fff', border = '#e5e7eb', textColor = '#1A1A1A', icon = null
                if (revealed) {
                  if (i === q.correct) { bg = '#dcfce7'; border = '#22c55e'; textColor = '#166534'; icon = 'correct' }
                  else if (i === selected) { bg = '#fef2f2'; border = '#ef4444'; textColor = '#991b1b'; icon = 'wrong' }
                } else if (i === selected) { bg = colorBg; border = color; textColor = color }
                return (
                  <button key={i} onClick={() => !revealed && setSelected(i)} style={{ padding: '13px 16px', borderRadius: 10, border: `2px solid ${border}`, background: bg, cursor: revealed ? 'default' : 'pointer', textAlign: 'left', fontSize: 14, color: textColor, fontWeight: i === selected || (revealed && i === q.correct) ? 600 : 400, display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)', transform: revealed && i === q.correct ? 'scale(1.01)' : 'scale(1)', boxShadow: revealed && i === q.correct ? '0 4px 14px rgba(34,197,94,0.2)' : 'none' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: i === selected && !revealed ? color : revealed && i === q.correct ? '#22c55e' : revealed && i === selected ? '#ef4444' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s' }}>
                      {revealed && icon === 'correct' && <HiOutlineCheck size={14} style={{ color: '#fff' }} />}
                      {revealed && icon === 'wrong' && <HiOutlineX size={14} style={{ color: '#fff' }} />}
                      {(!revealed || (i !== selected && i !== q.correct)) && <span style={{ fontSize: 12, fontWeight: 700, color: i === selected && !revealed ? '#fff' : '#9ca3af' }}>{String.fromCharCode(65 + i)}</span>}
                    </div>
                    <span>{opt}</span>
                    {revealed && i === q.correct && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 100 }}>Correct</span>}
                  </button>
                )
              })}
            </div>
            {revealed && (
              <div style={{ padding: '12px 16px', borderRadius: 10, background: selected === q.correct ? '#dcfce7' : '#fef2f2', border: `1px solid ${selected === q.correct ? '#86efac' : '#fca5a5'}`, marginBottom: 20, animation: 'fadeUp 0.3s ease both' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {selected === q.correct ? <HiOutlineCheck size={16} style={{ color: '#16a34a' }} /> : <HiOutlineX size={16} style={{ color: '#ef4444' }} />}
                  <span style={{ fontSize: 13, fontWeight: 700, color: selected === q.correct ? '#166534' : '#991b1b' }}>
                    {selected === q.correct ? 'Correct!' : `Incorrect — the correct answer is: ${q.options[q.correct]}`}
                  </span>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              {!revealed
                ? <button onClick={submit} disabled={selected === null} style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: selected !== null ? `linear-gradient(135deg, ${color}, ${color}cc)` : '#e5e7eb', color: selected !== null ? '#fff' : '#9ca3af', fontSize: 14, fontWeight: 700, cursor: selected !== null ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: selected !== null ? `0 4px 12px ${color}40` : 'none' }}>Check Answer</button>
                : <button onClick={next} style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 4px 12px ${color}40` }}>
                    {current + 1 < questions.length ? 'Next Question' : 'See Results'}
                    <HiOutlineArrowLeft size={15} style={{ transform: 'rotate(180deg)' }} />
                  </button>
              }
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
            <div style={{ width: 90, height: 90, margin: '0 auto 20px' }}>
              <CircleProgress pct={score} size={90} stroke={6} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: passed ? '#16a34a' : '#dc2626', fontFamily: "'Georgia', serif", marginBottom: 6 }}>
              {passed ? 'Well done!' : 'Keep practicing!'}
            </div>
            <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>You scored {score}% — pass mark is {c.pass_score || 70}%</div>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {answers.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 9, background: a.isCorrect ? '#f0fdf4' : '#fef2f2', border: `1px solid ${a.isCorrect ? '#bbf7d0' : '#fecaca'}` }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: a.isCorrect ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    {a.isCorrect ? <HiOutlineCheck size={12} style={{ color: '#fff' }} /> : <HiOutlineX size={12} style={{ color: '#fff' }} />}
                  </div>
                  <div style={{ flex: 1, fontSize: 13 }}>
                    <div style={{ fontWeight: 600, color: '#08060d', marginBottom: 2 }}>{a.question}</div>
                    {!a.isCorrect && <div style={{ color: '#dc2626', fontSize: 12 }}>Correct: {questions[i]?.options[a.correct]}</div>}
                  </div>
                </div>
              ))}
            </div>
            {!passed && (
              <button onClick={() => { setCurrent(0); setSelected(null); setRevealed(false); setAnswers([]); setDone(false) }} style={{ padding: '10px 22px', borderRadius: 9, border: `1.5px solid ${colorBorder}`, background: '#fff', color: color, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Retake Quiz
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Render block ─────────────────────────────────────────────────────────────
function RenderBlock({ block, onQuizComplete }) {
  const c = block.content || {}
  switch (block.type) {
    case 'topics':     return <BlockTopics c={c} />
    case 'text':       return <BlockText c={c} />
    case 'video':      return <BlockVideo c={c} />
    case 'callout':    return <BlockCallout c={c} />
    case 'code':       return <BlockCode c={c} />
    case 'steps':      return <BlockSteps c={c} />
    case 'concepts':   return <BlockConcepts c={c} />
    case 'comparison': return <BlockComparison c={c} />
    case 'timeline':   return <BlockTimeline c={c} />
    case 'pdf':        return <BlockPDF c={c} />
    case 'summary':    return <BlockSummary c={c} />
    case 'quiz':       return <BlockQuiz c={c} isAssessment={false} onComplete={onQuizComplete} />
    case 'assessment': return <BlockQuiz c={c} isAssessment={true} onComplete={onQuizComplete} />
    default:           return null
  }
}

// ─── Lock tooltip ─────────────────────────────────────────────────────────────
function LockedToast({ visible }) {
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      background: '#1a1a2e', color: '#fff', borderRadius: 12, padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 500,
      opacity: visible ? 1 : 0, transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      pointerEvents: 'none',
    }}>
      <HiOutlineLockClosed size={16} style={{ color: OG }} />
      Complete the quiz in this lesson to unlock the next one
    </div>
  )
}

// ─── Main CoursePage ──────────────────────────────────────────────────────────
export default function CoursePage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const contentRef = useRef(null)

  const [course, setCourse]           = useState(null)
  const [modules, setModules]         = useState([])
  const [activeLesson, setActiveLesson] = useState(null)
  const [blocks, setBlocks]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [blocksLoading, setBlocksLoading] = useState(false)
  const [completed, setCompleted]     = useState({})   // lessonId -> bool
  const [quizPassed, setQuizPassed]   = useState({})   // lessonId -> bool (has a quiz been passed)
  const [expanded, setExpanded]       = useState({})
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [lockedShake, setLockedShake] = useState(null) // lessonId being shaken
  const [showLockedToast, setShowLockedToast] = useState(false)
  const [userId, setUserId]           = useState(null)
  const userIdRef = useRef(null)
  const [isAdmin, setIsAdmin]         = useState(false)

  // Load course + auth + progress from DB
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const uid = session?.user?.id || null
      setUserId(uid)
      userIdRef.current = uid

      // Check if admin — admins get all lessons unlocked
      if (uid) {
        const { data: profile } = await supabase.from('users').select('role').eq('id', uid).single()
        if (profile?.role === 'admin') setIsAdmin(true)
      }

      const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single()
      setCourse(courseData)

      const { data: mods } = await supabase.from('modules').select('*').eq('course_id', courseId).order('order_index')
      if (mods) {
        const withLessons = await Promise.all(mods.map(async mod => {
          const { data: lessons } = await supabase.from('lessons').select('*').eq('module_id', mod.id).order('order_index')
          return { ...mod, lessons: lessons || [] }
        }))
        setModules(withLessons)
        setExpanded({ [withLessons[0]?.id]: true })

        // Load saved progress from DB
        if (uid) {
          const { data: prog } = await supabase
            .from('lesson_progress')
            .select('lesson_id, completed, quiz_passed')
            .eq('user_id', uid)
            .eq('course_id', courseId)

          if (prog?.length) {
            const comp = {}, qp = {}
            prog.forEach(p => {
              if (p.completed) comp[p.lesson_id] = true
              if (p.quiz_passed) qp[p.lesson_id] = true
            })
            setCompleted(comp)
            setQuizPassed(qp)
          }
        }

        // Open first lesson
        if (withLessons[0]?.lessons?.length) {
          openLesson(withLessons[0].lessons[0])
        }
      }
      setLoading(false)
    }
    init()
  }, [courseId])

  // Save progress to DB
  const saveProgress = useCallback(async (lessonId, updates) => {
    const uid = userIdRef.current
    if (!uid) return
    await supabase.from('lesson_progress').upsert({
      user_id: uid,
      course_id: courseId,
      lesson_id: lessonId,
      ...updates,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' })
  }, [userId, courseId])

  const issueCertificate = async (uid, cid) => {
    // Check if already issued
    const { data: existing } = await supabase
      .from('certificates')
      .select('id')
      .eq('user_id', uid)
      .eq('course_id', cid)
      .single()
    if (existing) return // already has one
    // Issue new certificate
    const certId = `ADHYOT-${cid.slice(0,6).toUpperCase()}-${Date.now()}`
    await supabase.from('certificates').insert([{
      user_id: uid,
      course_id: cid,
      certificate_id: certId,
      issued_at: new Date().toISOString(),
    }])
    setCourseCompleted(true)
  }

  const [courseCompleted, setCourseCompleted] = useState(false)

  const openLesson = async (lesson) => {
    setActiveLesson(lesson)
    setBlocksLoading(true)
    if (contentRef.current) contentRef.current.scrollTop = 0
    const { data } = await supabase.from('content_blocks').select('*').eq('lesson_id', lesson.id).order('order_index')
    setBlocks(data || [])
    setBlocksLoading(false)
  }

  // Check if a lesson has a quiz/assessment block
  const lessonHasQuiz = useCallback((lessonId) => {
    // We check from the currently loaded blocks (active lesson) or we default false
    if (activeLesson?.id === lessonId) {
      return blocks.some(b => b.type === 'quiz' || b.type === 'assessment')
    }
    return false
  }, [activeLesson, blocks])

  // Can a lesson be accessed?
  const canAccessLesson = useCallback((lesson, allLessons) => {
    if (isAdmin) return true  // admins can access any lesson freely
    const idx = allLessons.findIndex(l => l.id === lesson.id)
    if (idx === 0) return true  // first lesson always accessible
    const prevLesson = allLessons[idx - 1]
    // Must have completed previous lesson
    return !!completed[prevLesson.id]
  }, [completed, isAdmin])

  const allLessons = modules.flatMap(m => m.lessons)
  const totalLessons = allLessons.length
  const currentIdx = allLessons.findIndex(l => l.id === activeLesson?.id)
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null

  const hasUnpassedQuiz = !isAdmin && blocks.some(b => (b.type === 'quiz' || b.type === 'assessment') && !quizPassed[activeLesson?.id])

  const markComplete = useCallback(async (lessonId) => {
    const newCompleted = { ...completed, [lessonId]: true }
    setCompleted(newCompleted)
    await saveProgress(lessonId, { completed: true })
    const uid = userIdRef.current
    if (uid) {
      const done = Object.values(newCompleted).filter(Boolean).length
      const pct = totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0
      // upsert enrollment row in case it doesn't exist yet (e.g. admin previewing)
      await supabase.from('enrollments')
        .upsert({ user_id: uid, course_id: courseId, progress_pct: pct }, { onConflict: 'user_id,course_id' })
      // issue certificate if 100% and course has certificate enabled
      if (pct === 100 && course?.has_certificate !== false) {
        await issueCertificate(uid, courseId)
      }
    }
  }, [saveProgress, completed, totalLessons, userId, courseId])

  const handleQuizComplete = useCallback(async (passed, score) => {
    if (!activeLesson) return
    if (passed) {
      setQuizPassed(prev => ({ ...prev, [activeLesson.id]: true }))
      await saveProgress(activeLesson.id, { quiz_passed: true, quiz_score: score })
      markComplete(activeLesson.id)
    }
  }, [activeLesson, saveProgress, markComplete])

  const handleNextLesson = useCallback(() => {
    if (!nextLesson) return
    if (hasUnpassedQuiz) {
      setLockedShake(nextLesson.id)
      setShowLockedToast(true)
      setTimeout(() => setLockedShake(null), 600)
      setTimeout(() => setShowLockedToast(false), 3000)
      return
    }
    markComplete(activeLesson.id)
    openLesson(nextLesson)
  }, [nextLesson, hasUnpassedQuiz, markComplete, activeLesson])

  const handleSidebarLessonClick = useCallback((lesson) => {
    if (!canAccessLesson(lesson, allLessons)) {
      setLockedShake(lesson.id)
      setShowLockedToast(true)
      setTimeout(() => setLockedShake(null), 600)
      setTimeout(() => setShowLockedToast(false), 3000)
      return
    }
    openLesson(lesson)
  }, [canAccessLesson, allLessons])

  const doneLessons = Object.values(completed).filter(Boolean).length
  const overallPct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0

    if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d0805', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${OGB}`, borderTop: `3px solid ${OG}`, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: '#6b6375', fontSize: 14 }}>Loading course…</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes fadeUp   { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn  { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-24px); } }
        @keyframes shake    {
          0%,100% { transform: translateX(0); }
          15%     { transform: translateX(-6px); }
          30%     { transform: translateX(6px); }
          45%     { transform: translateX(-4px); }
          60%     { transform: translateX(4px); }
          75%     { transform: translateX(-2px); }
          90%     { transform: translateX(2px); }
        }
        @keyframes lockPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50%     { box-shadow: 0 0 0 6px rgba(239,68,68,0.2); }
        }
        .prose-content h2 { font-size: 20px; font-weight: 700; color: #08060d; font-family: 'Georgia', serif; margin: 24px 0 10px; }
        .prose-content h3 { font-size: 17px; font-weight: 700; color: #08060d; margin: 20px 0 8px; }
        .prose-content p  { margin: 0 0 14px; }
        .prose-content ul, .prose-content ol { padding-left: 22px; margin: 0 0 14px; }
        .prose-content li { margin-bottom: 5px; }
        .prose-content blockquote { border-left: 4px solid ${OG}; padding: 10px 16px; background: ${OGB}; margin: 16px 0; border-radius: 0 8px 8px 0; color: ${OG3}; font-style: italic; }
        .prose-content hr { border: none; border-top: 1px solid #DDDDDD; margin: 20px 0; }
      `}</style>

      {/* Top bar */}
      <div style={{ background: '#08060d', borderBottom: '1px solid #1f1815', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 200, flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#6b6375', fontSize: 13, fontWeight: 500, padding: '6px 10px', borderRadius: 7, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#6b6375'}
        >
          <HiOutlineArrowLeft size={15} /> Back
        </button>
        <div style={{ width: 1, height: 20, background: '#2a2020' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Georgia', serif" }}>{course?.title}</div>
          <div style={{ fontSize: 11, color: '#6b6375' }}>{course?.domain} · {course?.level}</div>
        </div>
        <CircleProgress pct={overallPct} size={40} stroke={3} />
        <button onClick={() => setSidebarOpen(s => !s)} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid #2a2020', background: 'transparent', color: '#9ca3af', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          <HiOutlineViewList size={14} /> {sidebarOpen ? 'Hide' : 'Menu'}
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{ width: sidebarOpen ? 300 : 0, minWidth: sidebarOpen ? 300 : 0, background: '#08060d', borderRight: '1px solid #1f1815', overflow: 'hidden', transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), min-width 0.35s cubic-bezier(0.4,0,0.2,1)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ overflowY: 'auto', flex: 1, padding: '16px 0' }}>
            {/* Progress summary */}
            <div style={{ padding: '14px 18px 18px', borderBottom: '1px solid #1f1815', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CircleProgress pct={overallPct} size={52} stroke={4} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Your Progress</div>
                  <div style={{ fontSize: 12, color: '#6b6375', marginTop: 2 }}>{doneLessons} of {totalLessons} lessons done</div>
                  <div style={{ marginTop: 6, height: 4, background: '#1f1815', borderRadius: 100, width: 140, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${overallPct}%`, background: `linear-gradient(90deg, ${OG}, ${OG2})`, borderRadius: 100, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Modules + lessons */}
            {modules.map((mod) => {
              const modDone = mod.lessons.filter(l => completed[l.id]).length
              const modPct = mod.lessons.length > 0 ? Math.round((modDone / mod.lessons.length) * 100) : 0
              const isExpanded = expanded[mod.id]
              return (
                <div key={mod.id} style={{ marginBottom: 2 }}>
                  <button onClick={() => setExpanded(e => ({ ...e, [mod.id]: !e[mod.id] }))} style={{ width: '100%', padding: '12px 18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#0f0b0a'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <CircleProgress pct={modPct} size={32} stroke={3} />
                    <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mod.title}</div>
                      <div style={{ fontSize: 10, color: '#6b6375', marginTop: 1 }}>{mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}</div>
                    </div>
                    {isExpanded ? <HiOutlineChevronUp size={13} style={{ color: '#6b6375', flexShrink: 0 }} /> : <HiOutlineChevronDown size={13} style={{ color: '#6b6375', flexShrink: 0 }} />}
                  </button>

                  <div style={{ maxHeight: isExpanded ? `${mod.lessons.length * 60}px` : '0', overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)' }}>
                    {mod.lessons.map((lesson, li) => {
                      const isActive = activeLesson?.id === lesson.id
                      const isDone = completed[lesson.id]
                      const isLocked = !canAccessLesson(lesson, allLessons)
                      const isShaking = lockedShake === lesson.id

                      return (
                        <button key={lesson.id} onClick={() => handleSidebarLessonClick(lesson)}
                          style={{
                            width: '100%', padding: '10px 18px 10px 28px',
                            background: isActive ? 'rgba(232,89,12,0.12)' : 'none',
                            border: 'none',
                            borderLeft: isActive ? `3px solid ${OG}` : isLocked ? '3px solid transparent' : '3px solid transparent',
                            cursor: isLocked ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 10,
                            transition: 'all 0.2s',
                            opacity: isLocked ? 0.5 : 1,
                            animation: isShaking ? 'shake 0.6s ease' : 'none',
                          }}
                        >
                          <div style={{
                            width: 22, height: 22, borderRadius: '50%', flexShrink: 0, transition: 'all 0.3s',
                            background: isDone ? '#22c55e' : isActive ? OG : isLocked ? '#2a2020' : '#1f1815',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            animation: isShaking ? 'lockPulse 0.6s ease' : 'none',
                          }}>
                            {isDone
                              ? <HiOutlineCheck size={11} style={{ color: '#fff' }} />
                              : isLocked
                                ? <HiOutlineLockClosed size={10} style={{ color: '#ef4444' }} />
                                : <HiOutlineDocument size={9} style={{ color: isActive ? '#fff' : '#6b6375' }} />
                            }
                          </div>
                          <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isLocked ? '#4b4545' : isActive ? OG : '#9ca3af', textAlign: 'left', lineHeight: 1.4, transition: 'color 0.2s', flex: 1 }}>{lesson.title}</span>
                          {isLocked && <HiOutlineLockClosed size={10} style={{ color: '#4b4545', flexShrink: 0 }} />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main content */}
        <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', background: '#f4f5f7' }}>
          {activeLesson ? (
            <div style={{ maxWidth: 820, margin: '0 auto', padding: '36px 32px 80px' }}>
              {/* Lesson header */}
              <div style={{ marginBottom: 32, animation: 'fadeUp 0.4s ease both' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: OG, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  {modules.find(m => m.lessons.some(l => l.id === activeLesson.id))?.title}
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#08060d', fontFamily: "'Georgia', serif", margin: '0 0 12px', lineHeight: 1.3 }}>{activeLesson.title}</h1>
                <div style={{ height: 3, width: 48, background: `linear-gradient(90deg, ${OG}, ${OG2})`, borderRadius: 100 }} />
              </div>

              {/* Quiz gate notice */}
              {hasUnpassedQuiz && (
                <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeUp 0.3s ease both' }}>
                  <HiOutlineLockClosed size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#991b1b', fontWeight: 500 }}>Complete and pass the quiz below to unlock the next lesson.</span>
                </div>
              )}

              {/* Blocks */}
              {blocksLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${OGB}`, borderTop: `3px solid ${OG}`, animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : blocks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: 14 }}>No content for this lesson yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {blocks.map((block, i) => (
                    <div key={block.id} style={{ animation: `fadeUp 0.45s ease ${i * 0.06}s both` }}>
                      {block.title && <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>{block.title}</div>}
                      <RenderBlock block={block} onQuizComplete={handleQuizComplete} />
                      {i < blocks.length - 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0' }}>
                          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #DDDDDD)' }} />
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#DDDDDD', flexShrink: 0 }} />
                          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #DDDDDD, transparent)' }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Nav bar */}
              <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid #DDDDDD`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                {prevLesson
                  ? <button onClick={() => openLesson(prevLesson)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: '1.5px solid #DDDDDD', background: '#fff', color: '#1A1A1A', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = OG; e.currentTarget.style.color = OG }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#DDDDDD'; e.currentTarget.style.color = '#1A1A1A' }}
                    >
                      <HiOutlineArrowLeft size={14} /> Previous
                    </button>
                  : <div />
                }
                <div style={{ display: 'flex', gap: 10 }}>
                  {!completed[activeLesson.id] && !hasUnpassedQuiz && (
                    <button onClick={() => markComplete(activeLesson.id)} style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                      onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
                    >
                      <HiOutlineCheck size={15} /> Mark Complete
                    </button>
                  )}
                  {nextLesson ? (
                    <button onClick={handleNextLesson} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, border: 'none', background: hasUnpassedQuiz ? '#6b7280' : `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: hasUnpassedQuiz ? 'not-allowed' : 'pointer', boxShadow: hasUnpassedQuiz ? 'none' : `0 4px 14px rgba(232,89,12,0.3)`, transition: 'all 0.2s' }}>
                      {hasUnpassedQuiz ? <><HiOutlineLockClosed size={14} /> Locked</> : <>Next Lesson <HiOutlineArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} /></>}
                    </button>
                  ) : (
                    <button onClick={async () => {
                      await markComplete(activeLesson.id)
                      navigate('/dashboard')
                    }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, border: 'none', background: completed[activeLesson.id] ? '#16a34a' : `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 14px rgba(232,89,12,0.3)` }}>
                      <HiOutlineCheck size={14} /> {completed[activeLesson.id] ? 'Back to Dashboard' : 'Finish Course'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: 14 }}>
              Select a lesson to get started
            </div>
          )}
        </div>
      </div>

      {/* Locked toast */}
      <LockedToast visible={showLockedToast} />

      {/* Course Completion Modal */}
      {courseCompleted && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,6,13,0.75)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', maxWidth: 440, width: '100%', textAlign: 'center', animation: 'popIn 0.3s ease both', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #E8590C, #ff7c35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(232,89,12,0.4)' }}>
              <HiOutlineStar size={32} style={{ color: '#fff' }} />
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 10 }}>
              Course Complete!
            </h2>
            <p style={{ fontSize: 15, color: '#6b6375', lineHeight: 1.7, marginBottom: 8 }}>
              Congratulations! You've completed <strong>{course?.title}</strong>.
            </p>
            <p style={{ fontSize: 14, color: '#E8590C', fontWeight: 600, marginBottom: 28 }}>
              Your certificate has been issued and is available in your dashboard.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setCourseCompleted(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #DDDDDD', background: '#fff', color: '#6b6375', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Keep Reviewing
              </button>
              <button onClick={() => navigate('/dashboard')} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #E8590C, #ff7c35)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(232,89,12,0.3)' }}>
                View Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}