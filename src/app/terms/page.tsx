import Link from 'next/link'

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 sm:p-6 max-w-2xl mx-auto min-w-0">
      <nav className="mb-6">
        <Link href="/" className="text-sm text-blue-400 underline">
          ← Home
        </Link>
      </nav>
      <h1 className="text-xl sm:text-2xl font-bold mb-6 break-words">Terms of Service</h1>
      <p className="text-gray-400 text-sm mb-4">Last updated: March 2026</p>
      <div className="space-y-4 text-gray-300 text-sm">
        <p>By using ExamGo, you agree to these terms.</p>
        <p>ExamGo provides exam students with access to deals, city guides, and scholarship matching services.</p>
        <p>You must provide accurate information during registration. False information may result in account termination.</p>
        <p>Deals and discounts are subject to merchant availability and may change without notice.</p>
        <p>Scholarship offers are provided by partner institutions. ExamGo does not guarantee admission or scholarships.</p>
        <p>ExamGo reserves the right to suspend accounts that misuse the platform.</p>
        <p>For queries contact us at support@examgo.in</p>
      </div>
    </div>
  )
}