/**
 * 클라이언트/서버 공통 프로토콜 상수.
 * 메시지 타입을 한곳에서 관리하여 확장을 쉽게 만든다.
 */
export const MSG = {
  AUTH: "auth",
  AUTH_OK: "auth_ok",
  AUTH_FAIL: "auth_fail",
  QUEUE: "queue",
  JOINED: "joined",
  INPUT: "input",
  STATE: "state",
  SKILL: "skill",
  MODE: "mode",
  PROFILE: "profile",
  PROFILE_SAVED: "profile_saved",
  ERROR: "error"
};

/**
 * 캐릭터 정의: 원형 외형 + 기본 능력치 + 고유 스킬.
 */
export const CHARACTERS = {
  striker: { color: "#4fc3f7", hp: 120, speed: 220, skill: "projectile" },
  nova: { color: "#ff8a65", hp: 100, speed: 230, skill: "aoe" },
  dash: { color: "#81c784", hp: 90, speed: 260, skill: "dash" }
};

export const SKILLS = {
  projectile: { cooldownMs: 1100, range: 420, damage: 22 },
  aoe: { cooldownMs: 1700, range: 90, damage: 28 },
  dash: { cooldownMs: 1500, range: 160, damage: 18 }
};
