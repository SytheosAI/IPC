import Link from 'next/link'
import PageTitle from '@/components/PageTitle'

export default function TestPage() {
  return (
    <div className="p-6">
      <PageTitle title="IPC Test Page" subtitle="Deployment verification and navigation testing" />
      <p className="mt-4">If you can see this, the deployment is working!</p>
      <p className="mt-2">Time: {new Date().toISOString()}</p>
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Navigation Links:</h2>
        <ul className="mt-2 space-y-2">
          <li><Link href="/" className="text-blue-500 hover:underline">Home</Link></li>
          <li><Link href="/mobile" className="text-blue-500 hover:underline">Mobile Landing</Link></li>
          <li><Link href="/vba" className="text-blue-500 hover:underline">VBA</Link></li>
          <li><Link href="/settings" className="text-blue-500 hover:underline">Settings</Link></li>
        </ul>
      </div>
    </div>
  )
}