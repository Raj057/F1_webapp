import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import './index.css';
import QualifyingResultsViewer from "./components/QualifyingResultsViewer";
import RaceResultsViewer from "./components/RaceResultsViewer"; // example
// import other components as needed

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<RaceResultsViewer />} />
          <Route path="qualifying" element={<QualifyingResultsViewer />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
