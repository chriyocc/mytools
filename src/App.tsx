import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import JourneyDashboard from './pages/JourneyDashboard/JourneyDashboard';
import Sidebar from './components/Sidebar/Sidebar';
import './App.css';
import './styles/common.css'

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<Dashboard />} />
            <Route path="/journey" element={<JourneyDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
