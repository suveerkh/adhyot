import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineViewGrid, HiOutlineLogout } from 'react-icons/hi'
import supabase from '../supabaseClient'


function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const fetchProfile = async (id) => {
    const { data } = await supabase.from('users').select('name, role').eq('id', id).single()
    if (data) setProfile(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setDropdownOpen(false)
    navigate('/')
  }

  const name = profile?.name || user?.email?.split('@')[0] || ''
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid #DDDDDD' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 5%',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #E8590C, #ff8c42)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Georgia', serif", fontWeight: 700, color: '#fff', fontSize: 18,
          }}>A</div>
          <span style={{ fontFamily: "'Georgia', serif", fontWeight: 700, fontSize: 22, color: '#08060d', letterSpacing: '-0.5px' }}>
            Adhyot
          </span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="hidden-mobile">
          <a href="/courses" style={{ color: '#6b6375', fontSize: 15, textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#E8590C'}
            onMouseLeave={e => e.target.style.color = '#6b6375'}
          >Courses</a>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }} className="hidden-mobile">
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setDropdownOpen(o => !o)} style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #E8590C, #ff8c42)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff',
                boxShadow: '0 2px 8px rgba(232,89,12,0.35)',
                transition: 'transform 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >{initials}</button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: '120%', right: 0,
                  background: '#fff', borderRadius: 12,
                  border: '1px solid #DDDDDD',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                  minWidth: 200, overflow: 'hidden', zIndex: 200,
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #DDDDDD' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#08060d' }}>{name}</div>
                    <div style={{ fontSize: 12, color: '#6b6375', marginTop: 2 }}>{user.email}</div>
                  </div>
                  <button onClick={() => navigate(profile?.role === 'admin' ? '/admin' : '/dashboard')} style={{
                    width: '100%', padding: '12px 16px', textAlign: 'left',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 14, color: '#1A1A1A', fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'background 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FFF3EC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  ><HiOutlineViewGrid size={16} /> {profile?.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}</button>
                  <div style={{ height: 1, background: '#DDDDDD' }} />
                  <button onClick={handleLogout} style={{
                    width: '100%', padding: '12px 16px', textAlign: 'left',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 14, color: '#ef4444', fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'background 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  ><HiOutlineLogout size={16} /> Log Out</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/auth')} style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #E8590C, #ff7c35)',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(232,89,12,0.35)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
            >Get Started</button>
          )}
        </div>
      </div>
    </nav>
  )
}

function HeroSection() {
  const navigate = useNavigate()
  return (
    <section style={{
      minHeight: '75vh',
      background: 'linear-gradient(160deg, #fff 0%, #FFF3EC 50%, #fff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '100px 5% 60px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '10%', right: '8%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,89,12,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', left: '5%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,89,12,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 800, width: '100%', margin: '0 auto', textAlign: 'center', animation: 'fadeUp 0.8s ease forwards' }}>
        <h1 style={{
          fontFamily: "'Georgia', serif",
          fontSize: 'clamp(38px, 5vw, 64px)',
          fontWeight: 700, lineHeight: 1.1,
          color: '#08060d', letterSpacing: '-2px',
          marginBottom: 28,
        }}>
          Launch Your Career in<br />
          <span style={{ color: '#E8590C' }}>QA & Cybersecurity</span>
        </h1>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
          {['2 Courses Available', 'QA Engineering', 'Cybersecurity'].map(item => (
            <div key={item} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#FFF3EC', border: '1px solid rgba(232,89,12,0.2)',
              borderRadius: 100, padding: '6px 16px',
            }}>
              <span style={{ fontSize: 13, color: '#E8590C', fontWeight: 600 }}>{item}</span>
            </div>
          ))}
        </div>

        <button onClick={() => navigate('/courses')} style={{
          padding: '14px 32px', borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg, #E8590C, #ff7c35)',
          color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 6px 24px rgba(232,89,12,0.4)',
          transition: 'all 0.25s',
        }}
          onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 30px rgba(232,89,12,0.45)' }}
          onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 6px 24px rgba(232,89,12,0.4)' }}
        >
          Explore Courses →
        </button>
      </div>
    </section>
  )
}

function CTASection() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (user) return null
  return (
    <section style={{ padding: '100px 5%', background: '#fff' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, #E8590C 0%, #ff7c35 100%)',
          borderRadius: 24, padding: '64px 48px',
          boxShadow: '0 20px 60px rgba(232,89,12,0.3)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <h2 style={{
            fontFamily: "'Georgia', serif",
            fontSize: 'clamp(26px, 4vw, 40px)',
            fontWeight: 700, color: '#fff', letterSpacing: '-1px', marginBottom: 16,
          }}>Ready to Get Started?</h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', marginBottom: 36, lineHeight: 1.6 }}>
            No credit card needed to get started.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{
              padding: '14px 36px', borderRadius: 10, border: 'none',
              background: '#fff', color: '#E8590C',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)', transition: 'all 0.25s',
            }}
              onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
              onClick={() => navigate('/auth', { state: { mode: 'register' } })}
            >Create Free Account</button>
            <button style={{
              padding: '14px 36px', borderRadius: 10,
              border: '2px solid rgba(255,255,255,0.5)',
              background: 'transparent', color: '#fff',
              fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s',
            }}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.target.style.background = 'transparent'}
              onClick={() => navigate('/courses')}
            >Browse Courses</button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{ background: '#08060d', color: '#9ca3af', padding: '60px 5% 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #E8590C, #ff8c42)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Georgia', serif", fontWeight: 700, color: '#fff', fontSize: 16,
              }}>A</div>
              <span style={{ fontFamily: "'Georgia', serif", fontWeight: 700, fontSize: 20, color: '#fff' }}>Adhyot</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#6b7280', maxWidth: 260 }}>
              Delivering accessible, high-quality QA and Cybersecurity education through structured digital learning.
            </p>
          </div>
          {[
            { title: 'Courses', links: [
              { label: 'QA Engineering', href: '/courses' },
              { label: 'Cybersecurity',  href: '/courses' },
              { label: 'Free Courses',   href: '/courses' },
            ]},
            { title: 'Support', links: [
              { label: 'About Us',       href: '#' },
              { label: 'Contact',        href: '#' },
              { label: 'Privacy Policy', href: '#' },
              { label: 'Terms of Use',   href: '#' },
            ]},
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>{col.title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <a key={link.label} href={link.href} style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#E8590C'}
                    onMouseLeave={e => e.target.style.color = '#6b7280'}
                  >{link.label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #1f2937', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13 }}>© 2026 Adhyot. All rights reserved.</p>
          <p style={{ fontSize: 13 }}>Made with love for aspiring tech professionals</p>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hidden-mobile { display: flex; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
      <Navbar />
      <HeroSection />
      <CTASection />
      <Footer />
    </>
  )
}