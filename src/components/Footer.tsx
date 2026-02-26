export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border bg-card/50 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🥗</span>
              <span className="font-display font-bold text-foreground text-lg">Calculadora de Calorías</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Proyecto de grado universitario. Calculadora nutricional basada en la fórmula Mifflin-St Jeor.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Recursos</h4>
            <ul className="space-y-2 list-none p-0">
              <li><a href="#calculator" className="text-muted-foreground hover:text-primary transition-colors text-sm no-underline">Calculadora</a></li>
              <li><a href="#exclusivo" className="text-muted-foreground hover:text-primary transition-colors text-sm no-underline">Contenido Exclusivo</a></li>
              <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors text-sm no-underline">Acerca de</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Información</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Los cálculos son estimaciones basadas en fórmulas científicas reconocidas. Consulta a un profesional de salud para planes personalizados.
            </p>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Calculadora de Calorías — Proyecto de Grado
          </p>
        </div>
      </div>
    </footer>
  );
}
