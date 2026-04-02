import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import supabase from '../supabaseClient'

export default function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialMode = location.state?.mode || 'register'
  const [mode, setMode] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const update = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
    setServerError('')
  }

  const validate = () => {
    const e = {}
    if (mode === 'register' && !form.name.trim()) e.name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (mode === 'register' && !form.phone.trim()) e.phone = 'Phone number is required'
    if (mode !== 'forgot' && !form.password.trim()) e.password = 'Password is required'
    else if (mode !== 'forgot' && form.password.length < 6) e.password = 'Minimum 6 characters'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    setLoading(true)
    setServerError('')

    try {
      if (mode === 'register') {
        // Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        })
        if (error) { setServerError(error.message); return }

        // Save extra info to users table
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            name: form.name,
            email: form.email,
            phone: form.phone,
            role: 'student',
          }])
        if (profileError) { setServerError(profileError.message); return }
        window.location.replace('/dashboard')

      } else if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (error) { setServerError(error.message); return }

        // Fetch role from users table
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()

        localStorage.setItem('user', JSON.stringify(data.user))

        if (profile?.role === 'admin') {
          window.location.replace('/admin')
        } else {
          window.location.replace('/dashboard')
        }

      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
          redirectTo: 'http://localhost:5173/reset-password',
        })
        if (error) { setServerError(error.message); return }
        setSubmitted(true)
      }
    } catch (err) {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (m) => {
    setMode(m)
    setErrors({})
    setSubmitted(false)
    setServerError('')
    setForm({ name: '', email: '', phone: '', password: '' })
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      fontFamily: "'Georgia', serif",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .auth-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1.5px solid #DDDDDD;
          font-size: 15px;
          font-family: system-ui, sans-serif;
          color: #1A1A1A;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .auth-input:focus {
          border-color: #E8590C;
          box-shadow: 0 0 0 3px rgba(232,89,12,0.1);
        }
        .auth-input.error {
          border-color: #ef4444;
        }
        .auth-input::placeholder {
          color: #aaa;
        }
        @media (max-width: 768px) {
          .auth-left { display: none !important; }
          .auth-right { grid-column: 1 / -1 !important; }
          .auth-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Left Panel */}
      <div className="auth-left" style={{
        background: 'linear-gradient(145deg, #1a0a00 0%, #3d1500 40%, #E8590C 100%)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, color: '#fff', fontSize: 18,
          }}>A</div>
          <span style={{ fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: '-0.5px' }}>Adhyot</span>
        </a>

        {/* Center content */}
        <div style={{ animation: 'fadeUp 0.8s ease forwards' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 700,
            color: '#fff', lineHeight: 1.2, letterSpacing: '-1px', marginBottom: 24,
          }}>
            Build a career in<br />QA & Cybersecurity
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 340 }}>
            Structured courses, expert-designed curriculum, and career guidance — everything you need to break into tech.
          </p>
        </div>

        {/* Bottom */}
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
          © 2026 Adhyot
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right" style={{
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 5%',
      }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp 0.6s ease forwards' }}>

          {/* Forgot password success */}
          {mode === 'forgot' && submitted ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>📬</div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#08060d', marginBottom: 12, letterSpacing: '-0.5px' }}>Check your inbox</h2>
              <p style={{ fontSize: 15, color: '#6b6375', lineHeight: 1.6, marginBottom: 32 }}>
                We've sent a password reset link to <strong>{form.email}</strong>
              </p>
              <button onClick={() => switchMode('login')} style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #E8590C, #ff7c35)',
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}>Back to Login</button>
            </div>

          ) : mode === 'register' && submitted ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>📬</div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#08060d', marginBottom: 12, letterSpacing: '-0.5px' }}>Verify your email</h2>
              <p style={{ fontSize: 15, color: '#6b6375', lineHeight: 1.6, marginBottom: 16 }}>
                We've sent a verification email to
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#E8590C', marginBottom: 16 }}>{form.email}</p>
              <p style={{ fontSize: 14, color: '#6b6375', lineHeight: 1.6, marginBottom: 32 }}>
                Click the link in the email to activate your account. Check your spam folder if you don't see it.
              </p>
              <button onClick={() => switchMode('login')} style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #E8590C, #ff7c35)',
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}>Go to Login</button>
            </div>

          ) : (
            <>
              {/* Header */}
              <div style={{ marginBottom: 36 }}>
                <h1 style={{ fontSize: 30, fontWeight: 700, color: '#08060d', letterSpacing: '-1px', marginBottom: 8 }}>
                  {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Reset password'}
                </h1>
                <p style={{ fontSize: 15, color: '#6b6375' }}>
                  {mode === 'login' ? 'Log in to continue learning.' :
                   mode === 'register' ? 'Start your learning journey today.' :
                   'Enter your email to receive a reset link.'}
                </p>
              </div>

              {/* Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {mode === 'register' && (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: 6, fontFamily: 'system-ui, sans-serif' }}>Full Name</label>
                    <input
                      className={`auth-input${errors.name ? ' error' : ''}`}
                      type="text"
                      placeholder="XYZ ABC"
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                    />
                    {errors.name && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4, fontFamily: 'system-ui' }}>{errors.name}</p>}
                  </div>
                )}

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: 6, fontFamily: 'system-ui, sans-serif' }}>Email Address</label>
                  <input
                    className={`auth-input${errors.email ? ' error' : ''}`}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                  />
                  {errors.email && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4, fontFamily: 'system-ui' }}>{errors.email}</p>}
                </div>

                {mode === 'register' && (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: 6, fontFamily: 'system-ui, sans-serif' }}>Phone Number</label>
                    <input
                      className={`auth-input${errors.phone ? ' error' : ''}`}
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                    />
                    {errors.phone && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4, fontFamily: 'system-ui' }}>{errors.phone}</p>}
                  </div>
                )}

                {mode !== 'forgot' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', fontFamily: 'system-ui, sans-serif' }}>Password</label>
                      {mode === 'login' && (
                        <button onClick={() => switchMode('forgot')} style={{
                          fontSize: 13, color: '#E8590C', background: 'none', border: 'none',
                          cursor: 'pointer', fontFamily: 'system-ui', fontWeight: 500, padding: 0,
                        }}>Forgot password?</button>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        className={`auth-input${errors.password ? ' error' : ''}`}
                        type={showPassword ? 'text' : 'password'}
                        placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                        value={form.password}
                        onChange={e => update('password', e.target.value)}
                        style={{ paddingRight: 44 }}
                      />
                      <button onClick={() => setShowPassword(s => !s)} style={{
                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0,
                        display: 'flex', alignItems: 'center',
                      }}>{showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}</button>
                    </div>
                    {errors.password && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4, fontFamily: 'system-ui' }}>{errors.password}</p>}
                  </div>
                )}

                {/* Server error */}
                {serverError && (
                  <div style={{
                    padding: '12px 16px', borderRadius: 8,
                    background: '#fef2f2', border: '1px solid #fecaca',
                    fontSize: 14, color: '#dc2626', fontFamily: 'system-ui',
                  }}>{serverError}</div>
                )}

                {/* Submit */}
                <button onClick={handleSubmit} disabled={loading} style={{
                  width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                  background: loading ? '#f5a882' : 'linear-gradient(135deg, #E8590C, #ff7c35)',
                  color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 6px 20px rgba(232,89,12,0.35)',
                  transition: 'all 0.25s', marginTop: 4,
                }}
                  onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 10px 28px rgba(232,89,12,0.4)' }}}
                  onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = loading ? 'none' : '0 6px 20px rgba(232,89,12,0.35)' }}
                >
                  {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                </button>
              </div>

              {/* Switch mode */}
              <div style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#6b6375', fontFamily: 'system-ui, sans-serif' }}>
                {mode === 'login' ? (
                  <>Don't have an account?{' '}
                    <button onClick={() => switchMode('register')} style={{ color: '#E8590C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'system-ui' }}>Sign up</button>
                  </>
                ) : mode === 'register' ? (
                  <>Already have an account?{' '}
                    <button onClick={() => switchMode('login')} style={{ color: '#E8590C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'system-ui' }}>Log in</button>
                  </>
                ) : (
                  <>Remember your password?{' '}
                    <button onClick={() => switchMode('login')} style={{ color: '#E8590C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'system-ui' }}>Log in</button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}