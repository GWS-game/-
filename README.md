# Circle Arena Online (HTML5 Canvas + Firebase + WebSocket)

온라인 2D 탑다운 액션 게임의 최소 실행 가능한 프로젝트입니다.

## 구현 범위
- 웹 기반(PC 브라우저), HTML5 Canvas 렌더링
- 클라이언트/서버 분리 구조
- WebSocket 실시간 통신
- 1vs1 PvP 큐/매칭
- PvE 모드(AI 추적/근접 공격)
- 서버 권한 판정(이동/스킬/HP)
- Firebase Authentication(Google) + UID 기반 프로필 저장
  - 캐릭터 선택
  - 전적(wins/losses)
  - 플레이 횟수(plays)

## 폴더 구조

```txt
client/
  rendering/   # 확장용(현재 main.js 내 렌더링)
  input/       # 확장용(현재 main.js 내 입력)
  ui/          # 확장용
server/
  websocket/   # 소켓 게이트웨이
  game-loop/   # 확장용
  entity-management/
common/        # 클라/서버 공유 프로토콜/데이터
```

## 실행 방법

```bash
npm install
npm run start
```

브라우저에서 `http://localhost:3000` 접속.

## Firebase 설정

### 1) 클라이언트 (`client/main.js`)
`firebaseConfig`를 실제 프로젝트 값으로 교체합니다.

### 2) 서버 (환경변수)
`.env` 예시:

```env
PORT=3000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

환경변수가 없으면 로컬 데모 모드로 동작하며 `dev:<uid>` 형식 토큰 인증을 허용합니다.

## 조작법
- 이동: `WASD`
- 스킬: `Space`
- 조준: 마우스 이동 (화면 중심 기준)

## 확장 포인트
- `common/protocol.js`에 캐릭터/스킬 추가
- `GameRoom.useSkill`에 스킬 로직 추가
- 룸 단위 매치 인스턴스 분리(현재는 pvp/pve 단일 룸)
- 전적 갱신 로직(승/패) 고도화
