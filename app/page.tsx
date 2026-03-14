import Link from "next/link";

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Momentum</h1>
        <p className="text-gray-600 mb-8">Slack command center with AI-powered actions</p>
        <Link
          href="/dashboard"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Open Dashboard
        </Link>
      </div>
    </main>
  );
}
