export class MediaManager {
  private localStream: MediaStream | null = null;
  private audioEnabled = true;
  private videoEnabled = true;

  async getLocalStream(): Promise<MediaStream> {
    try {
      console.log('🎥 Requesting user media...');

      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log('✅ Got local stream:', this.localStream.id);
      return this.localStream;
    } catch (error) {
      console.error('❌ Error getting user media:', error);
      throw new Error(
        `카메라/마이크 접근 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요. (${error instanceof Error ? error.message : 'Unknown error'})`
      );
    }
  }

  getStream(): MediaStream | null {
    return this.localStream;
  }

  toggleAudio(): boolean {
    if (!this.localStream) {
      return false;
    }

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      this.audioEnabled = !this.audioEnabled;
      audioTrack.enabled = this.audioEnabled;
      console.log(`🎤 Audio ${this.audioEnabled ? 'enabled' : 'disabled'}`);
    }

    return this.audioEnabled;
  }

  toggleVideo(): boolean {
    if (!this.localStream) {
      return false;
    }

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      this.videoEnabled = !this.videoEnabled;
      videoTrack.enabled = this.videoEnabled;
      console.log(`📹 Video ${this.videoEnabled ? 'enabled' : 'disabled'}`);
    }

    return this.videoEnabled;
  }

  isAudioEnabled(): boolean {
    return this.audioEnabled;
  }

  isVideoEnabled(): boolean {
    return this.videoEnabled;
  }

  stopLocalStream(): void {
    if (this.localStream) {
      console.log('🛑 Stopping local stream');
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.localStream = null;
    }
  }

  // 특정 트랙 가져오기
  getAudioTrack(): MediaStreamTrack | undefined {
    return this.localStream?.getAudioTracks()[0];
  }

  getVideoTrack(): MediaStreamTrack | undefined {
    return this.localStream?.getVideoTracks()[0];
  }
}
