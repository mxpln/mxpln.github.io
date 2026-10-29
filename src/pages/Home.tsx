import React from 'react';
import { Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projects } from './index';

export const Home: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Header */}
      <header className="brutal-container p-8 mb-12">
        <h1 className="brutal-title text-6xl md:text-8xl mb-6" data-text="JOHN DOE">
          JOHN DOE
        </h1>
        <p className="text-2xl md:text-3xl max-w-2xl">
          FULL-STACK DEVELOPER / DIGITAL ARCHITECT / CODE SCULPTOR
        </p>
      </header>

      {/* About */}
      <section className="brutal-container brutal-asymm p-8 mb-12">
        <h2 className="brutal-title text-4xl mb-6">SYSTEM SPECS</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-xl mb-4">
              Building digital brutalism through clean code and raw functionality.
              Specialized in creating robust, scalable applications with an 
              emphasis on performance and user experience.
            </p>
            <Link to="/contact" className="brutal-button inline-block">
              INITIALIZE CONTACT
            </Link>
            <Link to="/garden" className="brutal-button inline-block ml-4">
              OPEN GARDEN →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['REACT', 'NODE.JS', 'TYPESCRIPT', 'POSTGRESQL'].map((tech, i) => (
              <div key={i} className="brutal-tech p-4">
                <span className="text-lg font-bold">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="brutal-title text-4xl">FEATURED_WORKS</h2>
          <Link to="/works" className="brutal-button">VIEW_ALL</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {projects.slice(0, 2).map((project) => (
            <Link 
              key={project.id} 
              to={`/works/${project.id}`}
              className="brutal-container p-6 hover:cursor-pointer"
            >
              <div className="mb-4 brutal-container p-2">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
              </div>
              <h3 className="brutal-title text-2xl mb-4 flex items-center gap-2">
                <Code size={24} />
                {project.title}
              </h3>
              <p className="mb-4">{project.shortDesc}</p>
              <div className="flex gap-2 flex-wrap">
                {project.tech.slice(0, 3).map((t, j) => (
                  <span key={j} className="brutal-tech px-3 py-1">
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};