import { CHARACTERS, SKILLS } from "../../common/protocol.js";

const ROOM_SIZE = { width: 1280, height: 720 };
const PLAYER_RADIUS = 18;
const BOT_RADIUS = 16;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * 서버 권한 기반 룸.
 * - 위치/HP/스킬을 서버에서 판정
 * - 입력만 클라이언트에서 수신
 */
export class GameRoom {
  constructor(mode = "pvp") {
    this.mode = mode;
    this.players = new Map();
    this.aiEnemies = new Map();
    this.projectiles = [];
    this.pendingHits = [];
    this.lastUpdate = Date.now();

    if (mode === "pve") {
      this.spawnAi("bot-1", 900, 360);
    }
  }

  addPlayer(uid, character = "striker") {
    const base = CHARACTERS[character] || CHARACTERS.striker;
    this.players.set(uid, {
      uid,
      character,
      color: base.color,
      x: 160 + Math.random() * 240,
      y: 160 + Math.random() * 280,
      r: PLAYER_RADIUS,
      hp: base.hp,
      maxHp: base.hp,
      speed: base.speed,
      input: { up: false, down: false, left: false, right: false, aimX: 0, aimY: 0 },
      cooldownUntil: 0,
      alive: true,
      respawnAt: 0
    });
  }

  removePlayer(uid) {
    this.players.delete(uid);
  }

  spawnAi(id, x, y) {
    this.aiEnemies.set(id, {
      id,
      x,
      y,
      r: BOT_RADIUS,
      hp: 90,
      maxHp: 90,
      speed: 150,
      color: "#b0bec5",
      cooldownUntil: 0,
      alive: true,
      respawnAt: 0
    });
  }

  setInput(uid, input) {
    const p = this.players.get(uid);
    if (!p) return;
    p.input = { ...p.input, ...input };
  }

  useSkill(uid) {
    const p = this.players.get(uid);
    if (!p || !p.alive) return;
    const skillType = CHARACTERS[p.character].skill;
    const skill = SKILLS[skillType];
    if (Date.now() < p.cooldownUntil) return;

    p.cooldownUntil = Date.now() + skill.cooldownMs;
    const aimLen = Math.hypot(p.input.aimX, p.input.aimY) || 1;
    const nx = p.input.aimX / aimLen;
    const ny = p.input.aimY / aimLen;

    if (skillType === "projectile") {
      this.projectiles.push({
        owner: uid,
        x: p.x,
        y: p.y,
        vx: nx * 500,
        vy: ny * 500,
        life: skill.range / 500,
        r: 8,
        damage: skill.damage
      });
    } else if (skillType === "aoe") {
      this.dealAoe(uid, p.x, p.y, skill.range, skill.damage);
    } else if (skillType === "dash") {
      p.x = clamp(p.x + nx * skill.range, PLAYER_RADIUS, ROOM_SIZE.width - PLAYER_RADIUS);
      p.y = clamp(p.y + ny * skill.range, PLAYER_RADIUS, ROOM_SIZE.height - PLAYER_RADIUS);
      this.dealAoe(uid, p.x, p.y, 42, skill.damage);
    }
  }

  dealAoe(ownerId, x, y, range, damage) {
    for (const [id, target] of this.players) {
      if (id === ownerId || !target.alive) continue;
      if (dist({ x, y }, target) <= range + target.r) {
        this.pendingHits.push({ type: "player", id, damage, ownerId });
      }
    }

    for (const [id, bot] of this.aiEnemies) {
      if (!bot.alive) continue;
      if (dist({ x, y }, bot) <= range + bot.r) {
        this.pendingHits.push({ type: "ai", id, damage, ownerId });
      }
    }
  }

  update() {
    const now = Date.now();
    const dt = Math.min((now - this.lastUpdate) / 1000, 0.05);
    this.lastUpdate = now;

    this.updatePlayers(dt, now);
    this.updateProjectiles(dt);
    this.updateAi(dt, now);
    this.applyHits(now);
  }

  updatePlayers(dt, now) {
    for (const [, p] of this.players) {
      if (!p.alive) {
        if (now >= p.respawnAt) {
          p.alive = true;
          p.hp = p.maxHp;
          p.x = 120 + Math.random() * 300;
          p.y = 120 + Math.random() * 300;
        }
        continue;
      }

      const mx = (p.input.right ? 1 : 0) - (p.input.left ? 1 : 0);
      const my = (p.input.down ? 1 : 0) - (p.input.up ? 1 : 0);
      const mlen = Math.hypot(mx, my) || 1;
      p.x = clamp(p.x + (mx / mlen) * p.speed * dt, PLAYER_RADIUS, ROOM_SIZE.width - PLAYER_RADIUS);
      p.y = clamp(p.y + (my / mlen) * p.speed * dt, PLAYER_RADIUS, ROOM_SIZE.height - PLAYER_RADIUS);
    }
  }

  updateProjectiles(dt) {
    this.projectiles = this.projectiles.filter((proj) => {
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;
      if (proj.life <= 0) return false;

      for (const [id, p] of this.players) {
        if (id === proj.owner || !p.alive) continue;
        if (dist(proj, p) <= proj.r + p.r) {
          this.pendingHits.push({ type: "player", id, damage: proj.damage, ownerId: proj.owner });
          return false;
        }
      }

      for (const [id, bot] of this.aiEnemies) {
        if (!bot.alive) continue;
        if (dist(proj, bot) <= proj.r + bot.r) {
          this.pendingHits.push({ type: "ai", id, damage: proj.damage, ownerId: proj.owner });
          return false;
        }
      }

      return true;
    });
  }

  updateAi(dt, now) {
    if (this.mode !== "pve") return;
    for (const [, bot] of this.aiEnemies) {
      if (!bot.alive) {
        if (now >= bot.respawnAt) {
          bot.alive = true;
          bot.hp = bot.maxHp;
          bot.x = 860 + Math.random() * 200;
          bot.y = 220 + Math.random() * 260;
        }
        continue;
      }

      const target = [...this.players.values()].find((p) => p.alive);
      if (!target) continue;

      const dx = target.x - bot.x;
      const dy = target.y - bot.y;
      const d = Math.hypot(dx, dy) || 1;

      if (d > 65) {
        bot.x = clamp(bot.x + (dx / d) * bot.speed * dt, BOT_RADIUS, ROOM_SIZE.width - BOT_RADIUS);
        bot.y = clamp(bot.y + (dy / d) * bot.speed * dt, BOT_RADIUS, ROOM_SIZE.height - BOT_RADIUS);
      } else if (now > bot.cooldownUntil) {
        bot.cooldownUntil = now + 1000;
        this.pendingHits.push({ type: "player", id: target.uid, damage: 12, ownerId: bot.id });
      }
    }
  }

  applyHits(now) {
    for (const hit of this.pendingHits) {
      if (hit.type === "player") {
        const p = this.players.get(hit.id);
        if (!p || !p.alive) continue;
        p.hp -= hit.damage;
        if (p.hp <= 0) {
          p.alive = false;
          p.hp = 0;
          p.respawnAt = now + 3000;
        }
      } else {
        const bot = this.aiEnemies.get(hit.id);
        if (!bot || !bot.alive) continue;
        bot.hp -= hit.damage;
        if (bot.hp <= 0) {
          bot.alive = false;
          bot.hp = 0;
          bot.respawnAt = now + 4000;
        }
      }
    }
    this.pendingHits = [];
  }

  snapshot() {
    return {
      room: ROOM_SIZE,
      mode: this.mode,
      players: [...this.players.values()].map((p) => ({
        uid: p.uid,
        character: p.character,
        color: p.color,
        x: p.x,
        y: p.y,
        r: p.r,
        hp: p.hp,
        maxHp: p.maxHp,
        alive: p.alive
      })),
      ai: [...this.aiEnemies.values()].map((bot) => ({
        id: bot.id,
        x: bot.x,
        y: bot.y,
        r: bot.r,
        color: bot.color,
        hp: bot.hp,
        maxHp: bot.maxHp,
        alive: bot.alive
      })),
      projectiles: this.projectiles.map((p) => ({ x: p.x, y: p.y, r: p.r }))
    };
  }
}
