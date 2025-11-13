# Meeting - Google Meet Mock

WebRTC를 이용한 구글 밋 스타일의 화상 회의 mock 프로젝트입니다.

## 프로젝트 구조

```
google-meeting-mock/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # NestJS + Socket.io (시그널링 서버)
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── meeting/
│   │       ├── meeting.gateway.ts
│   │       └── meeting.module.ts
│   └── package.json
└── package.json       # 모노레포 스크립트
```

## 주요 기능

- ✅ 비디오/오디오 통화 (WebRTC)
- ✅ 참가자 관리
- ✅ 4-6명 소규모 그룹 미팅 지원
- ✅ 구글 밋 스타일 UI

## 기술 스택

### Frontend
- React 19
- TypeScript
- Vite
- Socket.io Client
- WebRTC API

### Backend
- NestJS 10
- WebSocket Gateway
- Socket.io
- TypeScript

## 시작하기

### 1. 의존성 설치

```bash
npm run install:all
```

### 2. 개발 서버 실행

#### 전체 실행 (Frontend + Backend)
```bash
npm run dev
```

#### 개별 실행
```bash
# Backend 시그널링 서버 (포트 3001)
npm run dev:backend

# Frontend (포트 5173)
npm run dev:frontend
```

### 3. 빌드

```bash
npm run build
```

## 포트 설정

- **Frontend**: `http://localhost:5173`
- **Backend (시그널링 서버)**: `http://localhost:3001`

## WebRTC 시그널링

WebRTC 연결을 위한 시그널링 서버가 NestJS WebSocket Gateway로 `backend/src/meeting/meeting.gateway.ts`에 구현되어 있습니다.

### 주요 이벤트:
- `join-room`: 회의실 입장
- `offer`: WebRTC offer 전달
- `answer`: WebRTC answer 전달
- `ice-candidate`: ICE candidate 전달
- `user-joined`: 새 참가자 입장 알림
- `user-left`: 참가자 퇴장 알림

## 다음 단계

프론트엔드 구현:
1. 홈 페이지 (회의실 코드 입력/생성)
2. 미팅 페이지 (비디오 그리드, 컨트롤)
3. WebRTC 연결 로직
4. 참가자 관리 UI

---

포스팅을 위한 교육용 프로젝트입니다.
