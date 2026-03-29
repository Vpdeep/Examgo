import Link from 'next/link'

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Partner With ExamGo</h1>
          <p className="text-gray-400 text-lg">Reach thousands of verified exam students across India</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#111827] rounded-2xl p-8 border border-gray-800 hover:border-blue-600 transition-all">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl mb-6">🏪</div>
            <h2 className="text-2xl font-bold mb-3">For Merchants</h2>
            <p className="text-gray-400 mb-4">Restaurants, hotels, pharmacies, and transport providers near exam centres.</p>
            <ul className="space-y-2 mb-8">
              {[
                'List your deals for free',
                'Reach verified exam students',
                'Track redemptions in real time',
                'No commission on sales',
              ].map(function(item) {
                return (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400">✓</span> {item}
                  </li>
                )
              })}
            </ul>
            <Link href="/merchant/register" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-xl font-semibold transition-colors">
              Register as Merchant
            </Link>
          </div>

          <div className="bg-[#111827] rounded-2xl p-8 border border-gray-800 hover:border-purple-600 transition-all">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-2xl mb-6">🎓</div>
            <h2 className="text-2xl font-bold mb-3">For Institutions</h2>
            <p className="text-gray-400 mb-4">Coaching institutes, colleges, and corporate CSR programs.</p>
            <ul className="space-y-2 mb-8">
              {[
                'List scholarship offers',
                'Get verified student leads',
                'Filter by tier and exam',
                'Pay only per qualified lead',
              ].map(function(item) {
                return (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400">✓</span> {item}
                  </li>
                )
              })}
            </ul>
            <Link href="/institution/register" className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-3 rounded-xl font-semibold transition-colors">
              Register as Institution
            </Link>
          </div>
        </div>

        <div className="mt-16 bg-[#111827] rounded-2xl p-8 text-center border border-gray-800">
          <h3 className="text-xl font-bold mb-2">Already a partner?</h3>
          <p className="text-gray-400 mb-6">Access your dashboard to manage deals and view leads.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/merchant/dashboard" className="bg-[#1f2937] hover:bg-[#374151] text-white px-6 py-2 rounded-lg text-sm transition-colors">
              Merchant Dashboard
            </Link>
            <Link href="/institution/dashboard" className="bg-[#1f2937] hover:bg-[#374151] text-white px-6 py-2 rounded-lg text-sm transition-colors">
              Institution Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-400 text-sm underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}