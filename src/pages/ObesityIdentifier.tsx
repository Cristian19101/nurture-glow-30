import { useState, useRef, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/ajDy5Q8Op/';

type Prediction = {
  className: string;
  probability: number;
};

const classStyles: Record<string, { emoji: string; color: string; bg: string }> = {
  'Bajo de peso': { emoji: '⚠️', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  'Saludable': { emoji: '✅', color: 'text-accent', bg: 'bg-accent/10 border-accent/30' },
  'Sobrepeso': { emoji: '🔴', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30' },
};

function getStyle(className: string) {
  const key = Object.keys(classStyles).find(k => className.toLowerCase().includes(k.toLowerCase()));
  return key ? classStyles[key] : { emoji: '📊', color: 'text-primary', bg: 'bg-primary/10 border-primary/30' };
}

export default function ObesityIdentifier() {
  const [mode, setMode] = useState<'webcam' | 'image'>('webcam');
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [webcamActive, setWebcamActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load TF + TM scripts dynamically
  useEffect(() => {
    const loadScripts = async () => {
      if ((window as any).tmImage) return;

      const loadScript = (src: string) =>
        new Promise<void>((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
          const s = document.createElement('script');
          s.src = src;
          s.onload = () => resolve();
          s.onerror = reject;
          document.head.appendChild(s);
        });

      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js');
    };

    loadScripts();
  }, []);

  const loadModel = useCallback(async () => {
    if (model) return model;
    setLoading(true);
    setError('');
    try {
      const tmImage = (window as any).tmImage;
      if (!tmImage) throw new Error('Las librerías de IA no se han cargado aún. Intenta de nuevo.');
      const m = await tmImage.load(MODEL_URL + 'model.json', MODEL_URL + 'metadata.json');
      setModel(m);
      setLoading(false);
      return m;
    } catch (e: any) {
      setError(e.message || 'Error cargando el modelo');
      setLoading(false);
      return null;
    }
  }, [model]);

  // Webcam
  const startWebcam = async () => {
    const m = await loadModel();
    if (!m) return;

    const tmImage = (window as any).tmImage;
    const webcam = new tmImage.Webcam(300, 300, true);
    await webcam.setup();
    await webcam.play();
    webcamRef.current = webcam;
    setWebcamActive(true);

    if (canvasRef.current?.parentNode) {
      // Replace canvas
      const container = canvasRef.current.parentNode;
      container.replaceChild(webcam.canvas, canvasRef.current);
      webcam.canvas.className = 'rounded-xl w-full max-w-[300px] mx-auto';
    }

    const loop = async () => {
      webcam.update();
      const preds = await m.predict(webcam.canvas);
      setPredictions(preds.map((p: any) => ({ className: p.className, probability: p.probability })));
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
  };

  const stopWebcam = () => {
    if (webcamRef.current) {
      webcamRef.current.stop();
      webcamRef.current = null;
    }
    cancelAnimationFrame(animFrameRef.current);
    setWebcamActive(false);
    setPredictions([]);
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const m = await loadModel();
    if (!m) return;

    const url = URL.createObjectURL(file);
    setImagePreview(url);

    const img = new Image();
    img.src = url;
    img.onload = async () => {
      const preds = await m.predict(img);
      setPredictions(preds.map((p: any) => ({ className: p.className, probability: p.probability })));
    };
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topPrediction = predictions.length > 0
    ? predictions.reduce((a, b) => (a.probability > b.probability ? a : b))
    : null;

  return (
    <>
      <Navbar />
      <main className="relative z-10 min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-block px-4 py-1.5 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-6">
              🤖 Modelo entrenado con Teachable Machine
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
              Identificador de <span className="glow-text">Obesidad</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Usa tu cámara o sube una imagen para que nuestro modelo de IA identifique 
              si estás bajo de peso, saludable o en sobrepeso.
            </p>
          </div>

          {/* Mode selector */}
          <div className="flex gap-3 justify-center mb-8">
            <button
              onClick={() => { stopWebcam(); setMode('webcam'); setImagePreview(null); setPredictions([]); }}
              className={`px-6 py-3 rounded-full font-display font-semibold text-sm transition-all cursor-pointer border ${
                mode === 'webcam'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-muted border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              📷 Webcam
            </button>
            <button
              onClick={() => { stopWebcam(); setMode('image'); setPredictions([]); }}
              className={`px-6 py-3 rounded-full font-display font-semibold text-sm transition-all cursor-pointer border ${
                mode === 'image'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-muted border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              🖼️ Subir imagen
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Input */}
            <div className="glass-card flex flex-col items-center justify-center min-h-[400px]">
              {mode === 'webcam' ? (
                <>
                  <canvas ref={canvasRef} className="rounded-xl w-full max-w-[300px] mx-auto bg-muted" width={300} height={300} />
                  <div className="mt-6">
                    {!webcamActive ? (
                      <button onClick={startWebcam} disabled={loading} className="btn-primary">
                        {loading ? 'Cargando modelo...' : 'Iniciar cámara →'}
                      </button>
                    ) : (
                      <button onClick={stopWebcam} className="btn-secondary">
                        Detener cámara
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="rounded-xl max-w-[300px] max-h-[300px] object-cover" />
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-[300px] rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center cursor-pointer"
                    >
                      <div className="text-4xl mb-3">📤</div>
                      <p className="text-muted-foreground text-sm">Haz click para seleccionar una imagen</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {imagePreview && (
                    <button
                      onClick={() => { setImagePreview(null); setPredictions([]); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="btn-secondary mt-4 text-sm"
                    >
                      Cambiar imagen
                    </button>
                  )}
                </>
              )}
              {error && <p className="text-destructive text-sm mt-4">{error}</p>}
            </div>

            {/* Results */}
            <div className="glass-card flex flex-col justify-center min-h-[400px]">
              {predictions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-muted-foreground">
                    {mode === 'webcam' ? 'Inicia la cámara para ver los resultados' : 'Sube una imagen para analizar'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in-up">
                  <h3 className="font-display text-xl font-bold text-foreground">Resultados</h3>

                  {/* Top prediction */}
                  {topPrediction && (
                    <div className={`text-center p-6 rounded-xl border ${getStyle(topPrediction.className).bg}`}>
                      <div className="text-4xl mb-2">{getStyle(topPrediction.className).emoji}</div>
                      <div className={`text-2xl font-display font-bold ${getStyle(topPrediction.className).color}`}>
                        {topPrediction.className}
                      </div>
                      <div className="text-muted-foreground text-sm mt-1">
                        {(topPrediction.probability * 100).toFixed(1)}% de confianza
                      </div>
                    </div>
                  )}

                  {/* All predictions */}
                  <div className="space-y-3">
                    {predictions.map((pred) => {
                      const style = getStyle(pred.className);
                      const pct = (pred.probability * 100).toFixed(1);
                      return (
                        <div key={pred.className}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-foreground">{style.emoji} {pred.className}</span>
                            <span className={style.color}>{pct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${pct}%`,
                                background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-lg bg-muted border border-border">
                    <p className="text-sm text-muted-foreground">
                      ⚠️ Este modelo es una herramienta educativa y no reemplaza el diagnóstico médico profesional.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
