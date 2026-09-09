import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import os from 'os';
import util from 'util';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Types
import {
  RoomState, Player, RoomSettings, SecretSolution, GamePhase,
  RoleType, MarkerColor, CardEvidence, CardMethod, CardObject,
  CardEvent, CardAbility, ChatMessage, AccusationRecord, ActiveEvent, ActiveAbility, GameLog
} from './src/types/game';

// Data
import {
  METHODS, OBJECTS, EVIDENCES, EVENTS, ABILITIES, CHARACTERS,
  getRandomAtmosphericNarrative
} from './src/data/gameData';

import {
  createNewRoom,
  fillWithAIBots,
  populateLobbyInvestigators,
  startGameDistribution,
  handleNightChoice,
  handleOracleMark,
  finishOraclePhase,
  handleAccusation,
  handleAbilityUse,
  handleAdvanceRound,
  handleDrawRandomEvent,
  handleUpdateStoryNarrative,
  handleDrawNewEvidence,
  handleAddSpecificEvidence,
  handleDiscardEvidence,
  autoProcessBotOracleNextRound,
  autoMarkOracleAI,
  handleAnswerAnalystInquiry,
  sanitizeRoomForPlayer
} from './src/engine/gameLogic';

// Engine
import { generateDynamicCrimeNarrative } from './src/engine/crimeNarrativeEngine';

const PORT = process.env.PORT || 3000;
const app = express();
const execPromise = util.promisify(exec);

// Middlewares
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// Paths
const publicDir = path.join(process.cwd(), 'public');
const distPath = path.join(process.cwd(), 'dist');
const audioDir = path.join(publicDir, 'audio');
const voiceNotesDir = path.join(audioDir, 'voice_notes');
const charDir = path.join(publicDir, 'characters');
const cardsDir = path.join(publicDir, 'cards');
const framesDir = path.join(publicDir, 'frames');
const aliasMapPath = path.join(cardsDir, 'alias_map.json');

[audioDir, voiceNotesDir, charDir, cardsDir, framesDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

app.use('/audio', express.static(audioDir));
app.use('/characters', express.static(charDir));
app.use('/frames', express.static(framesDir));
app.use('/cards', express.static(cardsDir));

// --- INTELLIGENT CARD MAPPING ---
let cardAliasMap: Record<string, string> = {};
try { if (fs.existsSync(aliasMapPath)) cardAliasMap = JSON.parse(fs.readFileSync(aliasMapPath, 'utf8')); } catch {}

const extraCardDirs = ['metodos', 'objetos', 'eventos', 'habilidades', 'evidencias', 'papeis_secretos', 'marcadores', 'frames', 'personagens', 'characters'].map(d => path.join(publicDir, d));

const getCardSearchDirs = () => {
  const dirs = [cardsDir, publicDir];
  const distCardsDir = path.join(distPath, 'cards');
  if (fs.existsSync(distCardsDir)) dirs.push(distCardsDir);
  extraCardDirs.forEach(d => { if (fs.existsSync(d)) dirs.push(d); });
  return dirs;
};

const getCanonicalId = (fileName: string): string[] => {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext).trim();
  const clean = base.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-_\s.]+/g, '');
  const ids: string[] = [base, base.toUpperCase(), base.toLowerCase()];

  const mMatch = clean.match(/^(?:metodo|method|m)0*([1-9]|[1-5][0-9]|60)$/);
  if (mMatch) ids.push(`M${mMatch[1].padStart(2, '0')}`);

  const oMatch = clean.match(/^(?:objeto|object|obj|o)0*([1-9]|[1-5][0-9]|6[0-4])$/);
  if (oMatch) ids.push(`O${oMatch[1].padStart(2, '0')}`);

  const eMatch = clean.match(/^(?:evidencia|evidence|e)0*([1-9]|[1-5][0-9]|60)$/);
  if (eMatch && !clean.startsWith('ev0') && !clean.startsWith('evento')) ids.push(`E${eMatch[1].padStart(2, '0')}`);

  const evMatch = clean.match(/^(?:evento|event|ev)0*([1-9]|1[0-6])$/);
  if (evMatch) ids.push(`EV${evMatch[1].padStart(2, '0')}`);

  const hMatch = clean.match(/^(?:habilidade|ability|hab|h)0*([1-9]|1[0-2])$/);
  if (hMatch) ids.push(`H${hMatch[1].padStart(2, '0')}`);

  const pMatch = clean.match(/^(?:personagem|perso|char|suspeito|p)0*([1-9]|[1-3][0-9]|4[0-2])$/);
  if (pMatch) {
    const num = parseInt(pMatch[1], 10);
    ids.push(`personagem_${num.toString().padStart(2, '0')}`, `char_${(num - 1).toString().padStart(2, '0')}`);
  }

  const charNameMap: Record<string, string> = {
    rafael: 'personagem_01', lia: 'personagem_02', bruno: 'personagem_03', sofia: 'personagem_04',
    lucas: 'personagem_05', julia: 'personagem_06', igor: 'personagem_07', mariana: 'personagem_08',
    enzo: 'personagem_09', ana: 'personagem_10', pedro: 'personagem_11', clara: 'personagem_12',
    gabriel: 'personagem_13', beatriz: 'personagem_14', mateus: 'personagem_15', valentina: 'personagem_16',
    thiago: 'personagem_17', melissa: 'personagem_18', daniel: 'personagem_19', isabela: 'personagem_20',
    vinicius: 'personagem_21', laura: 'personagem_22', otavio: 'personagem_23', marcia: 'personagem_24',
    heitor: 'personagem_25', nicole: 'personagem_26', felipe: 'personagem_27', aline: 'personagem_28',
    diego: 'personagem_29', yasmim: 'personagem_30', sergio: 'personagem_31', paola: 'personagem_32',
    arthur: 'personagem_33', joao: 'personagem_34', tatiana: 'personagem_35', rodrigo: 'personagem_36',
    carolina: 'personagem_37', andre: 'personagem_38', renata: 'personagem_39', guilherme: 'personagem_40',
    vitoria: 'personagem_41', leonardo: 'personagem_42'
  };

  for (const [name, pId] of Object.entries(charNameMap)) {
    if (clean.includes(name)) {
      ids.push(pId, `char_${(parseInt(pId.split('_')[1]) - 1).toString().padStart(2, '0')}`);
    }
  }

  // 9. Markers / Seals - Map common naming variations to canonical IDs
  const markerColors = ['dourado', 'vermelho', 'azul', 'cinza', 'preto'];
  for (const color of markerColors) {
    if (clean.includes(color) && (clean.includes('seal') || clean.includes('marcador') || clean.includes('selo'))) {
      ids.push(`seal_${color}`, `marcador_${color}`, `selo_${color}`, `cera_${color}`, `wax_${color}`);
    }
  }

  return Array.from(new Set(ids));
};

const scanAllCardsRecursively = (baseDir: string, result: Record<string, string>) => {
  if (!fs.existsSync(baseDir)) return;
  const allFiles = fs.readdirSync(baseDir, { recursive: true }) as string[];
  for (const f of allFiles) {
    const ext = path.extname(f).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) {
      const canonicalIds = getCanonicalId(f);
      const parentDir = path.basename(path.dirname(path.join(baseDir, f))).toLowerCase();
      const numMatch = path.basename(f, ext).match(/\d+/);
      if (numMatch) {
        const num = numMatch[0].padStart(2, '0');
        if (parentDir === 'metodos') canonicalIds.push(`M${num}`);
        else if (parentDir === 'objetos') canonicalIds.push(`O${num}`);
        else if (parentDir === 'evidencias') canonicalIds.push(`E${num}`);
        else if (parentDir === 'eventos') canonicalIds.push(`EV${num}`);
        else if (parentDir === 'habilidades') canonicalIds.push(`H${num}`);
      }
      const stat = fs.statSync(path.join(baseDir, f));
      for (const id of Array.from(new Set(canonicalIds))) {
        result[id] = `/cards/${path.basename(f)}?v=${stat.mtimeMs}`;
      }
    }
  }
};

// --- CORE GAME LOGIC (Imported functions redefined here for Monolith completeness if requested) ---

function secureShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let pass = 0; pass < 3; pass++) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  return arr;
}

function createDefaultSettings(): RoomSettings {
  return {
    maxPlayers: 12, minPlayers: 4, maxRounds: 3, hasAccomplice: false, accompliceCount: 1,
    hasSaboteur: false, roundTimerSeconds: 300, discussionTimerSeconds: 180,
    allowEvents: true, allowAbilities: true, aiDifficulty: 'normal', botAccuracyPercent: 20,
    oracleSelectionMode: 'random'
  };
}

function createNewRoom(code: string, hostName: string, hostCharId?: string): RoomState {
  const char = CHARACTERS.find(c => c.id === hostCharId) || CHARACTERS[0];
  const host: Player = {
    id: `p_${Math.random().toString(36).substring(2, 9)}`, name: hostName || 'Investigador Líder',
    characterId: char.id, isHost: true, isReady: true, isAI: false, seatNumber: 0,
    methods: [], objects: [], ability: ABILITIES.find(a => a.id === char.defaultAbilityId) || ABILITIES[0],
    abilityUsed: false, hasAccused: false
  };
  return {
    code, hostId: host.id, phase: 'LOBBY', round: 1, maxRounds: 3, settings: createDefaultSettings(),
    players: [host], evidencesOnTable: EVIDENCES.slice(0, 4).map(e => ({ ...e })),
    discardedEvidences: [], activeEvent: null, activeAbility: null, storyNarrative: '',
    phaseTimerRemaining: 0, phaseTimerActive: false, logs: [], messages: []
  };
}

function populateLobbyInvestigators(room: RoomState, targetCount: number = 10): RoomState {
  const updated = { ...room, players: [...room.players] };
  const used = new Set(updated.players.map(p => p.characterId));
  const available = CHARACTERS.filter(c => !used.has(c.id));
  while (updated.players.length < targetCount && available.length > 0) {
    const next = available.shift()!;
    updated.players.push({
      id: `ai_${Math.random().toString(36).substring(2, 7)}`, name: `${next.name} (IA)`,
      characterId: next.id, isHost: false, isReady: true, isAI: true,
      aiDifficulty: updated.settings.aiDifficulty, seatNumber: updated.players.length,
      methods: [], objects: [], ability: ABILITIES.find(a => a.id === next.defaultAbilityId) || ABILITIES[0],
      abilityUsed: false, hasAccused: false
    });
  }
  return updated;
}

function startGameDistribution(room: RoomState): RoomState {
  const updated = { ...room, players: [...room.players] };
  const allIndices = updated.players.map((_, i) => i);
  let oracleIdx = -1;

  // 1. Determine Oracle
  if (updated.designatedOraclePlayerId) {
    oracleIdx = updated.players.findIndex(p => p.id === updated.designatedOraclePlayerId);
  } else if (updated.settings.oracleSelectionMode === 'host') {
    oracleIdx = updated.players.findIndex(p => p.id === updated.hostId);
  }

  if (oracleIdx === -1) {
    oracleIdx = Math.floor(Math.random() * updated.players.length);
  }

  // 2. Determine Killer
  const others = allIndices.filter(i => i !== oracleIdx);
  const killerIdx = others[Math.floor(Math.random() * others.length)];

  // 3. Assign Roles
  updated.players.forEach((p, i) => {
    if (i === oracleIdx) p.role = 'oraculo';
    else if (i === killerIdx) p.role = 'assassino';
    else p.role = 'investigador';

    if (p.role !== 'oraculo') {
      p.methods = secureShuffle(METHODS).slice(0, 4);
      p.objects = secureShuffle(OBJECTS).slice(0, 4);
      p.ability = secureShuffle(ABILITIES)[0];
    }
  });

  updated.secretSolution = { killerPlayerId: updated.players[killerIdx].id, methodId: '', objectId: '' };
  updated.phase = 'NOITE';
  return updated;
}

function handleNightChoice(room: RoomState, killerId: string, mid: string, oid: string): RoomState {
  const updated = { ...room };
  if (updated.secretSolution?.killerPlayerId !== killerId) throw new Error('Not the killer');
  updated.secretSolution.methodId = mid;
  updated.secretSolution.objectId = oid;
  updated.storyNarrative = generateDynamicCrimeNarrative(METHODS.find(m => m.id === mid)!, OBJECTS.find(o => o.id === oid)!);
  updated.phase = 'ORACULO';
  return updated;
}

function handleOracleMark(room: RoomState, eid: string, opt: number, col: MarkerColor, crd?: any): RoomState {
  const updated = { ...room, evidencesOnTable: room.evidencesOnTable.map(e => e.id === eid ? { ...e, markedOptionIndex: opt, markedColor: col, markerX: crd?.x, markerY: crd?.y } : e) };
  return updated;
}

function finishOraclePhase(room: RoomState): RoomState {
  const updated = { ...room };
  updated.phase = 'INVESTIGACAO';
  updated.phaseTimerRemaining = updated.settings.discussionTimerSeconds;
  updated.phaseTimerActive = true;
  return updated;
}

function handleAccusation(room: RoomState, aid: string, tid: string, mid: string, oid: string): RoomState {
  const updated = { ...room, players: [...room.players] };
  const acc = updated.players.find(p => p.id === aid);
  if (acc?.hasAccused) throw new Error('Used accusation');
  acc!.hasAccused = true;
  const correct = updated.secretSolution?.killerPlayerId === tid && updated.secretSolution?.methodId === mid && updated.secretSolution?.objectId === oid;
  if (correct) { updated.phase = 'REVELACAO'; updated.winner = 'investigadores'; }
  else if (updated.players.filter(p => p.role === 'investigador' && !p.hasAccused).length === 0) { updated.phase = 'REVELACAO'; updated.winner = 'assassino'; }
  return updated;
}

function handleAbilityUse(room: RoomState, pid: string, abid: string, pay?: any): RoomState {
  const updated = { ...room, players: [...room.players] };
  const p = updated.players.find(x => x.id === pid);
  if (p && !p.abilityUsed) {
    p.abilityUsed = true;
    updated.activeAbility = { ability: ABILITIES.find(a => a.id === abid)!, userId: pid, userName: p.name, activatedAt: new Date().toLocaleTimeString(), remainingSeconds: 60, extraPayload: pay };
  }
  return updated;
}

function handleAdvanceRound(room: RoomState): RoomState {
  const updated = { ...room };
  if (updated.round < updated.maxRounds) { updated.round++; updated.phase = 'ORACULO'; updated.players.forEach(p => p.abilityUsed = false); }
  else { updated.phase = 'REVELACAO'; updated.winner = 'assassino'; }
  return updated;
}

function sanitizeRoomForPlayer(room: RoomState, pid: string): RoomState {
  const me = room.players.find(p => p.id === pid);
  const isGameOver = room.phase === 'REVELACAO';
  const s = JSON.parse(JSON.stringify(room));
  if (!isGameOver && !['oraculo', 'assassino', 'cumplice'].includes(me?.role || '')) delete s.secretSolution;
  s.players.forEach((p: any) => { if (p.id !== pid && !isGameOver) {
    if (!(me?.role === 'assassino' && p.role === 'cumplice') && !(me?.role === 'oraculo' && ['assassino', 'cumplice'].includes(p.role))) delete p.role;
  }});
  return s;
}

// --- EXPRESS ENDPOINTS ---

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/rooms', (req, res) => res.json({ rooms: Array.from(rooms.values()).map(r => ({
  code: r.code,
  name: r.roomName || 'INVESTIGAÇÃO SOMBRIA',
  hostName: r.players.find(p => p.id === r.hostId)?.name || 'Anfitrião',
  playerCount: r.players.length,
  maxPlayers: r.settings?.maxPlayers || 10,
  isPrivate: !!r.isPrivate,
  gameMode: r.gameMode || 'CASUAL'
})) }));

// REST API to delete a room (admin or host request)
app.delete('/api/rooms/:code', (req, res) => {
  const { code } = req.params;
  if (rooms.has(code)) {
    rooms.delete(code);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Room not found' });
});

app.get('/api/cards/list', (req, res) => {
  const result: Record<string, string> = {};
  getCardSearchDirs().forEach(d => scanAllCardsRecursively(d, result));
  res.json({ success: true, cards: result });
});
app.post('/api/voice-notes/upload', async (req, res) => {
  const { audioBase64 } = req.body;
  const id = `vn_${Date.now()}`;
  const outPath = path.join(voiceNotesDir, `${id}.mp3`);
  await execPromise(`ffmpeg -y -i data:audio/webm;base64,${audioBase64.replace(/^data:[^;]+;base64,/, '')} -c:a libmp3lame -b:a 64k "${outPath}"`);
  res.json({ success: true, audioUrl: `/audio/voice_notes/${id}.mp3` });
});
app.post('/api/story', async (req, res) => {
  const m = METHODS.find(x => x.id === req.body.methodName) || METHODS[0];
  const o = OBJECTS.find(x => x.id === req.body.objectName) || OBJECTS[0];
  res.json({ story: generateDynamicCrimeNarrative(m, o) });
});

app.get('/cards/:fileName', (req, res) => {
  const name = req.params.fileName;
  const search = getCardSearchDirs();
  for (const d of search) {
    const files = fs.readdirSync(d, { recursive: true }) as string[];
    const found = files.find(f => path.basename(f).toLowerCase() === name.toLowerCase());
    if (found) return res.sendFile(path.join(d, found));
  }
  res.status(404).send('Not found');
});

// --- SOCKET.IO ---

const rooms = new Map<string, RoomState>();
const socketToPlayer = new Map<string, { roomCode: string; playerId: string }>();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

function broadcastRoom(code: string) {
  const r = rooms.get(code); if (!r) return;
  io.to(code).fetchSockets().then(sks => sks.forEach(s => {
    const m = socketToPlayer.get(s.id); if (m) s.emit('room_update', sanitizeRoomForPlayer(r, m.playerId));
  }));
}

io.on('connection', (socket) => {
  socket.on('join_room', ({ roomCode, playerName, characterId, isPrivate, password, includeBots, roomSettings, roomName, gameMode }) => {
    const code = roomCode?.toUpperCase() || 'UNKN';
    let room = rooms.get(code);
    let playerId = `p_${socket.id.substring(0, 6)}`;
    let finalName = (playerName || 'Investigador').trim();

    if (!room) {
      room = createNewRoom(code, finalName, characterId);
      if (roomSettings) room.settings = { ...room.settings, ...roomSettings };
      if (roomName) room.roomName = roomName;
      if (gameMode) room.gameMode = gameMode;
      if (isPrivate !== undefined) room.isPrivate = !!isPrivate;
      if (password) room.password = password;
      if (includeBots) room = populateLobbyInvestigators(room, room.settings.maxPlayers || 10);

      playerId = room.players[0].id;
      finalName = room.players[0].name;
      rooms.set(code, room);
    } else {
      // Logic for joining existing room
      if (room.phase === 'LOBBY') {
        // Handle password
        if (room.isPrivate && room.password && room.password !== password) {
          return socket.emit('error_message', 'Senha incorreta para esta câmara privada.');
        }

        // Replace first AI bot if room is "full" of defaults
        const aiBotIdx = room.players.findIndex(p => p.isAI);
        const nonAiCount = room.players.filter(p => !p.isAI).length;

        if (aiBotIdx !== -1 && nonAiCount >= (room.settings.maxPlayers || 10)) {
          return socket.emit('error_message', 'Esta câmara já está lotada.');
        }

        const char = CHARACTERS.find(c => c.id === characterId && !room!.players.some(p => p.characterId === c.id)) ||
                     CHARACTERS.find(c => !room!.players.some(p => p.characterId === c.id)) ||
                     CHARACTERS[0];

        const newPlayer: Player = {
          id: playerId, name: finalName, characterId: char.id, isHost: false,
          isReady: true, isAI: false, seatNumber: room.players.length,
          methods: [], objects: [], ability: ABILITIES[0], abilityUsed: false, hasAccused: false
        };
        room.players.push(newPlayer);
      } else {
        // Reconnect logic
        const existing = room.players.find(p => p.name === playerName && !p.isAI);
        if (existing) { playerId = existing.id; finalName = existing.name; }
      }
    }

    socket.join(code);
    socketToPlayer.set(socket.id, { roomCode: code, playerId });
    socket.emit('joined_success', { playerId, roomCode: code, assignedName: finalName });
    broadcastRoom(code);
  });

  socket.on('toggle_ready', () => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) {
      const p = r.players.find(x => x.id === m?.playerId);
      if (p) {
        p.isReady = !p.isReady;
        broadcastRoom(r.code);
      }
    }
  });

  socket.on('update_character', (d) => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    const p = r?.players.find(x => x.id === m?.playerId);
    if (p) { p.characterId = d.characterId; broadcastRoom(r!.code); }
  });

  socket.on('start_game', () => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r?.hostId === m?.playerId) { rooms.set(r.code, startGameDistribution(r)); broadcastRoom(r.code); }
  });

  socket.on('night_choice', (d) => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) {
      try {
        const updated = handleNightChoice(r, m!.playerId, d.methodId, d.objectId);
        rooms.set(r.code, updated);
        broadcastRoom(r.code);
      } catch (err: any) {
        socket.emit('error_message', err.message);
      }
    }
  });

  socket.on('suggest_night_choice', (d) => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) {
      const sender = r.players.find(p => p.id === m!.playerId);
      if (sender?.role === 'cumplice') {
        r.nightSuggestion = {
          methodId: d.methodId,
          objectId: d.objectId,
          suggestedByPlayerId: m!.playerId,
          suggestedByPlayerName: sender.name
        };
        broadcastRoom(r.code);
      }
    }
  });

  socket.on('answer_analyst_inquiry', (d) => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) {
      try {
        const updated = handleAnswerAnalystInquiry(r, d.selectedItem, m!.playerId);
        rooms.set(r.code, updated);
        broadcastRoom(r.code);
      } catch (err: any) {
        socket.emit('error_message', err.message);
      }
    }
  });

  socket.on('oracle_mark', (d) => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) { rooms.set(r.code, handleOracleMark(r, d.evidenceId, d.optionIndex, d.color, d.coords)); broadcastRoom(r.code); }
  });

  socket.on('finish_oracle', () => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) { rooms.set(r.code, finishOraclePhase(r)); broadcastRoom(r.code); }
  });

  socket.on('make_accusation', (d) => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) { rooms.set(r.code, handleAccusation(r, m!.playerId, d.targetPlayerId, d.methodId, d.objectId)); broadcastRoom(r.code); }
  });

  socket.on('send_message', (d) => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) {
      r.messages.push({ id: `msg_${Date.now()}`, senderId: m!.playerId, senderName: r.players.find(p => p.id === m!.playerId)?.name || '?', text: d.text, timestamp: new Date().toLocaleTimeString(), isWhisper: d.isWhisper });
      broadcastRoom(r.code);
    }
  });

  socket.on('leave_room', () => {
    const m = socketToPlayer.get(socket.id);
    if (!m) return;
    const r = rooms.get(m.roomCode);
    if (r) {
      r.players = r.players.filter(p => p.id !== m.playerId);
      if (r.players.length === 0) rooms.delete(m.roomCode);
      else broadcastRoom(m.roomCode);
    }
    socket.leave(m.roomCode);
    socketToPlayer.delete(socket.id);
  });

  socket.on('update_player_name', (d) => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    const p = r?.players.find(x => x.id === m?.playerId);
    if (p) { p.name = d.newName; broadcastRoom(r!.code); }
  });

  socket.on('add_bot', () => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r?.hostId === m?.playerId && r.players.length < (r.settings?.maxPlayers || 12)) {
      rooms.set(r.code, populateLobbyInvestigators(r, r.players.length + 1));
      broadcastRoom(r.code);
    }
  });

  socket.on('remove_bot', (d) => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r?.hostId === m?.playerId && r.phase === 'LOBBY') {
      const botToRemove = d?.botId
        ? r.players.find(p => p.id === d.botId && p.isAI)
        : [...r.players].reverse().find(p => p.isAI);

      if (botToRemove) {
        r.players = r.players.filter(p => p.id !== botToRemove.id);
        broadcastRoom(r.code);
      }
    }
  });

  socket.on('clear_bots', () => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r?.hostId === m?.playerId && r.phase === 'LOBBY') {
      r.players = r.players.filter(p => !p.isAI);
      broadcastRoom(r.code);
    }
  });

  socket.on('update_settings', (d) => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r?.hostId === m?.playerId) {
      r.settings = { ...r.settings, ...d.settings };
      if (d.settings?.designatedOraclePlayerId !== undefined) {
        r.designatedOraclePlayerId = d.settings.designatedOraclePlayerId;
      }
      broadcastRoom(r.code);
    }
  });

  socket.on('designate_oracle', (d) => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r?.hostId === m?.playerId && r.phase === 'LOBBY') {
      r.designatedOraclePlayerId = d.playerId || undefined;
      r.settings.oracleSelectionMode = d.playerId ? 'custom' : 'random';
      broadcastRoom(r.code);
    }
  });

  socket.on('use_ability', (d) => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) {
      try {
        const updated = handleAbilityUse(r, m!.playerId, d.abilityId, d.extraPayload);
        rooms.set(r.code, updated);
        broadcastRoom(r.code);
      } catch (err: any) {
        socket.emit('error_message', err.message);
      }
    }
  });

  socket.on('draw_event', () => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) {
      try {
        const updated = handleDrawRandomEvent(r);
        rooms.set(r.code, updated);
        broadcastRoom(r.code);
      } catch (err: any) {
        socket.emit('error_message', err.message);
      }
    }
  });

  socket.on('toggle_timer', () => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) {
      r.phaseTimerActive = !r.phaseTimerActive;
      broadcastRoom(r.code);
    }
  });

  socket.on('adjust_timer', (d) => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) {
      const delta = typeof d === 'number' ? d : d.deltaSeconds || 0;
      r.phaseTimerRemaining = Math.max(0, r.phaseTimerRemaining + delta);
      broadcastRoom(r.code);
    }
  });

  socket.on('draw_evidence', () => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) {
      try {
        const updated = handleDrawNewEvidence(r);
        rooms.set(r.code, updated);
        broadcastRoom(r.code);
      } catch (err: any) {
        socket.emit('error_message', err.message);
      }
    }
  });

  socket.on('add_evidence', (d) => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) {
      try {
        const updated = handleAddSpecificEvidence(r, d.evidenceId);
        rooms.set(r.code, updated);
        broadcastRoom(r.code);
      } catch (err: any) {
        socket.emit('error_message', err.message);
      }
    }
  });

  socket.on('discard_evidence', (d) => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) {
      try {
        const updated = handleDiscardEvidence(r, d.evidenceId);
        rooms.set(r.code, updated);
        broadcastRoom(r.code);
      } catch (err: any) {
        socket.emit('error_message', err.message);
      }
    }
  });

  socket.on('advance_round', () => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) {
      try {
        const updated = handleAdvanceRound(r);
        rooms.set(r.code, updated);
        broadcastRoom(r.code);
      } catch (err: any) {
        socket.emit('error_message', err.message);
      }
    }
  });

  socket.on('update_story', (d) => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r) {
      try {
        const text = d.text || d.narrative || '';
        const updated = handleUpdateStoryNarrative(r, m!.playerId, text);
        rooms.set(r.code, updated);
        broadcastRoom(r.code);
      } catch (err: any) {
        socket.emit('error_message', err.message);
      }
    }
  });

  socket.on('delete_room', () => {
    const m = socketToPlayer.get(socket.id);
    const r = rooms.get(m?.roomCode || '');
    if (r?.hostId === m?.playerId) {
      io.to(r.code).emit('error_message', 'A sala foi encerrada pelo anfitrião.');
      rooms.delete(r.code);
    }
  });

  socket.on('disconnect', () => {
    const m = socketToPlayer.get(socket.id);
    if (m) {
      const r = rooms.get(m.roomCode);
      if (r && r.phase === 'LOBBY') {
        r.players = r.players.filter(p => p.id !== m.playerId);
        const humans = r.players.filter(p => !p.isAI);
        if (humans.length === 0) rooms.delete(m.roomCode);
        else broadcastRoom(m.roomCode);
      }
      socketToPlayer.delete(socket.id);
    }
  });
});

// --- INTERVALS ---

setInterval(() => {
  rooms.forEach((r, c) => {
    if (r.phaseTimerActive && r.phaseTimerRemaining > 0) {
      r.phaseTimerRemaining--;
      if (r.phaseTimerRemaining % 10 === 0) broadcastRoom(c);
    }
  });
}, 1000);

setInterval(() => {
  rooms.forEach((r, c) => {
    // 1. Bot Oracle Auto-Marking
    if (r.phase === 'ORACULO') {
      const oraclePlayer = r.players.find((p) => p.role === 'oraculo');
      if (oraclePlayer?.isAI) {
        // Round 1 use autoMarkOracleAI, subsequent rounds use autoProcessBotOracleNextRound
        const updated = (r.round === 1 && !r.evidencesOnTable.some(e => e.markedOptionIndex !== undefined))
          ? autoMarkOracleAI(r)
          : autoProcessBotOracleNextRound(r);

        rooms.set(c, updated);
        broadcastRoom(c);
        return;
      }
    }

    // 2. Bot Assassin Auto-Choice
    if (r.phase === 'NOITE') {
      const killerPlayer = r.players.find((p) => p.role === 'assassino');
      if (killerPlayer?.isAI && killerPlayer.methods.length > 0 && killerPlayer.objects.length > 0) {
        const randMethod = killerPlayer.methods[Math.floor(Math.random() * killerPlayer.methods.length)];
        const randObject = killerPlayer.objects[Math.floor(Math.random() * killerPlayer.objects.length)];
        try {
          const updated = handleNightChoice(r, killerPlayer.id, randMethod.id, randObject.id);
          rooms.set(c, updated);
          broadcastRoom(c);
          return;
        } catch (e) {
          console.error('[AI Bot] Error in auto-night-choice:', e);
        }
      }
    }

    // 3. Bot Investigation Phrases
    if (r.phase === 'INVESTIGACAO' && !r.winner && Math.random() < 0.1) {
      const bots = r.players.filter(p => p.isAI);
      if (bots.length > 0) {
        const bot = bots[Math.floor(Math.random() * bots.length)];
        const phrases = [
          'O Oráculo selou algo muito específico aqui...',
          'Essas evidências cruzadas apontam para um suspeito.',
          'Olhem bem as cartas na mesa, a verdade está próxima.',
          'Alguém mentiu no depoimento inicial?',
          'Vou examinar os arquivos ancestrais mais uma vez.'
        ];
        r.messages.push({
          id: `b_${Date.now()}`,
          senderId: bot.id,
          senderName: bot.name,
          text: phrases[Math.floor(Math.random() * phrases.length)],
          timestamp: new Date().toLocaleTimeString()
        });
        broadcastRoom(c);
      }
    }
  });
}, 2000);

async function startApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Online on port ${PORT}`);
  });
}

startApp();
