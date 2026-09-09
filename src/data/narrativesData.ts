import rawNarratives from './narratives.json';

export interface StoryChapter {
  id: number;
  title: string;
  subtitle?: string;
  text: string;
}

// Fallback chapters in case the JSON is ever modified with empty data or corrupted
const FALLBACK_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    title: 'CAPÍTULO I: O SILÊNCIO NA CRIPTA',
    subtitle: 'O pacto quebrado sob a tempestade',
    text: 'A meia-noite caiu pesada sobre as abóbadas góticas da abadia. O corpo repousa inerte sobre o mármore frio, cercado pelo eco sufocado de passos apressados e pelo odor acre de cera recém-apagada. Um juramento sagrado foi quebrado nas trevas, e as pesadas portas do claustro foram trancadas para que ninguém escape antes do veredito.',
  },
  {
    "id": 2,
    "title": "CAPÍTULO II: AS SOMBRAS DO CONDE",
    "subtitle": "A vigília na galeria superior",
    "text": "O vento fustiga as janelas ogivais enquanto os candelabros vacilam na penumbra do salão nobre. O Senhor da noite tudo observa através das visões do Oráculo. Cada marcador disposto sobre o veludo carmesim é uma cifra muda deixada para guiar os investigadores sem romper o silêncio fúnebre."
  },
  {
    "id": 3,
    "title": "CAPÍTULO III: A NOITE DA TRAIÇÃO",
    "subtitle": "O eco dos passos na penumbra",
    "text": "Os passos do traidor ecoaram suaves pelas lajes de pedra gélida da biblioteca antes que o grito abafado cortasse a calada da noite. Nenhuma testemunha ousou erguer a voz, pois o medo congelou os corações dos presentes. Apenas o Oráculo recolheu os vestígios etéreos deixados pelo ato fatal."
  },
  {
    "id": 4,
    "title": "CAPÍTULO IV: O CÓDICE E OS DOZE JURADOS",
    "subtitle": "Nenhum nobre deixa o recinto",
    "text": "Os doze membros da corte sentam-se ao redor da mesa ancestral, envoltos em olhares de mútua desconfiança. Entre eles, o culpado dissimula suas intenções com frieza impecável. O Códice da Morte foi aberto, e as tábuas de indícios aguardam a revelação de quem ousou macular o santuário."
  },
  {
    "id": 5,
    "title": "CAPÍTULO V: O JULGAMENTO DAS GEMAS",
    "subtitle": "A linguagem silenciosa da verdade",
    "text": "O Oráculo não profere palavras aos mortais; sua voz ecoa apenas na disposição precisa das gemas coloridas sobre as tábuas de julgamento. Uma única pedra sobre a tábua correta pode iluminar o caminho dos detetives, enquanto a areia negra da ampulheta dita a marcha inexorável do tempo."
  },
];

export const STORY_CHAPTERS: StoryChapter[] = Array.isArray(rawNarratives) && rawNarratives.length > 0
  ? (rawNarratives as StoryChapter[])
  : FALLBACK_CHAPTERS;

/**
 * Returns a random gothic crime narrative that sets the atmosphere
 * WITHOUT spoiling, naming, or hinting at any specific method or object card.
 */
export function getRandomAtmosphericNarrative(): string {
  if (STORY_CHAPTERS.length === 0) {
    return 'Nas sombras gélidas da biblioteca ancestral, a quietude da noite foi rompida pela descoberta do corpo inerte. As sombras da abadia guardam o enigma da traição, e as gemas do Oráculo são o único farol para que os detetives desvendem o crime antes do amanhecer.';
  }
  const picked = STORY_CHAPTERS[Math.floor(Math.random() * STORY_CHAPTERS.length)];
  return picked.text;
}
