import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-black text-white shadow-md border-b border-red-600">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-wide text-red-500 hover:text-red-400">
          F1 Race Weekend
        </Link>
        <div className="flex gap-6">
          <Link to="/" className="hover:text-red-400 transition-colors duration-200">
            Race Weekend
          </Link>
        </div>
      </div>
    </nav>
  );
}
