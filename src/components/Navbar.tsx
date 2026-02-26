import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

export function Navbar() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-card/90 backdrop-blur-xl border-b border-border shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🥗</span>
          <span className="font-display font-bold text-foreground text-lg hidden sm:inline">
            Calculadora de Calorías
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo('hero')} className="text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer font-body text-sm">
            Inicio
          </button>
          <button onClick={() => scrollTo('calculator')} className="text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer font-body text-sm">
            Calculadora
          </button>
          <button onClick={() => scrollTo('exclusivo')} className="text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer font-body text-sm">
            Contenido
          </button>
          <button onClick={() => scrollTo('about')} className="text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer font-body text-sm">
            Acerca de
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {auth.isLoggedIn ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-bold">
                  {auth.getInitials(auth.currentUser!.name)}
                </div>
                <span className="text-foreground text-sm font-medium">
                  {auth.currentUser!.name.split(' ')[0]}
                </span>
              </div>
              <button onClick={handleLogout} className="btn-secondary text-sm !py-2 !px-4">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm !py-2 !px-4">
                Iniciar sesión
              </Link>
              <Link to="/register" className="btn-primary text-sm !py-2 !px-4">
                Registrarse
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden bg-transparent border-none text-foreground text-2xl cursor-pointer"
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border px-6 py-4 flex flex-col gap-3 animate-fade-in-up">
          <button onClick={() => scrollTo('hero')} className="text-left text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer py-2">Inicio</button>
          <button onClick={() => scrollTo('calculator')} className="text-left text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer py-2">Calculadora</button>
          <button onClick={() => scrollTo('exclusivo')} className="text-left text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer py-2">Contenido</button>
          <button onClick={() => scrollTo('about')} className="text-left text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer py-2">Acerca de</button>
          <div className="flex gap-3 pt-2">
            {auth.isLoggedIn ? (
              <button onClick={handleLogout} className="btn-secondary text-sm">Salir</button>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
                <Link to="/register" className="btn-primary text-sm" onClick={() => setMenuOpen(false)}>Registrarse</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
