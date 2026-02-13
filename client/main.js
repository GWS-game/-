import { MSG } from "../common/protocol.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const loginBtn = document.getElementById("googleLogin");
const joinPveBtn = document.getElementById("joinPve");
const joinPvpBtn = document.getElementById("joinPvp");
const saveProfileBtn = document.getElementById("saveProfile");
const characterSelect = document.getElementById("characterSelect");

const inputState = { up: false, down: false, left: false, right: false, aimX: 1, aimY: 0 };
let ws;
let uid;
let state;

// Firebase 설정값은 실제 프로젝트에서 교체한다.
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  projectId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

if (firebaseConfig.apiKey !== "REPLACE_ME") {
  firebase.initializeApp(firebaseConfig);
}

function connectSocket() {
  ws = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`);
  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === MSG.AUTH_OK) {
      uid = msg.uid;
      statusEl.textContent = `로그인 성공: ${uid}`;
      characterSelect.value = msg.profile.selectedCharacter || "striker";
    } else if (msg.type === MSG.JOINED) {
      statusEl.textContent = `매치 참여 완료 (${msg.mode})`;
    } else if (msg.type === MSG.STATE) {
      state = msg.state;
    } else if (msg.type === MSG.ERROR || msg.type === MSG.AUTH_FAIL) {
      statusEl.textContent = `오류: ${msg.message || msg.reason}`;
    } else if (msg.type === MSG.PROFILE_SAVED) {
      statusEl.textContent = "프로필 저장 완료";
    }
  });
}

async function loginWithGoogle() {
  // Firebase가 설정되지 않은 로컬 모드에서는 dev 토큰 사용
  if (!firebase.apps.length) {
    if (!ws || ws.readyState !== WebSocket.OPEN) connectSocket();
    ws.addEventListener(
      "open",
      () => ws.send(JSON.stringify({ type: MSG.AUTH, idToken: "dev:local-player" })),
      { once: true }
    );
    return;
  }

  const provider = new firebase.auth.GoogleAuthProvider();
  const result = await firebase.auth().signInWithPopup(provider);
  const idToken = await result.user.getIdToken();

  if (!ws || ws.readyState !== WebSocket.OPEN) connectSocket();
  ws.addEventListener("open", () => ws.send(JSON.stringify({ type: MSG.AUTH, idToken })), { once: true });
}

loginBtn.addEventListener("click", () => loginWithGoogle().catch((e) => (statusEl.textContent = e.message)));
joinPveBtn.addEventListener("click", () => ws?.send(JSON.stringify({ type: MSG.QUEUE, mode: "pve" })));
joinPvpBtn.addEventListener("click", () => ws?.send(JSON.stringify({ type: MSG.QUEUE, mode: "pvp" })));
saveProfileBtn.addEventListener("click", () => {
  ws?.send(
    JSON.stringify({
      type: MSG.PROFILE,
      profile: { selectedCharacter: characterSelect.value }
    })
  );
});

window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "w") inputState.up = true;
  if (e.key.toLowerCase() === "s") inputState.down = true;
  if (e.key.toLowerCase() === "a") inputState.left = true;
  if (e.key.toLowerCase() === "d") inputState.right = true;
  if (e.key === " ") ws?.send(JSON.stringify({ type: MSG.SKILL }));
});

window.addEventListener("keyup", (e) => {
  if (e.key.toLowerCase() === "w") inputState.up = false;
  if (e.key.toLowerCase() === "s") inputState.down = false;
  if (e.key.toLowerCase() === "a") inputState.left = false;
  if (e.key.toLowerCase() === "d") inputState.right = false;
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  inputState.aimX = x - canvas.width / 2;
  inputState.aimY = y - canvas.height / 2;
});

setInterval(() => {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: MSG.INPUT, input: inputState }));
  }
}, 50);

function drawEntity(entity) {
  ctx.beginPath();
  ctx.fillStyle = entity.color;
  ctx.arc(entity.x, entity.y, entity.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.fillRect(entity.x - entity.r, entity.y - entity.r - 10, entity.r * 2, 4);
  ctx.fillStyle = "#f44336";
  ctx.fillRect(entity.x - entity.r, entity.y - entity.r - 10, (entity.hp / entity.maxHp) * entity.r * 2, 4);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#243447";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (state) {
    state.players.forEach(drawEntity);
    state.ai.forEach(drawEntity);

    ctx.fillStyle = "#ffd54f";
    state.projectiles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 내 플레이어 강조 표시
    const me = state.players.find((p) => p.uid === uid);
    if (me) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(me.x, me.y, me.r + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  requestAnimationFrame(render);
}

connectSocket();
render();
