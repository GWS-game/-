import { WebSocketServer } from "ws";
import { MSG } from "../../common/protocol.js";
import { GameRoom } from "../entity-management/GameRoom.js";
import { loadProfile, saveProfile, verifyIdToken } from "../firebase.js";

/**
 * WebSocket 메시지 라우팅.
 * - 인증
 * - 모드 선택(PvP/PvE)
 * - 입력/스킬 전달
 */
export function createSocketGateway(server) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  const clients = new Map();
  const rooms = {
    pve: new GameRoom("pve"),
    pvp: new GameRoom("pvp")
  };

  const pvpQueue = [];

  const send = (ws, payload) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
  };

  wss.on("connection", (ws) => {
    send(ws, { type: MSG.MODE, modes: ["pve", "pvp"] });

    ws.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg.type === MSG.AUTH) {
          const decoded = await verifyIdToken(msg.idToken);
          const profile = await loadProfile(decoded.uid);
          clients.set(ws, { uid: decoded.uid, room: null, profile });
          send(ws, { type: MSG.AUTH_OK, uid: decoded.uid, profile });
          return;
        }

        const session = clients.get(ws);
        if (!session) {
          send(ws, { type: MSG.AUTH_FAIL, reason: "authenticate first" });
          return;
        }

        if (msg.type === MSG.PROFILE) {
          session.profile = { ...session.profile, ...msg.profile };
          await saveProfile(session.uid, session.profile);
          send(ws, { type: MSG.PROFILE_SAVED, profile: session.profile });
          return;
        }

        if (msg.type === MSG.QUEUE) {
          session.profile.plays = (session.profile.plays || 0) + 1;
          await saveProfile(session.uid, { plays: session.profile.plays });

          if (msg.mode === "pve") {
            session.room = rooms.pve;
            rooms.pve.addPlayer(session.uid, session.profile.selectedCharacter);
            send(ws, { type: MSG.JOINED, mode: "pve" });
            return;
          }

          if (!pvpQueue.includes(ws)) pvpQueue.push(ws);
          if (pvpQueue.length >= 2) {
            const a = pvpQueue.shift();
            const b = pvpQueue.shift();
            const sa = clients.get(a);
            const sb = clients.get(b);
            if (sa && sb) {
              rooms.pvp.addPlayer(sa.uid, sa.profile.selectedCharacter);
              rooms.pvp.addPlayer(sb.uid, sb.profile.selectedCharacter);
              sa.room = rooms.pvp;
              sb.room = rooms.pvp;
              send(a, { type: MSG.JOINED, mode: "pvp" });
              send(b, { type: MSG.JOINED, mode: "pvp" });
            }
          }
          return;
        }

        if (!session.room) return;

        if (msg.type === MSG.INPUT) {
          session.room.setInput(session.uid, msg.input);
        } else if (msg.type === MSG.SKILL) {
          session.room.useSkill(session.uid);
        }
      } catch (error) {
        send(ws, { type: MSG.ERROR, message: error.message });
      }
    });

    ws.on("close", () => {
      const session = clients.get(ws);
      if (!session) return;
      if (session.room) session.room.removePlayer(session.uid);
      const idx = pvpQueue.indexOf(ws);
      if (idx >= 0) pvpQueue.splice(idx, 1);
      clients.delete(ws);
    });
  });

  setInterval(() => {
    rooms.pve.update();
    rooms.pvp.update();
    const pveState = { type: MSG.STATE, state: rooms.pve.snapshot() };
    const pvpState = { type: MSG.STATE, state: rooms.pvp.snapshot() };

    for (const [ws, session] of clients.entries()) {
      if (!session.room) continue;
      send(ws, session.room === rooms.pve ? pveState : pvpState);
    }
  }, 50);

  return wss;
}
