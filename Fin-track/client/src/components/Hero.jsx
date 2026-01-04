export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-20 bg-gray-200">
      <h1 className="text-5xl font-bold text-gray-800 mb-6">
        Manage Your Portfolio with <span className="text-blue-700">FinTrack</span>
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mb-8">
        Track your investments, monitor trends, and stay ahead with real-time updates.
      </p>
      <div className="space-x-4">
        <a
          href="/signup"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Get Started
        </a>
        <a
          href="#features"
          className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50"
        >
          Learn More
        </a>
      </div>
    </section>
  );
}