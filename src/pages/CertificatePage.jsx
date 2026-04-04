import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { HiOutlineDownload, HiOutlineArrowLeft, HiOutlineBadgeCheck, HiOutlineStar } from 'react-icons/hi'
import { jsPDF } from 'jspdf'
import supabase from '../supabaseClient'

const OG  = '#E8590C'
const OG2 = '#ff7c35'
const OGB = '#FFF3EC'

// ─── Certificate Preview (SVG-based, matches PDF output) ─────────────────────
function CertificatePreview({ cert, profile }) {
  const studentName = profile?.name || 'Student'
  const courseName  = cert.courses?.title || 'Course'
  const issueDate   = new Date(cert.issued_at || cert.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const certId      = cert.certificate_id || cert.id?.slice(0, 16).toUpperCase()

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', maxWidth: 800, width: '100%', aspectRatio: '1.414 / 1', position: 'relative' }}>
      <svg viewBox="0 0 800 566" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
        {/* Background */}
        <rect width="800" height="566" fill="#fff" />

        {/* Border frame */}
        <rect x="16" y="16" width="768" height="534" rx="8" fill="none" stroke="#E8590C" strokeWidth="1.5" />
        <rect x="22" y="22" width="756" height="522" rx="6" fill="none" stroke="#E8590C" strokeWidth="0.5" opacity="0.4" />

        {/* Top orange bar */}
        <rect x="16" y="16" width="768" height="6" rx="3" fill="#E8590C" />

        {/* Bottom orange bar */}
        <rect x="16" y="544" width="768" height="6" rx="3" fill="#E8590C" />

        {/* Left accent bar */}
        <rect x="16" y="16" width="6" height="534" rx="3" fill="#E8590C" />

        {/* Right accent bar */}
        <rect x="778" y="16" width="6" height="534" rx="3" fill="#E8590C" />

        {/* Corner decorations */}
        <circle cx="44" cy="44" r="12" fill="#FFF3EC" stroke="#E8590C" strokeWidth="1" />
        <circle cx="756" cy="44" r="12" fill="#FFF3EC" stroke="#E8590C" strokeWidth="1" />
        <circle cx="44" cy="522" r="12" fill="#FFF3EC" stroke="#E8590C" strokeWidth="1" />
        <circle cx="756" cy="522" r="12" fill="#FFF3EC" stroke="#E8590C" strokeWidth="1" />

        {/* "Certificate of Completion" heading */}
        <text x="400" y="90" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="400" fontSize="13" fill="#9ca3af" letterSpacing="4">CERTIFICATE OF COMPLETION</text>

        {/* Divider */}
        <line x1="200" y1="144" x2="600" y2="144" stroke="#E8590C" strokeWidth="0.75" opacity="0.4" />

        {/* "This certifies that" */}
        <text x="400" y="178" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="400" fontSize="14" fill="#6b6375">This certifies that</text>

        {/* Student name */}
        <text x="400" y="236" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="38" fill="#08060d">{studentName}</text>

        {/* Underline under name */}
        <line x1="200" y1="250" x2="600" y2="250" stroke="#E8590C" strokeWidth="1.5" />

        {/* "has successfully completed" */}
        <text x="400" y="282" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="400" fontSize="14" fill="#6b6375">has successfully completed the course</text>

        {/* Course name */}
        <text x="400" y="336" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="24" fill="#E8590C">{courseName}</text>

        {/* Issue date */}
        <text x="400" y="382" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="400" fontSize="13" fill="#9ca3af">Issued on {issueDate}</text>

        {/* Divider */}
        <line x1="100" y1="420" x2="700" y2="420" stroke="#DDDDDD" strokeWidth="0.75" />

        {/* Badge/seal center */}
        <circle cx="400" cy="460" r="32" fill="#FFF3EC" stroke="#E8590C" strokeWidth="1.5" />
        <circle cx="400" cy="460" r="26" fill="none" stroke="#E8590C" strokeWidth="0.5" opacity="0.5" />
        <text x="400" y="456" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="11" fill="#E8590C">ADHYOT</text>
        <text x="400" y="470" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9" fill="#E8590C">CERTIFIED</text>

        {/* Certificate ID */}
        <text x="400" y="540" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#9ca3af" letterSpacing="1">ID: {certId}</text>
      </svg>
    </div>
  )
}

// ─── Download as PDF using jsPDF + SVG ───────────────────────────────────────
async function downloadCertificate(cert, profile, svgRef) {
  const studentName = profile?.name || 'Student'
  const html2canvas = (await import('html2canvas')).default
  const canvas = await html2canvas(svgRef, { scale: 3, useCORS: true, backgroundColor: '#ffffff' })
  const imgData = canvas.toDataURL('image/png')
  const { jsPDF: PDF } = await import('jspdf')
  const doc = new PDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = 297, H = 210
  const imgH = (canvas.height / canvas.width) * W
  const yOffset = Math.max(0, (H - imgH) / 2)
  doc.addImage(imgData, 'PNG', 0, yOffset, W, imgH)
  doc.save('Adhyot_Certificate_' + studentName.replace(/\s+/g, '_') + '.pdf')
}

// ─── Main CertificatePage ─────────────────────────────────────────────────────
export default function CertificatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const certId = searchParams.get('id')
  const [cert, setCert]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const svgRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/auth'); return }

      const { data: profileData } = await supabase.from('users').select('name, email').eq('id', session.user.id).single()
      if (profileData) setProfile(profileData)

      // Fetch cert without join (avoids 400/500 FK issues)
      let certQuery = supabase.from('certificates').select('*').eq('user_id', session.user.id)
      if (certId) certQuery = certQuery.eq('id', certId)
      else certQuery = certQuery.order('issued_at', { ascending: false }).limit(1)

      const { data: certData } = await certQuery.single()
      if (certData?.course_id) {
        const { data: courseData } = await supabase.from('courses').select('id, title').eq('id', certData.course_id).single()
        certData.courses = courseData || null
      }
      setCert(certData || null)
      setLoading(false)
    }
    load()
  }, [certId])

    const handleDownload = async () => {
    setDownloading(true)
    try { await downloadCertificate(cert, profile, svgRef.current) }
    finally { setDownloading(false) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${OGB}`, borderTop: `3px solid ${OG}`, animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!cert) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
      <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 24, color: '#08060d', marginBottom: 8 }}>No certificate found</h2>
      <p style={{ color: '#6b6375', marginBottom: 24 }}>Complete a course to earn your first certificate.</p>
      <button onClick={() => navigate('/courses')} style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Browse Courses</button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', fontFamily: 'system-ui, sans-serif', padding: '0 0 80px' }}>
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } } * { box-sizing: border-box; }`}</style>

      {/* Header */}
      <div style={{ background: '#08060d', padding: '20px 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#9ca3af', fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>
            <HiOutlineArrowLeft size={15} /> Dashboard
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: OG, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Certificate</div>
            <h1 style={{ color: '#fff', fontFamily: "'Georgia', serif", fontSize: 22, fontWeight: 800, margin: 0 }}>{cert.courses?.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 5%', animation: 'fadeUp 0.5s ease both' }}>

        {/* Certificate preview */}
        <div ref={svgRef} style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <CertificatePreview cert={cert} profile={profile} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button onClick={handleDownload} disabled={downloading} style={{ padding: '14px 32px', borderRadius: 11, border: 'none', background: `linear-gradient(135deg, ${OG}, ${OG2})`, color: '#fff', fontSize: 15, fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 9, boxShadow: '0 6px 20px rgba(232,89,12,0.35)', opacity: downloading ? 0.8 : 1, transition: 'all 0.2s' }}>
            <HiOutlineDownload size={18} /> {downloading ? 'Generating PDF…' : 'Download Certificate'}
          </button>
          <button onClick={() => navigate('/courses')} style={{ padding: '14px 28px', borderRadius: 11, border: '1.5px solid #DDDDDD', background: '#fff', color: '#1A1A1A', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Browse More Courses
          </button>
        </div>

        {/* Certificate details */}
        <div style={{ marginTop: 32, background: '#fff', borderRadius: 16, padding: '24px', border: '1.5px solid #DDDDDD', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Recipient', value: profile?.name || '—' },
            { label: 'Course', value: cert.courses?.title || '—' },
            { label: 'Issued', value: new Date(cert.issued_at || cert.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
            { label: 'Certificate ID', value: cert.certificate_id || cert.id?.slice(0, 16).toUpperCase() },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#08060d' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}