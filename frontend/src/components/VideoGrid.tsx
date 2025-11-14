import { VideoTile } from './VideoTile';
import type { Participant } from '../webrtc/types';

interface VideoGridProps {
  localStream?: MediaStream;
  localUserName: string;
  participants: Participant[];
  isLocalAudioEnabled: boolean;
  isLocalVideoEnabled: boolean;
}

export function VideoGrid({
  localStream,
  localUserName,
  participants,
  isLocalAudioEnabled,
  isLocalVideoEnabled,
}: VideoGridProps) {
  return (
    <div className="video-grid">
      {/* Local Video */}
      <VideoTile
        stream={localStream}
        name={localUserName}
        isMuted={!isLocalAudioEnabled}
        isVideoOff={!isLocalVideoEnabled}
        isLocal={true}
      />

      {/* Remote Participants */}
      {participants.map((participant) => (
        <VideoTile
          key={participant.socketId}
          stream={participant.stream}
          name={participant.userName}
          isLocal={false}
        />
      ))}

      {/* Empty State */}
      {participants.length === 0 && (
        <div className="video-wrapper">
          <div className="video-content">
            <div className="video-placeholder empty">
              <div className="empty-state">
                <p>참가자를 기다리는 중...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
