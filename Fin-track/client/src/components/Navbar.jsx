export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-6 shadow-md bg-black">
      <h1 className="text-2xl font-bold text-blue-600 hover:text-white">
              <a
          href="/"
        >
          FinTrack
        </a></h1>
      <div className="space-x-6">
        <a href="#features" className="text-2x1 font-bold text-white hover:text-blue-600">Features</a>
        <a href="#stats" className="text-2x1 font-bold text-white hover:text-blue-600">Stats</a>
        <a href="#footer" className="text-2x1 font-bold text-white hover:text-blue-600">Contact</a>
        <a
          href="/signin"
          className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Sign In
        </a>
                <a
          href="/signup"
          className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Sign Up
        </a>
      </div>
    </nav>
  );
}
