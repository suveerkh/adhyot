import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineBookOpen, HiOutlineAcademicCap, HiOutlineClock,
  HiOutlineCheck, HiOutlinePlay, HiOutlineLogout,
  HiOutlineChevronRight, HiOutlineStar, HiOutlineDocument,
  HiOutlineCollection, HiOutlineUser,
} from 'react-icons/hi'
import supabase from '../supabaseClient'

// ─── Theme ────────────────────────────────────────────────────────────────────
const OG  = '#E8590C'
const OG2 = '#ff7c35'
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
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={pct === 100 ? '#22c55e' : OG} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {pct === 100
          ? <HiOutlineCheck size={size * 0.3} style={{ color: '#22c55e' }} />
          : <span style={{ fontSize: size * 0.22, fontWeight: 700, color: pct > 0 ? OG : '#9ca3af', lineHeight: 1 }}>{pct}%</span>
        }
      </div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = OG, bg = OGB }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '22px 24px', border: '1px solid #DDDDDD', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 13, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#08060d', fontFamily: "'Georgia', serif", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: '#6b6375', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  )
}

// ─── Course Progress Card ─────────────────────────────────────────────────────
function CourseCard({ enrollment, navigate, setTab }) {
  const course = enrollment.courses
  if (!course) return null
  const pct = enrollment.progress_pct || 0
  const domainColor = course.domain === 'QA Engineering' ? OG : '#7c3aed'
  const domainBg    = course.domain === 'QA Engineering' ? OGB : '#f5f3ff'

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #DDDDDD', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer' }}
      onClick={() => pct === 100 ? setTab('certificates') : navigate(`/learn/${course.id}`)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = OGL; e.currentTarget.style.boxShadow = '0 8px 30px rgba(232,89,12,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#DDDDDD'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Top accent */}
      <div style={{ height: 4, background: pct === 100 ? 'linear-gradient(90deg, #16a34a, #22c55e)' : `linear-gradient(90deg, ${OG}, ${OG2})` }} />

      <div style={{ padding: '20px 22px' }}>
        {/* Domain badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: domainBg, color: domainColor }}>{course.domain}</span>
          {pct === 100 && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: '#dcfce7', color: '#16a34a' }}>Completed</span>}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", margin: '0 0 8px', lineHeight: 1.3 }}>{course.title}</h3>

        {/* Level */}
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 18 }}>{course.level} · {course.duration ? `${course.duration}h` : 'Self-paced'}</div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <CircleProgress pct={pct} size={44} stroke={4} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>
              {pct === 0 ? 'Not started' : pct === 100 ? 'Completed!' : `${pct}% complete`}
            </div>
            <div style={{ height: 6, background: '#f3f4f6', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'linear-gradient(90deg, #16a34a, #22c55e)' : `linear-gradient(90deg, ${OG}, ${OG2})`, borderRadius: 100, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
          </div>
        </div>

        {/* CTA */}
        <button style={{ width: '100%', padding: '10px', borderRadius: 9, border: 'none', background: pct === 100 ? '#f0fdf4' : `linear-gradient(135deg, ${OG}, ${OG2})`, color: pct === 100 ? '#16a34a' : '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: pct === 100 ? 'none' : '0 4px 12px rgba(232,89,12,0.25)', transition: 'all 0.2s' }}>
          {pct === 100 ? <><HiOutlineStar size={14} /> View Certificate</> : pct === 0 ? <><HiOutlinePlay size={14} /> Start Learning</> : <><HiOutlinePlay size={14} /> Continue</>}
        </button>
      </div>
    </div>
  )
}

// ─── Certificate Card ─────────────────────────────────────────────────────────
function CertificateCard({ cert, navigate }) {
  const course = cert.courses
  if (!course) return null
  return (
    <div style={{ background: `linear-gradient(135deg, ${OGB}, #fff8f5)`, borderRadius: 16, padding: '20px 22px', border: `1.5px solid ${OGL}`, borderLeft: `4px solid ${OG}`, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(232,89,12,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 13, background: `linear-gradient(135deg, ${OG}, ${OG2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(232,89,12,0.3)' }}>
        <HiOutlineStar size={22} style={{ color: '#fff' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#08060d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</div>
        <div style={{ fontSize: 12, color: '#6b6375', marginTop: 3 }}>Issued {new Date(cert.issued_at || cert.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
      </div>
      <div onClick={() => navigate(`/certificate?id=${cert.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: '#fff', border: `1px solid ${OGL}`, fontSize: 12, fontWeight: 700, color: OG, flexShrink: 0, cursor: 'pointer' }}>
        <HiOutlineDocument size={13} /> View & Download
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate()
  const [user, setUser]             = useState(null)
  const [profile, setProfile]       = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState('courses')
  const [userId, setUserId]         = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/auth', { state: { mode: 'login' } }); return }
      setUser(session.user)
      setUserId(session.user.id)
      loadData(session.user.id)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate('/auth', { state: { mode: 'login' } })
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // Re-fetch certificates every time the tab is switched to 'certificates'
  useEffect(() => {
    if (activeTab === 'certificates' && userId) {
      fetchCertificates(userId)
    }
  }, [activeTab, userId])

  const fetchCertificates = async (userId) => {
    // Fetch certs without join first, then manually attach course titles
    const { data: certData } = await supabase
      .from('certificates').select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false })
    if (!certData?.length) { setCertificates([]); return }
    // Fetch course titles for each cert
    const courseIds = [...new Set(certData.map(c => c.course_id).filter(Boolean))]
    const { data: coursesData } = await supabase.from('courses').select('id, title').in('id', courseIds)
    const courseMap = Object.fromEntries((coursesData || []).map(c => [c.id, c]))
    setCertificates(certData.map(cert => ({ ...cert, courses: courseMap[cert.course_id] || null })))
  }

  const loadData = async (userId) => {
    const [{ data: profileData }, { data: enrollData }] = await Promise.all([
      supabase.from('users').select('name, email, role').eq('id', userId).single(),
      supabase.from('enrollments').select('*, courses(id, title, domain, level, duration, is_free)').eq('user_id', userId).order('created_at', { ascending: false }),
    ])
    if (profileData?.role === 'admin') { navigate('/admin'); return }
    if (profileData) setProfile(profileData)
    setEnrollments(enrollData || [])
    await fetchCertificates(userId)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const name = profile?.name || user?.email?.split('@')[0] || ''
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const completed = enrollments.filter(e => (e.progress_pct || 0) === 100)
  const inProgress = enrollments.filter(e => (e.progress_pct || 0) > 0 && (e.progress_pct || 0) < 100)
  const notStarted = enrollments.filter(e => (e.progress_pct || 0) === 0)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${OGB}`, borderTop: `3px solid ${OG}`, animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── Sidebar ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, background: '#08060d', zIndex: 50, display: 'flex', flexDirection: 'column', padding: '0 0 24px' }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px', borderBottom: '1px solid #1f1815' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${OG}, ${OG2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Georgia', serif", fontWeight: 700, color: '#fff', fontSize: 17 }}>A</div>
            <div>
              <div style={{ fontFamily: "'Georgia', serif", fontWeight: 700, fontSize: 18, color: '#fff' }}>Adhyot</div>
              <div style={{ fontSize: 10, color: '#6b6375', marginTop: 1 }}>Student Portal</div>
            </div>
          </a>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { id: 'courses',      icon: HiOutlineBookOpen,    label: 'My Courses' },
            { id: 'certificates', icon: HiOutlineStar,         label: 'Certificates' },
            { id: 'profile',      icon: HiOutlineUser,         label: 'Profile' },
          ].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left',
              background: activeTab === id ? 'rgba(232,89,12,0.15)' : 'transparent',
              color: activeTab === id ? OG : '#9ca3af',
              fontSize: 14, fontWeight: activeTab === id ? 600 : 500,
              borderLeft: `3px solid ${activeTab === id ? OG : 'transparent'}`,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (activeTab !== id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (activeTab !== id) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={18} /> {label}
            </button>
          ))}

          <div style={{ height: 1, background: '#1f1815', margin: '8px 0' }} />

          <button onClick={() => navigate('/courses')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', background: 'transparent', color: '#9ca3af', fontSize: 14, fontWeight: 500, borderLeft: '3px solid transparent', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af' }}
          >
            <HiOutlineCollection size={18} /> Browse Courses
          </button>
        </nav>

        {/* User + logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1f1815' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${OG}, ${OG2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
              <div style={{ fontSize: 11, color: '#6b6375' }}>Student</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          ><HiOutlineLogout size={16} /> Log Out</button>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ marginLeft: 240, padding: '36px 40px 80px', minHeight: '100vh' }}>

        {/* My Courses tab */}
        {activeTab === 'courses' && (
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#08060d', fontFamily: "'Georgia', serif", margin: '0 0 6px' }}>
                Welcome back, {name.split(' ')[0] || 'there'} 👋
              </h1>
              <p style={{ fontSize: 15, color: '#6b6375', margin: 0 }}>
                {enrollments.length === 0 ? "You haven't enrolled in any courses yet." : `You're enrolled in ${enrollments.length} course${enrollments.length !== 1 ? 's' : ''}.`}
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
              <StatCard icon={HiOutlineBookOpen}    label="Enrolled"    value={enrollments.length}  color={OG}        bg={OGB} />
              <StatCard icon={HiOutlinePlay}        label="In Progress" value={inProgress.length}   color="#3b82f6"   bg="#eff6ff" />
              <StatCard icon={HiOutlineCheck}       label="Completed"   value={completed.length}    color="#16a34a"   bg="#f0fdf4" />
              <StatCard icon={HiOutlineStar}        label="Certificates" value={certificates.length} color="#f59e0b"  bg="#fffbeb" />
            </div>

            {/* In progress */}
            {inProgress.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", margin: 0 }}>Continue Learning</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                  {inProgress.map((e, i) => (
                    <div key={e.id} style={{ animation: `fadeUp 0.4s ease ${i * 0.06}s both` }}>
                      <CourseCard enrollment={e} navigate={navigate} setTab={setActiveTab} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not started */}
            {notStarted.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 16 }}>Not Started</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                  {notStarted.map((e, i) => (
                    <div key={e.id} style={{ animation: `fadeUp 0.4s ease ${i * 0.06}s both` }}>
                      <CourseCard enrollment={e} navigate={navigate} setTab={setActiveTab} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 16 }}>Completed</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                  {completed.map((e, i) => (
                    <div key={e.id} style={{ animation: `fadeUp 0.4s ease ${i * 0.06}s both` }}>
                      <CourseCard enrollment={e} navigate={navigate} setTab={setActiveTab} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {enrollments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 20, border: '2px dashed #DDDDDD' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: OGB, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <HiOutlineBookOpen size={28} style={{ color: OG }} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 8 }}>No courses yet</h3>
                <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>Browse our catalogue and enroll in your first course.</p>
                <button onClick={() => navigate('/courses')} style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(232,89,12,0.3)' }}>
                  Browse Courses
                </button>
              </div>
            )}
          </div>
        )}

        {/* Certificates tab */}
        {activeTab === 'certificates' && (
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#08060d', fontFamily: "'Georgia', serif", margin: '0 0 6px' }}>Certificates</h1>
              <p style={{ fontSize: 15, color: '#6b6375', margin: 0 }}>
                {certificates.length === 0 ? 'Complete a course to earn your first certificate.' : `You've earned ${certificates.length} certificate${certificates.length !== 1 ? 's' : ''}.`}
              </p>
            </div>

            {certificates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 20, border: '2px dashed #DDDDDD' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: OGB, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <HiOutlineStar size={28} style={{ color: OG }} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 8 }}>No certificates yet</h3>
                <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>Finish a course and pass the assessment to earn one.</p>
                <button onClick={() => setActiveTab('courses')} style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(232,89,12,0.3)' }}>
                  View My Courses
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {certificates.map((cert, i) => (
                  <div key={cert.id} style={{ animation: `fadeUp 0.4s ease ${i * 0.06}s both` }}>
                    <CertificateCard cert={cert} navigate={navigate} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div style={{ animation: 'fadeUp 0.4s ease both', maxWidth: 560 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#08060d', fontFamily: "'Georgia', serif", margin: '0 0 28px' }}>Profile</h1>
            <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #DDDDDD', padding: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${OG}, ${OG2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: '0 4px 16px rgba(232,89,12,0.3)' }}>{initials}</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif" }}>{name}</div>
                  <div style={{ fontSize: 13, color: '#6b6375', marginTop: 3 }}>{profile?.email || user?.email}</div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 28 }}>
                {[
                  { label: 'Enrolled',    value: enrollments.length },
                  { label: 'Completed',   value: completed.length },
                  { label: 'Certificates', value: certificates.length },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', padding: '16px', background: OGB, borderRadius: 12, border: `1px solid ${OGL}` }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: OG, fontFamily: "'Georgia', serif" }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: '#6b6375', marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/courses')} style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(232,89,12,0.3)' }}>
                <HiOutlineBookOpen size={16} /> Browse More Courses
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}