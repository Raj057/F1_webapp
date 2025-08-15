import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import "./index.css";
import RaceWeekend from "./pages/RaceWeekend/RaceWeekend";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<RaceWeekend />} />
        </Route>
      </Routes>
    </Router>
  );
}
