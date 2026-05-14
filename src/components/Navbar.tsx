import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

const NAV_OFFSET = 72; // sticky navbar height

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({ top, behavior: 'smooth' });
  return true;
}

export function Navbar() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const goToSection = useCallback(
    (id: string) => {
      setMenuOpen(false);
      if (location.pathname !== '/') {
        navigate(`/#${id}`);
        return;
      }
      // already on home: scroll directly
      if (!scrollToId(id)) {
        // fallback: set hash so ScrollToHash retries after render
        navigate(`/#${id}`);
      }
    },
    [location.pathname, navigate]
  );

  const handleLogout = () => {
    auth.logout();
    navigate('/');
  };

  const sectionLinks: { id: string; label: string }[] = [
    { id: 'hero', label: 'Inicio' },
    { id: 'calculator', label: 'Calculadora' },
  ];

  const routeLinks: { to: string; label: string }[] = [
    { to: '/obesity-identifier', label: 'Identificador' },
    { to: '/adaptive-trainer', label: 'Entrenador IA' },
    { to: '/virtual-coach', label: 'Coach IA' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-card/90 backdrop-blur-xl border-b border-border shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline" onClick={() => setMenuOpen(false)}>
          <span className="text-2xl">🥗</span>
          <span className="font-display font-bold text-foreground text-lg hidden sm:inline">
            Calculadora de Calorías
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {sectionLinks.map(s => (
            <button
              key={s.id}
              onClick={() => goToSection(s.id)}
              className="text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer font-body text-sm"
            >
              {s.label}
            </button>
          ))}
          {routeLinks.map(r => {
            const active = location.pathname === r.to;
            return (
              <Link
                key={r.to}
                to={r.to}
                className={`transition-colors no-underline font-body text-sm ${
                  active ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r.label}
              </Link>
            );
          })}
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
          aria-label="Menú"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border px-6 py-4 flex flex-col gap-2 animate-fade-in-up">
          {sectionLinks.map(s => (
            <button
              key={s.id}
              onClick={() => goToSection(s.id)}
              className="text-left text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer py-2"
            >
              {s.label}
            </button>
          ))}
          {routeLinks.map(r => (
            <Link
              key={r.to}
              to={r.to}
              onClick={() => setMenuOpen(false)}
              className="text-left text-muted-foreground hover:text-foreground no-underline py-2 block"
            >
              {r.label}
            </Link>
          ))}
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
