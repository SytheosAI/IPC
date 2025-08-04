export default function TestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">IPC Test Page</h1>
      <p className="mt-4">If you can see this, the deployment is working!</p>
      <p className="mt-2">Time: {new Date().toISOString()}</p>
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Navigation Links:</h2>
        <ul className="mt-2 space-y-2">
          <li><a href="/" className="text-blue-500 hover:underline">Home</a></li>
          <li><a href="/mobile" className="text-blue-500 hover:underline">Mobile Landing</a></li>
          <li><a href="/vba" className="text-blue-500 hover:underline">VBA</a></li>
          <li><a href="/settings" className="text-blue-500 hover:underline">Settings</a></li>
        </ul>
      </div>
    </div>
  )
}