import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

const mealPlan: Record<string, string[]> = {
  Lunes: ['Avena con frutas', 'Pollo con arroz integral', 'Yogur griego', 'Salmón con verduras'],
  Martes: ['Tostadas integrales con aguacate', 'Pasta con atún', 'Frutos secos', 'Pechuga con quinoa'],
  Miércoles: ['Smoothie de proteína', 'Ensalada César', 'Huevo duro', 'Carne magra con batata'],
  Jueves: ['Pancakes de avena', 'Bowl de pollo', 'Queso cottage', 'Tortilla de claras'],
  Viernes: ['Granola con yogur', 'Wrap de pollo', 'Barra de proteína', 'Pescado al horno'],
  Sábado: ['Huevos revueltos', 'Arroz con vegetales', 'Fruta fresca', 'Pizza casera saludable'],
  Domingo: ['French toast integral', 'Pollo al horno', 'Mix de nueces', 'Sopa de verduras'],
};

const tips = [
  { icon: '💧', title: 'Hidratación', text: 'Bebe al menos 2 litros de agua al día para mantener tu metabolismo activo.' },
  { icon: '🛌', title: 'Descanso', text: 'Duerme 7-9 horas. El sueño es clave para la recuperación muscular.' },
  { icon: '🥦', title: 'Fibra', text: 'Incluye fibra en cada comida para mejorar la digestión y saciedad.' },
  { icon: '⏰', title: 'Horarios', text: 'Come cada 3-4 horas para mantener estables los niveles de energía.' },
  { icon: '📝', title: 'Registro', text: 'Lleva un diario alimenticio. Lo que se mide se puede mejorar.' },
  { icon: '🏋️', title: 'Ejercicio', text: 'Combina cardio y fuerza para mejores resultados en composición corporal.' },
];

export function ExclusiveSection() {
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'plan' | 'tips'>('plan');

  if (!isLoggedIn) {
    return (
      <section id="exclusivo" className="relative z-10 py-20 px-6">
        <div className="max-w-2xl mx-auto text-center glass-card">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">Contenido Exclusivo</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Regístrate gratis para acceder al plan alimenticio semanal,
            seguimiento de progreso y tips nutricionales personalizados.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" className="btn-primary">Registrarse gratis →</Link>
            <Link to="/login" className="btn-secondary">Ya tengo cuenta</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="exclusivo" className="relative z-10 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Contenido <span className="glow-text">Exclusivo</span>
          </h2>
          <p className="text-muted-foreground">Tu acceso premium desbloqueado</p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {(['plan', 'tips'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-display font-semibold text-sm transition-all cursor-pointer border ${
                activeTab === tab
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-muted border-border text-muted-foreground hover:border-primary/30'
              }`}
            >
              {tab === 'plan' ? '🍽️ Plan Alimenticio' : '💡 Tips'}
            </button>
          ))}
        </div>

        {activeTab === 'plan' && (
          <div className="glass-card overflow-x-auto animate-fade-in-up">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-display">Día</th>
                  <th className="text-left p-3 text-muted-foreground font-display">Desayuno</th>
                  <th className="text-left p-3 text-muted-foreground font-display">Almuerzo</th>
                  <th className="text-left p-3 text-muted-foreground font-display">Merienda</th>
                  <th className="text-left p-3 text-muted-foreground font-display">Cena</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(mealPlan).map(([day, meals]) => (
                  <tr key={day} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-display font-semibold text-primary">{day}</td>
                    {meals.map((meal, i) => (
                      <td key={i} className="p-3 text-foreground">{meal}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
            {tips.map((tip, i) => (
              <div key={i} className="glass-card hover:border-primary/30 transition-all">
                <div className="text-3xl mb-3">{tip.icon}</div>
                <h4 className="font-display font-bold text-foreground mb-2">{tip.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
