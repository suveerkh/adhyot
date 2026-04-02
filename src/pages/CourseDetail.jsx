import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  HiOutlineArrowLeft, HiOutlineCheck, HiOutlineClock,
  HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineChevronDown,
  HiOutlineChevronUp, HiOutlineLockClosed, HiOutlinePlay,
  HiOutlineDocument, HiOutlineClipboardList, HiOutlineLogout,
  HiOutlineViewGrid, HiOutlineChevronRight, HiOutlineUsers,
  HiOutlineStar, HiOutlineBadgeCheck,
} from 'react-icons/hi'
import supabase from '../supabaseClient'

// ─── Theme ────────────────────────────────────────────────────────────────────
const OG  = '#E8590C'
const OG2 = '#ff7c35'
const OGB = '#FFF3EC'
const OGL = '#fcd9c0'

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ user, profile, onLogout }) {
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const name = profile?.name || user?.email?.split('@')[0] || ''
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: '1px solid #DDDDDD',
      transition: 'all 0.3s', padding: '0 5%',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #E8590C, #ff8c42)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Georgia', serif", fontWeight: 700, color: '#fff', fontSize: 18 }}>A</div>
          <span style={{ fontFamily: "'Georgia', serif", fontWeight: 700, fontSize: 22, color: '#08060d', letterSpacing: '-0.5px' }}>Adhyot</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="/courses" style={{ color: '#6b6375', fontSize: 15, textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = OG}
            onMouseLeave={e => e.target.style.color = '#6b6375'}
          >Courses</a>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setDropdownOpen(d => !d)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', borderRadius: 100, border: `1.5px solid ${OGL}`, background: OGB, cursor: 'pointer' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${OG}, ${OG2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{initials}</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{name}</span>
                <HiOutlineChevronDown size={13} style={{ color: '#6b6375' }} />
              </button>
              {dropdownOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#fff', borderRadius: 12, border: '1px solid #DDDDDD', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '6px', minWidth: 180, zIndex: 200 }}>
                  <button onClick={() => { navigate('/dashboard'); setDropdownOpen(false) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#1A1A1A' }}
                    onMouseEnter={e => e.currentTarget.style.background = OGB}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  ><HiOutlineViewGrid size={15} /> Dashboard</button>
                  <div style={{ height: 1, background: '#DDDDDD', margin: '4px 0' }} />
                  <button onClick={() => { onLogout(); setDropdownOpen(false) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#ef4444' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  ><HiOutlineLogout size={15} /> Log Out</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => navigate('/auth')} style={{ padding: '9px 20px', borderRadius: 9, border: '1.5px solid #DDDDDD', background: '#fff', color: '#1A1A1A', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Log In</button>
              <button onClick={() => navigate('/auth?mode=register')} style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(232,89,12,0.3)' }}>Get Started</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

// ─── Lesson type icon ─────────────────────────────────────────────────────────
function LessonIcon({ type }) {
  const icons = {
    video:      <HiOutlinePlay size={12} style={{ color: OG }} />,
    quiz:       <HiOutlineClipboardList size={12} style={{ color: '#7c3aed' }} />,
    assessment: <HiOutlineAcademicCap size={12} style={{ color: '#dc2626' }} />,
    pdf:        <HiOutlineDocument size={12} style={{ color: '#16a34a' }} />,
  }
  return icons[type] || <HiOutlineDocument size={12} style={{ color: '#9ca3af' }} />
}

// ─── Curriculum accordion ─────────────────────────────────────────────────────
function CurriculumSection({ modules, isEnrolled }) {
  const [expanded, setExpanded] = useState({ 0: true })
  const totalLessons = modules.reduce((a, m) => a + (m.lessons?.length || 0), 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", margin: 0 }}>Course Curriculum</h2>
        <span style={{ fontSize: 13, color: '#6b6375' }}>{modules.length} modules · {totalLessons} lessons</span>
      </div>
      <div style={{ border: '1.5px solid #DDDDDD', borderRadius: 14, overflow: 'hidden' }}>
        {modules.map((mod, mi) => (
          <div key={mod.id} style={{ borderBottom: mi < modules.length - 1 ? '1px solid #DDDDDD' : 'none' }}>
            {/* Module header */}
            <button
              onClick={() => setExpanded(e => ({ ...e, [mi]: !e[mi] }))}
              style={{ width: '100%', padding: '16px 20px', background: expanded[mi] ? OGB : '#f9fafb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.2s', textAlign: 'left' }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 7, background: expanded[mi] ? `linear-gradient(135deg, ${OG}, ${OG2})` : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                <HiOutlineBookOpen size={13} style={{ color: expanded[mi] ? '#fff' : '#6b6375' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#08060d' }}>{mod.title}</div>
                <div style={{ fontSize: 12, color: '#6b6375', marginTop: 2 }}>{mod.lessons?.length || 0} lessons</div>
              </div>
              {expanded[mi]
                ? <HiOutlineChevronUp size={16} style={{ color: OG, flexShrink: 0 }} />
                : <HiOutlineChevronDown size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
              }
            </button>

            {/* Lessons */}
            <div style={{ maxHeight: expanded[mi] ? `${(mod.lessons?.length || 0) * 52}px` : '0', overflow: 'hidden', transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)' }}>
              {(mod.lessons || []).map((lesson, li) => {
                const isPreview = !isEnrolled && li === 0 && mi === 0
                return (
                  <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px 12px 64px', borderTop: '1px solid #f3f4f6', background: '#fff', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: isPreview ? OGB : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isEnrolled
                        ? <HiOutlinePlay size={10} style={{ color: OG }} />
                        : isPreview
                          ? <HiOutlinePlay size={10} style={{ color: OG }} />
                          : <HiOutlineLockClosed size={10} style={{ color: '#9ca3af' }} />
                      }
                    </div>
                    <span style={{ flex: 1, fontSize: 13, color: isEnrolled || isPreview ? '#1A1A1A' : '#9ca3af', fontWeight: isPreview ? 600 : 400 }}>{lesson.title}</span>
                    {isPreview && <span style={{ fontSize: 11, fontWeight: 700, color: OG, background: OGB, padding: '2px 8px', borderRadius: 100, border: `1px solid ${OGL}` }}>Preview</span>}
                    {!isEnrolled && !isPreview && <HiOutlineLockClosed size={13} style={{ color: '#d1d5db', flexShrink: 0 }} />}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Sticky enroll card ───────────────────────────────────────────────────────
function EnrollCard({ course, enrolled, enrolling, onEnroll, user, navigate }) {
  const domainColor = course.domain === 'QA Engineering' ? OG : '#7c3aed'

  return (
    <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #DDDDDD', boxShadow: '0 8px 40px rgba(0,0,0,0.1)', overflow: 'hidden', position: 'sticky', top: 88 }}>
      {/* Top accent */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${domainColor}, ${OG2})` }} />

      <div style={{ padding: '24px' }}>
        {/* Price */}
        <div style={{ marginBottom: 20 }}>
          {course.is_free
            ? <div style={{ fontSize: 32, fontWeight: 800, color: '#16a34a' }}>Free</div>
            : <div style={{ fontSize: 32, fontWeight: 800, color: '#08060d' }}>₹{course.price?.toLocaleString()}</div>
          }
          {!course.is_free && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>One-time payment · Lifetime access</div>}
        </div>

        {/* CTA */}
        {enrolled ? (
          <button onClick={() => navigate(`/learn/${course.id}`)} style={{ width: '100%', padding: '14px', borderRadius: 11, border: 'none', background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(34,197,94,0.3)', marginBottom: 12 }}>
            <HiOutlinePlay size={16} /> Continue Learning
          </button>
        ) : (
          <button onClick={() => user ? onEnroll() : navigate('/auth')} disabled={enrolling} style={{ width: '100%', padding: '14px', borderRadius: 11, border: 'none', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 15, fontWeight: 700, cursor: enrolling ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 18px rgba(232,89,12,0.35)', marginBottom: 12, opacity: enrolling ? 0.8 : 1, transition: 'all 0.2s' }}>
            {enrolling ? 'Enrolling…' : course.is_free ? 'Enroll for Free' : 'Enroll Now'}
          </button>
        )}

        {!user && !enrolled && (
          <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', margin: '0 0 16px' }}>
            <span style={{ color: OG, cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/auth')}>Log in</span> or <span style={{ color: OG, cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/auth?mode=register')}>sign up</span> to enroll
          </p>
        )}

        <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0 16px' }} />

        {/* Course meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: HiOutlineAcademicCap, label: 'Level', value: course.level },
            { icon: HiOutlineClock,        label: 'Duration', value: course.duration ? `${course.duration} hours` : 'Self-paced' },
            { icon: HiOutlineBookOpen,     label: 'Domain', value: course.domain },
            { icon: HiOutlineBadgeCheck,   label: 'Certificate', value: 'On completion' },
            { icon: HiOutlineUsers,        label: 'Access', value: 'Lifetime' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <Icon size={15} style={{ color: OG, flexShrink: 0 }} />
              <span style={{ color: '#6b6375', flex: 1 }}>{label}</span>
              <span style={{ color: '#1A1A1A', fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main CourseDetail ─────────────────────────────────────────────────────────
export default function CourseDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  const [course, setCourse]     = useState(null)
  const [modules, setModules]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [user, setUser]         = useState(null)
  const [profile, setProfile]   = useState(null)
  const [enrolled, setEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
        checkEnrolled(session.user.id)
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) { fetchProfile(session.user.id); checkEnrolled(session.user.id) }
      else { setProfile(null); setEnrolled(false) }
    })
    fetchCourse()
    return () => listener.subscription.unsubscribe()
  }, [courseId])

  const fetchCourse = async () => {
    const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single()
    if (!courseData) { navigate('/courses'); return }
    setCourse(courseData)

    const { data: mods } = await supabase.from('modules').select('*').eq('course_id', courseId).order('order_index')
    if (mods) {
      const withLessons = await Promise.all(mods.map(async mod => {
        const { data: lessons } = await supabase.from('lessons').select('id, title, order_index').eq('module_id', mod.id).order('order_index')
        return { ...mod, lessons: lessons || [] }
      }))
      setModules(withLessons)
    }
    setLoading(false)
  }

  const fetchProfile = async (id) => {
    const { data } = await supabase.from('users').select('name').eq('id', id).single()
    if (data) setProfile(data)
  }

  const checkEnrolled = async (userId) => {
    const { data } = await supabase.from('enrollments').select('id').eq('user_id', userId).eq('course_id', courseId).single()
    setEnrolled(!!data)
  }

  const handleEnroll = async () => {
    if (!user) { navigate('/auth'); return }
    if (course.is_free) {
      setEnrolling(true)
      const existing = await supabase.from('enrollments').select('id').eq('user_id', user.id).eq('course_id', courseId).single()
      if (!existing.data) {
        await supabase.from('enrollments').insert([{ user_id: user.id, course_id: courseId }])
      }
      setEnrolled(true)
      setEnrolling(false)
      navigate(`/learn/${courseId}`)
    } else {
      alert('Payment gateway coming soon!')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${OGB}`, borderTop: `3px solid ${OG}`, animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!course) return null

  const totalLessons = modules.reduce((a, m) => a + (m.lessons?.length || 0), 0)
  const goals = Array.isArray(course.goals) ? course.goals : []
  const domainColor = course.domain === 'QA Engineering' ? OG : '#7c3aed'
  const domainBg    = course.domain === 'QA Engineering' ? OGB : '#f5f3ff'

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      <Navbar user={user} profile={profile} onLogout={handleLogout} />

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg, #08060d 0%, #1a0e06 60%, #08060d 100%)', paddingTop: 96, paddingBottom: 0 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 5% 0', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'start' }}>
          {/* Left */}
          <div style={{ paddingBottom: 48, animation: 'fadeUp 0.5s ease both' }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 12, color: '#6b6375' }}>
              <span style={{ cursor: 'pointer', color: '#9ca3af' }} onClick={() => navigate('/courses')}>Courses</span>
              <HiOutlineChevronRight size={12} />
              <span style={{ color: OG, fontWeight: 600 }}>{course.domain}</span>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: domainBg, color: domainColor }}>{course.domain}</span>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.08)', color: '#9ca3af' }}>{course.level}</span>
              {course.is_free && <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Free</span>}
              {enrolled && <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Enrolled</span>}
            </div>

            {/* Title */}
            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', fontFamily: "'Georgia', serif", margin: '0 0 16px', lineHeight: 1.25 }}>
              {course.title}
            </h1>

            {/* Description */}
            <p style={{ fontSize: 16, color: '#9ca3af', lineHeight: 1.75, margin: '0 0 28px', maxWidth: 600 }}>
              {course.description}
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {[
                { icon: HiOutlineBookOpen, label: `${modules.length} modules` },
                { icon: HiOutlineDocument, label: `${totalLessons} lessons` },
                { icon: HiOutlineClock,    label: course.duration ? `${course.duration} hours` : 'Self-paced' },
                { icon: HiOutlineAcademicCap, label: course.level },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9ca3af' }}>
                  <Icon size={15} style={{ color: OG }} /> {label}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Enroll card floats in hero */}
          <div style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
            <EnrollCard
              course={course}
              enrolled={enrolled}
              enrolling={enrolling}
              onEnroll={handleEnroll}
              user={user}
              navigate={navigate}
            />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 5% 80px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>

          {/* What you'll learn */}
          {goals.length > 0 && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 20 }}>What you'll learn</h2>
              <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #DDDDDD', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {goals.map((goal, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: `linear-gradient(135deg, ${OG}, ${OG2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, boxShadow: '0 2px 6px rgba(232,89,12,0.3)' }}>
                        <HiOutlineCheck size={10} style={{ color: '#fff' }} />
                      </div>
                      <span style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 1.55 }}>{goal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Curriculum */}
          {modules.length > 0 && (
            <div style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
              <CurriculumSection modules={modules} isEnrolled={enrolled} />
            </div>
          )}

          {/* Requirements / About section */}
          <div style={{ animation: 'fadeUp 0.5s ease 0.15s both' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 16 }}>About this course</h2>
            <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #DDDDDD', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', fontSize: 15, color: '#6b6375', lineHeight: 1.8 }}>
              {course.description || 'No description available.'}
            </div>
          </div>

          {/* Certificate section */}
          <div style={{ animation: 'fadeUp 0.5s ease 0.2s both' }}>
            <div style={{ background: `linear-gradient(135deg, ${OGB}, #fff8f5)`, borderRadius: 16, padding: '28px', border: `1.5px solid ${OGL}`, borderLeft: `5px solid ${OG}`, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${OG}, ${OG2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(232,89,12,0.3)' }}>
                <HiOutlineStar size={26} style={{ color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 4 }}>Certificate of Completion</div>
                <div style={{ fontSize: 13, color: '#6b6375', lineHeight: 1.6 }}>Complete all lessons and pass the final assessment to earn your verified Adhyot certificate.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — sticky card (hidden on mobile, shown in hero on desktop) */}
        <div style={{ display: 'none' }} />
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #DDDDDD', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, zIndex: 90, boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
        <div>
          {course.is_free
            ? <span style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>Free</span>
            : <span style={{ fontSize: 20, fontWeight: 800, color: '#08060d' }}>₹{course.price?.toLocaleString()}</span>
          }
        </div>
        {enrolled ? (
          <button onClick={() => navigate(`/learn/${courseId}`)} style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            <HiOutlinePlay size={15} /> Continue
          </button>
        ) : (
          <button onClick={() => user ? handleEnroll() : navigate('/auth')} disabled={enrolling} style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(232,89,12,0.3)', opacity: enrolling ? 0.8 : 1 }}>
            {enrolling ? 'Enrolling…' : course.is_free ? 'Enroll Free' : 'Enroll Now'}
          </button>
        )}
      </div>
    </div>
  )
}