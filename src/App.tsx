import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import JourneyDashboard from './pages/JourneyDashboard/JourneyDashboard';
import Sidebar from './components/Sidebar/Sidebar';
import { Toaster } from 'react-hot-toast';
import { ConfirmProvider } from './components/ConfirmModal/ConfirmModalContext';
import './App.css';
import './styles/common.css'
import {Cloudinary} from "@cloudinary/url-gen";

const App = () => {
  // Create a Cloudinary instance and set your cloud name.
  const cld = new Cloudinary({
    cloud: {
      cloudName: 'dlaqeohvw'
    }
  });
  return (
    <ConfirmProvider>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#000000',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
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
    </ConfirmProvider>
    
  );
};

export default App;
