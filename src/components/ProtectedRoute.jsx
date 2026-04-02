import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../supabaseClient'

export default function ProtectedRoute({ children, requiredRole }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState('checking') // 'checking' | 'allowed'

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate('/auth', { state: { mode: 'login' } })
        return
      }

      if (requiredRole) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()

        const role = profile?.role
        if (role !== requiredRole) {
          window.location.replace(role === 'admin' ? '/admin' : '/dashboard')
          return
        }
      }

      setStatus('allowed')
    })
  }, [])

  if (status === 'checking') return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#fff',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid #FFF3EC',
        borderTop: '3px solid #E8590C',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return children
}