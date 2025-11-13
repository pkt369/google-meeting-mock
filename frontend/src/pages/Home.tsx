import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [meetingCode, setMeetingCode] = useState('');
  const navigate = useNavigate();

  const handleCreateMeeting = () => {
    // 랜덤한 회의 코드 생성 (예: abc-defg-hij)
    const code = generateMeetingCode();
    navigate(`/meeting/${code}`);
  };

  const handleJoinMeeting = () => {
    if (meetingCode.trim()) {
      navigate(`/meeting/${meetingCode.trim()}`);
    }
  };

  const generateMeetingCode = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const segments = 3;
    const segmentLength = 4;

    const code = Array.from({ length: segments }, () => {
      return Array.from({ length: segmentLength }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
    }).join('-');

    return code;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && meetingCode.trim()) {
      handleJoinMeeting();
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logo">Meet</div>
      </header>

      <div className="home-content">
        <div className="content-left">
          <h1 className="home-title">화상 회의를 위한 안전한 공간</h1>
          <p className="home-description">
            Meet을 사용하여 언제 어디서나 연결하세요
          </p>

          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleCreateMeeting}>
              <span className="icon">📹</span>
              새 회의 시작하기
            </button>

            <div className="join-section">
              <input
                type="text"
                className="meeting-input"
                placeholder="코드 또는 링크 입력"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                className="btn btn-text"
                onClick={handleJoinMeeting}
                disabled={!meetingCode.trim()}
              >
                참가하기
              </button>
            </div>
          </div>

          <div className="divider"></div>

          <p className="learn-more">
            <a href="#" onClick={(e) => e.preventDefault()}>Meet에 대해 자세히 알아보기</a>
          </p>
        </div>

        <div className="content-right">
          <div className="illustration">
            <div className="meeting-preview">
              <div className="preview-screen">
                <div className="preview-avatar">👤</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
