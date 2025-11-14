# Meeting - Google Meet Mock

WebRTC를 이용한 구글 밋 스타일의 화상 회의 애플리케이션입니다.

## 프로젝트 구조

```
google-meeting-mock/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # 재사용 가능한 컴포넌트
│   │   │   ├── VideoTile.tsx
│   │   │   └── VideoGrid.tsx
│   │   ├── pages/           # 페이지 컴포넌트
│   │   │   ├── Home.tsx
│   │   │   └── Meeting.tsx
│   │   ├── webrtc/          # WebRTC 로직
│   │   │   ├── SocketService.ts
│   │   │   ├── MediaManager.ts
│   │   │   ├── PeerConnection.ts
│   │   │   ├── WebRTCManager.ts
│   │   │   └── types.ts
│   │   └── App.tsx
│   └── package.json
├── backend/           # NestJS + Socket.io (시그널링 서버)
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/
│   │   │   └── configuration.ts  # 환경변수 설정
│   │   └── meeting/
│   │       ├── meeting.gateway.ts
│   │       └── meeting.module.ts
│   ├── .env                      # 환경변수 파일
│   └── package.json
└── package.json       # 모노레포 스크립트
```

## 주요 기능

- ✅ **실시간 비디오/오디오 통화** (WebRTC P2P)
- ✅ **참가자 관리** (입장/퇴장 알림)
- ✅ **오디오/비디오 토글** (음소거, 카메라 on/off)
- ✅ **다자간 통화 지원** (최대 6명)
- ✅ **STUN/TURN 서버 지원** (NAT 통과)
- ✅ **구글 밋 스타일 UI**

## 기술 스택

### Frontend
- React 19
- TypeScript
- Vite 7
- Socket.io Client
- WebRTC API
- React Router

### Backend
- NestJS 10
- WebSocket Gateway (@nestjs/websockets)
- Socket.io
- @nestjs/config (환경변수 관리)
- TypeScript

## 시작하기

### 1. 의존성 설치

```bash
npm run install:all
```

### 2. 백엔드 환경변수 설정

백엔드 `.env` 파일이 이미 생성되어 있습니다. 기본적으로 Google Public STUN 서버를 사용합니다.

```bash
# backend/.env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# STUN 서버 (무료 Google STUN)
STUN_SERVER_URL=stun:stun.l.google.com:19302
STUN_SERVER_URL_2=stun:stun1.l.google.com:19302

# TURN 서버 (프로덕션용 - 선택사항)
# TURN_SERVER_URL=turn:your-turn-server.com:3478
# TURN_USERNAME=your-username
# TURN_PASSWORD=your-password
```

### 3. 개발 서버 실행

#### 전체 실행 (Frontend + Backend 동시)
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

### 4. 빌드

```bash
# 전체 빌드
npm run build

# 개별 빌드
npm run build:backend
npm run build:frontend
```

### 5. 사용 방법

1. 브라우저에서 `http://localhost:5173` 접속
2. "새 회의 만들기" 또는 회의 코드 입력
3. 카메라/마이크 권한 허용
4. 다른 브라우저 탭에서 동일한 회의 코드로 입장하여 테스트

## 포트 설정

- **Frontend**: `http://localhost:5173`
- **Backend (시그널링 서버)**: `http://localhost:3001`

## WebRTC 아키텍처

### 시그널링 서버

WebRTC 연결을 위한 시그널링 서버가 NestJS WebSocket Gateway로 구현되어 있습니다.
위치: `backend/src/meeting/meeting.gateway.ts`

**주요 이벤트:**
- `get-ice-servers`: ICE 서버 정보 요청
- `join-room`: 회의실 입장
- `offer`: WebRTC offer 전달
- `answer`: WebRTC answer 전달
- `ice-candidate`: ICE candidate 전달
- `user-joined`: 새 참가자 입장 알림
- `user-left`: 참가자 퇴장 알림
- `existing-participants`: 기존 참가자 목록 전달

### WebRTC 클라이언트 구조

**SocketService** (`frontend/src/webrtc/SocketService.ts`)
- Socket.io 연결 관리
- 시그널링 이벤트 송수신

**MediaManager** (`frontend/src/webrtc/MediaManager.ts`)
- 로컬 미디어 스트림 관리 (getUserMedia)
- 오디오/비디오 토글

**PeerConnection** (`frontend/src/webrtc/PeerConnection.ts`)
- 개별 RTCPeerConnection 래퍼
- Offer/Answer 생성
- ICE candidate 처리

**WebRTCManager** (`frontend/src/webrtc/WebRTCManager.ts`)
- 전체 WebRTC 로직 오케스트레이션
- 다중 Peer Connection 관리
- 참가자 상태 관리

## STUN/TURN 서버 설정

### 개발 환경 (현재 설정)
무료 Google Public STUN 서버를 사용합니다. 같은 네트워크 또는 대부분의 환경에서 작동합니다.

### 프로덕션 환경 (권장)
복잡한 NAT 환경에서는 TURN 서버가 필요할 수 있습니다.

**옵션 1: 무료 서비스**
- [Metered.ca](https://www.metered.ca/) (무료 플랜 제공)
- [Open Relay Project](https://www.metered.ca/tools/openrelay/)

**옵션 2: 자체 호스팅**
- [Coturn](https://github.com/coturn/coturn) 서버 설치

설정 후 `backend/.env`에 TURN 정보를 추가하세요.

## 브라우저 호환성

- Chrome/Edge: ✅ 완전 지원
- Firefox: ✅ 완전 지원
- Safari: ✅ 지원 (일부 제약)
- Opera: ✅ 지원

**참고:** HTTPS 환경에서만 카메라/마이크 접근이 가능합니다. 로컬 개발은 localhost에서 허용됩니다.

## 트러블슈팅

### 카메라/마이크 권한 에러
브라우저 설정에서 `localhost:5173`에 대한 카메라/마이크 권한을 확인하세요.

### 연결이 안 될 때
1. 백엔드 서버가 실행 중인지 확인 (`localhost:3001`)
2. 브라우저 콘솔에서 WebSocket 연결 상태 확인
3. 방화벽이 WebSocket 연결을 차단하지 않는지 확인

### ICE candidate 실패
- STUN/TURN 서버 설정 확인
- 네트워크 환경에 따라 TURN 서버가 필요할 수 있음

---

**교육용 프로젝트**입니다.
