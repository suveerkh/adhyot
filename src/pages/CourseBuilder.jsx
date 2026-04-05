import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  HiOutlineArrowLeft, HiOutlinePlus, HiOutlineTrash,
  HiOutlinePencil, HiOutlineX, HiOutlineCheck,
  HiOutlineVideoCamera, HiOutlineDocument, HiOutlineClipboardList,
  HiOutlineAcademicCap, HiOutlineChevronUp, HiOutlineChevronDown,
  HiOutlineLink, HiOutlineDuplicate,
  HiOutlineBookOpen, HiOutlineCollection, HiOutlineLightBulb,
  HiOutlineTable, HiOutlineViewList, HiOutlineCode,
  HiOutlineKey, HiOutlineChartBar, HiOutlineStar, HiOutlineEye,
  HiOutlineExclamation, HiOutlineInformationCircle,
  HiOutlineShieldExclamation, HiOutlineBan,
  HiOutlineAnnotation, HiOutlineFlag
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


// ─── Constants ────────────────────────────────────────────────────────────────
const BLOCK_TYPES = [
  { id: 'topics',     label: 'Topics Covered',    icon: HiOutlineEye,          color: '#E8590C', desc: 'What this lesson covers (start)' },
  { id: 'video',      label: 'Video',             icon: HiOutlineVideoCamera,  color: '#E8590C', desc: 'Embed a video lecture' },
  { id: 'text',       label: 'Text',              icon: HiOutlineDocument,     color: '#555555', desc: 'Rich text & notes' },
  { id: 'callout',    label: 'Callout / Info Box', icon: HiOutlineLightBulb,   color: '#f59e0b', desc: 'Tip, warning, note or important' },
  { id: 'code',       label: 'Code Block',        icon: HiOutlineCode,         color: '#1A1A1A', desc: 'Code with syntax highlighting' },
  { id: 'steps',      label: 'Step-by-Step',      icon: HiOutlineViewList,     color: '#E8590C', desc: 'Numbered process steps' },
  { id: 'concepts',   label: 'Key Concepts',      icon: HiOutlineKey,          color: '#E8590C', desc: 'Term + definition cards' },
  { id: 'comparison', label: 'Comparison Table',  icon: HiOutlineTable,        color: '#E8590C', desc: 'Feature grid / comparison' },
  { id: 'timeline',   label: 'Timeline',          icon: HiOutlineChartBar,     color: '#E8590C', desc: 'Process flow / timeline' },
  { id: 'summary',    label: 'Key Points',        icon: HiOutlineStar,         color: '#E8590C', desc: 'Key takeaways (end of lesson)' },
  { id: 'pdf',        label: 'PDF / File',        icon: HiOutlineLink,         color: '#16a34a', desc: 'Link to a PDF or resource' },
  { id: 'quiz',       label: 'Quiz',              icon: HiOutlineClipboardList,color: '#7c3aed', desc: 'Short knowledge check' },
  { id: 'assessment', label: 'Assessment',        icon: HiOutlineAcademicCap,  color: '#dc2626', desc: 'Graded final exam' },
]
const blockInfo = (type) => BLOCK_TYPES.find(b => b.id === type) || BLOCK_TYPES[1]

const TABS = [
  { id: 'overview',  label: 'Overview' },
  { id: 'structure', label: 'Modules & Lessons' },
]

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1.5px solid #e5e7eb', fontSize: 14, color: '#1A1A1A',
  fontFamily: 'system-ui', outline: 'none', boxSizing: 'border-box', background: '#fff',
}
const labelStyle = {
  fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'block',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
}

// ─── Block type groups for the Add menu ───────────────────────────────────────
const BLOCK_GROUPS = [
  { label: 'Lesson Structure', ids: ['topics', 'summary'] },
  { label: 'Content', ids: ['video', 'text', 'pdf', 'code'] },
  { label: 'Visual Components', ids: ['callout', 'steps', 'concepts', 'comparison', 'timeline'] },
  { label: 'Assessment', ids: ['quiz', 'assessment'] },
]

// ─── Add Block Menu ───────────────────────────────────────────────────────────
function AddBlockMenu({ onAdd, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '28px', width: 600, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'popIn 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif" }}>Add Content Block</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><HiOutlineX size={20} /></button>
        </div>
        {BLOCK_GROUPS.map(group => (
          <div key={group.label} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{group.label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {group.ids.map(id => {
                const bt = BLOCK_TYPES.find(b => b.id === id)
                if (!bt) return null
                return (
                  <button key={bt.id} onClick={() => { onAdd(bt.id); onClose() }} style={{
                    padding: '12px 14px', borderRadius: 10, border: '1.5px solid #DDDDDD',
                    background: '#fff', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 12,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8590C'; e.currentTarget.style.background = '#FFF3EC' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#DDDDDD'; e.currentTarget.style.background = '#fff' }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'linear-gradient(135deg, #E8590C, #ff7c35)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(232,89,12,0.25)' }}>
                      <bt.icon size={16} style={{ color: '#fff' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#08060d' }}>{bt.label}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{bt.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Block Components ─────────────────────────────────────────────────────────

function VideoBlock({ block, onChange }) {
  const c = block.content || {}
  const getEmbed = (url) => {
    if (!url) return null
    if (url.includes('youtube.com/watch')) return url.replace('watch?v=', 'embed/')
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/')
    if (url.includes('vimeo.com/')) return url.replace('vimeo.com/', 'player.vimeo.com/video/')
    return url
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle}>Video URL</label>
        <input style={inputStyle} placeholder="YouTube, Vimeo, or direct MP4 URL" value={c.url || ''} onChange={e => onChange({ ...c, url: e.target.value })} />
      </div>
      {c.url && (
        <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000', aspectRatio: '16/9' }}>
          {(c.url.includes('youtube') || c.url.includes('youtu.be') || c.url.includes('vimeo')) ? (
            <iframe src={getEmbed(c.url)} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
          ) : (
            <video src={c.url} controls style={{ width: '100%', height: '100%' }} />
          )}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Duration (minutes)</label>
          <input style={inputStyle} type="number" placeholder="e.g. 15" value={c.duration || ''} onChange={e => onChange({ ...c, duration: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Notes (optional)</label>
          <input style={inputStyle} placeholder="Brief description..." value={c.notes || ''} onChange={e => onChange({ ...c, notes: e.target.value })} />
        </div>
      </div>
    </div>
  )
}

function TextBlock({ block, onChange }) {
  const c = block.content || {}
  const editorRef = useRef(null)
  const [activeFormats, setActiveFormats] = useState({})
  const [isFocused, setIsFocused] = useState(false)

  // Set HTML only on mount — never re-set it after that (prevents cursor reset)
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = c.html || '<p>Start typing your content here...</p>'
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const updateActiveFormats = () => {
    setActiveFormats({
      bold:               document.queryCommandState('bold'),
      italic:             document.queryCommandState('italic'),
      underline:          document.queryCommandState('underline'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList:  document.queryCommandState('insertOrderedList'),
      h2:         document.queryCommandValue('formatBlock') === 'h2',
      h3:         document.queryCommandValue('formatBlock') === 'h3',
      blockquote: document.queryCommandValue('formatBlock') === 'blockquote',
    })
  }

  const exec = (cmd, val) => {
    editorRef.current?.focus()
    // Toggle blockquote: if already active, switch back to paragraph
    if (cmd === 'formatBlock' && val === 'blockquote' && document.queryCommandValue('formatBlock') === 'blockquote') {
      document.execCommand('formatBlock', false, 'p')
    } else {
      document.execCommand(cmd, false, val || null)
    }
    setTimeout(() => {
      updateActiveFormats()
      onChange({ ...c, html: editorRef.current?.innerHTML || '' })
    }, 0)
  }

  const TOOLBAR = [
    { id: 'bold',      label: 'B',       title: 'Bold (Ctrl+B)',     cmd: 'bold',                style: { fontWeight: 800 } },
    { id: 'italic',    label: 'I',       title: 'Italic (Ctrl+I)',   cmd: 'italic',              style: { fontStyle: 'italic' } },
    { id: 'underline', label: 'U',       title: 'Underline (Ctrl+U)',cmd: 'underline',           style: { textDecoration: 'underline' } },
    { sep: true },
    { id: 'h2',        label: 'H2',      title: 'Heading 2',         cmd: 'formatBlock', val: 'h2' },
    { id: 'h3',        label: 'H3',      title: 'Heading 3',         cmd: 'formatBlock', val: 'h3' },
    { id: 'p',         label: '¶',       title: 'Paragraph',         cmd: 'formatBlock', val: 'p'  },
    { sep: true },
    { id: 'insertUnorderedList', label: '• List',  title: 'Bullet list',   cmd: 'insertUnorderedList' },
    { id: 'insertOrderedList',   label: '1. List', title: 'Numbered list', cmd: 'insertOrderedList'   },
    { sep: true },
    { id: 'blockquote', label: '❝', title: 'Blockquote (click again to remove)', cmd: 'formatBlock', val: 'blockquote' },
    { id: 'hr',         label: '—', title: 'Horizontal divider',                 cmd: 'insertHorizontalRule' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <style>{`
        .rte-editor ul  { list-style-type: disc;    padding-left: 26px; margin: 8px 0; }
        .rte-editor ol  { list-style-type: decimal; padding-left: 26px; margin: 8px 0; }
        .rte-editor li  { margin: 3px 0; line-height: 1.75; }
        .rte-editor ul ul { list-style-type: circle; }
        .rte-editor h2  { font-size: 20px; font-weight: 700; margin: 14px 0 6px; color: #08060d; font-family: Georgia, serif; line-height: 1.3; }
        .rte-editor h3  { font-size: 16px; font-weight: 700; margin: 12px 0 4px; color: #08060d; line-height: 1.4; }
        .rte-editor p   { margin: 5px 0; }
        .rte-editor blockquote { border-left: 4px solid #E8590C; margin: 12px 0; padding: 8px 16px; background: #FFF3EC; border-radius: 0 8px 8px 0; color: #c2410c; font-style: italic; }
        .rte-editor hr  { border: none; border-top: 1.5px solid #e5e7eb; margin: 16px 0; }
        .rte-editor b, .rte-editor strong { font-weight: 700; }
        .rte-editor a   { color: #E8590C; text-decoration: underline; }
        .rte-editor:empty:before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; }
      `}</style>
      <div>
        <label style={labelStyle}>Content</label>
        <div style={{
          border: isFocused ? '1.5px solid #E8590C' : '1.5px solid #e5e7eb',
          borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: isFocused ? '0 0 0 3px rgba(232,89,12,0.12)' : 'none',
        }}>
          {/* Toolbar */}
          <div style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '6px 10px', display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            {TOOLBAR.map((btn, idx) => btn.sep
              ? <div key={idx} style={{ width: 1, height: 18, background: '#e5e7eb', margin: '0 3px', flexShrink: 0 }} />
              : <button
                  key={btn.id}
                  title={btn.title}
                  onMouseDown={e => { e.preventDefault(); exec(btn.cmd, btn.val) }}
                  style={{
                    padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    border: activeFormats[btn.id] ? '1.5px solid #E8590C' : '1px solid #e5e7eb',
                    background: activeFormats[btn.id] ? '#FFF3EC' : '#fff',
                    color: activeFormats[btn.id] ? '#E8590C' : '#374151',
                    transition: 'all 0.15s',
                    ...btn.style,
                  }}>
                  {btn.label}
                </button>
            )}
          </div>
          {/* Editor — NO dangerouslySetInnerHTML after mount */}
          <div
            ref={editorRef}
            className="rte-editor"
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Start typing your content here..."
            onFocus={() => { setIsFocused(true); updateActiveFormats() }}
            onBlur={e => { setIsFocused(false); onChange({ ...c, html: e.currentTarget.innerHTML }) }}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            onSelect={updateActiveFormats}
            style={{ minHeight: 220, padding: '14px', fontSize: 14, lineHeight: 1.9, color: '#1A1A1A', outline: 'none', fontFamily: 'system-ui' }}
          />
        </div>
      </div>
    </div>
  )
}

function PDFBlock({ block, onChange }) {
  const c = block.content || {}
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle}>File URL or Link</label>
        <input style={inputStyle} placeholder="https://... (PDF, slide deck, or resource link)" value={c.url || ''} onChange={e => onChange({ ...c, url: e.target.value })} />
      </div>
      <div>
        <label style={labelStyle}>Description</label>
        <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} placeholder="What does this resource cover?" value={c.description || ''} onChange={e => onChange({ ...c, description: e.target.value })} />
      </div>
      {c.url && (
        <a href={c.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, border: '1.5px solid #16a34a', background: '#f0fdf4', color: '#16a34a', fontSize: 13, fontWeight: 600, textDecoration: 'none', width: 'fit-content' }}>
          <HiOutlineLink size={15} /> Preview Resource
        </a>
      )}
    </div>
  )
}

function QuizBlock({ block, onChange, isAssessment }) {
  const c = block.content || { title: '', questions: [], pass_score: 70, time_limit: 60 }
  const [newQ, setNewQ] = useState({ question: '', options: ['', '', '', ''], correct: 0 })
  const color = isAssessment ? '#dc2626' : '#7c3aed'
  const addQuestion = () => {
    if (!newQ.question.trim() || newQ.options.some(o => !o.trim())) return
    onChange({ ...c, questions: [...(c.questions || []), { ...newQ, id: Date.now() }] })
    setNewQ({ question: '', options: ['', '', '', ''], correct: 0 })
  }
  const removeQuestion = (id) => onChange({ ...c, questions: c.questions.filter(q => q.id !== id) })
  const updateOption = (i, val) => setNewQ(q => ({ ...q, options: q.options.map((o, idx) => idx === i ? val : o) }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {isAssessment && (
        <div style={{ padding: '10px 14px', background: 'rgba(220,38,38,0.06)', borderRadius: 8, border: '1px solid rgba(220,38,38,0.2)', fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
          Final Assessment — students must pass this to receive their certificate
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: isAssessment ? '1fr 1fr 1fr' : '1fr auto', gap: 12 }}>
        <div>
          <label style={labelStyle}>{isAssessment ? 'Assessment Title' : 'Quiz Title'}</label>
          <input style={inputStyle} value={c.title || ''} onChange={e => onChange({ ...c, title: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Pass Score (%)</label>
          <input style={{ ...inputStyle, width: isAssessment ? '100%' : 100 }} type="number" min="0" max="100" value={c.pass_score || 70} onChange={e => onChange({ ...c, pass_score: Number(e.target.value) })} />
        </div>
        {isAssessment && (
          <div>
            <label style={labelStyle}>Time Limit (min)</label>
            <input style={inputStyle} type="number" value={c.time_limit || 60} onChange={e => onChange({ ...c, time_limit: Number(e.target.value) })} />
          </div>
        )}
      </div>
      {(c.questions || []).map((q, i) => (
        <div key={q.id} style={{ background: '#f9fafb', borderRadius: 10, padding: '14px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#08060d' }}>Q{i + 1}. {q.question}</span>
            <button onClick={() => removeQuestion(q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><HiOutlineTrash size={14} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {q.options.map((opt, idx) => (
              <div key={idx} style={{ padding: '6px 10px', borderRadius: 6, fontSize: 12, background: idx === q.correct ? '#dcfce7' : '#fff', border: `1px solid ${idx === q.correct ? '#16a34a' : '#e5e7eb'}`, color: idx === q.correct ? '#16a34a' : '#6b7280', fontWeight: idx === q.correct ? 600 : 400 }}>
                {String.fromCharCode(65 + idx)}. {opt}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ background: `${color}08`, borderRadius: 12, padding: '16px', border: `1.5px dashed ${color}40` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Add Question</div>
        <input style={{ ...inputStyle, marginBottom: 10 }} placeholder="Enter your question" value={newQ.question} onChange={e => setNewQ(q => ({ ...q, question: e.target.value }))} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          {newQ.options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="radio" name={`correct_${block.id}`} checked={newQ.correct === i} onChange={() => setNewQ(q => ({ ...q, correct: i }))} />
              <input style={{ ...inputStyle, fontSize: 13 }} placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={e => updateOption(i, e.target.value)} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>Select the radio button next to the correct answer</div>
        <button onClick={addQuestion} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: color, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Add Question</button>
      </div>
    </div>
  )
}

// ─── NEW: Topics Covered Block ────────────────────────────────────────────────
// ── orange palette shorthands used across all visual blocks ───────────────────
const OG  = '#E8590C'   // primary orange
const OG2 = '#ff7c35'   // light orange
const OG3 = '#c2410c'   // dark orange
const OGB = '#FFF3EC'   // pale orange bg
const OGL = '#fcd9c0'   // orange border
const OGS = '0 4px 14px rgba(232,89,12,0.25)' // shadow

function TopicsBlock({ block, onChange }) {
  const c = block.content || { intro: '', topics: [] }
  const [newTopic, setNewTopic] = useState('')
  const [editingIdx, setEditingIdx] = useState(null)
  const [editVal, setEditVal] = useState('')
  const addTopic = () => {
    if (!newTopic.trim()) return
    onChange({ ...c, topics: [...(c.topics || []), newTopic.trim()] })
    setNewTopic('')
  }
  const startEdit = (i) => { setEditingIdx(i); setEditVal(c.topics[i]) }
  const commitEdit = (i) => {
    if (editVal.trim()) { const topics = [...c.topics]; topics[i] = editVal.trim(); onChange({ ...c, topics }) }
    setEditingIdx(null)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: '10px 14px', borderRadius: 8, background: OGB, border: `1.5px solid ${OGL}`, fontSize: 12, color: OG3, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
        <HiOutlineEye size={14} style={{ color: OG, flexShrink: 0 }} />
        Place this at the <strong>start</strong> of the lesson — shows students what they'll learn.
      </div>
      <div>
        <label style={labelStyle}>Intro Sentence</label>
        <input style={inputStyle} placeholder="In this lesson, you will learn:" value={c.intro || ''} onChange={e => onChange({ ...c, intro: e.target.value })} />
      </div>
      <div>
        <label style={labelStyle}>Topics</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          {(c.topics || []).map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#fff8f5', borderRadius: 8, border: `1px solid ${OGL}` }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: OGS }}>{i + 1}</div>
              {editingIdx === i
                ? <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={() => commitEdit(i)} onKeyDown={e => { if (e.key === 'Enter') commitEdit(i); if (e.key === 'Escape') setEditingIdx(null) }} style={{ flex: 1, fontSize: 13, border: '1.5px solid #E8590C', borderRadius: 6, padding: '3px 8px', outline: 'none', fontFamily: 'system-ui' }} />
                : <span style={{ flex: 1, fontSize: 13, color: '#1A1A1A' }}>{t}</span>
              }
              <button onClick={() => startEdit(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8590C', padding: 2 }}><HiOutlinePencil size={12} /></button>
              <button onClick={() => onChange({ ...c, topics: c.topics.filter((_, idx) => idx !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}><HiOutlineX size={12} /></button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="Add a topic..." value={newTopic} onChange={e => setNewTopic(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTopic() } }} />
          <button onClick={addTopic} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0, boxShadow: OGS }}>+ Add</button>
        </div>
      </div>
      {(c.topics || []).length > 0 && (
        <div style={{ background: `linear-gradient(135deg, ${OGB}, #fff8f5)`, borderRadius: 12, padding: '16px', border: `1.5px solid ${OGL}`, borderLeft: `4px solid ${OG}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: OG, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Student Preview</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', fontFamily: "'Georgia', serif", marginBottom: 12 }}>{c.intro || 'In this lesson, you will learn:'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 8 }}>
            {c.topics.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#fff', borderRadius: 8, border: `1px solid ${OGL}` }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: 12, color: '#1A1A1A', fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CALLOUT — warm amber/orange tones ────────────────────────────────────────
const CALLOUT_TYPES = [
  { id: 'tip',       label: 'Tip',       icon: HiOutlineLightBulb,        bg: OGB,        border: OGL,      text: OG3,       accent: OG       },
  { id: 'note',      label: 'Note',      icon: HiOutlineInformationCircle, bg: '#fff8f5',  border: '#fbbf87', text: '#92400e', accent: '#f97316' },
  { id: 'warning',   label: 'Warning',   icon: HiOutlineExclamation,       bg: '#fffbeb',  border: '#fcd34d', text: '#78350f', accent: '#d97706' },
  { id: 'important', label: 'Important', icon: HiOutlineShieldExclamation, bg: '#fef2f2',  border: '#fca5a5', text: '#7f1d1d', accent: '#ef4444' },
]
function CalloutBlock({ block, onChange }) {
  const c = block.content || { variant: 'tip', title: '', body: '' }
  const v = CALLOUT_TYPES.find(x => x.id === c.variant) || CALLOUT_TYPES[0]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle}>Callout Type</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {CALLOUT_TYPES.map(variant => (
            <button key={variant.id} onClick={() => onChange({ ...c, variant: variant.id })} style={{
              padding: '10px 8px', borderRadius: 10,
              border: `2px solid ${c.variant === variant.id ? variant.accent : '#e5e7eb'}`,
              background: c.variant === variant.id ? variant.bg : '#fff',
              cursor: 'pointer', fontSize: 12, fontWeight: 700,
              color: c.variant === variant.id ? variant.text : '#9ca3af',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, transition: 'all 0.15s',
            }}>
              <variant.icon size={20} style={{ color: c.variant === variant.id ? variant.accent : '#9ca3af' }} />
              {variant.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label style={labelStyle}>Title (optional)</label>
        <input style={inputStyle} placeholder={`${v.label} title...`} value={c.title || ''} onChange={e => onChange({ ...c, title: e.target.value })} />
      </div>
      <div>
        <label style={labelStyle}>Content</label>
        <textarea style={{ ...inputStyle, height: 90, resize: 'vertical' }} placeholder="Enter your callout content..." value={c.body || ''} onChange={e => onChange({ ...c, body: e.target.value })} />
      </div>
      {c.body && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Student Preview</div>
          <div style={{ padding: '14px 16px', background: v.bg, border: `1px solid ${v.border}`, borderRadius: 10, borderLeft: `4px solid ${v.accent}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <v.icon size={16} style={{ color: v.accent, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: v.text }}>{c.title || v.label}</span>
            </div>
            <p style={{ fontSize: 13, color: v.text, margin: 0, lineHeight: 1.7 }}>{c.body}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Prism highlight ─────────────────────────────────────────────────────────
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
    } catch {
      return escapeHtml(code)
    }
  }, [code, language])
}


const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'csharp', 'bash', 'sql', 'html', 'css', 'json', 'yaml', 'xml', 'plaintext']

const LANG_COLORS = {
  javascript: '#f7df1e', typescript: '#3178c6', python: '#3572A5',
  java: '#b07219', csharp: '#178600', bash: '#89e051', sql: '#e38c00',
  html: '#e34c26', css: '#563d7c', json: '#292929', yaml: '#cb171e',
  xml: '#e34c26', plaintext: '#9ca3af',
}
function CodeBlock({ block, onChange }) {
  const c = block.content || { language: 'javascript', code: '', caption: '' }
  const lang = PRISM_LANG_MAP[c.language] || 'plaintext'
  const highlighted = usePrismHighlight(c.code, c.language)
  const dotColor = LANG_COLORS[c.language] || '#9ca3af'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Language</label>
          <select style={inputStyle} value={c.language || 'javascript'} onChange={e => onChange({ ...c, language: e.target.value })}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Caption (optional)</label>
          <input style={inputStyle} placeholder="e.g. Selenium WebDriver setup" value={c.caption || ''} onChange={e => onChange({ ...c, caption: e.target.value })} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Code</label>
        <textarea
          value={c.code || ''}
          onChange={e => onChange({ ...c, code: e.target.value })}
          placeholder={`Enter your ${c.language || 'code'} here...`}
          spellCheck={false}
          style={{ ...inputStyle, height: 200, resize: 'vertical', fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace", fontSize: 13, lineHeight: 1.6, background: '#1e1e1e', color: '#e2e8f0', border: '1.5px solid #334155', padding: '14px' }}
        />
      </div>
      {c.code && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Preview — Syntax Highlighted</div>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#1a1f2e', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #0f172a' }}>
              <div style={{ display: 'flex', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              </div>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor }} />
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{c.language}</span>
              {c.caption && <span style={{ fontSize: 11, color: '#475569', marginLeft: 4 }}>— {c.caption}</span>}
            </div>
            <pre className={`language-${lang}`} style={{ background: '#1e1e1e', margin: 0, padding: '16px 18px', overflowX: 'auto', fontSize: 13, lineHeight: 1.75, fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace" }}>
              <code
                className={`language-${lang}`}
                dangerouslySetInnerHTML={{ __html: highlighted || escapeHtml(c.code || '') }}
                style={{ fontFamily: 'inherit', fontSize: 'inherit', background: 'none', color: 'inherit' }}
              />
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── STEPS — deep orange numbered cards ───────────────────────────────────────
function StepsBlock({ block, onChange }) {
  const c = block.content || { title: '', steps: [] }
  const [newStep, setNewStep] = useState({ heading: '', body: '' })
  const [editingId, setEditingId] = useState(null)
  const [editVal, setEditVal] = useState({ heading: '', body: '' })
  const startEdit = (step) => { setEditingId(step.id); setEditVal({ heading: step.heading, body: step.body || '' }) }
  const commitEdit = () => {
    if (editVal.heading.trim()) onChange({ ...c, steps: c.steps.map(s => s.id === editingId ? { ...s, ...editVal } : s) })
    setEditingId(null)
  }
  const addStep = () => {
    if (!newStep.heading.trim()) return
    onChange({ ...c, steps: [...(c.steps || []), { ...newStep, id: Date.now() }] })
    setNewStep({ heading: '', body: '' })
  }
  const removeStep = (id) => onChange({ ...c, steps: c.steps.filter(s => s.id !== id) })
  const moveStep = (idx, dir) => {
    const steps = [...c.steps]; const ni = idx + dir
    if (ni < 0 || ni >= steps.length) return
    const [s] = steps.splice(idx, 1); steps.splice(ni, 0, s)
    onChange({ ...c, steps })
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle}>Section Title (optional)</label>
        <input style={inputStyle} placeholder="e.g. How to set up Selenium WebDriver" value={c.title || ''} onChange={e => onChange({ ...c, title: e.target.value })} />
      </div>
      {/* Steps list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelStyle}>Steps</label>
        {(c.steps || []).map((step, i) => (
          <div key={step.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', background: OGB, borderRadius: 9, border: `1px solid ${OGL}` }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: OGS }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              {editingId === step.id
                ? <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <input autoFocus value={editVal.heading} onChange={e => setEditVal(v => ({ ...v, heading: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null) }} style={{ fontSize: 13, fontWeight: 700, border: '1.5px solid #E8590C', borderRadius: 6, padding: '3px 8px', outline: 'none', fontFamily: 'system-ui' }} />
                    <input value={editVal.body} onChange={e => setEditVal(v => ({ ...v, body: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null) }} placeholder="Description (optional)" style={{ fontSize: 12, border: '1.5px solid #e5e7eb', borderRadius: 6, padding: '3px 8px', outline: 'none', fontFamily: 'system-ui', color: '#6b6375' }} />
                    <button onClick={commitEdit} style={{ alignSelf: 'flex-start', padding: '2px 10px', borderRadius: 5, border: 'none', background: '#E8590C', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                  </div>
                : <><div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{step.heading}</div>{step.body && <div style={{ fontSize: 12, color: '#6b6375', marginTop: 2 }}>{step.body}</div>}</>
              }
            </div>
            <button onClick={() => moveStep(i, -1)} disabled={i === 0} style={{ background: 'none', border: 'none', cursor: i === 0 ? 'not-allowed' : 'pointer', color: i === 0 ? '#d1d5db' : '#9ca3af', padding: 2 }}><HiOutlineChevronUp size={13} /></button>
            <button onClick={() => moveStep(i, 1)} disabled={i === c.steps.length - 1} style={{ background: 'none', border: 'none', cursor: i === c.steps.length - 1 ? 'not-allowed' : 'pointer', color: i === c.steps.length - 1 ? '#d1d5db' : '#9ca3af', padding: 2 }}><HiOutlineChevronDown size={13} /></button>
            <button onClick={() => startEdit(step)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8590C', padding: 2 }}><HiOutlinePencil size={13} /></button>
            <button onClick={() => removeStep(step.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}><HiOutlineTrash size={13} /></button>
          </div>
        ))}
      </div>
      {/* Add step */}
      <div style={{ background: OGB, borderRadius: 10, padding: '14px', border: `1.5px dashed ${OGL}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: OG, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Add Step</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input style={inputStyle} placeholder="Step heading (required)" value={newStep.heading} onChange={e => setNewStep(s => ({ ...s, heading: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') addStep() }} />
          <input style={inputStyle} placeholder="Step description (optional)" value={newStep.body} onChange={e => setNewStep(s => ({ ...s, body: e.target.value }))} />
          <button onClick={addStep} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start', boxShadow: OGS }}>+ Add Step</button>
        </div>
      </div>
      {/* Preview */}
      {(c.steps || []).length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '18px', border: `1.5px solid ${OGL}`, borderTop: `4px solid ${OG}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: OG, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Student Preview</div>
          {c.title && <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', fontFamily: "'Georgia', serif", marginBottom: 16 }}>{c.title}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {c.steps.map((step, i) => (
              <div key={step.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: OGS }}>{i + 1}</div>
                <div style={{ flex: 1, borderBottom: i < c.steps.length - 1 ? `1px solid ${OGL}` : 'none', paddingBottom: i < c.steps.length - 1 ? 14 : 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#08060d', marginBottom: step.body ? 4 : 0 }}>{step.heading}</div>
                  {step.body && <div style={{ fontSize: 13, color: '#6b6375', lineHeight: 1.6 }}>{step.body}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CONCEPTS — burnt orange term cards ───────────────────────────────────────
function ConceptsBlock({ block, onChange }) {
  const c = block.content || { title: '', concepts: [] }
  const [newConcept, setNewConcept] = useState({ term: '', definition: '' })
  const [editingId, setEditingId] = useState(null)
  const [editVal, setEditVal] = useState({ term: '', definition: '' })
  const startEdit = (con) => { setEditingId(con.id); setEditVal({ term: con.term, definition: con.definition }) }
  const commitEdit = () => {
    if (editVal.term.trim()) onChange({ ...c, concepts: c.concepts.map(con => con.id === editingId ? { ...con, ...editVal } : con) })
    setEditingId(null)
  }
  const addConcept = () => {
    if (!newConcept.term.trim() || !newConcept.definition.trim()) return
    onChange({ ...c, concepts: [...(c.concepts || []), { ...newConcept, id: Date.now() }] })
    setNewConcept({ term: '', definition: '' })
  }
  const removeConcept = (id) => onChange({ ...c, concepts: c.concepts.filter(con => con.id !== id) })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle}>Section Title (optional)</label>
        <input style={inputStyle} placeholder="e.g. Key Terms to Know" value={c.title || ''} onChange={e => onChange({ ...c, title: e.target.value })} />
      </div>
      {/* Existing concepts */}
      {(c.concepts || []).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>Concepts ({c.concepts.length})</label>
          {c.concepts.map(con => (
            <div key={con.id} style={{ display: 'flex', gap: 10, padding: '10px 14px', background: OGB, borderRadius: 9, border: `1px solid ${OGL}`, borderLeft: `3px solid ${OG}`, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                {editingId === con.id
                  ? <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <input autoFocus value={editVal.term} onChange={e => setEditVal(v => ({ ...v, term: e.target.value }))} onKeyDown={e => { if (e.key === 'Escape') setEditingId(null) }} style={{ fontSize: 13, fontWeight: 700, border: '1.5px solid #E8590C', borderRadius: 6, padding: '3px 8px', outline: 'none', fontFamily: 'system-ui' }} />
                      <textarea value={editVal.definition} onChange={e => setEditVal(v => ({ ...v, definition: e.target.value }))} rows={2} style={{ fontSize: 12, border: '1.5px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', outline: 'none', fontFamily: 'system-ui', color: '#6b6375', resize: 'vertical' }} />
                      <button onClick={commitEdit} style={{ alignSelf: 'flex-start', padding: '2px 10px', borderRadius: 5, border: 'none', background: '#E8590C', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                    </div>
                  : <><div style={{ fontSize: 13, fontWeight: 700, color: OG3 }}>{con.term}</div><div style={{ fontSize: 12, color: '#6b6375', marginTop: 3, lineHeight: 1.5 }}>{con.definition}</div></>
                }
              </div>
              <button onClick={() => startEdit(con)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8590C', padding: 2, flexShrink: 0 }}><HiOutlinePencil size={13} /></button>
              <button onClick={() => removeConcept(con.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2, flexShrink: 0 }}><HiOutlineTrash size={13} /></button>
            </div>
          ))}
        </div>
      )}
      {/* Add */}
      <div style={{ background: OGB, borderRadius: 10, padding: '14px', border: `1.5px dashed ${OGL}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: OG, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Add Concept</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input style={inputStyle} placeholder="Term (e.g. Test Fixture, DOM, Assertion)" value={newConcept.term} onChange={e => setNewConcept(s => ({ ...s, term: e.target.value }))} />
          <textarea style={{ ...inputStyle, height: 70, resize: 'vertical' }} placeholder="Definition or explanation..." value={newConcept.definition} onChange={e => setNewConcept(s => ({ ...s, definition: e.target.value }))} />
          <button onClick={addConcept} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start', boxShadow: OGS }}>+ Add Concept</button>
        </div>
      </div>
      {/* Preview */}
      {(c.concepts || []).length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px', border: `1.5px solid ${OGL}`, borderTop: `4px solid ${OG2}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: OG, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Student Preview</div>
          {c.title && <div style={{ fontSize: 14, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 12 }}>{c.title}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10 }}>
            {c.concepts.map(con => (
              <div key={con.id} style={{ background: OGB, borderRadius: 10, padding: '12px 14px', border: `1px solid ${OGL}`, borderLeft: `3px solid ${OG}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: OG, marginBottom: 5 }}>{con.term}</div>
                <div style={{ fontSize: 12, color: '#555555', lineHeight: 1.6 }}>{con.definition}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TIMELINE — orange gradient steps ────────────────────────────────────────
function TimelineBlock({ block, onChange }) {
  const c = block.content || { title: '', items: [] }
  const [newItem, setNewItem] = useState({ label: '', description: '', tag: '' })
  const [editingId, setEditingId] = useState(null)
  const [editVal, setEditVal] = useState({ label: '', description: '', tag: '' })
  const startEdit = (item) => { setEditingId(item.id); setEditVal({ label: item.label, description: item.description || '', tag: item.tag || '' }) }
  const commitEdit = () => {
    if (editVal.label.trim()) onChange({ ...c, items: c.items.map(item => item.id === editingId ? { ...item, ...editVal } : item) })
    setEditingId(null)
  }
  const addItem = () => {
    if (!newItem.label.trim()) return
    onChange({ ...c, items: [...(c.items || []), { ...newItem, id: Date.now() }] })
    setNewItem({ label: '', description: '', tag: '' })
  }
  const removeItem = (id) => onChange({ ...c, items: c.items.filter(item => item.id !== id) })
  const moveItem = (idx, dir) => {
    const items = [...c.items]; const ni = idx + dir
    if (ni < 0 || ni >= items.length) return
    const [item] = items.splice(idx, 1); items.splice(ni, 0, item)
    onChange({ ...c, items })
  }
  // orange shades cycling for steps
  const stepColors = ['#E8590C', '#f97316', '#fb923c', '#c2410c', '#ea580c', '#f59e0b', '#d97706', '#b45309']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle}>Timeline Title (optional)</label>
        <input style={inputStyle} placeholder="e.g. SDLC Process Flow" value={c.title || ''} onChange={e => onChange({ ...c, title: e.target.value })} />
      </div>
      {/* Items editor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelStyle}>Timeline Items</label>
        {(c.items || []).map((item, i) => (
          <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', background: OGB, borderRadius: 9, border: `1px solid ${OGL}` }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: stepColors[i % stepColors.length], color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: OGS }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              {editingId === item.id
                ? <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <input autoFocus value={editVal.label} onChange={e => setEditVal(v => ({ ...v, label: e.target.value }))} onKeyDown={e => { if (e.key === 'Escape') setEditingId(null) }} style={{ fontSize: 13, fontWeight: 700, border: '1.5px solid #E8590C', borderRadius: 6, padding: '3px 8px', outline: 'none', fontFamily: 'system-ui' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 6 }}>
                      <input value={editVal.description} onChange={e => setEditVal(v => ({ ...v, description: e.target.value }))} placeholder="Description" style={{ fontSize: 12, border: '1.5px solid #e5e7eb', borderRadius: 6, padding: '3px 8px', outline: 'none', fontFamily: 'system-ui', color: '#6b6375' }} />
                      <input value={editVal.tag} onChange={e => setEditVal(v => ({ ...v, tag: e.target.value }))} placeholder="Tag" style={{ fontSize: 12, border: '1.5px solid #e5e7eb', borderRadius: 6, padding: '3px 8px', outline: 'none', fontFamily: 'system-ui', color: '#6b6375' }} />
                    </div>
                    <button onClick={commitEdit} style={{ alignSelf: 'flex-start', padding: '2px 10px', borderRadius: 5, border: 'none', background: '#E8590C', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                  </div>
                : <><span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{item.label}</span>{item.tag && <span style={{ fontSize: 11, marginLeft: 8, color: OG, fontWeight: 600, background: OGB, padding: '1px 7px', borderRadius: 100, border: `1px solid ${OGL}` }}>{item.tag}</span>}{item.description && <div style={{ fontSize: 12, color: '#6b6375', marginTop: 2 }}>{item.description}</div>}</>
              }
            </div>
            <button onClick={() => moveItem(i, -1)} disabled={i === 0} style={{ background: 'none', border: 'none', cursor: i === 0 ? 'not-allowed' : 'pointer', color: i === 0 ? '#d1d5db' : '#9ca3af', padding: 2 }}><HiOutlineChevronUp size={13} /></button>
            <button onClick={() => moveItem(i, 1)} disabled={i === c.items.length - 1} style={{ background: 'none', border: 'none', cursor: i === c.items.length - 1 ? 'not-allowed' : 'pointer', color: i === c.items.length - 1 ? '#d1d5db' : '#9ca3af', padding: 2 }}><HiOutlineChevronDown size={13} /></button>
            <button onClick={() => startEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8590C', padding: 2 }}><HiOutlinePencil size={13} /></button>
            <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}><HiOutlineTrash size={13} /></button>
          </div>
        ))}
      </div>
      {/* Add */}
      <div style={{ background: OGB, borderRadius: 10, padding: '14px', border: `1.5px dashed ${OGL}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: OG, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Add Timeline Item</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input style={inputStyle} placeholder="Step / phase label (required)" value={newItem.label} onChange={e => setNewItem(s => ({ ...s, label: e.target.value }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
            <input style={inputStyle} placeholder="Description (optional)" value={newItem.description} onChange={e => setNewItem(s => ({ ...s, description: e.target.value }))} />
            <input style={inputStyle} placeholder="Tag (e.g. '2 weeks')" value={newItem.tag} onChange={e => setNewItem(s => ({ ...s, tag: e.target.value }))} />
          </div>
          <button onClick={addItem} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start', boxShadow: OGS }}>+ Add Item</button>
        </div>
      </div>
      {/* Preview */}
      {(c.items || []).length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '18px', border: `1.5px solid ${OGL}`, borderTop: `4px solid ${OG3}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: OG, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Student Preview</div>
          {c.title && <div style={{ fontSize: 15, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 18 }}>{c.title}</div>}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {c.items.map((item, i) => (
              <div key={item.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: stepColors[i % stepColors.length], color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: OGS }}>{i + 1}</div>
                  {i < c.items.length - 1 && <div style={{ width: 2, height: 26, background: `linear-gradient(180deg, ${stepColors[i % stepColors.length]}, ${OGL})`, margin: '3px 0' }} />}
                </div>
                <div style={{ flex: 1, paddingTop: 6, paddingBottom: i < c.items.length - 1 ? 0 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#08060d' }}>{item.label}</span>
                    {item.tag && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: OGB, color: OG, border: `1px solid ${OGL}` }}>{item.tag}</span>}
                  </div>
                  {item.description && <p style={{ fontSize: 12, color: '#6b6375', lineHeight: 1.6, margin: '4px 0 14px 0' }}>{item.description}</p>}
                  {!item.description && <div style={{ height: 14 }} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SUMMARY / KEY POINTS — bold orange ───────────────────────────────────────
function SummaryBlock({ block, onChange }) {
  const c = block.content || { title: 'Key Points to Remember', points: [] }
  const [newPoint, setNewPoint] = useState('')
  const [editingIdx, setEditingIdx] = useState(null)
  const [editVal, setEditVal] = useState('')
  const startEdit = (i) => { setEditingIdx(i); setEditVal(c.points[i]) }
  const commitEdit = (i) => {
    if (editVal.trim()) { const points = [...c.points]; points[i] = editVal.trim(); onChange({ ...c, points }) }
    setEditingIdx(null)
  }
  const addPoint = () => {
    if (!newPoint.trim()) return
    onChange({ ...c, points: [...(c.points || []), newPoint.trim()] })
    setNewPoint('')
  }
  const removePoint = (i) => onChange({ ...c, points: c.points.filter((_, idx) => idx !== i) })
  const movePoint = (i, dir) => {
    const points = [...c.points]; const ni = i + dir
    if (ni < 0 || ni >= points.length) return
    const [p] = points.splice(i, 1); points.splice(ni, 0, p)
    onChange({ ...c, points })
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: '10px 14px', borderRadius: 8, background: OGB, border: `1.5px solid ${OGL}`, fontSize: 12, color: OG3, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
        <HiOutlineStar size={14} style={{ color: OG, flexShrink: 0 }} />
        Place this at the <strong>end</strong> of the lesson to reinforce key takeaways.
      </div>
      <div>
        <label style={labelStyle}>Section Title</label>
        <input style={inputStyle} value={c.title || 'Key Points to Remember'} onChange={e => onChange({ ...c, title: e.target.value })} />
      </div>
      {/* Points editor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelStyle}>Points</label>
        {(c.points || []).map((pt, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '9px 12px', background: OGB, borderRadius: 8, border: `1px solid ${OGL}` }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
            {editingIdx === i
              ? <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={() => commitEdit(i)} onKeyDown={e => { if (e.key === 'Enter') commitEdit(i); if (e.key === 'Escape') setEditingIdx(null) }} style={{ flex: 1, fontSize: 13, border: '1.5px solid #E8590C', borderRadius: 6, padding: '3px 8px', outline: 'none', fontFamily: 'system-ui' }} />
              : <span style={{ flex: 1, fontSize: 13, color: '#1A1A1A' }}>{pt}</span>
            }
            <button onClick={() => movePoint(i, -1)} disabled={i === 0} style={{ background: 'none', border: 'none', cursor: i === 0 ? 'not-allowed' : 'pointer', color: i === 0 ? '#d1d5db' : '#9ca3af', padding: 2 }}><HiOutlineChevronUp size={13} /></button>
            <button onClick={() => movePoint(i, 1)} disabled={i === c.points.length - 1} style={{ background: 'none', border: 'none', cursor: i === c.points.length - 1 ? 'not-allowed' : 'pointer', color: i === c.points.length - 1 ? '#d1d5db' : '#9ca3af', padding: 2 }}><HiOutlineChevronDown size={13} /></button>
            <button onClick={() => startEdit(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8590C', padding: 2 }}><HiOutlinePencil size={13} /></button>
            <button onClick={() => removePoint(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}><HiOutlineX size={13} /></button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="Add a key point..." value={newPoint} onChange={e => setNewPoint(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPoint() } }} />
          <button onClick={addPoint} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0, boxShadow: OGS }}>+ Add</button>
        </div>
      </div>
      {/* Preview */}
      {(c.points || []).length > 0 && (
        <div style={{ background: `linear-gradient(135deg, ${OGB}, #fff8f5)`, borderRadius: 14, padding: '18px 20px', border: `1.5px solid ${OGL}`, borderLeft: `5px solid ${OG}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <HiOutlineStar size={18} style={{ color: OG, flexShrink: 0 }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif" }}>{c.title}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {c.points.map((pt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 14px', background: '#fff', borderRadius: 9, border: `1px solid ${OGL}`, boxShadow: '0 1px 4px rgba(232,89,12,0.06)' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, boxShadow: OGS }}>{i + 1}</div>
                <span style={{ fontSize: 13, color: '#1A1A1A', lineHeight: 1.6 }}>{pt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
// ─── COMPARISON TABLE — fixed ─────────────────────────────────────────────────
function ComparisonBlock({ block, onChange }) {
  const defaultContent = { title: '', headers: ['Feature', 'Option A', 'Option B'], rows: [] }
  const c = (block.content && block.content.headers) ? block.content : defaultContent

  const numCols = c.headers.length

  // New row state — always kept in sync with numCols via a derived key approach
  const [draftCells, setDraftCells] = useState(() => Array(numCols).fill(''))

  // Keep draft length in sync when columns change
  const syncedDraft = draftCells.length === numCols
    ? draftCells
    : Array(numCols).fill('').map((_, i) => draftCells[i] || '')

  const updateHeader = (i, val) => {
    const headers = [...c.headers]; headers[i] = val
    onChange({ ...c, headers })
  }
  const addCol = () => {
    onChange({
      ...c,
      headers: [...c.headers, `Option ${String.fromCharCode(64 + c.headers.length)}`],
      rows: c.rows.map(r => [...r, '']),
    })
    setDraftCells(prev => [...prev, ''])
  }
  const removeCol = (i) => {
    onChange({
      ...c,
      headers: c.headers.filter((_, idx) => idx !== i),
      rows: c.rows.map(r => r.filter((_, idx) => idx !== i)),
    })
    setDraftCells(prev => prev.filter((_, idx) => idx !== i))
  }
  const updateCell = (ri, ci, val) => {
    const rows = c.rows.map((r, ridx) =>
      ridx === ri ? r.map((cell, cidx) => cidx === ci ? val : cell) : r
    )
    onChange({ ...c, rows })
  }
  const removeRow = (i) => onChange({ ...c, rows: c.rows.filter((_, idx) => idx !== i) })
  const commitRow = () => {
    if (syncedDraft.every(v => !v.trim())) return
    onChange({ ...c, rows: [...c.rows, [...syncedDraft]] })
    setDraftCells(Array(numCols).fill(''))
  }
  const updateDraft = (i, val) => {
    const next = [...syncedDraft]; next[i] = val
    setDraftCells(next)
  }

  const OG = '#E8590C'
  const OG2 = '#ff7c35'
  const OGB = '#FFF3EC'
  const OGL = '#fcd9c0'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle}>Table Title (optional)</label>
        <input style={inputStyle} placeholder="e.g. Selenium vs Cypress vs Playwright" value={c.title || ''} onChange={e => onChange({ ...c, title: e.target.value })} />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 12, border: `1.5px solid ${OGL}`, boxShadow: '0 2px 8px rgba(232,89,12,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 400 }}>
          <thead>
            <tr style={{ background: `linear-gradient(135deg, ${OG}, ${OG2})` }}>
              {c.headers.map((h, i) => (
                <th key={i} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#fff', minWidth: 130 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      value={h}
                      onChange={e => updateHeader(i, e.target.value)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontWeight: 700, fontSize: 13, width: '100%', fontFamily: 'system-ui' }}
                    />
                    {i > 0 && (
                      <button onClick={() => removeCol(i)} title="Remove column" style={{ background: 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: 4, padding: '1px 6px', fontSize: 12, lineHeight: 1, flexShrink: 0 }}>×</button>
                    )}
                  </div>
                </th>
              ))}
              <th style={{ width: 44, background: 'transparent' }}>
                <button onClick={addCol} title="Add column" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: 5, padding: '3px 8px', fontSize: 13, fontWeight: 700 }}>+</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {c.rows.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : OGB, transition: 'background 0.15s' }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: '9px 14px', borderBottom: `1px solid ${OGL}` }}>
                    <input
                      value={cell}
                      onChange={e => updateCell(ri, ci, e.target.value)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#1A1A1A', width: '100%', fontFamily: 'system-ui' }}
                    />
                  </td>
                ))}
                <td style={{ padding: '9px 8px', borderBottom: `1px solid ${OGL}`, textAlign: 'center' }}>
                  <button onClick={() => removeRow(ri)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}><HiOutlineTrash size={12} /></button>
                </td>
              </tr>
            ))}
            {/* Draft new row */}
            <tr style={{ background: c.rows.length % 2 === 0 ? '#fff' : OGB }}>
              {syncedDraft.map((val, ci) => (
                <td key={ci} style={{ padding: '8px 14px', borderTop: `1px dashed ${OGL}` }}>
                  <input
                    value={val}
                    onChange={e => updateDraft(ci, e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') commitRow() }}
                    placeholder={ci === 0 ? 'Type and press Enter to add row...' : ''}
                    style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#6b7280', width: '100%', fontFamily: 'system-ui', fontStyle: ci === 0 ? 'italic' : 'normal' }}
                  />
                </td>
              ))}
              <td style={{ padding: '8px', borderTop: `1px dashed ${OGL}`, textAlign: 'center' }}>
                <button onClick={commitRow} title="Add row" style={{ background: `linear-gradient(135deg, ${OG}, ${OG2})`, border: 'none', cursor: 'pointer', color: '#fff', borderRadius: 5, padding: '3px 9px', fontSize: 12, fontWeight: 700 }}>+</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 11, color: '#9ca3af' }}>Edit headers and cells inline · Press Enter or + to add a row · × on header removes that column</div>
    </div>
  )
}
// ─── Single Block ─────────────────────────────────────────────────────────────
function Block({ block, index, total, onUpdate, onDelete, onMove, onDuplicate }) {
  const [expanded, setExpanded] = useState(true)
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved
  const debounceRef = useRef(null)
  const info = blockInfo(block.type)

  const autosave = async (updated) => {
    setSaveState('saving')
    const isTempId = String(updated.id).startsWith('temp_')
    if (isTempId) {
      const { data } = await supabase.from('content_blocks').insert([{
        course_id: updated.course_id, lesson_id: updated.lesson_id,
        type: updated.type, title: updated.title, content: updated.content, order_index: updated.order_index,
      }]).select().single()
      if (data) onUpdate({ ...updated, id: data.id })
    } else {
      await supabase.from('content_blocks').update({ title: updated.title, content: updated.content }).eq('id', updated.id)
    }
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2000)
  }

  const handleChange = (updated) => {
    onUpdate(updated)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => autosave(updated), 1500)
  }

  const renderBlock = () => {
    const props = { block, onChange: c => handleChange({ ...block, content: c }) }
    switch (block.type) {
      case 'video':      return <VideoBlock {...props} />
      case 'text':       return <TextBlock {...props} />
      case 'pdf':        return <PDFBlock {...props} />
      case 'quiz':       return <QuizBlock {...props} isAssessment={false} />
      case 'assessment': return <QuizBlock {...props} isAssessment={true} />
      case 'topics':     return <TopicsBlock {...props} />
      case 'callout':    return <CalloutBlock {...props} />
      case 'code':       return <CodeBlock {...props} />
      case 'steps':      return <StepsBlock {...props} />
      case 'concepts':   return <ConceptsBlock {...props} />
      case 'comparison': return <ComparisonBlock {...props} />
      case 'timeline':   return <TimelineBlock {...props} />
      case 'summary':    return <SummaryBlock {...props} />
      default:           return <TextBlock {...props} />
    }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${expanded ? 'rgba(232,89,12,0.25)' : '#DDDDDD'}`, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', transition: 'border-color 0.2s' }}>
      {/* Block header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, background: expanded ? '#FFF3EC' : '#f9fafb', borderBottom: expanded ? '1px solid rgba(232,89,12,0.15)' : 'none', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg, #E8590C, #ff7c35)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(232,89,12,0.3)' }}>
          <info.icon size={14} style={{ color: '#fff' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            value={block.title || ''}
            onChange={e => { e.stopPropagation(); handleChange({ ...block, title: e.target.value }) }}
            onClick={e => e.stopPropagation()}
            placeholder={`Untitled ${info.label}`}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, fontWeight: 700, color: '#08060d', width: '100%', cursor: 'text', fontFamily: 'system-ui' }}
          />
          <div style={{ fontSize: 10, color: '#E8590C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 1 }}>{info.label}</div>
        </div>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
          {saveState !== 'idle' && (
            <span style={{ fontSize: 11, fontWeight: 600, color: saveState === 'saved' ? '#16a34a' : '#9ca3af', marginRight: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
              {saveState === 'saving' ? 'Saving…' : <><HiOutlineCheck size={10} /> Saved</>}
            </span>
          )}
          <button onClick={() => onMove(index, -1)} disabled={index === 0} style={{ padding: 4, background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: index === 0 ? '#d1d5db' : '#9ca3af', borderRadius: 4 }}><HiOutlineChevronUp size={13} /></button>
          <button onClick={() => onMove(index, 1)} disabled={index === total - 1} style={{ padding: 4, background: 'none', border: 'none', cursor: index === total - 1 ? 'not-allowed' : 'pointer', color: index === total - 1 ? '#d1d5db' : '#9ca3af', borderRadius: 4 }}><HiOutlineChevronDown size={13} /></button>
          <button onClick={() => onDuplicate(index)} title="Duplicate" style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', borderRadius: 4 }}><HiOutlineDuplicate size={13} /></button>
          <button onClick={() => onDelete(block.id)} title="Delete" style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', borderRadius: 4 }}><HiOutlineTrash size={13} /></button>
          <span style={{ color: '#9ca3af', fontSize: 10, marginLeft: 2 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '20px' }}>
          {renderBlock()}
        </div>
      )}
    </div>
  )
}

// ─── Lesson Editor ────────────────────────────────────────────────────────────
function LessonEditor({ lesson, courseId, onBack }) {
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [addAfterIndex, setAddAfterIndex] = useState(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('content_blocks').select('*').eq('lesson_id', lesson.id).order('order_index')
      setBlocks(data || [])
      setLoading(false)
    }
    load()
  }, [lesson.id])

  const addBlock = async (type) => {
    const idx = addAfterIndex !== null ? addAfterIndex + 1 : blocks.length
    // Optimistic block shown immediately even if DB insert is slow/fails
    const tempId = `temp_${Date.now()}`
    const tempBlock = { id: tempId, course_id: courseId, lesson_id: lesson.id, type, title: '', content: {}, order_index: idx }
    const updated = [...blocks]
    updated.splice(idx, 0, tempBlock)
    setBlocks(updated.map((b, i) => ({ ...b, order_index: i })))
    setAddAfterIndex(null)
    // Then persist to DB and swap temp ID for real ID
    const { data, error } = await supabase.from('content_blocks').insert([{
      course_id: courseId, lesson_id: lesson.id, type, title: '', content: {}, order_index: idx,
    }]).select().single()
    if (data) {
      setBlocks(prev => prev.map(b => b.id === tempId ? { ...data } : b))
    }
    // If DB fails, block stays with tempId — Save will handle upsert
  }

  const updateBlock = (updated) => setBlocks(blocks.map(b => b.id === updated.id ? updated : b))

  const deleteBlock = async (id) => {
    if (!String(id).startsWith('temp_')) {
      await supabase.from('content_blocks').delete().eq('id', id)
    }
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  const moveBlock = async (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= blocks.length) return
    const updated = [...blocks]
    const [moved] = updated.splice(index, 1)
    updated.splice(newIndex, 0, moved)
    const reordered = updated.map((b, i) => ({ ...b, order_index: i }))
    setBlocks(reordered)
    await Promise.all(reordered.map(b => supabase.from('content_blocks').update({ order_index: b.order_index }).eq('id', b.id)))
  }

  const duplicateBlock = async (index) => {
    const orig = blocks[index]
    const { data } = await supabase.from('content_blocks').insert([{
      course_id: courseId, lesson_id: lesson.id, type: orig.type,
      title: `${orig.title} (copy)`, content: orig.content, order_index: index + 1,
    }]).select().single()
    if (data) {
      const updated = [...blocks]
      updated.splice(index + 1, 0, data)
      setBlocks(updated.map((b, i) => ({ ...b, order_index: i })))
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 13, fontWeight: 600, padding: '6px 10px', borderRadius: 7 }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        ><HiOutlineArrowLeft size={15} /> Back to structure</button>
        <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif" }}>{lesson.title}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>{blocks.length} block{blocks.length !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => { setAddAfterIndex(null); setShowAddMenu(true) }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #E8590C, #ff7c35)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(232,89,12,0.3)' }}>
            <HiOutlinePlus size={15} /> Add Block
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading...</div>
      ) : blocks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 40px', background: '#fff', borderRadius: 16, border: '2px dashed #e5e7eb' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#FFF3EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <HiOutlineDocument size={24} style={{ color: '#E8590C' }} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 8 }}>No content yet</h3>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>Add videos, callouts, code blocks, quizzes and more to this lesson.</p>
          <button onClick={() => setShowAddMenu(true)} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #E8590C, #ff7c35)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Add First Block</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {blocks.map((block, i) => (
            <div key={block.id}>
              <Block block={block} index={i} total={blocks.length} onUpdate={updateBlock} onDelete={deleteBlock} onMove={moveBlock} onDuplicate={duplicateBlock} />
              <div style={{ display: 'flex', justifyContent: 'center', margin: '5px 0' }}>
                <button onClick={() => { setAddAfterIndex(i); setShowAddMenu(true) }} style={{ padding: '3px 14px', borderRadius: 100, border: '1.5px dashed #d1d5db', background: '#fff', color: '#9ca3af', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 4 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8590C'; e.currentTarget.style.color = '#E8590C' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#9ca3af' }}
                ><HiOutlinePlus size={11} /> insert here</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showAddMenu && <AddBlockMenu onAdd={addBlock} onClose={() => { setShowAddMenu(false); setAddAfterIndex(null) }} />}
    </div>
  )
}

// ─── Structure Tab ────────────────────────────────────────────────────────────
function StructureTab({ courseId, onEditLesson }) {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState({})

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    const { data: mods } = await supabase.from('modules').select('*').eq('course_id', courseId).order('order_index')
    if (mods) {
      const withLessons = await Promise.all(mods.map(async (mod) => {
        const { data: lessons } = await supabase.from('lessons').select('*').eq('module_id', mod.id).order('order_index')
        return { ...mod, lessons: lessons || [] }
      }))
      setModules(withLessons)
      const expanded = {}
      withLessons.forEach(m => expanded[m.id] = true)
      setExpandedModules(expanded)
    }
    setLoading(false)
  }

  const addModule = async () => {
    const { data } = await supabase.from('modules').insert([{ course_id: courseId, title: 'New Module', order_index: modules.length }]).select().single()
    if (data) setModules(m => [...m, { ...data, lessons: [] }])
  }
  const updateModuleTitle = async (id, title) => {
    await supabase.from('modules').update({ title }).eq('id', id)
    setModules(m => m.map(mod => mod.id === id ? { ...mod, title } : mod))
  }
  const deleteModule = async (id) => {
    await supabase.from('modules').delete().eq('id', id)
    setModules(m => m.filter(mod => mod.id !== id))
  }
  const addLesson = async (moduleId) => {
    const mod = modules.find(m => m.id === moduleId)
    const { data } = await supabase.from('lessons').insert([{ module_id: moduleId, course_id: courseId, title: 'New Lesson', order_index: mod.lessons.length }]).select().single()
    if (data) setModules(m => m.map(mod => mod.id === moduleId ? { ...mod, lessons: [...mod.lessons, data] } : mod))
  }
  const updateLessonTitle = async (moduleId, lessonId, title) => {
    await supabase.from('lessons').update({ title }).eq('id', lessonId)
    setModules(m => m.map(mod => mod.id === moduleId ? { ...mod, lessons: mod.lessons.map(l => l.id === lessonId ? { ...l, title } : l) } : mod))
  }
  const deleteLesson = async (moduleId, lessonId) => {
    await supabase.from('lessons').delete().eq('id', lessonId)
    setModules(m => m.map(mod => mod.id === moduleId ? { ...mod, lessons: mod.lessons.filter(l => l.id !== lessonId) } : mod))
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif" }}>Modules & Lessons</h3>
        <button onClick={addModule} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #E8590C, #ff7c35)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(232,89,12,0.3)' }}>
          <HiOutlinePlus size={15} /> Add Module
        </button>
      </div>
      {modules.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 40px', background: '#fff', borderRadius: 16, border: '2px dashed #e5e7eb' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#FFF3EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <HiOutlineCollection size={24} style={{ color: '#E8590C' }} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 8 }}>No modules yet</h3>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>Start by adding your first module, then add lessons inside it.</p>
          <button onClick={addModule} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #E8590C, #ff7c35)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Add First Module</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {modules.map((mod) => (
            <div key={mod.id} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '14px 18px', background: '#f9fafb', borderBottom: expandedModules[mod.id] ? '1px solid #e5e7eb' : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setExpandedModules(e => ({ ...e, [mod.id]: !e[mod.id] }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2 }}>
                  {expandedModules[mod.id] ? <HiOutlineChevronUp size={16} /> : <HiOutlineChevronDown size={16} />}
                </button>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(232,89,12,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HiOutlineBookOpen size={14} style={{ color: '#E8590C' }} />
                </div>
                <input value={mod.title} onChange={e => updateModuleTitle(mod.id, e.target.value)} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, fontWeight: 700, color: '#08060d', fontFamily: 'system-ui' }} placeholder="Module title" />
                <span style={{ fontSize: 12, color: '#9ca3af', marginRight: 8 }}>{mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}</span>
                <button onClick={() => addLesson(mod.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6, border: 'none', background: 'rgba(232,89,12,0.1)', color: '#E8590C', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  <HiOutlinePlus size={12} /> Add Lesson
                </button>
                <button onClick={() => deleteModule(mod.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}><HiOutlineTrash size={14} /></button>
              </div>
              {expandedModules[mod.id] && (
                <div style={{ padding: mod.lessons.length > 0 ? '6px 0' : '16px 18px' }}>
                  {mod.lessons.length === 0 ? (
                    <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>No lessons yet — click "Add Lesson" above.</div>
                  ) : mod.lessons.map((lesson, li) => (
                    <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: li < mod.lessons.length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#6b7280' }}>{li + 1}</div>
                      <input value={lesson.title} onChange={e => updateLessonTitle(mod.id, lesson.id, e.target.value)} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, fontWeight: 600, color: '#1A1A1A', fontFamily: 'system-ui' }} placeholder="Lesson title" />
                      <button onClick={() => onEditLesson(lesson)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6, border: '1.5px solid #e5e7eb', background: '#fff', color: '#1A1A1A', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8590C'; e.currentTarget.style.color = '#E8590C' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#1A1A1A' }}
                      ><HiOutlinePencil size={12} /> Edit Content</button>
                      <button onClick={() => deleteLesson(mod.id, lesson.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 3 }}><HiOutlineTrash size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ course, onUpdate, onDirtyChange, onFormChange }) {
  const [form, setForm] = useState({ ...course, goals: Array.isArray(course?.goals) ? course.goals : [] })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [newGoal, setNewGoal] = useState('')
  const update = (k, v) => { setForm(f => { const next = { ...f, [k]: v }; if (onFormChange) onFormChange(next); return next }); if (!dirty) { setDirty(true); onDirtyChange?.(true) } }
  const addGoal = () => { if (!newGoal.trim()) return; update('goals', [...form.goals, newGoal.trim()]); setNewGoal('') }
  const removeGoal = (i) => update('goals', form.goals.filter((_, idx) => idx !== i))
  const handleSave = async () => {
    setSaving(true)
    await supabase.from('courses').update(form).eq('id', course.id)
    onUpdate(form)
    setSaving(false); setSaved(true)
    setDirty(false); onDirtyChange?.(false)
    setTimeout(() => setSaved(false), 2000)
  }
  return (
    <div style={{ maxWidth: 720 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 24 }}>Course Overview</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div><label style={labelStyle}>Course Title</label><input style={inputStyle} value={form.title} onChange={e => update('title', e.target.value)} /></div>
        <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, height: 100, resize: 'vertical' }} value={form.description || ''} onChange={e => update('description', e.target.value)} placeholder="What will students learn?" /></div>
        <div>
          <label style={labelStyle}>Learning Goals</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            {form.goals.map((goal, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8590C', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14, color: '#1A1A1A' }}>{goal}</span>
                <button onClick={() => removeGoal(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}><HiOutlineX size={13} /></button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="Add a learning goal..." value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGoal() } }} />
            <button onClick={addGoal} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#E8590C', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>+ Add</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <div><label style={labelStyle}>Domain</label>
            <select style={inputStyle} value={form.domain} onChange={e => update('domain', e.target.value)}>
              <option>QA Engineering</option><option>Cybersecurity</option>
            </select>
          </div>
          <div><label style={labelStyle}>Level</label>
            <select style={inputStyle} value={form.level} onChange={e => update('level', e.target.value)}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
          </div>
          <div><label style={labelStyle}>Duration (hrs)</label><input style={inputStyle} type="number" value={form.duration || ''} onChange={e => update('duration', e.target.value)} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={labelStyle}>Price (₹)</label><input style={inputStyle} type="number" value={form.price || 0} onChange={e => update('price', Number(e.target.value))} disabled={form.is_free} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 22 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={form.is_free || false} onChange={e => { update('is_free', e.target.checked); if (e.target.checked) update('price', 0) }} /> Free Course
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={form.is_published || false} onChange={e => update('is_published', e.target.checked)} /> Published
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox"
                checked={form.has_certificate !== false}
                onChange={e => update('has_certificate', e.target.checked)}
                style={{ accentColor: '#E8590C' }}
              />
              <span style={{ color: form.has_certificate !== false ? '#E8590C' : '#6b6375', fontWeight: form.has_certificate !== false ? 600 : 400, transition: 'all 0.2s' }}>
                Issue Certificate on Completion
              </span>
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '11px 28px', borderRadius: 8, border: 'none', background: saved ? '#16a34a' : saving ? '#f5a882' : 'linear-gradient(135deg, #E8590C, #ff7c35)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(232,89,12,0.3)', transition: 'all 0.3s' }}>
            {saved ? <><HiOutlineCheck size={15} /> Saved!</> : saving ? 'Saving...' : 'Save Overview'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main CourseBuilder ───────────────────────────────────────────────────────
export default function CourseBuilder() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [editingLesson, setEditingLesson] = useState(null)
  const [overviewDirty, setOverviewDirty] = useState(false)
  const [unsavedModal, setUnsavedModal] = useState(null)
  const pendingFormRef = useRef(null)

  const guardedAction = (action) => {
    if (overviewDirty) { setUnsavedModal({ action }) } else { action() }
  }

  useEffect(() => {
    if (!courseId) return
    supabase.from('courses').select('*').eq('id', courseId).single().then(({ data }) => {
      setCourse(data)
      setLoading(false)
    })
  }, [courseId])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f5f7' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #FFF3EC', borderTop: '3px solid #E8590C', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* Top Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 32px', display: 'flex', alignItems: 'center', height: 60, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <button onClick={() => guardedAction(() => navigate('/admin'))} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 13, fontWeight: 500, marginRight: 20, padding: '6px 10px', borderRadius: 7 }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        ><HiOutlineArrowLeft size={16} /> Dashboard</button>
        <div style={{ width: 1, height: 20, background: '#e5e7eb', marginRight: 20 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif" }}>{course?.title}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>{course?.domain} · {course?.level}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: course?.is_published ? '#dcfce7' : '#f3f4f6', color: course?.is_published ? '#16a34a' : '#6b7280' }}>
            {course?.is_published ? 'Published' : 'Draft'}
          </span>
          <button
            onClick={() => navigate(`/admin/preview/${courseId}`)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, border: '1.5px solid #E8590C', background: '#FFF3EC', color: '#E8590C', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E8590C'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFF3EC'; e.currentTarget.style.color = '#E8590C' }}
          >
            <HiOutlineEye size={15} /> Preview
          </button>
        </div>
      </div>

      {/* Tabs */}
      {!editingLesson && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 32px', display: 'flex', gap: 4 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => guardedAction(() => setActiveTab(tab.id))} style={{ padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: activeTab === tab.id ? 700 : 500, color: activeTab === tab.id ? '#E8590C' : '#6b7280', borderBottom: activeTab === tab.id ? '2px solid #E8590C' : '2px solid transparent', transition: 'all 0.2s' }}>{tab.label}</button>
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {editingLesson ? (
          <LessonEditor lesson={editingLesson} courseId={courseId} onBack={() => guardedAction(() => setEditingLesson(null))} />
        ) : (
          <>
            {activeTab === 'overview'  && course && <OverviewTab course={course} onUpdate={setCourse} onDirtyChange={setOverviewDirty} onFormChange={f => { pendingFormRef.current = f }} />}
            {activeTab === 'structure' && <StructureTab courseId={courseId} onEditLesson={setEditingLesson} />}
          </>
        )}
      </div>

      {/* Unsaved changes modal */}
      {unsavedModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,6,13,0.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#FFF3EC', border: '1.5px solid #fcd9c0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <HiOutlineExclamation size={26} style={{ color: '#E8590C' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", textAlign: 'center', marginBottom: 10 }}>Unsaved Changes</h3>
            <p style={{ fontSize: 14, color: '#6b6375', textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
              You have unsaved changes in the Overview tab. Save before leaving?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setUnsavedModal(null)} style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1.5px solid #DDDDDD', background: '#fff', color: '#6b6375', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => { setOverviewDirty(false); setUnsavedModal(null); unsavedModal.action() }} style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1.5px solid #fecaca', background: '#fef2f2', color: '#ef4444', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Don't Save
              </button>
              <button onClick={async () => {
                if (pendingFormRef.current) {
                  await supabase.from('courses').update(pendingFormRef.current).eq('id', courseId)
                  setCourse(pendingFormRef.current)
                }
                setOverviewDirty(false); setUnsavedModal(null); unsavedModal.action()
              }} style={{ flex: 2, padding: '11px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #E8590C, #ff7c35)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(232,89,12,0.3)' }}>
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}