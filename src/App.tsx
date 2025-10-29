import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProjectsDashboard from './pages/ProjectsDashboard/ProjectsDashboard.tsx';
import JourneyDashboard from './pages/JourneyDashboard/JourneyDashboard';
import Sidebar from './components/Sidebar/Sidebar';
import { Toaster } from 'react-hot-toast';
import { ConfirmProvider } from './utils/confirmModalContext';
import { ImagePreviewProvider } from './components/ImagePreview/imagePreviewContext.tsx';
import { MarkdownPreviewProvider } from './components/MarkdownPreview/markdownPreviewContext.tsx';
import './App.css';
import './styles/common.css';

const App = () => {
  return (
    <Router>
      <MarkdownPreviewProvider>
        <ImagePreviewProvider>
          <ConfirmProvider>
            <Toaster 
              position="top-center"
              toastOptions={{
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
              <div className="app-container">
                <Sidebar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Navigate to="/projects" replace />} />
                    <Route path="/projects" element={<ProjectsDashboard />} />
                    <Route path="/journey" element={<JourneyDashboard />} />
                  </Routes>
                </main>
              </div>
          </ConfirmProvider>
        </ImagePreviewProvider>
      </MarkdownPreviewProvider>
    </Router>
  );
};

export default App;
