// src/components/Layout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div>
      <Navbar />
      <div className="p-4">
        <Outlet /> {/* This renders the current route's page */}
      </div>
    </div>
  );
}
