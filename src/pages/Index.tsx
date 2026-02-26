import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Calculator } from '@/components/Calculator';
import { ExclusiveSection } from '@/components/ExclusiveSection';

const Index = () => {
  return (
    <>
      <Navbar />
      
      {/* Hero */}
      <section id="hero" className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <div className="inline-block px-4 py-1.5 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-6">
            🔬 Fórmula Mifflin-St Jeor — Precisión científica
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold text-foreground leading-tight mb-6">
            Tu plan nutricional{' '}
            <span className="glow-text">personalizado</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Calcula tu gasto calórico, descubre tu distribución ideal de macronutrientes 
            y alcanza tus objetivos con ciencia real.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#calculator" className="btn-primary text-lg !py-4 !px-8">
              Comenzar ahora →
            </a>
            <a href="#about" className="btn-secondary text-lg !py-4 !px-8">
              Saber más
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
            {[
              { value: '99%', label: 'Precisión' },
              { value: '3', label: 'Objetivos' },
              { value: '∞', label: 'Resultados' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="font-display text-2xl font-bold glow-text">{stat.value}</div>
                <div className="text-muted-foreground text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Calculator />
      <ExclusiveSection />

      {/* About */}
      <section id="about" className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Acerca del <span className="glow-text">proyecto</span>
            </h2>
          </div>
          <div className="glass-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-4">🎓 Proyecto de Grado</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Esta aplicación fue desarrollada como proyecto de grado universitario, 
                  utilizando tecnologías modernas de desarrollo web. Implementa la fórmula 
                  Mifflin-St Jeor, reconocida por la comunidad médica como una de las más 
                  precisas para estimar el metabolismo basal.
                </p>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-4">🔬 Base Científica</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">▸</span>
                    Fórmula Mifflin-St Jeor para BMR
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">▸</span>
                    5 niveles de actividad física validados
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">▸</span>
                    Distribución de macros basada en evidencia
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">▸</span>
                    Ajustes calóricos según objetivo
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Index;
