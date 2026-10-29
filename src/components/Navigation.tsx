import React from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../pages';
import { Menu } from 'lucide-react';

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="brutal-container p-4 mb-8">
      <div className="flex justify-between items-center">
        <span className="brutal-title text-xl">SYSTEM_NAV</span>
        <button 
          className="brutal-button md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu size={24} />
        </button>
        
        <div className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-4 absolute md:relative top-full left-0 right-0 md:top-auto md:left-auto md:right-auto bg-[var(--surface)] md:bg-transparent p-4 md:p-0 border-t-2 md:border-0 border-[var(--border)]`}>
          {routes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className="brutal-link text-lg"
              title={route.description}
            >
              {route.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};