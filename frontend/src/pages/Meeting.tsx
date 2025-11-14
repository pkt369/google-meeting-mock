import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WebRTCManager } from '../webrtc/WebRTCManager';
import type { Participant } from '../webrtc/types';
import { VideoGrid } from '../components/VideoGrid';
import './Meeting.css';

function Meeting() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | undefined>();
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const webrtcManagerRef = useRef<WebRTCManager | null>(null);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    // WebRTC 초기화 및 미팅 참가
    const initializeWebRTC = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        // 사용자 이름 (실제로는 프롬프트나 설정에서 가져와야 함)
        const userName = prompt('이름을 입력하세요:') || 'Guest';

        // WebRTCManager 생성
        const manager = new WebRTCManager(
          // 참가자 추가 콜백
          (participant) => {
            console.log('Participant added:', participant);
            setParticipants((prev) => {
              // 중복 방지
              const exists = prev.some((p) => p.socketId === participant.socketId);
              if (exists) {
                return prev.map((p) =>
                  p.socketId === participant.socketId ? participant : p
                );
              }
              return [...prev, participant];
            });
          },
          // 참가자 제거 콜백
          (socketId) => {
            console.log('Participant removed:', socketId);
            setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
          },
          // 로컬 스트림 콜백
          (stream) => {
            console.log('Local stream received');
            setLocalStream(stream);
          }
        );

        webrtcManagerRef.current = manager;

        // 미팅 참가
        await manager.joinMeeting(roomId, userName);
        setIsConnecting(false);
      } catch (err) {
        console.error('Failed to initialize WebRTC:', err);
        setError(err instanceof Error ? err.message : '미팅 참가에 실패했습니다.');
        setIsConnecting(false);
      }
    };

    initializeWebRTC();

    // 클린업
    return () => {
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.leaveMeeting();
        webrtcManagerRef.current = null;
      }
    };
  }, [roomId, navigate]);

  const handleToggleMute = () => {
    if (webrtcManagerRef.current) {
      const enabled = webrtcManagerRef.current.toggleAudio();
      setIsAudioEnabled(enabled);
    }
  };

  const handleToggleVideo = () => {
    if (webrtcManagerRef.current) {
      const enabled = webrtcManagerRef.current.toggleVideo();
      setIsVideoEnabled(enabled);
    }
  };

  const handleLeaveMeeting = () => {
    if (window.confirm('회의에서 나가시겠습니까?')) {
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.leaveMeeting();
      }
      navigate('/');
    }
  };

  const copyMeetingLink = () => {
    const meetingLink = `${window.location.origin}/meeting/${roomId}`;
    navigator.clipboard.writeText(meetingLink);
    alert('회의 링크가 클립보드에 복사되었습니다!');
  };

  // 로딩 화면
  if (isConnecting) {
    return (
      <div className="meeting-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
          <div style={{ fontSize: '48px' }}>🔄</div>
          <div style={{ fontSize: '20px', color: '#5f6368' }}>미팅에 참가하는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 화면
  if (error) {
    return (
      <div className="meeting-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
          <div style={{ fontSize: '48px' }}>❌</div>
          <div style={{ fontSize: '20px', color: '#d93025' }}>{error}</div>
          <button onClick={() => navigate('/')} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="meeting-container">
      {/* Header */}
      <header className="meeting-header">
        <div className="meeting-info">
          <span className="meeting-time">회의 중</span>
          <span className="meeting-divider">|</span>
          <span className="meeting-code">{roomId}</span>
        </div>
        <div className="meeting-actions">
          <button className="header-btn" onClick={copyMeetingLink} title="회의 정보">
            ⓘ
          </button>
        </div>
      </header>

      {/* Main Video Area */}
      <main className="meeting-main">
        <VideoGrid
          localStream={localStream}
          localUserName="나"
          participants={participants}
          isLocalAudioEnabled={isAudioEnabled}
          isLocalVideoEnabled={isVideoEnabled}
        />
      </main>

      {/* Controls Footer */}
      <footer className="meeting-footer">
        <div className="footer-left">
          <span className="meeting-code-small">{roomId}</span>
        </div>

        <div className="meeting-controls">
          <button
            className={`control-btn ${!isAudioEnabled ? 'muted' : ''}`}
            onClick={handleToggleMute}
            title={isAudioEnabled ? '음소거' : '음소거 해제'}
          >
            <span className="control-icon">{isAudioEnabled ? '🎤' : '🔇'}</span>
          </button>

          <button
            className={`control-btn ${!isVideoEnabled ? 'video-off' : ''}`}
            onClick={handleToggleVideo}
            title={isVideoEnabled ? '카메라 끄기' : '카메라 켜기'}
          >
            <span className="control-icon">{isVideoEnabled ? '📷' : '📹'}</span>
          </button>

          <button
            className="control-btn leave"
            onClick={handleLeaveMeeting}
            title="회의 나가기"
          >
            <span className="control-icon">📞</span>
          </button>
        </div>

        <div className="footer-right">
          <button className="icon-btn" title="더보기">
            ⋯
          </button>
        </div>
      </footer>
    </div>
  );
}

export default Meeting;
