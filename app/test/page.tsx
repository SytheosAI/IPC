import Link from 'next/link'
import PageTitle from '@/components/PageTitle'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <PageTitle title="IPC Test Page" subtitle="Deployment verification and navigation testing" />
      <div className="card-modern hover-lift backdrop-blur-lg p-6 mt-6">
        <p className="text-gray-200 text-lg">If you can see this, the deployment is working!</p>
        <p className="text-gray-400 mt-2">Time: {new Date().toISOString()}</p>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-yellow-400 mb-4">Navigation Links:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/" className="card-modern hover-lift backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-glow">
            <span className="text-yellow-400 hover:text-yellow-300">Home</span>
          </Link>
          <Link href="/mobile" className="card-modern hover-lift backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-glow">
            <span className="text-yellow-400 hover:text-yellow-300">Mobile Landing</span>
          </Link>
          <Link href="/vba" className="card-modern hover-lift backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-glow">
            <span className="text-yellow-400 hover:text-yellow-300">VBA</span>
          </Link>
          <Link href="/settings" className="card-modern hover-lift backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-glow">
            <span className="text-yellow-400 hover:text-yellow-300">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  )
}