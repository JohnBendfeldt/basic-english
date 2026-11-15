import React from 'react';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isOpen: boolean;
  _onClose: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  activeSection, 
  setActiveSection,
  isOpen,
  _onClose
}) => {
  const navItems = [
    { id: 'alphabet', label: 'Alphabet' },
    { id: 'phrases', label: 'Basic Phrases' },
    { id: 'words', label: 'Common Words' },
    { id: 'numbers', label: 'Numbers' },
    { id: 'quiz', label: 'Quiz' }
  ];

  return (
    <nav className={`navigation ${isOpen ? 'open' : ''}`} aria-label="Main navigation">
      <ul>
        {navItems.map(item => {
          const isActive = activeSection === item.id;
          return (
            <li
              key={item.id}
              className={isActive ? 'active' : ''}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setActiveSection(item.id);
                }
              }}
            >
              <button
                type="button"
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setActiveSection(item.id)}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
