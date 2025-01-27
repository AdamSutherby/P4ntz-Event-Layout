import Dashboard from "./components/Dashboard"

export default function Home() {
  return (
    <main className="min-h-screen overflow-y-auto bg-zinc-900">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-4xl font-bold mb-6 text-zinc-100">Streamer Goals Dashboard</h1>
        <Dashboard />
      </div>
    </main>
  )
}

