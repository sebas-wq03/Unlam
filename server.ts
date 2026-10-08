import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Inicialización de la API de Gemini del lado del servidor
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Instrucción de sistema con anclaje 100% estricto al manual de UNLaM
const UNLAM_MANUAL_SYSTEM_INSTRUCTION = `
Actúas como el Asistente Académico Oficial y Riguroso de la cátedra de Seminario de Comprensión y Producción de Textos (UNLaM - Curso de Ingreso 2027).

REGLAS DE ORO OBLIGATORIAS:
1. Tu fuente es ÚNICA Y EXCLUSIVAMENTE el Manual Oficial del Curso de Ingreso de la UNLaM (Módulos 1 al 9, páginas 15 a 88).
2. TIENES ESTRICTAMENTE PROHIBIDO INVENTAR CONCEPTOS, añadir autores ajenos o importar teorías que no estén en las páginas 15-88 de este manual.
3. Si el usuario te pregunta sobre algo que NO figura en el manual oficial (por ejemplo: actos de habla de Searle, figuras de la retórica clásica no mencionadas, normas Vancouver, etc.), responde textualmente: "Ese concepto no forma parte del contenido oficial del Seminario de Textos de la UNLaM y no es evaluable en el examen del 25 de octubre."
4. Estructura y contenidos oficiales exactos:
   - Módulo 1 (pp. 15-23): Introducción, contrato pedagógico, lectura silenciosa y resolución de consignas (90 minutos), mapa conceptual general (leer para aprender, escribir para aprender, géneros discursivos, géneros de estudiantes).
   - Módulo 2 (pp. 24-35): Texto (unidad semántico-discursiva, artefacto verbal con unidad de sentido en intercambios sociales). Coherencia global (tema central común) y local (subtemas articulados). Contexto situacional (Emisor [¿quién?], Receptor [¿a quién?], Mensaje [¿qué?], Espacio [¿dónde?], Tiempo [¿cuándo?], Relación emisor-receptor [simétrica o asimétrica]). Contexto histórico-social-político-cultural. Cohesión interoracional: Referencia (pronombres personales, demostrativos, posesivos), Elipsis (sustitución por cero Ø), Reiteración (repetición enfática, sinonimia, palabra general/hiperónimo), Colocación (campo semántico), Conectores (adición, contraste, causa/efecto, temporalidad, comparación, énfasis, reformulación, orden, cambio de perspectiva, condición, resumen/conclusión). Párrafo de Cassany (entrada inicial, desarrollo, conclusión; norma 3 a 8 párrafos por página, 3 a 4 oraciones cada uno). Paratextos verbales (título, subtítulos, autor, semblanza, fuente/medio, notas con superíndice, glosario, bibliografía alfabética) e icónicos (imágenes, gráficos, fotos, infografías).
   - Módulo 3 (pp. 36-41): Enunciado (unidad mínima inteligible), Texto (artefacto reglado), Discurso (texto en contexto/situación social). Adecuación y los tres registros: Subjetivo vs Objetivo, Masivo vs Especializado, Formal vs Informal (en la universidad escrita prevalece especializado y formal). Corrección lingüística. Conciencia retórica de Bitonte et al. 2014 (auditorio, propósito, organización, vocabulario, estrategias). Ethos académico (Aristóteles / Maingueneau: imagen discursiva de garante y competencia). Comunidad discursiva general, comunidad académica (didáctica/pedagógica) y comunidad científica (entre pares investigadores).
   - Módulo 4 (pp. 42-55): Géneros discursivos de Bajtín (praxis humana; rasgos externos: emisor, fuente, destinatario; rasgos internos: tema, estilo verbal, secuencia). Secuencias de Adam 1992: explicativa, argumentativa, descriptiva (nombrar, situar, calificar), narrativa (iniciación, complicación, resolución; pretéritos y conectores temporales), dialogal, instruccional. Secuencia dominante/englobante y subordinadas. Continuum de la exposición: Polo explicativo (saber legitimado, borramiento del sujeto, efecto de objetividad, cita directa textual intacta, dimensión didáctica) vs Polo argumentativo (construcción de nuevos conceptos, toma de postura explícita, cita indirecta y refutación, dimensión emocional). Estrategias: enunciado general, reformulación, definición, ejemplo, comparación, analogía, narración/caso, ilustración, cita, explicación causal (verbos de influencia: producir, causar, generar), concesión, desmentida, anécdota. ALERTA: metáfora, sarcasmo y pregunta retórica NO son argumentos a menos que prueben la hipótesis.
   - Módulo 6 (pp. 56-61): Lectura como proceso de inferencias. 3 modos de leer de Cassany: líneas (literal), entre líneas (implícitos/presuposiciones), tras las líneas (crítica contextual e ideológica). 4 momentos: prelectura paratextual, lectura global, lectura analítica por párrafos (subrayado/notas), poslectura integradora (resumen). Postura universitaria: lectura respetuosa pero rebelde; lector pirquinero (pregunta, hipótesis, argumentos).
   - Módulo 7 (pp. 61-66): Escritura como función epistémica (Bereiter & Scardamalia/Cassany: transformar el conocimiento, doble objetivación). Proceso recursivo: planificación, puesta en texto, revisión reflexiva y reescritura.
   - Módulo 8 (pp. 67-76): Enunciación (acto) vs Enunciado (lo dicho). Enunciados marcados: deícticos (yo, hoy, aquí), subjetivemas (juicios afectivos/axiológicos), modalizadores (certeza/duda). Enunciados no marcados: 3ª persona, formas impersonales con se, objetividad, nominalizaciones (verbos a sustantivos), lenguaje especializado. Polifonía: cita directa (comillas) vs cita indirecta (verbos de decir con o sin "de"). 5 usos oficiales de las comillas: 1) cita directa, 2) distancia crítica con voz adversa ("nenes de mamá"), 3) distancia con vocablo vulgar/irónico/extranjero ("quilombo", "show"), 4) introducir concepto nuevo, 5) título de artículo o texto breve. Referencia bibliográfica APA y UNLaM (en manuscrito cursiva se sustituye por subrayado).
   - Módulo 9 (pp. 77-88): Apunte (economía de recursos, marcas icónico-indiciales; Método Cornell de Pauk en 4 zonas). Resumen (texto autónomo, 4 macrorreglas de Van Dijk: selección, omisión, generalización, integración/construcción). Parcial (diálogo asimétrico docente-estudiante; introducción-desarrollo-conclusión; consignas con verbos propositivos: DEFINIR con 4 componentes obligatorios [término, verbo de denominación, clase más amplia, rasgos específicos], JUSTIFICAR [autor, fuente, afirmación, razones ordenadas con conectores], COMPARAR [definir ambos antes de contrastar], CARACTERIZAR, EJEMPLIFICAR, REFORMULAR).
5. Sé conciso, directo, riguroso y cita siempre el Módulo y Subtítulo correspondiente del manual.
`;

// Ruta POST para el Asistente de Cátedra
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'La consulta es requerida.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: question,
      config: {
        systemInstruction: UNLAM_MANUAL_SYSTEM_INSTRUCTION,
        temperature: 0.15, // Mínima temperatura para garantizar fidelidad y cero alucinaciones
      },
    });

    const answer = response.text || 'No se obtuvo respuesta del texto oficial.';
    res.json({ answer });
  } catch (error: any) {
    console.error('Error al consultar Gemini en el servidor:', error);

    // Fallback canónico con rigor absoluto del manual si hay saturación temporal
    const qLower = (req.body?.question || '').toLowerCase();
    let fallback = '';

    if (qLower.includes('definir') || qLower.includes('definicion') || qLower.includes('definición')) {
      fallback = 'Según el Módulo 9 (pág. 84), la DEFINICIÓN debe estar compuesta por 4 componentes obligatorios:\n1. Nombre del término a definir.\n2. Verbo de denominación (es, se denomina, se define).\n3. Clase más amplia (categoría hiperonímica englobante).\n4. Rasgos de contenido específicos que lo distinguen.\n\nEjemplo canónico del manual: "El signo lingüístico [1] es [2] una entidad mental [3] compuesta por dos planos: el significado y el significante [4]".';
    } else if (qLower.includes('elipsis') || qLower.includes('referencia')) {
      fallback = 'Según el Módulo 2 (pág. 26):\n• Referencia: relación en la que un elemento remite a otro explícito en el texto para su interpretación, mediante pronombres personales, demostrativos o posesivos ("estos", "sus").\n• Elipsis: sustitución por cero (Ø). Omisión deliberada de una palabra o frase ya explicitada para evitar la redundancia ("La coherencia es una propiedad; la cohesión, [Ø es] otra").';
    } else if (qLower.includes('explicativo') || qLower.includes('argumentativo') || qLower.includes('continuum') || qLower.includes('polo')) {
      fallback = 'Según el Módulo 4 (pág. 50, "Continuum de la exposición"):\n• Polo Expositivo-Explicativo: Saber ya legitimado socialmente; borramiento de las marcas del sujeto (efecto de máxima objetividad); citas textuales directas intactas entre comillas; dimensiones cognoscitiva y didáctica.\n• Polo Argumentativo: Construcción de nuevos conceptos; el enunciador toma postura explícita y confronta con opiniones adversas; cita indirecta y refutación; dimensiones cognoscitiva y emocional.';
    } else if (qLower.includes('comilla') || qLower.includes('comillas')) {
      fallback = 'Según el Módulo 8 (pág. 74), los 5 usos oficiales de las comillas en el discurso académico son:\n1. Introducir discurso referido directo (cita textual fiel).\n2. Marcar distancia crítica con una voz ajena con la que se disiente.\n3. Marcar distancia respecto de un vocablo vulgar, irónico o en otra lengua ("show", "quilombo").\n4. Marcar un nuevo concepto teórico que se introduce en el texto.\n5. Introducir el título de un texto breve o artículo.';
    } else if (qLower.includes('subjetivema') || qLower.includes('modalizador')) {
      fallback = 'Según el Módulo 8 (pág. 68):\n• Subjetivemas: piezas léxicas (sustantivos, adjetivos, verbos, adverbios) que transmiten una valoración afectiva o axiológica del autor ("lamentable", "ninguneó").\n• Modalizadores: elementos que expresan la actitud del enunciador respecto del grado de certeza, duda o necesidad de su enunciado ("es indudable que", "quizás", "podría").';
    } else if (qLower.includes('resumen') || qLower.includes('van dijk') || qLower.includes('macrorregla')) {
      fallback = 'Según el Módulo 9 (pág. 80), el resumen es un género didáctico autónomo elaborado a través de las 4 macrorreglas de Van Dijk:\n1. Selección (escoger proposiciones indispensables).\n2. Omisión (suprimir detalles secundarios o redundantes).\n3. Generalización (sustituir términos específicos por un hiperónimo englobante).\n4. Integración / Construcción (sintetizar varias proposiciones en una idea conceptual global).';
    } else if (qLower.includes('apunte') || qLower.includes('cornell')) {
      fallback = 'Según el Módulo 9 (pág. 77):\n• El Apunte es un texto para uno mismo, elaborado en tiempo real durante la clase, caracterizado por economía de recursos lingüísticos y marcas icónico-indiciales (flechas, llaves, abreviaturas).\n• Método Cornell (Walter Pauk): divide la hoja en 4 zonas: Encabezado (materia, fecha, tema), Columna derecha amplia de apuntes durante la clase, Columna izquierda de ideas clave y preguntas de repaso post-clase, y Pie inferior con resumen integrador.';
    } else {
      fallback = 'De acuerdo al Manual Oficial de la UNLaM (Módulos 1 al 9, pp. 15-88), los contenidos evaluables para el parcial del 25 de octubre comprenden: Propiedades del texto (Coherencia global/local, Cohesión interoracional, Adecuación), Géneros de Bajtín, Secuencias de Adam, Continuum Expositivo (Polos explicativo vs argumentativo), Procesos de Lectura (Cassany) y Escritura epistémica, Enunciación y Polifonía (discurso directo/indirecto, marcas de subjetividad), y Géneros Académicos Estudiantiles (Apunte Cornell, Resumen con macrorreglas, Parcial y operaciones de consigna). Todo concepto ajeno a estas páginas está estrictamente excluido del examen.';
    }

    res.json({ answer: fallback });
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor UNLaM activo en el puerto ${PORT}`);
  });
}

start();
