import { RoomState, Player } from '../types/game';
import { ABILITIES, CHARACTERS, EVIDENCES, METHODS, OBJECTS } from '../data/gameData';

export interface TutorialStep {
  id: string;
  title: string;
  message: string;
  targetElementId?: string; // Para destacar um botão específico
  actionRequired?: string; // O que o jogador precisa fazer para avançar
  phase: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'intro',
    title: 'BEM-VINDO AO CÓDICE',
    message: 'Neste tutorial, você aprenderá as artes da investigação sombria. O Códice da Morte é um jogo de mentiras, pistas e rituais.',
    phase: 'LOBBY'
  },
  {
    id: 'lobby_roles',
    title: 'O SAGUÃO (LOBBY)',
    message: 'Aqui você organiza a partida. Como Host, você pode adicionar Bots IA ou convidar amigos. O Oráculo é quem guiará a investigação.',
    targetElementId: 'lobby-main-card',
    phase: 'LOBBY'
  },
  {
    id: 'start_game',
    title: 'INICIANDO A SESSÃO',
    message: 'Clique em INICIAR PARTIDA para selar os papéis e começar o mistério.',
    targetElementId: 'btn-start-game',
    actionRequired: 'start_game',
    phase: 'LOBBY'
  },
  {
    id: 'night_phase',
    title: 'A NOITE CAIU',
    message: 'Nesta fase, o Assassino escolhe o Método e o Objeto do crime. Como estamos no tutorial, o Rafael (IA) já selou o destino: Veneno e Cálice.',
    phase: 'NOITE'
  },
  {
    id: 'oracle_intro',
    title: 'O DESPERTAR DO ORÁCULO',
    message: 'O Oráculo deve marcar as pistas no Códice. Ele usa Selos de Cera coloridos para dar dicas aos Investigadores.',
    phase: 'ORACULO'
  },
  {
    id: 'oracle_colors',
    title: 'A LINGUAGEM DAS CORES',
    message: '🔴 VERMELHO: Indica o Método Fatal.\n🔵 AZUL: Indica o Objeto do Crime.\n🟡 DOURADO: Uma pista central.\n⚪ CINZA: Uma pista de incerteza.',
    phase: 'ORACULO'
  },
  {
    id: 'investigation_intro',
    title: 'A INVESTIGAÇÃO',
    message: 'Agora o tempo corre! Os investigadores devem debater e cruzar as dicas do Oráculo com as cartas nas mesas de cada jogador.',
    phase: 'INVESTIGACAO'
  },
  {
    id: 'skills_guide',
    title: 'HABILIDADES (CARTAS VERDES)',
    message: 'Cada investigador tem uma habilidade única por rodada. Use-as para ver cartas descartadas ou interrogar suspeitos.',
    targetElementId: 'btn-use-ability',
    phase: 'INVESTIGACAO'
  },
  {
    id: 'events_guide',
    title: 'EVENTOS (CARTAS LARANJAS)',
    message: 'Eventos aleatórios podem mudar o rumo da partida, como o "Apagão" que esconde uma pista temporariamente.',
    phase: 'INVESTIGACAO'
  },
  {
    id: 'notebook_guide',
    title: 'O CADERNO DE NOTAS',
    message: 'Este é seu segredo. Aqui você risca pistas descartadas e anota quem você acha que é o culpado.',
    targetElementId: 'btn-open-notebook',
    phase: 'INVESTIGACAO'
  },
  {
    id: 'narration_guide',
    title: 'A VOZ DO ALÉM (IA)',
    message: 'O Códice usa IA (Gemini) para narrar a história do crime de forma sombria e imersiva baseada nas cartas escolhidas.',
    phase: 'INVESTIGACAO'
  },
  {
    id: 'accusation_final',
    title: 'O JULGAMENTO FINAL',
    message: 'Quando tiver certeza, faça uma ACUSAÇÃO FORMAL. Você deve acertar o Jogador, o Método e o Objeto. Se errar, perde sua ficha!',
    targetElementId: 'btn-make-accusation',
    phase: 'INVESTIGACAO'
  }
];

export const createTutorialInitialState = (playerName: string): RoomState => {
  const host: Player = {
    id: 'p_tutorial_user',
    name: playerName,
    characterId: 'char_01',
    isHost: true,
    isReady: true,
    isAI: false,
    seatNumber: 0,
    methods: [],
    objects: [],
    ability: ABILITIES[0],
    abilityUsed: false,
    hasAccused: false,
    role: 'investigador'
  };

  const botAssassin: Player = {
    id: 'ai_assassin',
    name: 'Rafael (IA)',
    characterId: 'char_rafael',
    isHost: false,
    isReady: true,
    isAI: true,
    seatNumber: 1,
    methods: [METHODS[0], METHODS[1], METHODS[2], METHODS[3]],
    objects: [OBJECTS[0], OBJECTS[1], OBJECTS[2], OBJECTS[3]],
    ability: ABILITIES[1],
    abilityUsed: false,
    hasAccused: false,
    role: 'assassino'
  };

  return {
    code: 'TUTORIAL',
    hostId: host.id,
    phase: 'LOBBY',
    round: 1,
    maxRounds: 3,
    settings: {
      maxPlayers: 4,
      minPlayers: 4,
      maxRounds: 3,
      hasAccomplice: false,
      accompliceCount: 0,
      hasSaboteur: false,
      roundTimerSeconds: 600,
      discussionTimerSeconds: 300,
      allowEvents: true,
      allowAbilities: true,
      aiDifficulty: 'normal'
    },
    players: [host, botAssassin],
    evidencesOnTable: EVIDENCES.slice(0, 6).map(e => ({ ...e })),
    discardedEvidences: [],
    activeEvent: null,
    activeAbility: null,
    storyNarrative: 'Um silêncio sepulcral domina a biblioteca tutorial...',
    phaseTimerRemaining: 0,
    phaseTimerActive: false,
    logs: [],
    messages: []
  };
};
