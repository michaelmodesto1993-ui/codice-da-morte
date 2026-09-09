import { RoomState, Player } from '../types/game';
import { ABILITIES, CHARACTERS, EVIDENCES, METHODS, OBJECTS } from '../data/gameData';

export interface TutorialStep {
  id: string;
  title: string;
  message: string;
  targetElementId?: string;
  actionRequired?: 'click' | 'wait' | 'none';
  phase: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'intro',
    title: 'O CÓDICE DA MORTE',
    message: '“A verdade sempre deixa rastros.”\n\nNeste tutorial passo a passo, você aprenderá as regras e a interface da biblioteca ancestral.',
    phase: 'LOBBY'
  },
  {
    id: 'lobby_explanation',
    title: '🎭 PAPÉIS E REGRAS',
    message: 'Em cada partida, ocorre uma morte misteriosa. Um dos jogadores é o Assassino. Os demais tentam descobrir a verdade.',
    targetElementId: 'lobby-main-card',
    phase: 'LOBBY'
  },
  {
    id: 'oracle_role',
    title: '🔮 O ORÁCULO',
    message: 'O Oráculo conduz a investigação. Ele conhece a verdade, administra as Evidências, coloca os marcadores e controla as rodadas. Ele não participa das acusações.',
    phase: 'LOBBY'
  },
  {
    id: 'assassin_role',
    title: '🔪 O ASSASSINO',
    message: 'O Assassino recebe 4 cartas de Objetos e 4 de Métodos e escolhe secretamente 1 de cada para definir o crime.',
    phase: 'LOBBY'
  },
  {
    id: 'investigator_role',
    title: '🔎 OS INVESTIGADORES',
    message: 'Analisam a narrativa, as Evidências e as cartas dos outros jogadores para identificar o Assassino, o Objeto e o Método.',
    phase: 'LOBBY'
  },
  {
    id: 'start_click',
    title: 'INICIAR PARTIDA',
    message: 'Como Host, você controla o início do ritual. Clique no botão vermelho abaixo para começar.',
    targetElementId: 'btn-start-game',
    actionRequired: 'click',
    phase: 'LOBBY'
  },
  {
    id: 'night_explanation',
    title: '🃏 OBJETO + MÉTODO',
    message: 'A noite caiu. O Assassino escolheu a combinação fatal. Existem 3.840 combinações possíveis. No tutorial, o crime foi: Veneno + Cálice.',
    phase: 'NOITE'
  },
  {
    id: 'oracle_action',
    title: '🔍 MARCAÇÃO DE EVIDÊNCIAS',
    message: 'O Oráculo coloca 1 marcador em cada carta de Evidência para orientar a investigação sem entregar a resposta direta.',
    phase: 'ORACULO'
  },
  {
    id: 'color_meaning',
    title: '🔴 LINGUAGEM DAS CORES',
    message: 'Vermelho = Método Fatal\nAzul = Objeto do Crime\nDourado = Pista Central\nCinza = Incerteza',
    phase: 'ORACULO'
  },
  {
    id: 'investigation_ui',
    title: '🧠 COMO JOGAR',
    message: 'Consulte a Narrativa do Oráculo → Evidências → Suas cartas → Jogadores → Caderno de Anotações.',
    phase: 'INVESTIGACAO'
  },
  {
    id: 'notebook_tutorial',
    title: '📝 O CADERNO DE NOTAS',
    message: 'Individual e secreto. Registre suspeitos, risque pistas descartadas e salve suas hipóteses aqui.',
    targetElementId: 'btn-open-notebook',
    actionRequired: 'click',
    phase: 'INVESTIGACAO'
  },
  {
    id: 'skills_events',
    title: '✨ HABILIDADES E EVENTOS',
    message: 'Personagens possuem habilidades únicas (Cartas Verdes). Eventos (Cartas Laranjas) podem ser ativados pelo Oráculo para mudar o jogo.',
    targetElementId: 'btn-use-ability',
    phase: 'INVESTIGACAO'
  },
  {
    id: 'rounds_info',
    title: '⏱️ RODADAS',
    message: 'O anfitrião define a quantidade de rodadas e o tempo. O Oráculo controla o cronômetro in-game.',
    phase: 'INVESTIGACAO'
  },
  {
    id: 'accusation_tutorial',
    title: '⚖️ A ACUSAÇÃO',
    message: 'Quando tiver certeza, indique: Quem é o Assassino + Qual o Objeto + Qual o Método. Errar significa perder sua única chance!',
    targetElementId: 'btn-make-accusation',
    actionRequired: 'click',
    phase: 'INVESTIGACAO'
  },
  {
    id: 'victory_defeat',
    title: '🏆 FINAL DA PARTIDA',
    message: 'Revelar a verdade traz a VITÓRIA. Falhar em todas as acusações resulta em DERROTA e a impunidade do Assassino.',
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
    methods: [METHODS[0], METHODS[1]],
    objects: [OBJECTS[0], OBJECTS[1]],
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
    maxRounds: 5,
    settings: {
      maxPlayers: 4,
      minPlayers: 4,
      maxRounds: 5,
      hasAccomplice: false,
      accompliceCount: 0,
      hasSaboteur: false,
      roundTimerSeconds: 600,
      discussionTimerSeconds: 300,
      allowEvents: true,
      allowAbilities: true,
      aiDifficulty: 'normal',
      oracleSelectionMode: 'random'
    },
    players: [host, botAssassin],
    evidencesOnTable: EVIDENCES.slice(0, 6).map(e => ({ ...e })),
    discardedEvidences: [],
    activeEvent: null,
    activeAbility: null,
    storyNarrative: 'A biblioteca aguarda sua investigação...',
    phaseTimerRemaining: 0,
    phaseTimerActive: false,
    logs: [],
    messages: []
  };
};
