export class PeerConnection {
  private pc: RTCPeerConnection;
  private remoteSocketId: string;
  private remoteStream: MediaStream;
  private onRemoteStreamCallback?: (stream: MediaStream) => void;
  private onIceCandidateCallback?: (candidate: RTCIceCandidate) => void;

  constructor(
    remoteSocketId: string,
    iceServers: RTCIceServer[],
    onRemoteStream?: (stream: MediaStream) => void,
    onIceCandidate?: (candidate: RTCIceCandidate) => void
  ) {
    this.remoteSocketId = remoteSocketId;
    this.remoteStream = new MediaStream();
    this.onRemoteStreamCallback = onRemoteStream;
    this.onIceCandidateCallback = onIceCandidate;

    // RTCPeerConnection 생성
    this.pc = new RTCPeerConnection({
      iceServers,
    });

    this.setupEventHandlers();
    console.log(`🔗 Created peer connection for ${remoteSocketId}`);
  }

  private setupEventHandlers(): void {
    // ICE candidate 이벤트
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`🧊 ICE candidate for ${this.remoteSocketId}:`, event.candidate);
        this.onIceCandidateCallback?.(event.candidate);
      }
    };

    // 원격 트랙 수신 이벤트
    this.pc.ontrack = (event) => {
      console.log(`📥 Received track from ${this.remoteSocketId}:`, event.track.kind);
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });

      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(this.remoteStream);
      }
    };

    // 연결 상태 변경 이벤트
    this.pc.onconnectionstatechange = () => {
      console.log(
        `🔌 Connection state with ${this.remoteSocketId}:`,
        this.pc.connectionState
      );

      if (this.pc.connectionState === 'failed') {
        console.error(`❌ Connection failed with ${this.remoteSocketId}`);
      }
    };

    // ICE 연결 상태 변경
    this.pc.oniceconnectionstatechange = () => {
      console.log(
        `🧊 ICE connection state with ${this.remoteSocketId}:`,
        this.pc.iceConnectionState
      );
    };
  }

  // 로컬 스트림 트랙 추가
  addTrack(track: MediaStreamTrack, stream: MediaStream): void {
    try {
      this.pc.addTrack(track, stream);
      console.log(`➕ Added ${track.kind} track to ${this.remoteSocketId}`);
    } catch (error) {
      console.error('Error adding track:', error);
    }
  }

  // Offer 생성
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    try {
      const offer = await this.pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await this.pc.setLocalDescription(offer);
      console.log(`📤 Created offer for ${this.remoteSocketId}`);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  // Answer 생성
  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    try {
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      console.log(`📤 Created answer for ${this.remoteSocketId}`);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }

  // Remote Description 설정
  async setRemoteDescription(
    description: RTCSessionDescriptionInit
  ): Promise<void> {
    try {
      await this.pc.setRemoteDescription(new RTCSessionDescription(description));
      console.log(
        `📥 Set remote ${description.type} for ${this.remoteSocketId}`
      );
    } catch (error) {
      console.error('Error setting remote description:', error);
      throw error;
    }
  }

  // ICE Candidate 추가
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log(`🧊 Added ICE candidate for ${this.remoteSocketId}`);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
      // ICE candidate 추가 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }

  // 연결 종료
  close(): void {
    console.log(`🔌 Closing peer connection with ${this.remoteSocketId}`);
    this.pc.close();
    this.remoteStream.getTracks().forEach((track) => track.stop());
  }

  // Getter
  getRemoteSocketId(): string {
    return this.remoteSocketId;
  }

  getRemoteStream(): MediaStream {
    return this.remoteStream;
  }

  getConnectionState(): RTCPeerConnectionState {
    return this.pc.connectionState;
  }
}
