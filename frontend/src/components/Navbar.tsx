// src/components/Navbar.tsx
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="p-4 bg-black text-white flex gap-4">
      <Link to="/">Race Results</Link>
      <Link to="/qualifying">Qualifying</Link>
      <Link to="/pitstops">Pitstops</Link>
    </nav>
  );
}
