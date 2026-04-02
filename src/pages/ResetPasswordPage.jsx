import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import supabase from '../supabaseClient'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Supabase automatically handles the token from the URL
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is in password recovery mode — ready to reset
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleReset = async () => {
    setError('')
    if (!password) { setError('Password is required'); return }
    if (password.length < 6) { setError('Minimum 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) { setError(error.message); return }
    setDone(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #fff 0%, #FFF3EC 50%, #fff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 5%', fontFamily: 'system-ui, sans-serif',
    }}>
      <style>{`
        .rp-input {
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
        .rp-input:focus {
          border-color: #E8590C;
          box-shadow: 0 0 0 3px rgba(232,89,12,0.1);
        }
      `}</style>

      <div style={{
        width: '100%', maxWidth: 420,
        background: '#fff', borderRadius: 20,
        padding: '48px 40px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        border: '1px solid #DDDDDD',
      }}>
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 36 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #E8590C, #ff8c42)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Georgia, serif', fontWeight: 700, color: '#fff', fontSize: 16,
          }}>A</div>
          <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 20, color: '#08060d' }}>Adhyot</span>
        </a>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#08060d', marginBottom: 12, fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
              Password updated!
            </h2>
            <p style={{ fontSize: 15, color: '#6b6375', lineHeight: 1.6, marginBottom: 32 }}>
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <button onClick={() => navigate('/auth', { state: { mode: 'login' } })} style={{
              width: '100%', padding: '13px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #E8590C, #ff7c35)',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(232,89,12,0.35)',
            }}>Go to Login</button>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#08060d', letterSpacing: '-1px', marginBottom: 8, fontFamily: 'Georgia, serif' }}>
              Set new password
            </h1>
            <p style={{ fontSize: 15, color: '#6b6375', marginBottom: 32 }}>
              Choose a strong password for your account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: 6 }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="rp-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    style={{ paddingRight: 44 }}
                  />
                  <button onClick={() => setShowPassword(s => !s)} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0,
                    display: 'flex', alignItems: 'center',
                  }}>{showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}</button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="rp-input"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError('') }}
                    style={{ paddingRight: 44 }}
                  />
                  <button onClick={() => setShowConfirm(s => !s)} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0,
                    display: 'flex', alignItems: 'center',
                  }}>{showConfirm ? <HiEyeOff size={18} /> : <HiEye size={18} />}</button>
                </div>
              </div>

              {error && (
                <div style={{
                  padding: '12px 16px', borderRadius: 8,
                  background: '#fef2f2', border: '1px solid #fecaca',
                  fontSize: 14, color: '#dc2626',
                }}>{error}</div>
              )}

              <button onClick={handleReset} disabled={loading} style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                background: loading ? '#f5a882' : 'linear-gradient(135deg, #E8590C, #ff7c35)',
                color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(232,89,12,0.35)',
                transition: 'all 0.25s',
              }}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
