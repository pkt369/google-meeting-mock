import { io, Socket } from 'socket.io-client';
import type {
  IceServersResponse,
  UserJoinedPayload,
  UserLeftPayload,
  OfferPayload,
  AnswerPayload,
  IceCandidatePayload,
  RoomParticipant,
  JoinRoomData,
  SendOfferData,
  SendAnswerData,
  SendIceCandidateData,
} from './types';

const BACKEND_URL = 'http://localhost:3001';

export class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(BACKEND_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket?.id);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // ICE 서버 정보 요청
  async getIceServers(): Promise<IceServersResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('get-ice-servers', {}, (response: IceServersResponse) => {
        console.log('📡 Received ICE servers:', response);
        resolve(response);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Timeout getting ICE servers'));
      }, 5000);
    });
  }

  // 방 참가
  joinRoom(data: JoinRoomData): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    console.log('🚪 Joining room:', data);
    this.socket.emit('join-room', data);
  }

  // Offer 전송
  sendOffer(data: SendOfferData): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    console.log('📤 Sending offer to:', data.targetSocketId);
    this.socket.emit('offer', data);
  }

  // Answer 전송
  sendAnswer(data: SendAnswerData): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    console.log('📤 Sending answer to:', data.targetSocketId);
    this.socket.emit('answer', data);
  }

  // ICE Candidate 전송
  sendIceCandidate(data: SendIceCandidateData): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('ice-candidate', data);
  }

  // 이벤트 리스너 등록
  on(event: 'existing-participants', callback: (participants: RoomParticipant[]) => void): void;
  on(event: 'user-joined', callback: (payload: UserJoinedPayload) => void): void;
  on(event: 'user-left', callback: (payload: UserLeftPayload) => void): void;
  on(event: 'offer', callback: (payload: OfferPayload) => void): void;
  on(event: 'answer', callback: (payload: AnswerPayload) => void): void;
  on(event: 'ice-candidate', callback: (payload: IceCandidatePayload) => void): void;
  on(event: string, callback: Function): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    // 기존 리스너 추적
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    this.socket.on(event, callback as any);
  }

  // 이벤트 리스너 제거
  off(event: string, callback?: Function): void {
    if (!this.socket) {
      return;
    }

    if (callback) {
      this.socket.off(event, callback as any);
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }
}
