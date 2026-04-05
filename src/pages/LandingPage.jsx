import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineViewGrid, HiOutlineLogout, HiOutlineMenuAlt3, HiOutlineX } from 'react-icons/hi'
import supabase from '../supabaseClient'

const OG  = '#E8590C'
const OG2 = '#ff7c35'
const OGB = '#FFF3EC'

function Navbar() {
  const [scrolled, setScrolled]         = useState(false)
  const [user, setUser]                 = useState(null)
  const [profile, setProfile]           = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen]     = useState(false)
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
    setMobileOpen(false)
    navigate('/')
  }

  const name     = profile?.name || user?.email?.split('@')[0] || ''
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none', borderBottom: scrolled ? '1px solid #DDDDDD' : 'none', transition:'all 0.3s ease', padding:'0 5%' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:68 }}>
          <a href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg, ${OG}, #ff8c42)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Georgia', serif", fontWeight:700, color:'#fff', fontSize:18 }}>A</div>
            <span style={{ fontFamily:"'Georgia', serif", fontWeight:700, fontSize:22, color:'#08060d', letterSpacing:'-0.5px' }}>Adhyot</span>
          </a>

          {/* Desktop links */}
          <div className="lp-desktop" style={{ display:'flex', alignItems:'center', gap:36 }}>
            <a href="/courses" style={{ color:'#6b6375', fontSize:15, textDecoration:'none', fontWeight:500 }}
              onMouseEnter={e => e.target.style.color=OG} onMouseLeave={e => e.target.style.color='#6b6375'}>Courses</a>
          </div>

          <div className="lp-desktop" style={{ display:'flex', alignItems:'center', gap:12 }}>
            {user ? (
              <div style={{ position:'relative' }}>
                <button onClick={() => setDropdownOpen(o => !o)} style={{ width:38, height:38, borderRadius:'50%', background:`linear-gradient(135deg, ${OG}, #ff8c42)`, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', boxShadow:'0 2px 8px rgba(232,89,12,0.35)' }}>{initials}</button>
                {dropdownOpen && (
                  <div style={{ position:'absolute', top:'120%', right:0, background:'#fff', borderRadius:12, border:'1px solid #DDDDDD', boxShadow:'0 8px 30px rgba(0,0,0,0.1)', minWidth:200, overflow:'hidden', zIndex:200 }}>
                    <div style={{ padding:'12px 16px', borderBottom:'1px solid #DDDDDD' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#08060d' }}>{name}</div>
                      <div style={{ fontSize:12, color:'#6b6375', marginTop:2 }}>{user.email}</div>
                    </div>
                    <button onClick={() => navigate(profile?.role === 'admin' ? '/admin' : '/dashboard')} style={{ width:'100%', padding:'12px 16px', textAlign:'left', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'#1A1A1A', fontWeight:500, display:'flex', alignItems:'center', gap:10 }}
                      onMouseEnter={e => e.currentTarget.style.background=OGB} onMouseLeave={e => e.currentTarget.style.background='none'}>
                      <HiOutlineViewGrid size={16} /> {profile?.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
                    </button>
                    <div style={{ height:1, background:'#DDDDDD' }} />
                    <button onClick={handleLogout} style={{ width:'100%', padding:'12px 16px', textAlign:'left', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'#ef4444', fontWeight:500, display:'flex', alignItems:'center', gap:10 }}
                      onMouseEnter={e => e.currentTarget.style.background='#fef2f2'} onMouseLeave={e => e.currentTarget.style.background='none'}>
                      <HiOutlineLogout size={16} /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => navigate('/auth')} style={{ padding:'9px 20px', borderRadius:8, border:'none', background:`linear-gradient(135deg, ${OG}, ${OG2})`, color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', boxShadow:'0 4px 14px rgba(232,89,12,0.35)' }}>Get Started</button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="lp-mobile" onClick={() => setMobileOpen(true)} style={{ display:'none', background:'none', border:'none', cursor:'pointer', color:'#08060d', padding:4, alignItems:'center' }}>
            <HiOutlineMenuAlt3 size={26} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(8,6,13,0.5)', zIndex:299 }} />
          <div style={{ position:'fixed', top:0, right:0, bottom:0, width:280, background:'#fff', zIndex:300, boxShadow:'-8px 0 40px rgba(0,0,0,0.12)', display:'flex', flexDirection:'column', padding:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
              <span style={{ fontFamily:"'Georgia', serif", fontWeight:700, fontSize:20, color:'#08060d' }}>Adhyot</span>
              <button onClick={() => setMobileOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b6375' }}><HiOutlineX size={22} /></button>
            </div>
            {user && (
              <div style={{ display:'flex', alignItems:'center', gap:12, paddingBottom:16, borderBottom:'1px solid #DDDDDD', marginBottom:16 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg, ${OG}, ${OG2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff' }}>{initials}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#08060d' }}>{name}</div>
                  <div style={{ fontSize:12, color:'#6b6375' }}>{user.email}</div>
                </div>
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:2, flex:1 }}>
              <a href="/courses" onClick={() => setMobileOpen(false)} style={{ padding:'13px 0', fontSize:16, fontWeight:600, color:'#1A1A1A', textDecoration:'none', borderBottom:'1px solid #f3f4f6' }}>Courses</a>
              {user && (
                <button onClick={() => { navigate(profile?.role === 'admin' ? '/admin' : '/dashboard'); setMobileOpen(false) }} style={{ padding:'13px 0', fontSize:16, fontWeight:600, color:'#1A1A1A', background:'none', border:'none', borderBottom:'1px solid #f3f4f6', cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:10 }}>
                  <HiOutlineViewGrid size={16} /> {profile?.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
                </button>
              )}
            </div>
            <div style={{ paddingTop:16, display:'flex', flexDirection:'column', gap:10 }}>
              {user ? (
                <button onClick={handleLogout} style={{ padding:'13px', borderRadius:10, border:'1.5px solid #fecaca', background:'#fef2f2', color:'#ef4444', fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <HiOutlineLogout size={16} /> Log Out
                </button>
              ) : (
                <>
                  <button onClick={() => { navigate('/auth', { state:{ mode:'register' } }); setMobileOpen(false) }} style={{ padding:'13px', borderRadius:10, border:'none', background:`linear-gradient(135deg, ${OG}, ${OG2})`, color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer' }}>Create Free Account</button>
                  <button onClick={() => { navigate('/auth'); setMobileOpen(false) }} style={{ padding:'13px', borderRadius:10, border:'1.5px solid #DDDDDD', background:'#fff', color:'#1A1A1A', fontSize:15, fontWeight:600, cursor:'pointer' }}>Log In</button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; }
        .lp-mobile { display:none !important; }
        @media (max-width: 768px) {
          .lp-desktop { display:none !important; }
          .lp-mobile  { display:flex !important; }
        }
      `}</style>
    </>
  )
}

function HeroSection() {
  const navigate = useNavigate()
  return (
    <section style={{ minHeight:'75vh', background:'linear-gradient(160deg, #fff 0%, #FFF3EC 50%, #fff 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'100px 5% 60px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'10%', right:'8%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(232,89,12,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'15%', left:'5%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(232,89,12,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ maxWidth:800, width:'100%', margin:'0 auto', textAlign:'center', animation:'fadeUp 0.8s ease forwards' }}>
        <h1 style={{ fontFamily:"'Georgia', serif", fontSize:'clamp(34px, 6vw, 64px)', fontWeight:700, lineHeight:1.1, color:'#08060d', letterSpacing:'-2px', marginBottom:20 }}>
          Launch Your Career in<br /><span style={{ color:OG }}>QA & Cybersecurity</span>
        </h1>
        <p style={{ fontSize:'clamp(15px, 2vw, 18px)', color:'#6b6375', lineHeight:1.7, maxWidth:520, margin:'0 auto 28px' }}>
          Structured courses, hands-on practice, and career guidance — built for aspiring QA engineers and security professionals.
        </p>
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginBottom:36 }}>
          {['2 Courses Available', 'QA Engineering', 'Cybersecurity'].map(item => (
            <div key={item} style={{ display:'inline-flex', alignItems:'center', gap:6, background:OGB, border:'1px solid rgba(232,89,12,0.2)', borderRadius:100, padding:'6px 16px' }}>
              <span style={{ fontSize:13, color:OG, fontWeight:600 }}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('/courses')} style={{ padding:'14px 32px', borderRadius:10, border:'none', background:`linear-gradient(135deg, ${OG}, ${OG2})`, color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(232,89,12,0.4)', transition:'all 0.25s' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 30px rgba(232,89,12,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(232,89,12,0.4)' }}
          >Explore Courses →</button>
          <button onClick={() => navigate('/auth', { state:{ mode:'register' } })} style={{ padding:'14px 32px', borderRadius:10, border:`1.5px solid ${OG}`, background:'transparent', color:OG, fontSize:16, fontWeight:600, cursor:'pointer', transition:'all 0.25s' }}
            onMouseEnter={e => e.currentTarget.style.background=OGB}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >Sign Up Free</button>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    { icon:'🎥', title:'Video Lectures',   desc:'Recorded lessons you can watch at your own pace, anytime.' },
    { icon:'🧪', title:'Quizzes',          desc:'Test your understanding at the end of every lesson.' },
    { icon:'📄', title:'Written Content',  desc:'Rich reading material and downloadable resources.' },
    { icon:'🏆', title:'Certificates',     desc:'Earn a certificate on completing each course.' },
    { icon:'🗺️', title:'Career Guidance',  desc:'Role roadmaps, resume tips, and interview prep.' },
    { icon:'🔓', title:'Free & Paid',      desc:"Start free. Upgrade to paid courses when you're ready." },
  ]
  return (
    <section style={{ padding:'80px 5%', background:'#fff' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <div style={{ display:'inline-block', background:OGB, border:'1px solid rgba(232,89,12,0.2)', borderRadius:100, padding:'5px 16px', fontSize:12, fontWeight:700, color:OG, letterSpacing:1, textTransform:'uppercase', marginBottom:16 }}>What You Get</div>
          <h2 style={{ fontFamily:"'Georgia', serif", fontSize:'clamp(26px, 4vw, 40px)', fontWeight:700, color:'#08060d', letterSpacing:'-1px', margin:0 }}>Everything you need to grow</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:20 }}>
          {features.map((f, i) => (
            <div key={i} style={{ padding:'24px', background:'#fafafa', borderRadius:16, border:'1.5px solid #DDDDDD', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=OG; e.currentTarget.style.background=OGB; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 8px 24px rgba(232,89,12,0.1)` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#DDDDDD'; e.currentTarget.style.background='#fafafa'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
            >
              <div style={{ fontSize:32, marginBottom:14 }}>{f.icon}</div>
              <div style={{ fontSize:16, fontWeight:700, color:'#08060d', marginBottom:8 }}>{f.title}</div>
              <div style={{ fontSize:14, color:'#6b6375', lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DomainsSection() {
  const navigate = useNavigate()
  return (
    <section style={{ padding:'80px 5%', background:'#f4f5f7' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <div style={{ display:'inline-block', background:OGB, border:'1px solid rgba(232,89,12,0.2)', borderRadius:100, padding:'5px 16px', fontSize:12, fontWeight:700, color:OG, letterSpacing:1, textTransform:'uppercase', marginBottom:16 }}>Domains</div>
          <h2 style={{ fontFamily:"'Georgia', serif", fontSize:'clamp(26px, 4vw, 40px)', fontWeight:700, color:'#08060d', letterSpacing:'-1px', margin:0 }}>Two paths. One platform.</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:24 }}>
          {[
            { title:'QA Engineering', color:OG, icon:'🧪', topics:['Manual Testing','Selenium & Cypress','API Testing','SDLC / STLC','Performance Testing'], desc:'From fundamentals to automation — become job-ready as a QA engineer.' },
            { title:'Cybersecurity',  color:'#1e40af', icon:'🛡️', topics:['Ethical Hacking','Penetration Testing','OWASP Top 10','Network Security','SOC Fundamentals'], desc:'Learn offensive and defensive security to protect modern systems.' },
          ].map((d, i) => (
            <div key={i} style={{ background:'#fff', borderRadius:20, padding:'32px', border:'1.5px solid #DDDDDD', boxShadow:'0 4px 20px rgba(0,0,0,0.05)', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.05)' }}
            >
              <div style={{ fontSize:40, marginBottom:16 }}>{d.icon}</div>
              <h3 style={{ fontFamily:"'Georgia', serif", fontSize:22, fontWeight:700, color:'#08060d', marginBottom:12 }}>{d.title}</h3>
              <p style={{ fontSize:14, color:'#6b6375', lineHeight:1.6, marginBottom:20 }}>{d.desc}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:28 }}>
                {d.topics.map((t, j) => (
                  <div key={j} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:d.color, flexShrink:0 }} />
                    <span style={{ fontSize:13, color:'#555', fontWeight:500 }}>{t}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/courses')} style={{ padding:'10px 20px', borderRadius:8, border:`1.5px solid ${d.color}`, background:'transparent', color:d.color, fontSize:14, fontWeight:700, cursor:'pointer', transition:'all 0.2s', width:'100%' }}
                onMouseEnter={e => { e.currentTarget.style.background=d.color; e.currentTarget.style.color='#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=d.color }}
              >View Courses →</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => listener.subscription.unsubscribe()
  }, [])
  if (user) return null
  return (
    <section style={{ padding:'80px 5%', background:'#fff' }}>
      <div style={{ maxWidth:800, margin:'0 auto' }}>
        <div style={{ background:`linear-gradient(135deg, ${OG} 0%, ${OG2} 100%)`, borderRadius:24, padding:'clamp(32px, 5vw, 64px) clamp(24px, 5vw, 48px)', boxShadow:'0 20px 60px rgba(232,89,12,0.3)', position:'relative', overflow:'hidden', textAlign:'center' }}>
          <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.08)' }} />
          <div style={{ position:'absolute', bottom:-40, left:-40, width:150, height:150, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />
          <h2 style={{ fontFamily:"'Georgia', serif", fontSize:'clamp(24px, 4vw, 40px)', fontWeight:700, color:'#fff', letterSpacing:'-1px', marginBottom:16, position:'relative' }}>Ready to Get Started?</h2>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.85)', marginBottom:36, lineHeight:1.6, position:'relative' }}>No credit card needed. Start learning for free today.</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', position:'relative' }}>
            <button style={{ padding:'14px 32px', borderRadius:10, border:'none', background:'#fff', color:OG, fontSize:16, fontWeight:700, cursor:'pointer', transition:'all 0.25s', flex:'1 1 auto', maxWidth:220 }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
              onClick={() => navigate('/auth', { state:{ mode:'register' } })}
            >Create Free Account</button>
            <button style={{ padding:'14px 32px', borderRadius:10, border:'2px solid rgba(255,255,255,0.5)', background:'transparent', color:'#fff', fontSize:16, fontWeight:600, cursor:'pointer', transition:'all 0.25s', flex:'1 1 auto', maxWidth:220 }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
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
    <footer style={{ background:'#08060d', color:'#9ca3af', padding:'60px 5% 32px' }}>
      <style>{`
        .footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr; gap:48px; margin-bottom:48px; }
        .footer-bottom { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns:1fr !important; gap:32px !important; }
          .footer-bottom { flex-direction:column; text-align:center; }
        }
      `}</style>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div className="footer-grid">
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg, ${OG}, #ff8c42)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Georgia', serif", fontWeight:700, color:'#fff', fontSize:16 }}>A</div>
              <span style={{ fontFamily:"'Georgia', serif", fontWeight:700, fontSize:20, color:'#fff' }}>Adhyot</span>
            </div>
            <p style={{ fontSize:14, lineHeight:1.7, color:'#6b7280', maxWidth:260 }}>Delivering accessible, high-quality QA and Cybersecurity education through structured digital learning.</p>
          </div>
          {[
            { title:'Courses', links:[{ label:'QA Engineering', href:'/courses' },{ label:'Cybersecurity', href:'/courses' },{ label:'Free Courses', href:'/courses' }]},
            { title:'Support', links:[{ label:'About Us', href:'#' },{ label:'Contact', href:'#' },{ label:'Privacy Policy', href:'#' },{ label:'Terms of Use', href:'#' }]},
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ color:'#fff', fontSize:14, fontWeight:700, marginBottom:16, textTransform:'uppercase', letterSpacing:1 }}>{col.title}</h4>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {col.links.map(link => (
                  <a key={link.label} href={link.href} style={{ color:'#6b7280', fontSize:14, textDecoration:'none', transition:'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color=OG} onMouseLeave={e => e.target.style.color='#6b7280'}>{link.label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="footer-bottom" style={{ borderTop:'1px solid #1f2937', paddingTop:24 }}>
          <p style={{ fontSize:13, margin:0 }}>© 2026 Adhyot. All rights reserved.</p>
          <p style={{ fontSize:13, margin:0 }}>Made with love for aspiring tech professionals</p>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DomainsSection />
      <CTASection />
      <Footer />
    </>
  )
}