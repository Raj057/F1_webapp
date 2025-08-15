import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4">
        <div className="bg-white shadow-md rounded-lg p-4">
          <Outlet />
        </div>
      </main>
      <footer className="bg-black border-t border-red-600 py-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} F1 Race Weekend — Data powered by FastF1
      </footer>
    </div>
  );
}
