import { useEffect, useRef } from 'react';

interface VideoTileProps {
  stream?: MediaStream;
  name: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isLocal?: boolean;
}

export function VideoTile({ stream, name, isMuted, isVideoOff, isLocal }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="video-wrapper">
      <div className="video-content">
        {!stream || isVideoOff ? (
          <div className="video-off">
            <div className="avatar-large">{name.charAt(0).toUpperCase()}</div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal} // 로컬 비디오는 항상 mute
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>
      <div className="video-overlay">
        <span className="participant-name">{name}</span>
        {isMuted && <span className="muted-indicator">🔇</span>}
      </div>
    </div>
  );
}
