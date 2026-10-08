import React, { useState, useEffect } from 'react';
import {
  Layers,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Scale,
  Calendar,
  CheckSquare,
  Search,
  ChevronDown,
  ChevronRight,
  Flame,
  AlertTriangle,
  FileCheck,
  Copy,
  Zap,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sparkles,
  MessageSquare,
  X,
  Target,
  Maximize2,
  Bot,
  Send,
  MessageCircle,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'mapa' | 'modulos' | 'actividades' | 'fichas' | 'tablas' | 'checklist' | 'plan'
  >('modulos');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Estados del Acompañante Rick Sanchez
  const [rickOpen, setRickOpen] = useState(true);
  const [rickImgError, setRickImgError] = useState(false);
  const [rickMessageIndex, setRickMessageIndex] = useState(0);
  const [studyTimer, setStudyTimer] = useState(25 * 60); // 25 minutos pomodoro
  const [timerRunning, setTimerRunning] = useState(false);
  const [rickChallenge, setRickChallenge] = useState<number | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

  // Estados de la IA Flotante (Consultas estrictas al Libro)
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ia'; text: string; source?: string }>>([
    {
      sender: 'ia',
      text: '¡Hola! Soy el asistente oficial del manual de la UNLaM (páginas 15 a 88). Tengo PROHIBIDO inventar conceptos o usar teorías fuera del programa. ¿Qué duda tenés para el parcial del 25 de octubre?',
      source: 'Manual UNLaM Módulos 1-9'
    }
  ]);

  const handleAskAi = async (pregunta?: string) => {
    const q = (pregunta || chatInput).trim();
    if (!q) return;

    // Agregar mensaje del usuario
    const newMsgs = [...chatMessages, { sender: 'user' as const, text: q }];
    setChatMessages(newMsgs);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok) throw new Error('Error al conectar con el servidor.');
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ia',
          text: data.answer || 'No se obtuvo respuesta del texto oficial.',
          source: 'Manual Oficial UNLaM'
        }
      ]);
    } catch (err: any) {
      // Fallback local canónico estricto basado en el libro si el servidor no está accesible
      let fallbackText = '';
      const lower = q.toLowerCase();
      if (lower.includes('definir') || lower.includes('definicion') || lower.includes('definición')) {
        fallbackText = 'Según el Módulo 9 (pág. 84), la DEFINICIÓN debe estar compuesta por 4 componentes obligatorios:\n1. Nombre del término a definir.\n2. Verbo de denominación (es, se denomina, se define).\n3. Clase más amplia (categoría hiperonímica englobante).\n4. Rasgos de contenido específicos que lo distinguen.\nEjemplo del manual: "El signo lingüístico [1] es [2] una entidad mental [3] compuesta por dos planos: el significado y el significante [4]".';
      } else if (lower.includes('elipsis') || lower.includes('referencia')) {
        fallbackText = 'Según el Módulo 2 (pág. 26):\n• Referencia: relación en la que un ítem necesita de otro explícito para interpretarse, usando pronombres personales, demostrativos o posesivos ("estos", "sus").\n• Elipsis: sustitución por cero (Ø). Es la omisión de una palabra o frase ya explicitada ("La coherencia es una propiedad; la cohesión, [Ø es] otra").';
      } else if (lower.includes('explicativo') || lower.includes('argumentativo') || lower.includes('continuum') || lower.includes('polo')) {
        fallbackText = 'Según el Módulo 4 (pág. 50, "Continuum de la exposición"):\n• Polo Expositivo-Explicativo: Saber ya legitimado socialmente; borramiento de huellas del sujeto (distancia objetiva); cita textual directa entrecomillada; dimensiones cognoscitiva + didáctica.\n• Polo Argumentativo: Construcción de nuevos conceptos; el enunciador toma postura y confronta opiniones; cita indirecta y refutación; dimensiones cognoscitiva + emocional.';
      } else if (lower.includes('comilla') || lower.includes('comillas')) {
        fallbackText = 'Según el Módulo 8 (pág. 74), las comillas tienen 5 usos oficiales:\n1. Introducir discurso referido directo (cita textual).\n2. Marcar distancia crítica con una voz adversa con la que no se acuerda.\n3. Marcar distancia con un vocablo vulgar, irónico o en otra lengua ("show", "quilombo").\n4. Marcar un nuevo concepto teórico que se introduce.\n5. Introducir el título de un texto breve o artículo.';
      } else if (lower.includes('subjetivema') || lower.includes('modalizador')) {
        fallbackText = 'Según el Módulo 8 (pág. 68):\n• Subjetivemas: sustantivos, adjetivos, verbos o adverbios que transmiten una valoración afectiva o axiológica del autor ("lamentable", "ninguneó").\n• Modalizadores: adverbios ("quizás", "indudablemente"), verbos condicionales ("podría") o locuciones ("es evidente que") que manifiestan la actitud del enunciador ante la certeza o duda de lo dicho.';
      } else if (lower.includes('resumen') || lower.includes('van dijk') || lower.includes('macrorregla')) {
        fallbackText = 'Según el Módulo 9 (pág. 80), el resumen es un texto autónomo que aplica 4 macrorreglas de Van Dijk:\n1. Selección (de proposiciones relevantes).\n2. Omisión (eliminar información accesoria).\n3. Generalización (sustituir términos específicos por un concepto englobante).\n4. Integración / Construcción (reunir varias proposiciones en una idea global).';
      } else {
        fallbackText = 'De acuerdo al Manual Oficial de la UNLaM (pp. 15-88), solo se evalúan los contenidos reglamentados de los módulos 1 al 9: propiedades del texto (coherencia, cohesión, adecuación), géneros de Bajtín, secuencias de Adam, continuum expositivo, lectura inferencial, escritura epistémica, enunciación/polifonía y géneros estudiantiles (apunte, resumen, parcial). Si tu consulta no figura en estos temas, no es evaluable en el examen del 25 de octubre.';
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ia',
          text: fallbackText,
          source: 'Manual Oficial UNLaM (Módulos 1-9)'
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Frases y retos de Rick según contexto y generales
  const rickQuotes = [
    "¡Escuchame bien, genio del multiverso! *¡burp!* El 25 de octubre te van a sentar en un banco de la UNLaM y si no sabés los 4 componentes de la DEFINICIÓN, ¡te vas a quedar en esta dimensión para siempre!",
    "¡Morty... digo, aspirante! ¡Dejá el celular y mirá la pantalla! Si ponés que la elipsis es un pronombre en vez de sustitución por cero, ¡te juro que te teletransporto a una dimensión llena de monstruos gramaticales!",
    "¡ENFOCATE EN EL CONTINUUM DE LA EXPOSICIÓN! Página 50 del manual. ¿Qué hace el polo explicativo? ¡Borra el sujeto, carajo! ¡No metas tus opiniones de Facebook en un texto de parcial!",
    "¡Wubba Lubba Dub Dub! La justificación académica tiene fórmula matemática: Autor + Fuente + Tesis + Razones con conectores lógicos de orden. ¡No me vengas con 'a mí me parece'!",
    "¡¿Todavía no te aprendiste los conectores?! Contraste: 'sin embargo', 'no obstante'. Causa: 'puesto que', 'ya que'. ¡Usá los conectores adecuados o tu texto va a ser un monstruo de Frankenstein!",
    "¡Ojo con los paratextos! Si empezás a leer un texto sin mirar el título, la fuente y las notas al pie, estás navegando a ciegas en el espacio profundo sin combustible de portal.",
    "¡Actitud respetuosa pero rebelde! Lo dijo el manual en el Módulo 6. ¡Sos un pirquinero, buscá la hipótesis del autor y desarmala con argumentos!"
  ];

  // Desafíos rápidos de Rick
  const rickQuizzes = [
    {
      pregunta: "En la consigna 'Defina Cohesión Textual', ¿cuál de estos NO es uno de los 4 componentes obligatorios?",
      opciones: [
        "A) Nombre del término a definir",
        "B) Verbo de denominación (es, se denomina)",
        "C) Ejemplo concreto ilustrativo de la vida diaria",
        "D) Clase más amplia e hiperonímica"
      ],
      correcta: "C",
      explicacion: "¡Exacto! ¡Un ejemplo jamás es parte de la definición canónica! Poner ejemplos cuando te piden definir es la forma más rápida de que te pongan un 2."
    },
    {
      pregunta: "¿Cuál es la diferencia crítica entre Elipsis y Referencia?",
      opciones: [
        "A) La elipsis usa pronombres demostrativos; la referencia usa verbos.",
        "B) La elipsis es omisión absoluta (sustitución por cero Ø); la referencia usa un pronombre visible.",
        "C) Son exactamente lo mismo.",
        "D) La referencia solo se usa en textos poéticos."
      ],
      correcta: "B",
      explicacion: "¡Bien ahí! La referencia deja el pronombre en la hoja; la elipsis deja el hueco vacío porque el término ya se sabe por cotexto."
    },
    {
      pregunta: "¿Qué caracteriza al Polo Expositivo-Explicativo según el cuadro oficial de la pág. 50?",
      opciones: [
        "A) Busca persuadir con recursos emocionales y citas indirectas.",
        "B) Expone un saber ya legitimado socialmente y borra las huellas del sujeto (distancia objetiva).",
        "C) Se escribe en primera persona del singular con lenguaje coloquial.",
        "D) Utiliza únicamente diálogos espontáneos."
      ],
      correcta: "B",
      explicacion: "¡Brillante! El polo explicativo enseña un saber construido previamente, sin juicios personales y con dimensión didáctica."
    }
  ];

  // Temporizador de concentración
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && studyTimer > 0) {
      interval = setInterval(() => {
        setStudyTimer((prev) => prev - 1);
      }, 1000);
    } else if (studyTimer === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, studyTimer]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const nextRickQuote = () => {
    setRickMessageIndex((prev) => (prev + 1) % rickQuotes.length);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-50 backdrop-blur px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/20">
              U
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black tracking-wider uppercase text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  UNLaM · Ingreso 2027
                </span>
                <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" /> Parcial: 25 de Octubre
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Seminario de Textos · Masterclass & Entrenador Interdimensional
              </h1>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'modulos', label: '📖 Módulos Oficiales', icon: BookOpen },
              { id: 'actividades', label: '✅ Actividades Resueltas', icon: FileCheck },
              { id: 'fichas', label: '💡 Fichas Concepto', icon: Lightbulb },
              { id: 'tablas', label: '⚖️ Tablas Comparativas', icon: Scale },
              { id: 'checklist', label: '☑️ Checklist Habilidades', icon: CheckSquare },
              { id: 'plan', label: '📅 Plan 15 Días', icon: Calendar },
              { id: 'mapa', label: '📌 Mapa Mental', icon: Layers }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 font-bold'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* ============================================================== */}
        {/* BANNER INTERDIMENSIONAL DE RICK SANCHEZ                        */}
        {/* ============================================================== */}
        <section className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border-2 border-emerald-500/60 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
          {/* Luz de portal verde de fondo */}
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-5 relative z-10">
            {/* Imagen de Rick con Portal Verde animado */}
            <div className="relative group shrink-0">
              <div className="w-28 h-36 sm:w-32 sm:h-44 rounded-2xl bg-gradient-to-b from-emerald-400/20 to-emerald-900/40 border-2 border-emerald-400 p-1 flex items-center justify-center overflow-hidden shadow-lg shadow-emerald-500/30">
                {!rickImgError ? (
                  <img
                    src="Rick_MV.webp"
                    alt="Rick Sanchez Tutor UNLaM"
                    className="w-full h-full object-contain filter drop-shadow-[0_5px_10px_rgba(52,211,153,0.5)] transition-transform duration-300 group-hover:scale-105"
                    onError={() => setRickImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 bg-slate-950/80 rounded-xl">
                    <svg viewBox="0 0 100 100" className="w-20 h-20 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">
                      {/* Pelo puntiagudo de Rick celeste */}
                      <polygon points="50,5 57,25 68,10 70,30 85,18 82,40 95,35 87,55 93,65 80,70 78,85 65,80 50,92 35,80 22,85 20,70 7,65 13,55 5,35 18,40 15,18 30,30 32,10 43,25" fill="#a0e1e9" stroke="#5cb8c4" strokeWidth="2" />
                      {/* Cara */}
                      <ellipse cx="50" cy="55" rx="25" ry="28" fill="#e9e0cf" stroke="#666" strokeWidth="1.5" />
                      {/* Monoceja azul */}
                      <path d="M 33 42 Q 50 37 67 42" stroke="#4fc3f7" strokeWidth="4" fill="none" strokeLinecap="round" />
                      {/* Ojos */}
                      <circle cx="40" cy="50" r="7" fill="#fff" stroke="#333" strokeWidth="1.5" />
                      <circle cx="60" cy="50" r="7" fill="#fff" stroke="#333" strokeWidth="1.5" />
                      <circle cx="41" cy="50" r="1.5" fill="#111" />
                      <circle cx="59" cy="50" r="1.5" fill="#111" />
                      {/* Nariz */}
                      <line x1="50" y1="52" x2="50" y2="60" stroke="#b0a08e" strokeWidth="2" strokeLinecap="round" />
                      {/* Boca y baba verde */}
                      <path d="M 40 70 Q 50 67 60 70" stroke="#444" strokeWidth="2" fill="none" strokeLinecap="round" />
                      <ellipse cx="44" cy="74" rx="3.5" ry="4.5" fill="#52ea58" />
                    </svg>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 mt-1">RICK C-137</span>
                  </div>
                )}
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-950 text-emerald-300 border border-emerald-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shadow">
                C-137 TUTOR
              </span>
            </div>

            {/* Bocadillo de Rick y controles de enfoque */}
            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-500 text-xs font-black tracking-wide flex items-center gap-1.5 animate-pulse">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" /> RICK SANCHEZ TE ESTÁ VIGILANDO
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Dimensión C-137 / Sede San Justo</span>
                </div>

                {/* Pomodoro Portal */}
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-emerald-800/80">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-sm font-black text-emerald-300">
                    {formatTimer(studyTimer)}
                  </span>
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="p-1 hover:bg-slate-800 rounded text-emerald-400 transition"
                    title={timerRunning ? "Pausar" : "Iniciar enfoque"}
                  >
                    {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setTimerRunning(false);
                      setStudyTimer(25 * 60);
                    }}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                    title="Reiniciar 25 min"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* El mensaje de Rick */}
              <div className="bg-slate-950/90 border border-emerald-500/50 p-3.5 rounded-xl relative shadow-inner">
                <p className="text-xs sm:text-sm text-emerald-200 font-medium leading-relaxed italic">
                  "{rickQuotes[rickMessageIndex]}"
                </p>
              </div>

              {/* Botonera de interacción con Rick */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                <button
                  onClick={nextRickQuote}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-lg transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" /> ¡Rick, dame otra orden de estudio!
                </button>
                <button
                  onClick={() => {
                    const rnd = Math.floor(Math.random() * rickQuizzes.length);
                    setRickChallenge(rnd);
                    setQuizAnswer(null);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-lg border border-cyan-800/60 transition flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5 text-cyan-400" /> ¡Tomame una pregunta trampa, Rick!
                </button>
              </div>
            </div>
          </div>

          {/* Modal / Desafío interactivo de Rick */}
          {rickChallenge !== null && (
            <div className="mt-4 pt-4 border-t border-emerald-900/60 bg-slate-950 p-4 rounded-xl border border-emerald-600/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber-500" /> DESAFÍO RELÁMPAGO DE RICK:
                </span>
                <button
                  onClick={() => setRickChallenge(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white">
                {rickQuizzes[rickChallenge].pregunta}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {rickQuizzes[rickChallenge].opciones.map((op, idx) => {
                  const letter = op[0];
                  return (
                    <button
                      key={idx}
                      onClick={() => setQuizAnswer(letter)}
                      className={`p-2.5 rounded-lg text-left border transition font-medium ${
                        quizAnswer === letter
                          ? letter === rickQuizzes[rickChallenge].correcta
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      {op}
                    </button>
                  );
                })}
              </div>
              {quizAnswer && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium border ${
                    quizAnswer === rickQuizzes[rickChallenge].correcta
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                      : 'bg-rose-950/80 border-rose-500 text-rose-200'
                  }`}
                >
                  {quizAnswer === rickQuizzes[rickChallenge].correcta ? '✅ ' : '❌ '}
                  {rickQuizzes[rickChallenge].explicacion}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ======================= TAB 2: CONTENIDO POR MÓDULOS CON SUBTÍTULOS EXACTOS ======================= */}
        {activeTab === 'modulos' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-800/40 p-5 rounded-2xl shadow-lg">
              <h2 className="text-xl font-black text-cyan-300 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-cyan-400" />
                Programa Oficial con Subtítulos Exactos del Manual de UNLaM
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Jerarquía 100% idéntica al índice oficial. Cada concepto desarrollado con rigor académico:
                definición canónica, cómo se reconoce en el parcial, analogía mnemotécnica y errores fatales a evitar.
              </p>
            </div>

            {/* MÓDULO 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-sky-400">
                  1. INTRODUCCIÓN · LECTURA Y ESCRITURA ACADÉMICAS
                </h3>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">pp. 15-23</span>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                <div>
                  <h4 className="font-bold text-amber-300">1.1 ¿CÓMO LEER ESTE MANUAL?</h4>
                  <p className="mt-1 leading-relaxed">
                    Organizado en dos partes: módulos teórico-prácticos para apropiación de lectura y escritura de géneros académicos, y anexo en MIeL con actividades integradoras y modelos de examen.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-300">1.2 ¿QUÉ SON Y PARA QUÉ SIRVEN LAS FICHAS DE CLASE?</h4>
                  <p className="mt-1 leading-relaxed">
                    Disponibles en MIeL azul. Cada ficha coincide con un módulo del manual e incluye videos explicativos y actividades complementarias.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-300">1.3 PROGRAMA · 1.3.1 FUNDAMENTACIÓN Y 1.3.2 OBJETIVOS</h4>
                  <p className="mt-1 leading-relaxed">
                    Vinculación sistemática entre lectura y producción escrita. Promover adquisición de estrategias de lectura crítica y géneros académicos según la situación de comunicación.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-300">1.4 CRITERIOS DE EVALUACIÓN</h4>
                  <p className="mt-1 leading-relaxed">
                    Examen de 90 minutos con lectura silenciosa de textos académicos y resolución de consignas teórico-prácticas (opción múltiple, completamiento, justificación de respuestas elegidas, construcción de respuesta).
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-300">1.6 MAPA CONCEPTUAL DE LA ASIGNATURA</h4>
                  <p className="mt-1 leading-relaxed">
                    Eje central: Lectura y escritura académicas $\rightarrow$ Leer para aprender (global, párrafos, notas) + Escribir para aprender (planificación, puesta en texto, revisión) + Géneros discursivos (secuencias textuales, dos polos explicativo y argumentativo, enunciación y polifonía) + Géneros producidos por estudiantes (apunte, resumen, parcial).
                  </p>
                </div>
              </div>
            </div>

            {/* MÓDULO 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-rose-400">
                  2. EL TEXTO · Primera parte
                </h3>
                <span className="text-xs bg-red-950 text-rose-300 px-2.5 py-1 rounded border border-red-800 font-bold">
                  🔴 Prioridad Máxima (pp. 24-35)
                </span>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                <div>
                  <h4 className="font-bold text-cyan-300">2.1 TEXTO, CONTEXTO Y PARATEXTO</h4>
                  <p className="mt-1 leading-relaxed">
                    El texto es una <strong>unidad semántico-discursiva</strong>, un artefacto verbal con unidad de sentido que circula en intercambios sociales y se realiza a través de unidades de la lengua. Posee extensión variable y está dotado de propiedades inherentes reglamentadas. Para funcionar exige coherencia, cohesión y adecuación.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-cyan-300">2.1.1 Coherencia</h4>
                  <p className="mt-1 leading-relaxed">
                    Propiedad esencial que hace que el texto sea percibido como una unidad comunicativa.
                    <br />• <strong>Coherencia global:</strong> Presencia de un tema central común que articula todas las partes.
                    <br />• <strong>Coherencia local:</strong> Cada secuencia o párrafo posee sentido en relación con el tema central (subtemas).
                    <br />• <strong>Contexto de situación (situacional):</strong> Condición de posibilidad para el encuadre y asignación de sentido. Requiere responder obligatoriamente en examen:
                    <span className="block font-mono text-cyan-300 bg-slate-950 p-2 mt-1 rounded border border-slate-800 text-xs">
                      ¿Quién? (Emisor) | ¿A quién? (Receptor) | ¿Qué? (Mensaje) | ¿Dónde? (Espacio) | ¿Cuándo? (Tiempo) | Relación: ¿Simétrica o Asimétrica?
                    </span>
                    • <strong>Contexto histórico, social, político y cultural:</strong> Época, sociedad, leyes, valores y costumbres que enmarcan la producción.
                  </p>
                  <p className="text-xs text-rose-300 mt-1">
                    ⚠️ <em>No confundir:</em> La coherencia es una propiedad del sentido profundo (macroestructural); la cohesión es formal e interoracional.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-cyan-300">2.1.2 Cohesión</h4>
                  <p className="mt-1 leading-relaxed">
                    Relación interoracional que permite que las oraciones se organicen y conformen un texto. Procedimientos formales clasificados en el manual:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-xs">
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                      <strong className="text-sky-400 block">1. Referencia:</strong>
                      Ítem que necesita la presencia explícita de otro para interpretarse. Usa pronombres personales, demostrativos y posesivos.
                      <em className="text-sky-300 block mt-1">"La cohesión depende del orden; <strong>estos</strong> pueden ser conectores..."</em>
                    </div>
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                      <strong className="text-amber-400 block">2. Elipsis:</strong>
                      Sustitución por cero ($\emptyset$). Omisión de una palabra o frase ya dicha.
                      <em className="text-amber-300 block mt-1">"La coherencia es una propiedad; la cohesión, [$\emptyset$ es] otra."</em>
                    </div>
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                      <strong className="text-emerald-400 block">3. Reiteración:</strong>
                      • Repetición (misma palabra para enfatizar).<br />
                      • Sinonimia (términos de campo semántico común con significado semejante).<br />
                      • Palabra general (hiperónimo abarcador: "sustituciones").
                    </div>
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                      <strong className="text-purple-400 block">4. Colocación:</strong>
                      Coocurrencia de varios elementos léxicos que pertenecen al mismo campo semántico o marco de conocimiento (ej: *lector, autor, código, estilo, registro*).
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-cyan-300">2.1.3 Conectores</h4>
                  <p className="mt-1 leading-relaxed">
                    Palabras o frases que establecen relaciones semánticas entre palabras, oraciones o párrafos, agregando significado específico.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mt-2">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800"><strong>Adición:</strong> y, también, además, asimismo, aún.</div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800"><strong>Contraste:</strong> pero, sin embargo, no obstante, en cambio.</div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800"><strong>Causa/Efecto:</strong> porque, por lo tanto, por ende, ya que.</div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800"><strong>Temporalidad:</strong> después, luego, antes, finalmente.</div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800"><strong>Comparación:</strong> así como, del mismo modo, igualmente.</div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800"><strong>Énfasis:</strong> sobre todo, ciertamente, es más, especialmente.</div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800"><strong>Reformulación:</strong> es decir, o sea, en otras palabras.</div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800"><strong>Orden:</strong> primero, en segundo lugar, a continuación.</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-cyan-300">2.3 LOS PARATEXTOS · 2.3.1 CLASIFICACIÓN</h4>
                  <p className="mt-1 leading-relaxed">
                    Elementos que rodean o acompañan al texto (*para* = junto a). Funcionan como guías e instructivos de lectura para formular hipótesis de lectura previas.
                    <br />• <strong>Verbales:</strong> Título (sintetiza el tema de forma ajustada), Subtítulos (subnúcleos temáticos menores), Nombre del autor, Semblanza biográfica, Fuente/medio de publicación, Notas al pie (con superíndice $^{1}$), Glosario (términos técnicos), Bibliografía alfabética. En prensa: volanta, copete, cintillo.
                    <br />• <strong>Icónicos:</strong> Imágenes visuales, gráficos, fotografías, diagramas e infografías.
                  </p>
                </div>
              </div>
            </div>

            {/* MÓDULO 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-amber-400">
                  3. OTROS RASGOS TEXTUALES · Adecuación, Corrección, Conciencia Retórica y Ethos
                </h3>
                <span className="text-xs bg-amber-950 text-amber-300 px-2.5 py-1 rounded border border-amber-800 font-bold">
                  🟠 Prioridad Alta (pp. 36-41)
                </span>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                <div>
                  <h4 className="font-bold text-amber-300">3.1 TEXTO, ENUNCIADO Y DISCURSO</h4>
                  <p className="mt-1 leading-relaxed">
                    • <strong>Enunciado:</strong> Unidad mínima de comunicación que transmite un mensaje inteligible en un contexto físico o verbal determinado (ej: *"sí"*).
                    <br />• <strong>Texto:</strong> Conjunto estructurado de elementos lingüísticos organizados según reglas de construcción.
                    <br />• <strong>Discurso:</strong> El <em>texto en contexto o situación comunicativa</em>. Delimita un uso social específico de la lengua (político, legal, religioso, académico).
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-300">3.2 ADECUACIÓN</h4>
                  <p className="mt-1 leading-relaxed">
                    Propiedad textual por la que el texto se amolda y adapta a la situación comunicativa (interlocutores, canal, propósitos). Regula los <strong>registros</strong>:
                    <br />1. <em>Subjetivo vs. Objetivo:</em> Presencia de marcas valorativas vs. borramiento de huellas personales (discurso científico).
                    <br />2. <em>Masivo vs. Especializado:</em> Vocabulario accesible para todos vs. léxico técnico de la disciplina.
                    <br />3. <em>Informal vs. Formal:</em> Grado de familiaridad (a menor familiaridad, mayor formalidad). En la universidad escrita docente-alumno predomina el <strong>especializado y formal</strong>.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-300">3.3 CORRECCIÓN</h4>
                  <p className="mt-1 leading-relaxed">
                    Ausencia de errores en el uso de destrezas lingüísticas (gramática, ortografía, puntuación, sintaxis). No se limita a la gramática sino a su adecuación a la situación.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-300">3.4 CONCIENCIA RETÓRICA</h4>
                  <p className="mt-1 leading-relaxed">
                    (Bitonte et al. 2014): Reconocimiento reflexivo de los tipos y géneros que se producen, circulan y consumen en una comunidad discursiva. Elementos: <strong>auditorio, propósito, organización, vocabulario (registro) y estrategias</strong>.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-300">3.5 ETHOS ACADÉMICO</h4>
                  <p className="mt-1 leading-relaxed">
                    (Maingueneau / Aristóteles): Imagen que el autor construye discursivamente para mostrarse como escritor académico garante y fidedigno, ofreciendo garantías al lector para ser validado.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-300">3.6 COMUNIDAD DISCURSIVA · 3.7 COMUNIDAD ACADÉMICA Y CIENTÍFICA</h4>
                  <p className="mt-1 leading-relaxed">
                    • <strong>Comunidad discursiva:</strong> Grupo que comparte una lengua, normas y eventos comunicativos.
                    <br />• <strong>Comunidad académica:</strong> Práctica pedagógica colaborativa con estudiantes en el centro y docentes acompañantes (manuales, clases, parciales). Dimensión cognitiva + <em>didáctica</em>.
                    <br />• <strong>Comunidad científica:</strong> Producción entre pares investigadores con máximo grado de especialización (artículos de investigación, tesis doctorales).
                  </p>
                </div>
              </div>
            </div>

            {/* MÓDULO 4 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-rose-400">
                  4. GÉNEROS DISCURSIVOS Y SECUENCIAS TEXTUALES
                </h3>
                <span className="text-xs bg-red-950 text-rose-300 px-2.5 py-1 rounded border border-red-800 font-bold">
                  🔴 Prioridad Máxima (pp. 42-55)
                </span>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                <div>
                  <h4 className="font-bold text-cyan-300">4.1 GÉNEROS DISCURSIVOS (Bajtín)</h4>
                  <p className="mt-1 leading-relaxed">
                    Enunciados concretos y singulares pertenecientes a una esfera de la praxis humana. Reconocidos por:
                    <br />• <em>Rasgos externos:</em> Naturaleza del emisor, fuente de publicación y destinatario.
                    <br />• <em>Rasgos internos:</em> Tema, estilo verbal (registro y enunciación) y secuencia o estructura compositiva.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-cyan-300">4.2 SECUENCIAS TEXTUALES (J. M. Adam, 1992)</h4>
                  <p className="mt-1 leading-relaxed">
                    Unidades menores que componen un texto heterogéneo. La <strong>secuencia dominante o englobante</strong> determina la intención y subordina a las secuencias dominadas.
                    <br />• <strong>4.2.1 Descriptiva:</strong> Nombrar, localizar-situar y calificar (ej: definiciones).
                    <br />• <strong>4.2.2 Narrativa:</strong> Acontecimientos en el tiempo (Iniciación, Complicación, Resolución; pretéritos y conectores temporales).
                    <br />• <strong>4.2.3 Dialogal:</strong> Interacción discursiva basada en cooperación y turnos de habla pregunta-respuesta.
                    <br />• <strong>4.2.4 Instruccional:</strong> Pasos o directivas obligatorias para ejecutar una tarea.
                    <br />• <strong>4.2.5 Explicativa:</strong> Brinda saber para comprender fenómenos. Fases: Presentación del tema $\rightarrow$ Pregunta o problema $\rightarrow$ Respuesta o solución $\rightarrow$ Cierre o conclusión. Borra marcas subjetivas.
                    <br />• <strong>4.2.6 Argumentativa:</strong> Convence o persuade razonadamente confrontando opiniones. Fases: Punto de partida (tesis adversa) $\rightarrow$ Hipótesis $\rightarrow$ Argumentos (demostración) $\rightarrow$ Cierre.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-cyan-300">4.4 LA EXPOSICIÓN: EXPLICAR / ARGUMENTAR (CONTINUUM)</h4>
                  <p className="mt-1 leading-relaxed">
                    Forman un continuum expositivo porque ante problemas complejos hay múltiples respuestas que deben justificarse.
                    <br />• <em>Polo explicativo:</em> Saber ya legitimado socialmente; borramiento de huellas (efecto de objetividad); cita textual directa intacta; dimensión cognitiva + <strong>didáctica</strong>.
                    <br />• <em>Polo argumentativo:</em> Construcción discursiva de conceptos; enunciador toma postura explícita; cita indirecta y refutación; dimensión cognitiva + <strong>emocional</strong>.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-cyan-300">4.4.3 ESTRATEGIAS DISCURSIVAS</h4>
                  <p className="mt-1 leading-relaxed">
                    Enunciado general, Reformulación ("es decir"), Definición, Ejemplificación, Descripción, Comparación, Analogía (A es a B como 1 es a 2), Narración/caso, Ilustración, Cita, Explicación causal (con conectores o verbos de influencia: *provocar, causar, generar*), Concesión ("si bien...") y Desmentida.
                    <br /><strong className="text-rose-400">⚠️ ALERTA:</strong> Metáforas, sarcasmos y preguntas retóricas NO son argumentos a menos que prueben la hipótesis.
                  </p>
                </div>
              </div>
            </div>

            {/* MÓDULO 6 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-sky-400">
                  6. LECTURA · Tipos, Pasos y Postura Universitaria
                </h3>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">pp. 56-61</span>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                <div>
                  <h4 className="font-bold text-sky-300">6.1 LA LECTURA COMO PROCESO DE INFERENCIAS</h4>
                  <p className="mt-1 leading-relaxed">
                    Cassany (2006) describe 3 modos de leer:
                    <br />1. <em>Leer las líneas:</em> Decodificación lineal de lo explícito.
                    <br />2. <em>Leer entre líneas:</em> Inferir implícitos, presuposiciones y lo no dicho.
                    <br />3. <em>Leer tras las líneas:</em> Lectura crítica (quién habla, a quién, cuándo, dónde y qué intencionalidad o ideología encubre).
                    <br />• <strong>4 Pasos del proceso:</strong> 1. Prelectura de paratextos (hipótesis de lectura) $\rightarrow$ 2. Lectura global $\rightarrow$ 3. Lectura analítica por párrafos (subrayado/notas) $\rightarrow$ 4. Poslectura integradora (resumen).
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-sky-300">6.1.1 RECOMENDACIÓN MUY IMPORTANTE</h4>
                  <p className="mt-1 leading-relaxed">
                    *"Lectura respetuosa pero rebelde"*: Perder el temor a contradecir los textos universitarios. El lector actúa como un *pirquinero* que busca: 1) Pregunta de investigación, 2) Hipótesis del autor y 3) Argumentos que la sostienen.
                  </p>
                </div>
              </div>
            </div>

            {/* MÓDULO 7 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-sky-400">
                  7. ESCRITURA · Función Epistémica y Proceso de Composición
                </h3>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">pp. 61-66</span>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                <div>
                  <h4 className="font-bold text-emerald-300">7.1 LA ESCRITURA COMO FUNCIÓN EPISTÉMICA</h4>
                  <p className="mt-1 leading-relaxed">
                    Escribir no es una simple transcripción de lo ya sabido ni obra de musas inspiradoras: es una herramienta de <strong>elaboración cognitiva y transformación del conocimiento</strong> (Bereiter & Scardamalia). Produce una doble objetivación: objetiva el pensamiento y se convierte en objeto para el pensamiento.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-emerald-300">7.2 EL PROCESO DE LA ESCRITURA (Fases Recursivas)</h4>
                  <p className="mt-1 leading-relaxed">
                    • <strong>7.2.1 Planificación:</strong> Interrogación sobre finalidad, destinatario, género y registro; consulta bibliográfica y confección de esquemas/mapas conceptuales.<br />
                    • <strong>7.2.2 Puesta en texto:</strong> Redacción de ideas y párrafos asegurando coherencia y cohesión sin frenarse en la corrección microscópica.<br />
                    • <strong>7.2.3 Revisión:</strong> Momento reflexivo e introspectivo para evaluar orden, suprimir redundancias y corregir sintaxis, concordancia, puntuación y ortografía.<br />
                    • <strong>Reescritura:</strong> Versión final terminada.
                  </p>
                </div>
              </div>
            </div>

            {/* MÓDULO 8 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-rose-400">
                  8. ENUNCIACIÓN Y POLIFONÍA
                </h3>
                <span className="text-xs bg-red-950 text-rose-300 px-2.5 py-1 rounded border border-red-800 font-bold">
                  🔴 Prioridad Máxima (pp. 67-76)
                </span>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                <div>
                  <h4 className="font-bold text-cyan-300">8.1 ENUNCIACIÓN</h4>
                  <p className="mt-1 leading-relaxed">
                    Enunciación = el acto de producir un enunciado. Enunciado = el producto material lingüístico resultante (lo dicho).
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-cyan-300">8.1.1 ENUNCIADOS MARCADOS Y NO MARCADOS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-xs">
                    <div className="bg-slate-950 p-3 rounded border border-rose-900/40">
                      <strong className="text-rose-400 block text-sm">Enunciados Marcados</strong>
                      • <strong>Deícticos:</strong> persona (*yo, tú, nosotros*), tiempo (*hoy, ayer, ahora*) y espacio (*aquí, allí*).<br />
                      • <strong>Subjetivemas:</strong> términos axiológicos con valoración afectiva/moral (*lamentable, morbo, ninguneó*).<br />
                      • <strong>Modalizadores:</strong> manifiestan actitud ante la certeza o duda (*quizás, indudablemente, podría, es evidente que*).
                    </div>
                    <div className="bg-slate-950 p-3 rounded border border-emerald-900/40">
                      <strong className="text-emerald-400 block text-sm">Enunciados No Marcados (Científico-Académico)</strong>
                      • Ausencia de deícticos temporo-espaciales.<br />
                      • Despersonalización: 3ª persona y formas impersonales con *se* (*"se comprobó"*).<br />
                      • Supresión total de subjetivemas.<br />
                      • <strong>Nominalización:</strong> verbos transformados en sustantivos (*"se desplaza"* $\rightarrow$ *"el desplazamiento"*).<br />
                      • Lenguaje especializado y técnico.
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-cyan-300">8.3 POLIFONÍA ENUNCIATIVA · 8.3.1 A 8.3.4 DISCURSO REFERIDO Y COMILLAS</h4>
                  <p className="mt-1 leading-relaxed">
                    Polifonía = presencia de voces ajenas en el discurso.<br />
                    • <em>Discurso directo:</em> Cita textual entrecomillada manteniendo separación e integridad.<br />
                    • <em>Discurso indirecto:</em> Paráfrasis mediante verbos de decir (con preposición "de": *se dio cuenta de, habló de*; sin "de": *dijo que, explicó que*).<br />
                    • <strong>5 Usos oficiales de comillas:</strong> 1) Cita directa textual; 2) Distancia crítica con voz en desacuerdo; 3) Distancia con vocablo vulgar, irónico o extranjero (*"quilombo"*, *"show"*); 4) Introducir concepto nuevo; 5) Título de artículo o texto breve.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-cyan-300">8.4 MODOS DE REALIZAR LA REFERENCIA BIBLIOGRÁFICA</h4>
                  <p className="mt-1 leading-relaxed">
                    Obligatoria para evitar el plagio (falta ética y deshonestidad intelectual). Orden básico: Autor, Año, Título, Fuente. En examen manuscrito la cursiva se reemplaza con **subrayado**.
                  </p>
                </div>
              </div>
            </div>

            {/* MÓDULO 9 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-rose-400">
                  9. GÉNEROS ACADÉMICOS PRODUCIDOS POR ESTUDIANTES
                </h3>
                <span className="text-xs bg-red-950 text-rose-300 px-2.5 py-1 rounded border border-red-800 font-bold">
                  🔴 Prioridad Máxima (pp. 77-88)
                </span>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                <div>
                  <h4 className="font-bold text-amber-300">9.1 EL APUNTE Y MÉTODO CORNELL</h4>
                  <p className="mt-1 leading-relaxed">
                    Texto para uno mismo con economía de recursos y marcas icónico-indiciales.<br />
                    • <strong>Método Cornell (Walter Pauk):</strong> Hoja dividida en 4 zonas: Margen superior (título/fecha) + Espacio principal derecho 3/4 (notas) + Margen izquierdo 1/4 (preguntas clave y dudas) + Margen inferior (resumen).
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-300">9.3 EL RESUMEN · 9.3.1 HERRAMIENTAS Y MACRORREGLAS DE VAN DIJK</h4>
                  <p className="mt-1 leading-relaxed">
                    Texto autónomo producido por el estudiante; reformulación fiel sin copiar frases sueltas. Aplica 4 macrorreglas:
                    <br />1. <strong>Selección:</strong> Elegir proposiciones indispensables.
                    <br />2. <strong>Omisión:</strong> Suprimir información no esencial, detalles y redundancias.
                    <br />3. <strong>Generalización:</strong> Reemplazar conceptos específicos por un término englobante (hiperónimo).
                    <br />4. <strong>Integración / Construcción:</strong> Integrar varias proposiciones en una idea sintética nueva.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-300">9.5 EL PARCIAL · 9.5.1 ESTRUCTURA Y 9.5.2 OPERACIONES DE CONSIGNAS</h4>
                  <p className="mt-1 leading-relaxed">
                    Diálogo asimétrico docente-estudiante. Estructura de la respuesta: *Introducción $\rightarrow$ Desarrollo $\rightarrow$ Conclusión*.<br />
                    • <strong>DEFINIR (4 componentes obligatorios):</strong><br />
                    [1. Término a definir] + [2. Verbo de denominación] + [3. Clase más amplia] + [4. Rasgos de contenido específicos].<br />
                    • <strong>JUSTIFICAR:</strong> Autor + Fuente + Afirmación + Razones ordenadas con conectores lógicos (*en primer lugar, por un lado, en segundo término*).<br />
                    • <strong>COMPARAR:</strong> Exige obligatoriamente definir ambos conceptos antes de contrastar semejanzas y diferencias.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 3: ACTIVIDADES RESUELTAS COMPLETAS ======================= */}
        {activeTab === 'actividades' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-800/40 p-5 rounded-2xl shadow-lg">
              <h2 className="text-xl font-black text-emerald-300 flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-emerald-400" />
                Resolución Canónica Completa de Todas las Actividades del Manual
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Todas las consignas resueltas paso a paso según los criterios de corrección exactos de la cátedra de la UNLaM.
              </p>
            </div>

            {/* ACTIVIDAD 1.7 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-cyan-300 border-b border-slate-800 pb-2">
                1.7 Actividades de Lectura y Escritura (Texto de Mariano Magnífico, pp. 20-24)
              </h3>
              <div className="text-xs sm:text-sm text-slate-300 space-y-2">
                <p><strong>• ¿Por qué el texto leído está en este módulo del manual?</strong></p>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-300">
                  Porque funciona como una introducción didáctica a la cultura académica. Ilustra la ruptura entre el lenguaje informal/coloquial previo de la escuela o la vida cotidiana y las reglas obligatorias del discurso universitario (tema, estilo y estructura según Bajtín), concientizando al estudiante sobre el inicio de su alfabetización académica.
                </div>
                <p><strong>• ¿A quién va dirigido este texto? Listado de justificaciones:</strong></p>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-300">
                  Va dirigido a los estudiantes ingresantes a la universidad. Marcas textuales del texto que lo demuestran: *"Si está leyendo estas palabras... ha entrado en contacto con un mundo antes desconocido"*, *"Está en la universidad"*, *"Un estudiante podría recibir un mensaje"*, *"dar los pasos de Bambi hasta remontar en un galope"*, *"dinámicas institucionales 'meter' o 'bochar'"*.
                </div>
                <p><strong>• ¿Por qué el autor recurre a lo que expresan otros autores?</strong></p>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-300">
                  Para construir su <strong>ethos académico</strong> y dotar a su texto de autoridad y rigor epistémico. Al citar a teóricos reconocidos como Mijaíl Bajtín (noción de género y esferas de la praxis), Daniel Link, Paula Carlino y Michel Foucault, demuestra que sus afirmaciones no son opiniones individuales subjetivas (*"para mí"*), sino saberes validados por la comunidad académica.
                </div>
              </div>
            </div>

            {/* ACTIVIDAD 2.2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-cyan-300 border-b border-slate-800 pb-2">
                2.2 Actividades de Lectura y Escritura (Módulo 2, pp. 28-31)
              </h3>
              <div className="text-xs sm:text-sm text-slate-300 space-y-4">
                <div>
                  <p className="font-bold text-amber-300">1. Párrafo coherente y cohesivo con las oraciones de Paulo Freire:</p>
                  <div className="bg-slate-950 p-3.5 rounded border border-slate-800 text-emerald-300 mt-1 leading-relaxed">
                    "La lectura es un proceso activo de comunicación entre el texto y el lector, dado que aquel no explicita todo su contenido [referencia]. Por esta razón [conector de causa-efecto], el estudiante universitario debe asumir el acto de estudiar como un trabajo desafiante y riguroso. Este acto requiere [referencia] una postura crítica y sistemática, es decir [reformulación], una disciplina intelectual que se adquiere practicándola. En este sentido, estudiar implica comprender el texto mediante una metodología adecuada que parte de una visión global inicial; posteriormente [conector temporal], exige delimitar los núcleos centrales y el conjunto temático [colocación]. Asimismo [adición], [$\emptyset$ elipsis de sujeto] requiere buscar en cada párrafo el nexo con el objeto de estudio y relacionarlo con los precedentes y subsiguientes. En definitiva [conclusión], estudiar constituye una actitud reflexiva frente al mundo que exige humildad y rigor intelectual."
                  </div>
                </div>

                <div>
                  <p className="font-bold text-amber-300">2. Ordenamiento de conectores en "El queso y los gusanos" de Carlo Ginzburg:</p>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                    <p>• Donde decía <em>INCLUSO</em> $\rightarrow$ Corresponde: <strong>AUNQUE</strong> (*"...el primer obstáculo, aunque no el único..."*).</p>
                    <p>• Donde decía <em>AUNQUE</em> $\rightarrow$ Corresponde: <strong>PERO</strong> (*"Pero es una regla con excepciones..."*).</p>
                    <p>• Donde decía <em>PERO</em> $\rightarrow$ Corresponde: <strong>NO OBSTANTE</strong> (*"No obstante disponemos de páginas autógrafas..."*).</p>
                    <p>• Donde decía <em>NO OBSTANTE</em> $\rightarrow$ Corresponde: <strong>INCLUSO</strong> (*"...Cierto que nos gustaría saber otras cosas; incluso con los datos disponibles ya podemos..."*).</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-amber-300">3. Orden y Subtítulos de Cassany ("La cocina de la escritura"):</p>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1 text-slate-200">
                    <p>• <strong>1° Párrafo:</strong> *"Para comenzar, definiremos al párrafo como un conjunto de frases..."* $\rightarrow$ Subtítulo: <strong>Definición</strong> y <strong>Estructura interna</strong>.</p>
                    <p>• <strong>2° Párrafo:</strong> *"En los textos breves de dos páginas o menos, el párrafo es trascendental..."* $\rightarrow$ Subtítulo: <strong>Función externa</strong> y <strong>Tipología</strong>.</p>
                    <p>• <strong>3° Párrafo:</strong> *"Además, el contenido también determina la organización del párrafo..."* $\rightarrow$ Subtítulo: <strong>Estructura interna</strong> y <strong>Tipología</strong>.</p>
                    <p>• <strong>4° Párrafo:</strong> *"En general, el aspecto visual parece imponerse a las necesidades internas..."* $\rightarrow$ Subtítulo: <strong>Extensión</strong> y <strong>Recomendación</strong>.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIVIDAD 2.4 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-cyan-300 border-b border-slate-800 pb-2">
                2.4 Actividades sobre Paratextos y "La velocidad del cambio" (pp. 32-36)
              </h3>
              <div className="text-xs sm:text-sm text-slate-300 space-y-2">
                <p><strong>1. Paratextos del manual y bibliografía:</strong></p>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-300">
                  • Paratextos del manual: Portada/tapa, membrete de autoridades, prólogo del Rector, índice general paginado, subtítulos jerárquicos, cuadros, códigos QR y bibliografía.<br />
                  • Entrada bibliográfica: Se dispone alfabéticamente por apellido del autor para facilitar su localización unívoca y reconocer la autoridad teórica citada.
                </div>
                <p><strong>2. Paratextos de "La velocidad del cambio" (Schwarz):</strong></p>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-300">
                  • ¿Dónde se publicó?: En el suplemento/portal digital *Ciencia y Salud* (22 de abril de 2006).<br />
                  • Destinatario: Público general interesado en temas científicos (registro masivo/divulgación).<br />
                  • Función del título y subtítulo "Fenómeno social": El título sintetiza el tema (la aceleración histórica del progreso científico). El subtítulo introduce el subnúcleo que analiza el impacto del método científico sobre las costumbres sociales e institucionales.
                </div>
              </div>
            </div>

            {/* ACTIVIDAD 4.3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-cyan-300 border-b border-slate-800 pb-2">
                4.3 Actividades sobre Secuencias Textuales (Fragmentos a y b, pp. 47-50)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2">
                  <strong className="text-sky-300 block text-base">Fragmento a (Adam, 1992):</strong>
                  <p>1. <strong>Finalidad:</strong> Opción <strong>b)</strong> Informar y brindar conocimientos de rigor científico.</p>
                  <p>2. <strong>Secuencia dominante:</strong> Opción <strong>b)</strong> Explicativa.</p>
                  <p>3. <strong>Características correctas:</strong> <strong>a)</strong> No se utiliza la 1° persona gramatical (borramiento de huellas); <strong>c)</strong> Se produce un efecto de objetividad; <strong>f)</strong> Se utiliza lenguaje especializado; <strong>g)</strong> Se utilizan citas que avalan las consideraciones (Brassart, Erlich, Bereiter); <strong>h)</strong> Se utilizan nominalizaciones.</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2">
                  <strong className="text-rose-300 block text-base">Fragmento b (Etchegaray, 2012):</strong>
                  <p>1. <strong>Finalidad:</strong> Opción <strong>a)</strong> Opinar y demostrar un punto de vista determinado.</p>
                  <p>2. <strong>Secuencia dominante:</strong> Opción <strong>a)</strong> Argumentativa.</p>
                  <p>3. <strong>Características correctas:</strong> <strong>b)</strong> Existe subjetividad; <strong>d)</strong> Se utiliza la 1° persona gramatical (*"Creemos que..."*); <strong>g)</strong> Se hallan presentes los comentarios valorativos del enunciador (*"lugares comunes y superficiales"*); <strong>i)</strong> Se utiliza lenguaje especializado.</p>
                </div>
              </div>
            </div>

            {/* ACTIVIDAD 4.5 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-cyan-300 border-b border-slate-800 pb-2">
                4.5 Actividades sobre el Texto de Arnoux et al. (pp. 53-56)
              </h3>
              <div className="text-xs sm:text-sm text-slate-300 space-y-2">
                <p><strong>1. ¿A cuál de los dos polos se acerca el texto leído? Justificación:</strong></p>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-300">
                  Se acerca al <strong>polo expositivo-explicativo</strong>. Justificación: expone un saber conceptual teórico ya legitimado en los estudios del discurso; borra las huellas subjetivas del enunciador produciendo efecto de objetividad; delimita con claridad las fronteras con las voces ajenas y posee una finalidad fundamentalmente pedagógica/didáctica dirigida a estudiantes universitarios.
                </div>
                <p><strong>2. Análisis de la figura del enunciador:</strong></p>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-300">
                  El enunciador se construye con un <strong>ethos de docente e investigadora especialista</strong>: toma distancia de opiniones individuales, organiza el saber con distinciones taxonómicas claras y utiliza una tercera persona neutra combinada con la primera persona del plural inclusivo de comunidad académica.
                </div>
                <p><strong>3. Definiciones de polo explicativo y polo argumentativo con los 4 componentes:</strong></p>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
                  <p>• <strong>Polo explicativo:</strong> Es [2] un tipo de discurso de la exposición [3] en el que se presenta un saber ya legitimado socialmente borrando las marcas subjetivas para informar y hacer comprender con finalidad didáctica [4].</p>
                  <p>• <strong>Polo argumentativo:</strong> Es [2] un tipo de discurso de la exposición [3] en el que el enunciador construye y defiende una postura personal confrontando opiniones ajenas para persuadir o convencer a los destinatarios con dimensiones cognitiva y emocional [4].</p>
                </div>
              </div>
            </div>

            {/* ACTIVIDAD 8.2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-cyan-300 border-b border-slate-800 pb-2">
                8.2 Actividades de Enunciación y Polifonía (Textos Climáticos a, b y c, pp. 70-73)
              </h3>
              <div className="text-xs sm:text-sm text-slate-300 space-y-2">
                <p><strong>1. Clasificación en marcados / no marcados:</strong></p>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                  <p>• <strong>Texto a:</strong> <em>No marcado</em> (teórico, tercera persona, sin deícticos circunstanciales, despersonalizado).</p>
                  <p>• <strong>Texto b:</strong> <em>Fuertemente marcado</em> (primera persona plural *"estuvimos en París"*, deícticos temporales *"pasado 23 de octubre"*, subjetivemas y juicios afectivos como *"sutil movilización"*, *"escalofriante apatía"*, *"inaceptable"*, *"hipocresía"*).</p>
                  <p>• <strong>Texto c:</strong> <em>No marcado</em> (artículo científico de investigación: tercera persona impersonal, 90% de confiabilidad en modelos matemáticos, datos porcentuales, citas precisas Rivera 1999, IPCC 2001).</p>
                </div>
                <p><strong>6. Cuadro comparativo sintético entre Textos b y c:</strong></p>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs">
                  • <em>Texto b:</em> Marcado | Secuencia dominante: Argumentativa | Ámbito: Periodístico de opinión | Tesis: La ineficacia e hipocresía de las cumbres frente a la desesperación juvenil.<br />
                  • <em>Texto c:</em> No marcado | Secuencia dominante: Explicativa | Ámbito: Científico-académico | Problema: ¿Se pueden prevenir los desastres derivados del aumento de GEI?
                </div>
              </div>
            </div>

            {/* ACTIVIDAD 9.6 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-cyan-300 border-b border-slate-800 pb-2">
                9.6 Actividades sobre el Parcial Presencial Escrito (Betiana Olivero, pp. 86-88)
              </h3>
              <div className="text-xs sm:text-sm text-slate-300 space-y-2">
                <p><strong>1. Definición canónica de "Parcial presencial escrito" con los 4 componentes:</strong></p>
                <div className="bg-slate-950 p-3.5 rounded border border-slate-800 text-emerald-300 leading-relaxed">
                  "El parcial presencial escrito [1. término] es [2. verbo de denominación] un género discursivo académico evaluativo [3. clase más amplia] caracterizado por constituir un diálogo asimétrico e individual entre docente y estudiante donde este último debe poner en texto y demostrar tanto el dominio de los contenidos disciplinares como la resolución precisa de operaciones cognitivo-discursivas pautadas por consignas instruccionales [4. rasgos específicos]."
                </div>
                <p><strong>2. ¿En qué consiste la crítica a los docentes disciplinares?</strong></p>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-300">
                  Consiste en que los profesores universitarios exigen y califican el parcial presencial dando por sentado que los alumnos ya saben cómo resolverlo, pero omiten enseñarlo explícitamente en el aula como un género con reglas propias. Fragmento probatorio: *"pocas veces dentro de las instituciones educativas se encara una reflexión sobre las exigencias de este género, pese a que tiene una presencia destacada ya que a través del examen escrito se comunican los estudiantes con los profesores para ser evaluados"*.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 4: FICHAS CONCEPTO ======================= */}
        {activeTab === 'fichas' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Fichas Concepto (Fórmula: Qué es → Cómo se reconoce → Ejemplo → No confundir)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  t: 'Coherencia',
                  q: 'Propiedad esencial que hace que el texto sea percibido como una unidad comunicativa articulada en torno a un tema central común.',
                  r: 'Preguntate: "¿De qué trata todo el texto?". Si podés sintetizarlo en una oración y ningún párrafo se descoloca, hay coherencia global.',
                  ej: 'En "La velocidad del cambio", cada párrafo desarrolla un aspecto de cómo la ciencia aceleró las transformaciones históricas.',
                  conf: 'Cohesión (la cohesión son los conectores y lazos entre oraciones; la coherencia es el sentido global).'
                },
                {
                  t: 'Cohesión',
                  q: 'Relación interoracional concreta mediante la cual las oraciones se conectan sintáctica y semánticamente entre sí.',
                  r: 'Detectá pronombres visibles, elipsis, conectores lógicos, repeticiones y palabras del mismo campo semántico.',
                  ej: '"El león es carnívoro. Este felino [sinonimia] caza presas vivas."',
                  conf: 'Coherencia (el sentido global) o simple corrección gramatical.'
                },
                {
                  t: 'Elipsis',
                  q: 'Mecanismo cohesivo de sustitución por cero (Ø): omisión deliberada de una palabra o frase ya explicitada.',
                  r: 'Buscá comas elípticas que reemplazan verbos o sujetos tácitos fácilmente recuperables por cotexto.',
                  ej: '"Pedro estudia abogacía; Lucas, [Ø estudia] medicina."',
                  conf: 'Referencia (la referencia usa un pronombre visible como "él" o "este"; la elipsis deja un vacío absoluto).'
                },
                {
                  t: 'Subjetivema',
                  q: 'Palabra (sustantivo, adjetivo, verbo o adverbio) que expresa un juicio apreciativo o afectivo del autor.',
                  r: 'Palabras con carga moral o emocional que delatan el gusto o disgusto del autor (lamentable, viciada, excelente, ningunear).',
                  ej: '"Emitió un fallo vergonzoso que perjudica a la sociedad."',
                  conf: 'Modalizador (el modalizador gradúa duda o certeza; el subjetivema juzga si algo es bueno, malo, bello o atroz).'
                },
                {
                  t: 'Modalizador',
                  q: 'Elemento que manifiesta la actitud del enunciador ante el grado de certeza, duda o necesidad de su enunciado.',
                  r: 'Adverbios (quizás, indudablemente), verbos condicionales (podría, debería) y frases como "es evidente que".',
                  ej: '"Indudablemente, la medida podría desencadenar consecuencias imprevistas."',
                  conf: 'Subjetivema (que expresa carga axiológica de valor).'
                },
                {
                  t: 'Polifonía Enunciativa',
                  q: 'Inclusión de voces ajenas dentro del discurso del propio enunciador.',
                  r: 'Comillas que encierran citas ajenas o verbos de decir (afirmó, explicó, según X).',
                  ej: 'Como sostiene Daniel Cassany, escribir es un proceso de construcción reglamentado.',
                  conf: 'Plagio (el plagio oculta la voz ajena; la polifonía la explicita para autorizar o refutar).'
                },
                {
                  t: 'Nominalización',
                  q: 'Transformación morfológica de verbos en sustantivos para despersonalizar y generar rigor científico.',
                  r: 'Sustantivos abstractos terminados en -ción, -miento, -ura derivados de acciones verbales.',
                  ej: '"El desplazamiento de la sustancia" en lugar de "cuando la sustancia se desplaza".',
                  conf: 'Estilo narrativo o verbos activos conjugados.'
                },
                {
                  t: 'Conciencia Retórica',
                  q: 'Reconocimiento de los géneros que se producen, circulan y consumen en una comunidad discursiva específica.',
                  r: 'Saber a quién se le escribe, para qué, con qué formato, qué léxico usar y qué estrategias desplegar.',
                  ej: 'Escribir un examen con registro especializado y formal sin usar modismos coloquiales de redes sociales.',
                  conf: 'Simple conocimiento de normas ortográficas.'
                },
                {
                  t: 'Macrorreglas de Van Dijk',
                  q: 'Las cuatro operaciones cognitivas para reducir un texto fuente a un resumen autónomo.',
                  r: '1) Selección, 2) Omisión, 3) Generalización, 4) Integración o Construcción.',
                  ej: 'Reemplazar "peras, manzanas y naranjas" por "frutas" (Generalización).',
                  conf: 'Copiar y pegar frases subrayadas al azar.'
                }
              ].map((f, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5 shadow">
                  <h3 className="font-bold text-base text-yellow-300 border-b border-slate-800 pb-2">{f.t}</h3>
                  <div className="text-xs space-y-1.5">
                    <p><strong className="text-sky-400 block">→ Qué es:</strong> <span className="text-slate-300">{f.q}</span></p>
                    <p><strong className="text-emerald-400 block">→ Cómo lo reconozco:</strong> <span className="text-slate-300">{f.r}</span></p>
                    <p className="bg-slate-950 p-2 rounded border border-slate-800"><strong className="text-cyan-300">Ejemplo:</strong> <span className="text-slate-200 italic">{f.ej}</span></p>
                    <p className="bg-rose-950/30 p-2 rounded border border-rose-900/40"><strong className="text-rose-400">⚠️ No confundir con:</strong> <span className="text-rose-200">{f.conf}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= TAB 5: TABLAS COMPARATIVAS ======================= */}
        {activeTab === 'tablas' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-x-auto shadow">
              <h3 className="text-lg font-bold text-cyan-300 mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-cyan-400" /> 1. Coherencia vs. Cohesión (Módulo 2)
              </h3>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-cyan-400">
                    <th className="p-3">Criterio</th>
                    <th className="p-3">COHERENCIA</th>
                    <th className="p-3">COHESIÓN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-3 font-bold text-slate-200">Nivel de acción</td>
                    <td className="p-3">Semántico global (macroestructura y tema central).</td>
                    <td className="p-3">Interoracional y gramatical (microestructura).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-200">Percepción</td>
                    <td className="p-3">El texto como un todo unitario comunicativo.</td>
                    <td className="p-3">Las oraciones conectadas mediante marcas concretas.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-200">Procedimientos</td>
                    <td className="p-3">Coherencia global, local, contexto situacional e histórico.</td>
                    <td className="p-3">Referencia, elipsis, reiteración léxica, colocación, conectores.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-x-auto shadow">
              <h3 className="text-lg font-bold text-rose-300 mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-rose-400" /> 2. Polo Expositivo-Explicativo vs. Polo Argumentativo (Página 50)
              </h3>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-rose-400">
                    <th className="p-3">Parámetro</th>
                    <th className="p-3">POLO EXPOSITIVO-EXPLICATIVO</th>
                    <th className="p-3">POLO ARGUMENTATIVO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-3 font-bold text-slate-200">Origen del saber</td>
                    <td className="p-3">Saber construido en otro lado, ya legitimado socialmente.</td>
                    <td className="p-3">Construcción de nuevos conceptos a partir del propio discurso.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-200">Sujeto enunciador</td>
                    <td className="p-3">Borra sus huellas subjetivas (efecto de objetividad).</td>
                    <td className="p-3">Se manifiesta explícitamente y confronta opiniones ajenas.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-200">Manejo de citas</td>
                    <td className="p-3">Fronteras nítidas; predomina cita textual directa entrecomillada.</td>
                    <td className="p-3">Fronteras porosas; predomina cita indirecta y refutación.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-200">Finalidad</td>
                    <td className="p-3">Informar y hacer saber / comprender.</td>
                    <td className="p-3">Persuadir, concientizar, influir o lograr adhesión.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-200">Dimensiones</td>
                    <td className="p-3">Cognoscitiva + <strong>Didáctica</strong>.</td>
                    <td className="p-3">Cognoscitiva + <strong>Emocional</strong>.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-x-auto shadow">
              <h3 className="text-lg font-bold text-amber-300 mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" /> 3. Enunciación Marcada vs. No Marcada (Páginas 68-70)
              </h3>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-amber-400">
                    <th className="p-3">Elemento</th>
                    <th className="p-3">ENUNCIACIÓN MARCADA</th>
                    <th className="p-3">ENUNCIACIÓN NO MARCADA (CIENTÍFICA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-3 font-bold text-slate-200">Deícticos</td>
                    <td className="p-3">Presentes (*yo, nosotros, hoy, aquí*).</td>
                    <td className="p-3">Ausentes (busca enunciados generales y atemporales).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-200">Persona gramatical</td>
                    <td className="p-3">1ª y 2ª persona singular/plural.</td>
                    <td className="p-3">3ª persona y formas impersonales con *se* (*"se dice"*).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-200">Valoración afectiva</td>
                    <td className="p-3">Subjetivemas y modalizadores abundantes.</td>
                    <td className="p-3">Suprimidos en su totalidad. Neutralidad descriptiva.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-200">Construcción léxica</td>
                    <td className="p-3">Verbos activos en forma personal.</td>
                    <td className="p-3"><strong>Nominalizaciones</strong> y léxico técnico disciplinar.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================= TAB 6: CHECKLIST DE HABILIDADES ======================= */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                Checklist de Dominio Operativo para el 25 de Octubre
              </h2>
              <p className="text-xs text-slate-400">
                Marcá los ítems a medida que puedas resolverlos sin dudar ante un texto nuevo:
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 divide-y divide-slate-800 text-xs sm:text-sm">
              {[
                'Reconstruir el Contexto de Situación completo de un texto (Emisor, Receptor, Mensaje, Espacio, Tiempo, Relación simétrica/asimétrica).',
                'Identificar paratextos verbales e icónicos y explicar qué hipótesis permiten anticipar antes de leer.',
                'Detectar y nombrar los 5 mecanismos de cohesión: Referencia pronominal, Elipsis (Ø), Reiteración léxica y Colocación.',
                'Clasificar conectores lógicos según su relación de significado (adición, contraste, causa-efecto, orden, reformulación).',
                'Diferenciar Polo Explicativo de Polo Argumentativo justificando con marcas textuales concretas.',
                'Redactar una DEFINICIÓN completa con sus 4 componentes canónicos (Término + Verbo + Clase más amplia + Rasgos específicos).',
                'Redactar una JUSTIFICACIÓN académica obligatoria (Autor + Fuente + Tesis + Razones ordenadas con conectores).',
                'Reconocer deícticos, subjetivemas y modalizadores en un texto marcado.',
                'Despersonalizar un fragmento utilizando formas impersonales con se y nominalizaciones.',
                'Distinguir Cita Directa de Cita Indirecta (identificando verbos de decir con o sin "de").',
                'Explicar los 5 usos posibles de las comillas según el manual oficial.',
                'Aplicar las 4 macrorreglas de Van Dijk para confeccionar un resumen autónomo.',
                'Explicar los 4 cuadrantes del Método Cornell para la toma de apuntes de clase.'
              ].map((item, index) => (
                <label key={index} className="flex items-start gap-3 py-3 cursor-pointer group">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer" />
                  <span className="text-slate-300 group-hover:text-white transition leading-relaxed">{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ======================= TAB 7: PLAN 15 DÍAS ======================= */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Plan Estratégico de Batalla (15 Días al Parcial)
              </h2>
              <p className="text-xs text-slate-400">
                Organización de estudio activo: Entender $\rightarrow$ Reconocer $\rightarrow$ Aplicar $\rightarrow$ Simular.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-bold border border-sky-800">
                  DÍAS 1 AL 5: PROPIEDADES DEL TEXTO
                </span>
                <p className="text-slate-300">
                  • <strong>Día 1-2:</strong> Módulo 2 completo. Coherencia global/local, contexto situacional (6 preguntas), los 5 mecanismos de cohesión y conectores. Resolver actividad 2.2.<br />
                  • <strong>Día 3:</strong> Paratextos verbales e icónicos (actividad 2.4) y estructura del párrafo de Cassany.<br />
                  • <strong>Día 4-5:</strong> Módulo 3. Texto vs Enunciado vs Discurso, Adecuación y los 3 Registros (formal, especializado, objetivo). Ethos académico.
                </p>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 font-bold border border-indigo-800">
                  DÍAS 6 AL 10: SECUENCIAS Y POLIFONÍA
                </span>
                <p className="text-slate-300">
                  • <strong>Día 6-7:</strong> Módulo 4. Las 6 secuencias y el Continuum de la exposición. Dominar el cuadro de la pág. 50. Resolver actividades 4.3 y 4.5.<br />
                  • <strong>Día 8:</strong> Módulos 6 y 7. Los 3 modos de leer de Cassany, lectura respetuosa pero rebelde, y fases recursivas de la escritura epistémica.<br />
                  • <strong>Día 9-10:</strong> Módulo 8. Enunciación marcada vs no marcada. Despersonalización, nominalizaciones, polifonía y los 5 usos de las comillas. Resolver actividad 8.2.
                </p>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                  DÍAS 11 AL 15: CONSIGNAS Y SIMULACRO
                </span>
                <p className="text-slate-300">
                  • <strong>Día 11:</strong> Módulo 9. Método Cornell, las 4 macrorreglas de Van Dijk para el resumen (resolver actividad 9.4).<br />
                  • <strong>Día 12:</strong> Ejercitar los verbos propositivos: redactar definiciones con los 4 componentes y justificaciones canónicas (actividad 9.6).<br />
                  • <strong>Día 13:</strong> Primer simulacro de parcial completo con reloj (90 minutos estrictos).<br />
                  • <strong>Día 14:</strong> Corrección quirúrgica de errores y repaso selectivo.<br />
                  • <strong>Día 15:</strong> Segundo simulacro liviano y descanso mental previo al examen.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 1: MAPA MENTAL ======================= */}
        {activeTab === 'mapa' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <h2 className="text-lg font-bold text-sky-400 flex items-center gap-2">
                <Layers className="w-5 h-5" /> Mapa Mental Jerarquizado UNLaM
              </h2>
              <p className="text-xs text-slate-400">
                Estructura de ramas principales con conceptos evaluables, mecanismos y advertencias.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: '1',
                  color: 'border-l-rose-500',
                  badge: '🔴 MÓDULO 2',
                  title: '1. El Texto y sus Propiedades',
                  items: [
                    'Texto: unidad semántico-discursiva en intercambios sociales.',
                    'Coherencia global (tema central) y local (subtemas).',
                    'Contexto situacional: quién, a quién, qué, dónde, cuándo, relación.',
                    'Cohesión: referencia, elipsis, reiteración (repetición/sinonimia/palabra general), colocación.',
                    'Conectores: adición, contraste, causa-efecto, orden, etc.',
                    'Paratextos verbales e icónicos (función orientadora).'
                  ]
                },
                {
                  id: '2',
                  color: 'border-l-amber-500',
                  badge: '🟠 MÓDULO 3',
                  title: '2. Enunciado, Texto y Discurso',
                  items: [
                    'Enunciado: unidad mínima inteligible.',
                    'Texto: entramado lingüístico reglado.',
                    'Discurso: texto en situación comunicativa social.',
                    'Adecuación: se adapta al contexto comunicativo.',
                    'Registros: subjetivo/objetivo, masivo/especializado, formal/informal.',
                    'Conciencia retórica y Ethos académico (autor como garante).'
                  ]
                },
                {
                  id: '3',
                  color: 'border-l-rose-500',
                  badge: '🔴 MÓDULO 4',
                  title: '3. Géneros y Secuencias',
                  items: [
                    'Géneros discursivos (Bajtín): esferas de la praxis humana.',
                    'Rasgos externos (producción/circulación) e internos (tema, estilo, secuencia).',
                    'Secuencias (Adam): explicativa, argumentativa, descriptiva, narrativa, dialogal, instruccional.',
                    'Polo Explicativo (saber legitimado, distancia objetiva).',
                    'Polo Argumentativo (nuevos conceptos, toma de postura, persuasión).'
                  ]
                },
                {
                  id: '4',
                  color: 'border-l-sky-500',
                  badge: '🟠 MÓDULO 6',
                  title: '4. Lectura Universitaria',
                  items: [
                    'Lectura como proceso de inferencias.',
                    'Cassany: leer las líneas, entre líneas y tras las líneas.',
                    'Fases: Prelectura → Global → Analítica por párrafos → Poslectura.',
                    'Postura del estudiante: respetuosa pero rebelde ante la autoridad bibliográfica.'
                  ]
                },
                {
                  id: '5',
                  color: 'border-l-emerald-500',
                  badge: '🟠 MÓDULO 7',
                  title: '5. Escritura Académica',
                  items: [
                    'Función epistémica: escribir para aprender y transformar saberes.',
                    'Doble objetivación: objeto del pensamiento y para el pensamiento.',
                    'Fases recursivas: Planificación → Puesta en texto → Revisión → Reescritura.'
                  ]
                },
                {
                  id: '6',
                  color: 'border-l-rose-500',
                  badge: '🔴 MÓDULO 8',
                  title: '6. Enunciación y Polifonía',
                  items: [
                    'Enunciación (acto) vs Enunciado (producto).',
                    'Enunciados marcados: deícticos, subjetivemas, modalizadores.',
                    'Enunciados no marcados: 3ª persona, impersonal con se, objetividad, nominalización.',
                    'Polifonía: voces ajenas en el discurso.',
                    'Cita directa (comillas) vs Cita indirecta (verbos de decir).'
                  ]
                },
                {
                  id: '7',
                  color: 'border-l-amber-500',
                  badge: '🔴 MÓDULO 9',
                  title: '7. Géneros de Estudiantes y Parcial',
                  items: [
                    'Apunte: economía léxica, icónico-indicial, Método Cornell en 4 zonas.',
                    'Resumen: texto autónomo, 4 macrorreglas de Van Dijk (selección, omisión, generalización, integración).',
                    'Parcial: diálogo asimétrico docente-estudiante.',
                    'Verbos propositivos: Definir (4 componentes obligatorios), Justificar, Comparar, Caracterizar.'
                  ]
                }
              ].map((branch) => (
                <div
                  key={branch.id}
                  className={`bg-slate-900 border border-slate-800 border-l-4 ${branch.color} rounded-xl p-4 shadow space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider">{branch.badge}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100">{branch.title}</h4>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                    {branch.items.map((it, idx) => (
                      <li key={idx} className="leading-relaxed">{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500">
        Material de entrenamiento pedagógico para el Seminario de Comprensión y Producción de Textos (UNLaM). Tutoría Interdimensional C-137.
      </footer>

      {/* ============================================================== */}
      {/* BOTÓN FLOTANTE Y VENTANA DE LA IA (FUENTE EXCLUSIVA: EL LIBRO) */}
      {/* ============================================================== */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-4 py-3 rounded-full shadow-2xl shadow-cyan-500/40 border-2 border-cyan-300/80 flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 group"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <span className="text-xs sm:text-sm tracking-wide">Preguntar al Libro (IA)</span>
          <span className="text-[10px] bg-cyan-950 text-cyan-200 px-1.5 py-0.5 rounded border border-cyan-700/50 hidden sm:inline-block">
            UNLaM pp. 15-88
          </span>
        </button>
      )}

      {chatOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[440px] h-[580px] max-h-[88vh] bg-slate-900/98 border-2 border-cyan-500/90 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-2xl">
          {/* Header del Chat */}
          <div className="bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border-b border-cyan-800/60 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white">Tutor IA · Manual UNLaM</h4>
                  <span className="text-[9px] bg-red-950 text-rose-300 px-1.5 py-0.2 rounded border border-red-800 font-bold uppercase">
                    Anti-Alucinaciones
                  </span>
                </div>
                <p className="text-[11px] text-cyan-400 font-medium">Fuente exclusiva: Módulos 1-9 (pp. 15-88)</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Cerrar ventana flotante"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sugerencias Rápidas */}
          <div className="bg-slate-950/80 px-3 py-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
            <span className="text-slate-400 font-semibold text-[10px]">Preguntas clave:</span>
            {[
              "¿4 componentes de Definición?",
              "¿Elipsis vs Referencia?",
              "¿Polo Explicativo vs Argumentativo?",
              "¿5 usos de Comillas?",
              "¿Subjetivema vs Modalizador?",
              "¿Macrorreglas de Van Dijk?"
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleAskAi(chip)}
                className="px-2 py-0.5 rounded-full bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-slate-700 hover:border-cyan-600 transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Lista de Mensajes */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs leading-relaxed">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[90%] whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-inner'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.source && (
                  <span className="text-[10px] text-cyan-400/80 mt-1 px-1">
                    📖 Fuente: {msg.source}
                  </span>
                )}
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-cyan-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span className="text-[11px] font-mono">Buscando en las páginas del manual...</span>
              </div>
            )}
          </div>

          {/* Formulario de Entrada */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAi();
            }}
            className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Preguntale al manual (ej: ¿Cómo se justifica una respuesta?)..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 rounded-xl transition"
              title="Enviar consulta"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
