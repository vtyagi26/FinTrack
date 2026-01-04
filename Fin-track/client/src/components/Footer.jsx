export default function Footer() {
  return (
    <footer id="footer" className="py-8 bg-gray-900 text-gray-200 text-center">
      <p>&copy; {new Date().getFullYear()} FinTrack. All rights reserved.</p>
      <div className="mt-4 space-x-6">
        <a href="#" className="hover:text-white">Privacy</a>
        <a href="#" className="hover:text-white">Terms</a>
        <a href="#" className="hover:text-white">Support</a>
      </div>
    </footer>
  );
}