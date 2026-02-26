import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useToastCustom } from '@/lib/toast-context';
import { Navbar } from '@/components/Navbar';

const Register = () => {
  const auth = useAuth();
  const toast = useToastCustom();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!name || !email || !password || !confirmPassword) return;
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    const result = auth.register(name, email, password);
    if (!result.ok) { setError(result.error!); return; }
    toast.show('¡Cuenta creada!', 'Bienvenido/a a la comunidad 🎉');
    navigate('/');
  };

  return (
    <>
      <Navbar />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="glass-card w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Crear cuenta</h1>
            <p className="text-muted-foreground text-sm">Desbloquea contenido exclusivo gratis</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Nombre completo</label>
              <input type="text" value={name} onChange={e => { setName(e.target.value); setError(''); }} placeholder="Tu nombre" className="input-field" />
              {touched && !name && <span className="text-destructive text-xs mt-1 block">Requerido</span>}
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Correo electrónico</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="tu@email.com" className="input-field" />
              {touched && !email && <span className="text-destructive text-xs mt-1 block">Requerido</span>}
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Contraseña</label>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Mínimo 6 caracteres" className="input-field" />
              {touched && !password && <span className="text-destructive text-xs mt-1 block">Requerido</span>}
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Confirmar contraseña</label>
              <input type="password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(''); }} placeholder="Repite la contraseña" className="input-field" />
              {touched && !confirmPassword && <span className="text-destructive text-xs mt-1 block">Requerido</span>}
            </div>
            <button type="submit" className="btn-primary btn-full">
              Crear cuenta →
            </button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
