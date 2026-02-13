import admin from "firebase-admin";

let firebaseEnabled = false;
const memoryProfiles = new Map();

/**
 * Firebase Admin 초기화.
 * 로컬 개발 편의를 위해 자격증명이 없으면 메모리 저장소로 폴백한다.
 */
export function initFirebase() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("[firebase] 환경 변수가 없어 메모리 프로필 저장소를 사용합니다.");
    firebaseEnabled = false;
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey })
  });
  firebaseEnabled = true;
}

/**
 * 클라이언트에서 받은 Firebase ID 토큰 검증.
 */
export async function verifyIdToken(idToken) {
  if (!firebaseEnabled) {
    // 데모/오프라인 실행을 위한 간단한 UID 포맷 허용
    if (typeof idToken === "string" && idToken.startsWith("dev:")) {
      return { uid: idToken.slice(4) || "guest" };
    }
    throw new Error("Firebase is not configured. Use dev:<uid> token for local mode.");
  }
  return admin.auth().verifyIdToken(idToken);
}

/**
 * UID 기준 계정 데이터 로드.
 */
export async function loadProfile(uid) {
  if (!firebaseEnabled) {
    if (!memoryProfiles.has(uid)) {
      memoryProfiles.set(uid, { selectedCharacter: "striker", wins: 0, losses: 0, plays: 0 });
    }
    return memoryProfiles.get(uid);
  }

  const snap = await admin.firestore().collection("profiles").doc(uid).get();
  if (!snap.exists) {
    return { selectedCharacter: "striker", wins: 0, losses: 0, plays: 0 };
  }
  return snap.data();
}

/**
 * UID 기준 계정 데이터 저장.
 */
export async function saveProfile(uid, profile) {
  if (!firebaseEnabled) {
    memoryProfiles.set(uid, profile);
    return;
  }
  await admin.firestore().collection("profiles").doc(uid).set(profile, { merge: true });
}
