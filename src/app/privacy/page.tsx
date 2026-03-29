import Link from 'next/link'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 sm:p-6 max-w-2xl mx-auto min-w-0">
      <nav className="mb-6">
        <Link href="/" className="text-sm text-blue-400 underline">
          ← Home
        </Link>
      </nav>
      <h1 className="text-xl sm:text-2xl font-bold mb-6 break-words">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-4">Last updated: March 2026</p>
      <div className="space-y-4 text-gray-300 text-sm">
        <p>ExamGo collects your name, phone number, email, city, and exam details to provide our services.</p>
        <p>We use your phone number to send OTP verification messages via Fast2SMS.</p>
        <p>Your admit card and result documents are stored securely on Supabase Storage.</p>
        <p>We share your scholar lead information with partner institutions only when you click Apply Now.</p>
        <p>We do not sell your personal data to any third party.</p>
        <p>You can request deletion of your data by contacting us at support@examgo.in</p>
      </div>
    </div>
  )
}