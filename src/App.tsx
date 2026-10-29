import { useParams, useLocation } from 'react-router-dom';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Works } from './pages/Works';
import { Project } from './pages/Project';
import { Laboratory } from './pages/Laboratory';
import { Stack } from './pages/Stack';
import { Manifesto } from './pages/Manifesto';
import { Contact } from './pages/Contact';
import { Garden } from './pages/Garden';

function App() {
  return (
    <Router>
      <Shell />
    </Router>
  );
}

const Shell = () => {
  const location = useLocation();
  const isTerminal = location.pathname === '/' || location.pathname === '/garden';

  return (
    <div className={isTerminal ? 'min-h-screen' : 'min-h-screen bg-[var(--concrete)]'}>
      {!isTerminal && (
        <>
          <div className="brutal-grid"></div>
          <Navigation />
        </>
      )}
      <Routes>
        <Route path="/" element={<Garden />} />
        <Route path="/garden" element={<Garden />} />
        <Route path="/works" element={<Works />} />
        <Route path="/works/:id" element={<ProjectPage />} />
        <Route path="/lab" element={<Laboratory />} />
        <Route path="/stack" element={<Stack />} />
        <Route path="/manifesto" element={<Manifesto />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
};

// Wrapper component to handle project ID from URL
const ProjectPage = () => {
  const { id } = useParams();
  return <Project id={id || ''} />;
};

export default App;