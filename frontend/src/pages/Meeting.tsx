import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Meeting.css';

function Meeting() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    console.log('Joined room:', roomId);
    // TODO: WebRTC 연결 로직 구현

    return () => {
      // TODO: 연결 종료 로직
      console.log('Left room:', roomId);
    };
  }, [roomId, navigate]);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // TODO: 실제 오디오 뮤트 처리
  };

  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // TODO: 실제 비디오 on/off 처리
  };

  const handleLeaveMeeting = () => {
    if (window.confirm('회의에서 나가시겠습니까?')) {
      // TODO: 연결 종료 처리
      navigate('/');
    }
  };

  const copyMeetingLink = () => {
    const meetingLink = `${window.location.origin}/meeting/${roomId}`;
    navigator.clipboard.writeText(meetingLink);
    alert('회의 링크가 클립보드에 복사되었습니다!');
  };

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
        <div className="video-grid">
          {/* Local Video */}
          <div className="video-wrapper">
            <div className="video-content">
              {isVideoOff ? (
                <div className="video-off">
                  <div className="avatar-large">나</div>
                </div>
              ) : (
                <div className="video-placeholder">
                  <div className="avatar-large">나</div>
                </div>
              )}
            </div>
            <div className="video-overlay">
              <span className="participant-name">나</span>
              {isMuted && <span className="muted-indicator">🔇</span>}
            </div>
          </div>

          {/* Placeholder for remote participants */}
          <div className="video-wrapper">
            <div className="video-content">
              <div className="video-placeholder empty">
                <div className="empty-state">
                  <p>참가자를 기다리는 중...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Controls Footer */}
      <footer className="meeting-footer">
        <div className="footer-left">
          <span className="meeting-code-small">{roomId}</span>
        </div>

        <div className="meeting-controls">
          <button
            className={`control-btn ${isMuted ? 'muted' : ''}`}
            onClick={handleToggleMute}
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            <span className="control-icon">{isMuted ? '🔇' : '🎤'}</span>
          </button>

          <button
            className={`control-btn ${isVideoOff ? 'video-off' : ''}`}
            onClick={handleToggleVideo}
            title={isVideoOff ? '카메라 켜기' : '카메라 끄기'}
          >
            <span className="control-icon">{isVideoOff ? '📹' : '📷'}</span>
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
