import { SocketService } from './SocketService';
import { MediaManager } from './MediaManager';
import { PeerConnection } from './PeerConnection';
import type { Participant } from './types';

export class WebRTCManager {
  private socketService: SocketService;
  private mediaManager: MediaManager;
  private peerConnections: Map<string, PeerConnection> = new Map();
  private participants: Map<string, Participant> = new Map();
  private iceServers: RTCIceServer[] = [];

  // 콜백
  private onParticipantAddedCallback?: (participant: Participant) => void;
  private onParticipantRemovedCallback?: (socketId: string) => void;
  private onLocalStreamCallback?: (stream: MediaStream) => void;

  constructor(
    onParticipantAdded?: (participant: Participant) => void,
    onParticipantRemoved?: (socketId: string) => void,
    onLocalStream?: (stream: MediaStream) => void
  ) {
    this.socketService = new SocketService();
    this.mediaManager = new MediaManager();
    this.onParticipantAddedCallback = onParticipantAdded;
    this.onParticipantRemovedCallback = onParticipantRemoved;
    this.onLocalStreamCallback = onLocalStream;
  }

  // 초기화 및 미팅 참가
  async joinMeeting(roomId: string, userName: string): Promise<void> {
    try {
      console.log('🚀 Initializing WebRTC...');

      // 1. Socket 연결
      await this.socketService.connect();

      // 2. ICE 서버 가져오기
      const { iceServers } = await this.socketService.getIceServers();
      this.iceServers = iceServers;
      console.log('📡 ICE servers configured:', iceServers);

      // 3. 로컬 미디어 스트림 가져오기
      const localStream = await this.mediaManager.getLocalStream();
      console.log('🎥 Local stream acquired');

      // 로컬 스트림 콜백 호출
      if (this.onLocalStreamCallback) {
        this.onLocalStreamCallback(localStream);
      }

      // 4. Socket 이벤트 리스너 설정
      this.setupSocketListeners();

      // 5. 방 참가
      this.socketService.joinRoom({ roomId, userName });

      console.log('✅ Successfully joined meeting:', roomId);
    } catch (error) {
      console.error('❌ Error joining meeting:', error);
      throw error;
    }
  }

  // Socket 이벤트 리스너 설정
  private setupSocketListeners(): void {
    // 기존 참가자 목록 수신
    this.socketService.on('existing-participants', (participants) => {
      console.log('👥 Existing participants:', participants);
      participants.forEach((participant) => {
        this.createPeerConnection(participant.socketId, participant.userName, true);
      });
    });

    // 새 참가자 입장
    this.socketService.on('user-joined', (payload) => {
      console.log('👋 User joined:', payload.userName);
      this.createPeerConnection(payload.socketId, payload.userName, false);
    });

    // 참가자 퇴장
    this.socketService.on('user-left', (payload) => {
      console.log('👋 User left:', payload.userName);
      this.removePeerConnection(payload.socketId);
    });

    // Offer 수신
    this.socketService.on('offer', async (payload) => {
      console.log('📥 Received offer from:', payload.fromSocketId);
      await this.handleOffer(payload.fromSocketId, payload.offer);
    });

    // Answer 수신
    this.socketService.on('answer', async (payload) => {
      console.log('📥 Received answer from:', payload.fromSocketId);
      await this.handleAnswer(payload.fromSocketId, payload.answer);
    });

    // ICE Candidate 수신
    this.socketService.on('ice-candidate', async (payload) => {
      console.log('🧊 Received ICE candidate from:', payload.fromSocketId);
      await this.handleIceCandidate(payload.fromSocketId, payload.candidate);
    });
  }

  // Peer Connection 생성
  private createPeerConnection(
    remoteSocketId: string,
    userName: string,
    shouldCreateOffer: boolean
  ): void {
    if (this.peerConnections.has(remoteSocketId)) {
      console.warn(`Peer connection already exists for ${remoteSocketId}`);
      return;
    }

    // Participant 추가
    const participant: Participant = {
      socketId: remoteSocketId,
      userName,
    };
    this.participants.set(remoteSocketId, participant);

    // Peer Connection 생성
    const pc = new PeerConnection(
      remoteSocketId,
      this.iceServers,
      (stream) => {
        // 원격 스트림 수신
        participant.stream = stream;
        this.participants.set(remoteSocketId, participant);
        if (this.onParticipantAddedCallback) {
          this.onParticipantAddedCallback(participant);
        }
      },
      (candidate) => {
        // ICE Candidate 전송
        this.socketService.sendIceCandidate({
          targetSocketId: remoteSocketId,
          candidate: candidate.toJSON(),
        });
      }
    );

    this.peerConnections.set(remoteSocketId, pc);

    // 로컬 스트림 트랙 추가
    const localStream = this.mediaManager.getStream();
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    // Offer 생성 (기존 참가자에게만)
    if (shouldCreateOffer) {
      this.createAndSendOffer(remoteSocketId);
    }
  }

  // Offer 생성 및 전송
  private async createAndSendOffer(remoteSocketId: string): Promise<void> {
    const pc = this.peerConnections.get(remoteSocketId);
    if (!pc) return;

    try {
      const offer = await pc.createOffer();
      this.socketService.sendOffer({
        targetSocketId: remoteSocketId,
        offer,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  // Offer 처리
  private async handleOffer(
    fromSocketId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<void> {
    const pc = this.peerConnections.get(fromSocketId);
    if (!pc) {
      console.error('Peer connection not found for:', fromSocketId);
      return;
    }

    try {
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      this.socketService.sendAnswer({
        targetSocketId: fromSocketId,
        answer,
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  // Answer 처리
  private async handleAnswer(
    fromSocketId: string,
    answer: RTCSessionDescriptionInit
  ): Promise<void> {
    const pc = this.peerConnections.get(fromSocketId);
    if (!pc) {
      console.error('Peer connection not found for:', fromSocketId);
      return;
    }

    try {
      await pc.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  // ICE Candidate 처리
  private async handleIceCandidate(
    fromSocketId: string,
    candidate: RTCIceCandidateInit
  ): Promise<void> {
    const pc = this.peerConnections.get(fromSocketId);
    if (!pc) {
      console.error('Peer connection not found for:', fromSocketId);
      return;
    }

    try {
      await pc.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  // Peer Connection 제거
  private removePeerConnection(socketId: string): void {
    const pc = this.peerConnections.get(socketId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(socketId);
    }

    this.participants.delete(socketId);

    if (this.onParticipantRemovedCallback) {
      this.onParticipantRemovedCallback(socketId);
    }
  }

  // 오디오 토글
  toggleAudio(): boolean {
    return this.mediaManager.toggleAudio();
  }

  // 비디오 토글
  toggleVideo(): boolean {
    return this.mediaManager.toggleVideo();
  }

  // 미팅 종료
  leaveMeeting(): void {
    console.log('👋 Leaving meeting...');

    // 모든 Peer Connection 종료
    this.peerConnections.forEach((pc) => {
      pc.close();
    });
    this.peerConnections.clear();
    this.participants.clear();

    // 로컬 스트림 종료
    this.mediaManager.stopLocalStream();

    // Socket 연결 종료
    this.socketService.disconnect();

    console.log('✅ Successfully left meeting');
  }

  // Getter
  getParticipants(): Participant[] {
    return Array.from(this.participants.values());
  }

  getLocalStream(): MediaStream | null {
    return this.mediaManager.getStream();
  }

  isAudioEnabled(): boolean {
    return this.mediaManager.isAudioEnabled();
  }

  isVideoEnabled(): boolean {
    return this.mediaManager.isVideoEnabled();
  }
}
