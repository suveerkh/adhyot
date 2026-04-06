import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineHome, HiOutlineUsers, HiOutlineBookOpen,
  HiOutlineCreditCard, HiOutlineLogout, HiOutlinePlus,
  HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineMenuAlt3,
} from 'react-icons/hi'
import supabase from '../supabaseClient'

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: HiOutlineHome },
  { id: 'courses', label: 'Courses', icon: HiOutlineBookOpen },
  { id: 'users', label: 'Users', icon: HiOutlineUsers },
  { id: 'payments', label: 'Payments', icon: HiOutlineCreditCard },
]

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, onLogout, adminName }) {
  return (
    <aside style={{
      width: 240, minHeight: '100vh', background: '#08060d',
      display: 'flex', flexDirection: 'column',
      padding: '0 0 24px', flexShrink: 0,
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #1f2937' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #E8590C, #ff8c42)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Georgia', serif", fontWeight: 700, color: '#fff', fontSize: 17,
          }}>A</div>
          <div>
            <div style={{ fontFamily: "'Georgia', serif", fontWeight: 700, fontSize: 18, color: '#fff' }}>Adhyot</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActive(id)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 10, border: 'none',
            background: active === id ? 'rgba(232,89,12,0.15)' : 'transparent',
            color: active === id ? '#E8590C' : '#9ca3af',
            fontSize: 14, fontWeight: active === id ? 600 : 500,
            cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
            borderLeft: active === id ? '3px solid #E8590C' : '3px solid transparent',
          }}
            onMouseEnter={e => { if (active !== id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            onMouseLeave={e => { if (active !== id) e.currentTarget.style.background = 'transparent' }}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      {/* Admin info + logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #1f2937' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #E8590C, #ff8c42)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{adminName?.slice(0, 2).toUpperCase()}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminName}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Administrator</div>
          </div>
        </div>
        <button onClick={onLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 8, border: 'none',
          background: 'rgba(239,68,68,0.1)', color: '#ef4444',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
        ><HiOutlineLogout size={16} /> Log Out</button>
      </div>
    </aside>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = '#E8590C' }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '24px',
      border: '1px solid #DDDDDD', boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      transition: 'transform 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ fontSize: 13, color: '#6b6375', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color, fontFamily: "'Georgia', serif", letterSpacing: '-1px' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ─── Overview ────────────────────────────────────────────────────────────────
function Overview({ stats }) {
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 24, letterSpacing: '-0.5px' }}>Overview</h2>
      <div className="ad-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Students" value={stats.students} />
        <StatCard label="Total Courses" value={stats.courses} color="#7c3aed" />
        <StatCard label="Total Enrollments" value={stats.enrollments} color="#0ea5e9" />
        <StatCard label="Total Revenue" value={`₹${stats.revenue?.toLocaleString() ?? 0}`} color="#16a34a" />
      </div>
    </div>
  )
}

// ─── Course Form Modal ────────────────────────────────────────────────────────
function CourseModal({ course, onClose, onSave }) {
  const [form, setForm] = useState(course || {
    title: '', domain: 'QA Engineering', description: '',
    level: 'Beginner', price: 0, is_free: false, is_published: false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.description.trim()) { setError('Description is required'); return }
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '36px',
        width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", letterSpacing: '-0.5px' }}>
            {course ? 'Edit Course' : 'Create New Course'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4 }}>
            <HiOutlineX size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Course Title</label>
            <input style={inputStyle} placeholder="e.g. Selenium WebDriver Masterclass"
              value={form.title} onChange={e => update('title', e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Domain</label>
            <select style={inputStyle} value={form.domain} onChange={e => update('domain', e.target.value)}>
              <option>QA Engineering</option>
              <option>Cybersecurity</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, height: 100, resize: 'vertical' }}
              placeholder="What will students learn?"
              value={form.description} onChange={e => update('description', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Level</label>
              <select style={inputStyle} value={form.level} onChange={e => update('level', e.target.value)}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Price (₹)</label>
              <input style={inputStyle} type="number" placeholder="0"
                value={form.price} onChange={e => update('price', Number(e.target.value))}
                disabled={form.is_free} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#1A1A1A' }}>
              <input type="checkbox" checked={form.is_free}
                onChange={e => { update('is_free', e.target.checked); if (e.target.checked) update('price', 0) }} />
              Free Course
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#1A1A1A' }}>
              <input type="checkbox" checked={form.is_published}
                onChange={e => update('is_published', e.target.checked)} />
              Published
            </label>
          </div>

          {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#dc2626' }}>{error}</div>}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={onClose} style={{
              padding: '10px 20px', borderRadius: 8, border: '1.5px solid #DDDDDD',
              background: '#fff', color: '#1A1A1A', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: saving ? '#f5a882' : 'linear-gradient(135deg, #E8590C, #ff7c35)',
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(232,89,12,0.3)',
            }}>{saving ? 'Saving...' : course ? 'Save Changes' : 'Create Course'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { fontSize: 13, fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: 6, fontFamily: 'system-ui' }
const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1.5px solid #DDDDDD', fontSize: 14, color: '#1A1A1A',
  fontFamily: 'system-ui', outline: 'none', boxSizing: 'border-box',
  background: '#fff',
}

// ─── Courses Section ──────────────────────────────────────────────────────────
function CoursesSection() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | course object
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { fetchCourses() }, [])

  const fetchCourses = async () => {
    setLoading(true)
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
    setCourses(data || [])
    setLoading(false)
  }

  const navigate = useNavigate()

  const handleSave = async (form) => {
    if (form.id) {
      await supabase.from('courses').update(form).eq('id', form.id)
      setModal(null)
      fetchCourses()
    } else {
      const { data } = await supabase.from('courses').insert([form]).select().single()
      setModal(null)
      if (data) navigate(`/admin/course/${data.id}`)
    }
  }

  const handleDelete = async (id) => {
    await supabase.from('courses').delete().eq('id', id)
    setDeleteConfirm(null)
    fetchCourses()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", letterSpacing: '-0.5px' }}>Courses</h2>
        <button onClick={() => setModal('create')} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 8, border: 'none',
          background: 'linear-gradient(135deg, #E8590C, #ff7c35)',
          color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(232,89,12,0.3)',
        }}><HiOutlinePlus size={16} /> New Course</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading...</div>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af', background: '#fff', borderRadius: 16, border: '1px solid #DDDDDD' }}>
          <HiOutlineBookOpen size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontSize: 15 }}>No courses yet. Create your first one!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {courses.map(course => (
            <div key={course.id} style={{
              background: '#fff', borderRadius: 14, padding: '20px 24px',
              border: '1px solid #DDDDDD', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                    color: course.domain === 'QA Engineering' ? '#E8590C' : '#7c3aed',
                  }}>{course.domain}</span>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 100, fontWeight: 600,
                    background: course.is_published ? '#dcfce7' : '#f3f4f6',
                    color: course.is_published ? '#16a34a' : '#6b7280',
                  }}>{course.is_published ? 'Published' : 'Draft'}</span>
                  {course.is_free && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, fontWeight: 600, background: '#dbeafe', color: '#2563eb' }}>Free</span>}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#08060d', marginBottom: 2 }}>{course.title}</div>
                <div style={{ fontSize: 13, color: '#6b6375' }}>{course.level} · {course.is_free ? 'Free' : `₹${course.price?.toLocaleString()}`}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigate(`/admin/course/${course.id}`)} style={{
                  padding: '8px 16px', borderRadius: 8, border: '1.5px solid #DDDDDD',
                  background: '#fff', color: '#1A1A1A', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}><HiOutlinePencil size={14} /> Edit</button>
                <button onClick={() => setDeleteConfirm(course.id)} style={{
                  padding: '8px 12px', borderRadius: 8, border: '1.5px solid #fecaca',
                  background: '#fef2f2', color: '#ef4444', fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                }}><HiOutlineTrash size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Modal */}
      {modal && (
        <CourseModal
          course={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px', maxWidth: 380, width: '90%', textAlign: 'center' }}>
            <HiOutlineTrash size={36} style={{ color: '#ef4444', margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#08060d', marginBottom: 8 }}>Delete Course?</h3>
            <p style={{ fontSize: 14, color: '#6b6375', marginBottom: 24 }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: '10px 20px', borderRadius: 8, border: '1.5px solid #DDDDDD', background: '#fff', color: '#1A1A1A', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Users Section ────────────────────────────────────────────────────────────
function UsersSection() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", letterSpacing: '-0.5px' }}>Users</h2>
        <input
          style={{ ...inputStyle, width: 240 }}
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="ad-table" style={{ background: '#fff', borderRadius: 16, border: '1px solid #DDDDDD', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #DDDDDD' }}>
              {['Name', 'Email', 'Phone', 'Role', 'Joined'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No users found</td></tr>
            ) : filtered.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #E8590C, #ff8c42)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>{u.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#08060d' }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 14, color: '#6b6375' }}>{u.email}</td>
                <td style={{ padding: '14px 16px', fontSize: 14, color: '#6b6375' }}>{u.phone || '—'}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: 12, padding: '3px 10px', borderRadius: 100, fontWeight: 600,
                    background: u.role === 'admin' ? 'rgba(232,89,12,0.1)' : '#f3f4f6',
                    color: u.role === 'admin' ? '#E8590C' : '#6b7280',
                  }}>{u.role}</span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#9ca3af' }}>
                  {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Payments Section ─────────────────────────────────────────────────────────
function PaymentsSection() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('enrollments')
        .select('*, users(name, email), courses(title)')
        .order('created_at', { ascending: false })
      setPayments(data || [])
      setLoading(false)
    }
    fetchPayments()
  }, [])

  const statusColor = (s) => ({
    completed: { bg: '#dcfce7', color: '#16a34a' },
    pending: { bg: '#fef9c3', color: '#ca8a04' },
    failed: { bg: '#fef2f2', color: '#ef4444' },
    refunded: { bg: '#f3f4f6', color: '#6b7280' },
  }[s] || { bg: '#f3f4f6', color: '#6b7280' })

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#08060d', fontFamily: "'Georgia', serif", marginBottom: 24, letterSpacing: '-0.5px' }}>Payments & Enrollments</h2>

      <div className="ad-table" style={{ background: '#fff', borderRadius: 16, border: '1px solid #DDDDDD', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #DDDDDD' }}>
              {['Student', 'Course', 'Amount', 'Status', 'Date'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No enrollments yet</td></tr>
            ) : payments.map((p, i) => {
              const sc = statusColor(p.payment_status)
              return (
                <tr key={p.id} style={{ borderBottom: i < payments.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#08060d' }}>{p.users?.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{p.users?.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: '#6b6375' }}>{p.courses?.title}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: '#08060d' }}>
                    {p.amount ? `₹${p.amount?.toLocaleString()}` : 'Free'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, fontWeight: 600, background: sc.bg, color: sc.color }}>
                      {p.payment_status || 'enrolled'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#9ca3af' }}>
                    {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate()
  const [active, setActive] = useState('overview')
  const [adminName, setAdminName] = useState('')
  const [stats, setStats] = useState({ students: 0, courses: 0, enrollments: 0, revenue: 0 })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profile } = await supabase.from('users').select('name').eq('id', session.user.id).single()
      setAdminName(profile?.name || '')

      // Fetch stats in parallel
      const [{ count: students }, { count: courses }, { count: enrollments }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }),
      ])
      setStats({ students: students || 0, courses: courses || 0, enrollments: enrollments || 0, revenue: 0 })
    }
    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; }
        @media (max-width: 768px) {
          .ad-sidebar-wrap { transform: translateX(-100%); transition: transform 0.3s ease; }
          .ad-sidebar-open  { transform: translateX(0) !important; }
          .ad-topbar  { display: flex !important; }
          .ad-main    { margin-left: 0 !important; padding: 72px 16px 40px !important; }
          .ad-stats   { grid-template-columns: 1fr 1fr !important; }
          .ad-table   { overflow-x: auto; }
          .ad-table table { min-width: 600px; }
        }
        @media (max-width: 480px) {
          .ad-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:49 }} />}

      {/* Sidebar wrapper for mobile slide */}
      <div className={sidebarOpen ? 'ad-sidebar-wrap ad-sidebar-open' : 'ad-sidebar-wrap'} style={{ position:'fixed', top:0, left:0, bottom:0, zIndex:50, width:240, transition:'transform 0.3s ease', transform: typeof window !== "undefined" && window.innerWidth <= 768 && !sidebarOpen ? "translateX(-100%)" : "translateX(0)" }}>
        <Sidebar active={active} setActive={(s) => { setActive(s); setSidebarOpen(false) }} onLogout={handleLogout} adminName={adminName} />
      </div>

      {/* Mobile topbar */}
      <div className="ad-topbar" style={{ display:'none', position:'fixed', top:0, left:0, right:0, height:56, background:'#08060d', zIndex:48, alignItems:'center', padding:'0 16px', gap:12, borderBottom:'1px solid #1f2937' }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background:'none', border:'none', cursor:'pointer', color:'#fff', padding:4, display:'flex', alignItems:'center' }}>
          <HiOutlineMenuAlt3 size={24} />
        </button>
        <div style={{ fontFamily:"'Georgia', serif", fontWeight:700, fontSize:18, color:'#fff' }}>Adhyot Admin</div>
      </div>

      {/* Main content */}
      <main className="ad-main" style={{ marginLeft: 240, flex: 1, padding: '40px', animation: 'fadeUp 0.5s ease forwards' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {active === 'overview' && <Overview stats={stats} />}
          {active === 'courses' && <CoursesSection />}
          {active === 'users' && <UsersSection />}
          {active === 'payments' && <PaymentsSection />}
        </div>
      </main>
    </div>
  )
}