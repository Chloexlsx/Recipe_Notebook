import { useLocation, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
  };

  const handleInventoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/inventory');
  };
  
  return (
    <nav className="bg-white/20 backdrop-blur-md border-b border-white/30 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-center gap-4">
          <button
            onClick={handleHomeClick}
            className={`glass-button text-black ${
              location.pathname === '/' ? 'bg-white/60' : ''
            }`}
          >
            🏠 Home
          </button>
          <button
            onClick={handleInventoryClick}
            className={`glass-button text-black ${
              location.pathname === '/inventory' ? 'bg-white/60' : ''
            }`}
          >
            🧊 My Fridge.Pantry
          </button>
        </div>
      </div>
    </nav>
  );
};
