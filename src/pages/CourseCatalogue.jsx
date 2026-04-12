import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  HiOutlineSearch, HiOutlineBookOpen, HiOutlineClock,
  HiOutlineAcademicCap, HiOutlineChevronDown, HiOutlineX,
  HiOutlineLogout, HiOutlineViewGrid, HiOutlineFilter,
  HiOutlineMenuAlt3,
} from 'react-icons/hi'
import supabase from '../supabaseClient'

// ─── Theme ────────────────────────────────────────────────────────────────────
const OG  = '#E8590C'
const OG2 = '#ff7c35'
const OGB = '#FFF3EC'
const OGL = '#fcd9c0'

// ─── Navbar (matches LandingPage exactly) ─────────────────────────────────────
function Navbar({ user, profile, onLogout }) {
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const name = profile?.name || user?.email?.split('@')[0] || ''
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: '1px solid #DDDDDD',
      transition: 'all 0.3s ease', padding: '0 5%',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #E8590C, #ff8c42)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Georgia', serif", fontWeight: 700, color: '#fff', fontSize: 18 }}>A</div>
          <span style={{ fontFamily: "'Georgia', serif", fontWeight: 700, fontSize: 22, color: '#08060d', letterSpacing: '-0.5px' }}>Adhyot</span>
        </a>
        <div className="cc-desktop" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="/courses" style={{ color: OG, fontSize: 15, textDecoration: 'none', fontWeight: 700 }}>Courses</a>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setDropdownOpen(d => !d)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', borderRadius: 100, border: `1.5px solid ${OGL}`, background: OGB, cursor: 'pointer' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${OG}, ${OG2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{initials}</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{name}</span>
                <HiOutlineChevronDown size={13} style={{ color: '#6b6375' }} />
              </button>
              {dropdownOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#fff', borderRadius: 12, border: '1px solid #DDDDDD', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '6px', minWidth: 180, zIndex: 200 }}>
                  <button onClick={() => { navigate('/dashboard'); setDropdownOpen(false) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#1A1A1A', fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.background = OGB}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  ><HiOutlineViewGrid size={15} /> Dashboard</button>
                  <div style={{ height: 1, background: '#DDDDDD', margin: '4px 0' }} />
                  <button onClick={() => { onLogout(); setDropdownOpen(false) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#ef4444', fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  ><HiOutlineLogout size={15} /> Log Out</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => navigate('/auth', { state: { mode: 'login' } })} style={{ padding: '9px 20px', borderRadius: 9, border: '1.5px solid #DDDDDD', background: '#fff', color: '#1A1A1A', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Log In</button>
              <button onClick={() => navigate('/auth?mode=register')} style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(232,89,12,0.3)' }}>Get Started</button>
            </div>
          )}
        </div>
      {/* Hamburger */}
          <button className="cc-mobile" onClick={() => setMobileOpen(true)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#08060d', padding: 4, alignItems: 'center' }}>
            <HiOutlineMenuAlt3 size={26} />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(8,6,13,0.5)', zIndex: 299 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 280, background: '#fff', zIndex: 300, boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <span style={{ fontFamily: "'Georgia', serif", fontWeight: 700, fontSize: 20, color: '#08060d' }}>Adhyot</span>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6375' }}><HiOutlineX size={22} /></button>
            </div>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid #DDDDDD', marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #E8590C, #ff7c35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>{initials}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#08060d' }}>{name}</div>
                  <div style={{ fontSize: 12, color: '#6b6375' }}>{user.email}</div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              <a href="/courses" onClick={() => setMobileOpen(false)} style={{ padding: '13px 0', fontSize: 16, fontWeight: 600, color: '#E8590C', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>Courses</a>
              {user && <button onClick={() => { navigate('/dashboard'); setMobileOpen(false) }} style={{ padding: '13px 0', fontSize: 16, fontWeight: 600, color: '#1A1A1A', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', textAlign: 'left' }}>Dashboard</button>}
            </div>
            <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {user ? (
                <button onClick={() => { onLogout(); setMobileOpen(false) }} style={{ padding: '13px', borderRadius: 10, border: '1.5px solid #fecaca', background: '#fef2f2', color: '#ef4444', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Log Out</button>
              ) : (
                <>
                  <button onClick={() => { navigate('/auth?mode=register'); setMobileOpen(false) }} style={{ padding: '13px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #E8590C, #ff7c35)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Get Started</button>
                  <button onClick={() => { navigate('/auth', { state: { mode: 'login' } }); setMobileOpen(false) }} style={{ padding: '13px', borderRadius: 10, border: '1.5px solid #DDDDDD', background: '#fff', color: '#1A1A1A', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Log In</button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, enrolled, onEnroll, user }) {
  const navigate = useNavigate()
  const [hovering, setHovering] = useState(false)

  const domainColor = course.domain === 'QA Engineering' ? OG : '#7c3aed'
  const domainBg    = course.domain === 'QA Engineering' ? OGB : '#f5f3ff'
  const pct         = enrolled?.progress_pct || 0
  const isCompleted = pct === 100
  const isEnrolled  = !!enrolled

  const handleClick = () => {
    if (isEnrolled) {
      navigate(`/learn/${course.id}`)
    } else {
      navigate(`/courses/${course.id}`)
    }
  }

  const handleEnrollBtn = (e) => {
    e.stopPropagation()
    if (!user) { navigate('/auth', { state: { mode: 'login' } }); return }
    onEnroll(course)
  }



  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        background: '#fff', borderRadius: 16,
        border: `1.5px solid ${hovering ? OGL : '#DDDDDD'}`,
        boxShadow: hovering ? '0 12px 40px rgba(232,89,12,0.12)' : '0 2px 10px rgba(0,0,0,0.04)',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        transform: hovering ? 'translateY(-4px)' : 'translateY(0)',
        cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}
      onClick={handleClick}
    >
      {/* Card top accent */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${domainColor}, ${hovering ? OG2 : domainColor})`, transition: 'all 0.3s' }} />

      <div style={{ padding: '22px 24px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Domain + Level badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: domainBg, color: domainColor }}>
            {course.domain}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: '#f4f5f7', color: '#6b6375' }}>
            {course.level}
          </span>
          {isEnrolled && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: isCompleted ? '#dcfce7' : OGB, color: isCompleted ? '#16a34a' : OG, marginLeft: 'auto' }}>
              {isCompleted ? 'Completed' : 'Enrolled'}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", margin: '0 0 10px', lineHeight: 1.35 }}>
          {course.title}
        </h3>

        {/* Description */}
        <p style={{ fontSize: 13, color: '#6b6375', lineHeight: 1.65, margin: '0 0 18px', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.description || 'No description available.'}
        </p>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          {course.duration && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#9ca3af' }}>
              <HiOutlineClock size={13} /> {course.duration}h
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#9ca3af' }}>
            <HiOutlineAcademicCap size={13} /> {course.level}
          </div>
        </div>

        {/* Price + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
          <div>
            {course.is_free
              ? <span style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>Free</span>
              : <span style={{ fontSize: 18, fontWeight: 800, color: '#08060d' }}>₹{course.price?.toLocaleString()}</span>
            }
          </div>
          <button
            onClick={e => { e.stopPropagation(); if (isEnrolled) navigate(`/learn/${course.id}`); else if (course.is_free) handleEnrollBtn(e); else navigate(`/courses/${course.id}`); }}
            style={{
              padding: '9px 20px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: isCompleted ? '#dcfce7' : isEnrolled ? `linear-gradient(135deg, ${OG}, ${OG2})` : `linear-gradient(135deg, ${OG}, ${OG2})`,
              color: isCompleted ? '#16a34a' : '#fff',
              boxShadow: isCompleted || !isEnrolled ? 'none' : '0 4px 12px rgba(232,89,12,0.3)',
              transition: 'all 0.2s',
            }}
          >
            {isCompleted ? 'Completed ✓' : isEnrolled ? 'Continue' : course.is_free ? 'Enroll Free' : 'View Course'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Enroll Modal ─────────────────────────────────────────────────────────────
function EnrollModal({ course, onClose, onConfirm, loading }) {
  if (!course) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,6,13,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '36px', maxWidth: 440, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'popIn 0.2s ease' }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: OGB, border: `1.5px solid ${OGL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <HiOutlineBookOpen size={26} style={{ color: OG }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", textAlign: 'center', marginBottom: 8 }}>
          {course.is_free ? 'Enroll for Free' : 'Enroll in Course'}
        </h2>
        <p style={{ fontSize: 14, color: '#6b6375', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
          {course.title}
        </p>
        {!course.is_free && (
          <div style={{ padding: '14px 18px', background: OGB, borderRadius: 10, border: `1px solid ${OGL}`, textAlign: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#08060d' }}>₹{course.price?.toLocaleString()}</span>
            <span style={{ fontSize: 13, color: '#6b6375', marginLeft: 6 }}>one-time payment</span>
          </div>
        )}
        {course.is_free && (
          <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', textAlign: 'center', marginBottom: 20, fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
            This course is completely free
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #DDDDDD', background: '#fff', color: '#6b6375', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={() => onConfirm(course)} disabled={loading} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(232,89,12,0.3)', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Enrolling…' : course.is_free ? 'Start Learning' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main CourseCatalogue ─────────────────────────────────────────────────────
export default function CourseCatalogue() {
  const navigate = useNavigate()
  const [courses, setCourses]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [user, setUser]             = useState(null)
  const [profile, setProfile]       = useState(null)
  const [enrollments, setEnrollments] = useState([])  // {course_id, progress_pct}
  const [enrolling, setEnrolling]   = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [search, setSearch]         = useState('')
  const [domain, setDomain]         = useState('All')
  const [level, setLevel]           = useState('All')
  const [priceFilter, setPriceFilter] = useState('All')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
        fetchEnrollments(session.user.id)
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) { fetchProfile(session.user.id); fetchEnrollments(session.user.id) }
      else { setProfile(null); setEnrollments([]) }
    })
    fetchCourses()
    return () => listener.subscription.unsubscribe()
  }, [])

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').eq('is_published', true).order('created_at', { ascending: false })
    setCourses(data || [])
    setLoading(false)
  }

  const fetchProfile = async (id) => {
    const { data } = await supabase.from('users').select('name').eq('id', id).single()
    if (data) setProfile(data)
  }

  const fetchEnrollments = async (userId) => {
    const { data } = await supabase.from('enrollments').select('course_id, progress_pct').eq('user_id', userId)
    setEnrollments(data || [])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const handleEnroll = async (course) => {
    if (!user) { navigate('/auth', { state: { mode: 'login' } }); return }
    if (course.is_free) {
      setEnrolling(true)
      // upsert so duplicate enrollments don't block navigation
      const existing = await supabase.from('enrollments').select('id').eq('user_id', user.id).eq('course_id', course.id).single()
      if (!existing.data) {
        await supabase.from('enrollments').insert([{ user_id: user.id, course_id: course.id }])
      }
      setEnrollments(prev => prev.find(e => e.course_id === course.id) ? prev : [...prev, { course_id: course.id, progress_pct: 0 }])
      setSelectedCourse(null)
      setEnrolling(false)
      navigate(`/learn/${course.id}`)
    } else {
      setSelectedCourse(course)
    }
  }

  const handleEnrollConfirm = async (course) => {
    if (course.is_free) {
      await handleEnroll(course)
    } else {
      // TODO: Razorpay/Stripe
      alert('Payment gateway coming soon!')
    }
  }

  // Filtering
  const filtered = courses.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase())
    const matchDomain = domain === 'All' || c.domain === domain
    const matchLevel  = level  === 'All' || c.level  === level
    const matchPrice  = priceFilter === 'All' || (priceFilter === 'Free' ? c.is_free : !c.is_free)
    return matchSearch && matchDomain && matchLevel && matchPrice
  })

  const hasFilters = search || domain !== 'All' || level !== 'All' || priceFilter !== 'All'

  const clearFilters = () => { setSearch(''); setDomain('All'); setLevel('All'); setPriceFilter('All') }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', fontFamily: 'system-ui, sans-serif' }}>
      <Helmet>
        <title>Courses — Adhyot</title>
        <meta name="description" content="Browse QA Engineering and Cybersecurity courses on Adhyot. Free and paid courses with structured content, quizzes and certificates." />
        <meta property="og:title" content="Courses — Adhyot" />
        <meta property="og:description" content="Browse QA Engineering and Cybersecurity courses. Free and paid options available." />
        <meta property="og:url" content="https://adhyotlabs.in/courses" />
        <link rel="canonical" href="https://adhyotlabs.in/courses" />
      </Helmet>
      <style>{`
        @keyframes popIn  { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; }
        .cc-mobile  { display:none !important; }
        .cc-desktop { display:flex !important; }
        @media (max-width:768px) {
          .cc-mobile  { display:flex !important; }
          .cc-desktop { display:none !important; }
          .cc-hero-title { font-size:28px !important; }
          .cc-filter-bar { flex-direction:column !important; align-items:stretch !important; }
          .cc-filter-bar select { width:100% !important; }
        }
      `}</style>

      <Navbar user={user} profile={profile} onLogout={handleLogout} />

      {/* ── Hero strip ── */}
      <div style={{ background: `linear-gradient(135deg, #08060d 0%, #1a0e06 100%)`, paddingTop: 110, paddingBottom: 56, paddingLeft: '5%', paddingRight: '5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: OG, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>All Courses</div>
          <h1 className="cc-hero-title" style={{ fontSize: 40, fontWeight: 800, color: '#fff', fontFamily: "'Georgia', serif", margin: '0 0 12px', lineHeight: 1.2 }}>Learn QA &amp; Cybersecurity</h1>
          <p style={{ fontSize: 16, color: '#9ca3af', maxWidth: 520, lineHeight: 1.7, margin: 0 }}>
            Structured courses built for real-world careers in software testing and security.
          </p>

          {/* Search bar */}
          <div style={{ marginTop: 32, maxWidth: 560, position: 'relative' }}>
            <HiOutlineSearch size={17} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6b6375', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search courses…"
              style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: 12, border: '1.5px solid #2a2020', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 14, outline: 'none', backdropFilter: 'blur(8px)', fontFamily: 'system-ui' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6375', padding: 2 }}>
                <HiOutlineX size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filters + Grid ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 5% 80px' }}>

        {/* Filter bar */}
        <div className="cc-filter-bar" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          <HiOutlineFilter size={15} style={{ color: '#6b6375', flexShrink: 0 }} />

          {/* Domain */}
          <select value={domain} onChange={e => setDomain(e.target.value)} style={{ padding: '8px 14px', borderRadius: 9, border: `1.5px solid ${domain !== 'All' ? OG : '#DDDDDD'}`, background: domain !== 'All' ? OGB : '#fff', color: domain !== 'All' ? OG : '#1A1A1A', fontSize: 13, fontWeight: domain !== 'All' ? 700 : 500, cursor: 'pointer', outline: 'none', fontFamily: 'system-ui' }}>
            <option value="All">All Domains</option>
            <option value="QA Engineering">QA Engineering</option>
            <option value="Cybersecurity">Cybersecurity</option>
          </select>

          {/* Level */}
          <select value={level} onChange={e => setLevel(e.target.value)} style={{ padding: '8px 14px', borderRadius: 9, border: `1.5px solid ${level !== 'All' ? OG : '#DDDDDD'}`, background: level !== 'All' ? OGB : '#fff', color: level !== 'All' ? OG : '#1A1A1A', fontSize: 13, fontWeight: level !== 'All' ? 700 : 500, cursor: 'pointer', outline: 'none', fontFamily: 'system-ui' }}>
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* Price */}
          <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)} style={{ padding: '8px 14px', borderRadius: 9, border: `1.5px solid ${priceFilter !== 'All' ? OG : '#DDDDDD'}`, background: priceFilter !== 'All' ? OGB : '#fff', color: priceFilter !== 'All' ? OG : '#1A1A1A', fontSize: 13, fontWeight: priceFilter !== 'All' ? 700 : 500, cursor: 'pointer', outline: 'none', fontFamily: 'system-ui' }}>
            <option value="All">All Prices</option>
            <option value="Free">Free</option>
            <option value="Paid">Paid</option>
          </select>

          {hasFilters && (
            <button onClick={clearFilters} style={{ padding: '8px 14px', borderRadius: 9, border: '1.5px solid #fecaca', background: '#fef2f2', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <HiOutlineX size={12} /> Clear
            </button>
          )}

          <span style={{ marginLeft: 'auto', fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>
            {filtered.length} course{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, height: 320, border: '1.5px solid #DDDDDD', animation: 'pulse 1.5s ease infinite' }}>
                <div style={{ height: 4, background: '#f3f4f6', borderRadius: '14px 14px 0 0' }} />
                <div style={{ padding: 24 }}>
                  <div style={{ height: 20, background: '#f3f4f6', borderRadius: 6, marginBottom: 12, width: '40%' }} />
                  <div style={{ height: 24, background: '#f3f4f6', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ height: 24, background: '#f3f4f6', borderRadius: 6, marginBottom: 16, width: '70%' }} />
                  <div style={{ height: 60, background: '#f3f4f6', borderRadius: 6, marginBottom: 20 }} />
                  <div style={{ height: 36, background: '#f3f4f6', borderRadius: 9 }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: OGB, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <HiOutlineBookOpen size={28} style={{ color: OG }} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 8 }}>No courses found</h3>
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>Try adjusting your filters or search term.</p>
            <button onClick={clearFilters} style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 24 }}>
            {filtered.map((course, i) => (
              <div key={course.id} style={{ animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}>
                <CourseCard
                  course={course}
                  enrolled={enrollments.find(e => e.course_id === course.id)}
                  onEnroll={setSelectedCourse}
                  user={user}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enroll modal */}
      {selectedCourse && (
        <EnrollModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onConfirm={handleEnrollConfirm}
          loading={enrolling}
        />
      )}
    </div>
  )
}