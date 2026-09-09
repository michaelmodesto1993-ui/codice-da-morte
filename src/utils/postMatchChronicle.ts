import { RoomState } from '../types/game';
import { METHODS, OBJECTS, CHARACTERS } from '../data/gameData';

export interface ChronicleData {
  roomName: string;
  roomCode: string;
  winner: string;
  isVictory: boolean;
  totalRounds: number;
  durationFormatted: string;
  killerName: string;
  killerCharName: string;
  methodName: string;
  objectName: string;
  playersSummary: Array<{
    name: string;
    charName: string;
    role: string;
  }>;
}

export function generatePostMatchChronicleText(room: RoomState, myRole?: string): string {
  const solution = room.secretSolution;
  const killerPlayer = room.players.find((p) => p.id === solution?.killerPlayerId);
  const killerChar = CHARACTERS.find((c) => c.id === killerPlayer?.characterId);
  const method = METHODS.find((m) => m.id === solution?.methodId);
  const object = OBJECTS.find((o) => o.id === solution?.objectId);

  const isInvestigatorsVictory = room.winner === 'investigadores';
  const rounds = room.roundsPlayed || room.round || 1;

  // Format Duration
  let duration = '02:45';
  if (room.startedAt) {
    const end = room.endedAt || Date.now();
    const diffSec = Math.max(1, Math.round((end - room.startedAt) / 1000));
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    duration = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  const roleEmojiMap: Record<string, string> = {
    oraculo: '🔮 Oráculo',
    assassino: '🗡️ Assassino',
    cumplice: '🎭 Cúmplice',
    sabotador: '🧪 Sabotador',
    investigador: '🔍 Investigador',
  };

  const playersList = room.players
    .map((p) => {
      const c = CHARACTERS.find((ch) => ch.id === p.characterId);
      const roleStr = roleEmojiMap[p.role] || '🔍 Investigador';
      return `• *${p.name}* (${c?.name || 'Membro do Códice'}) ➔ ${roleStr}`;
    })
    .join('\n');

  const outcomeHeader = isInvestigatorsVictory
    ? '🏆 VITÓRIA DOS INVESTIGADORES!\nO mistério foi desvendado e a ordem foi restaurada.'
    : '💀 O ASSASSINO ESCAPOU ILESO!\nAs trevas engoliram o salão da abadia.';

  return `📜 *O CÓDICE DA MORTE — CRÔNICA DA SESSÃO* 📜

🏰 *Câmara:* ${room.roomName || 'Mansão Códice'} (Cód: \`${room.code}\`)
⏱️ *Tempo de Partida:* ${duration} | 🕯️ *Rodadas:* ${rounds}
${outcomeHeader}

═══════════════════════
🗡️ *A VERDADE DO CRIME:*
• *Assassino:* ${killerPlayer?.name || 'Desconhecido'} (${killerChar?.name || 'Sombra'})
• *Método:* ${method?.name || 'Desconhecido'}
• *Objeto:* ${object?.name || 'Desconhecido'}

👥 *PAPÉIS REVELADOS:*
${playersList}
═══════════════════════

🕯️ *Jogue você também no Códice da Morte:*
${typeof window !== 'undefined' ? window.location.origin : 'https://códicedamorte.app'}
`;
}
