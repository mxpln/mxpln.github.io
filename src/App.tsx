import { useParams, useLocation } from 'react-router-dom';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Works } from './pages/Works';
import { Project } from './pages/Project';
import { Home } from './pages/Home';
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
  const isGarden = location.pathname === '/garden';
  return (
    <div className={isGarden ? 'min-h-screen' : 'min-h-screen bg-[var(--concrete)]'}>
      {!isGarden && (
        <>
          <div className="brutal-grid"></div>
          <Navigation />
        </>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
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