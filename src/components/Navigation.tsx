import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            Di Gröne
          </Link>
          <div className="flex gap-2">
            <Link to="/">
              <Button variant={isActive('/') ? 'default' : 'ghost'}>
                Hem
              </Button>
            </Link>
            <Link to="/statistics">
              <Button variant={isActive('/statistics') ? 'default' : 'ghost'}>
                Statistik
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant={isActive('/admin') ? 'default' : 'ghost'}>
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
