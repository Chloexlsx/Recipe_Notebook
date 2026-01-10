interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="bg-white/20 backdrop-blur-md border-b border-white/30 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onNavigate('recipes')}
            className={`glass-button text-black ${
              currentView === 'recipes' ? 'bg-white/60' : ''
            }`}
          >
            🏠 Home
          </button>
          <button
            onClick={() => onNavigate('inventory')}
            className={`glass-button text-black ${
              currentView === 'inventory' ? 'bg-white/60' : ''
            }`}
          >
            🧊 My Fridge/Pantry
          </button>
        </div>
      </div>
    </nav>
  );
};
