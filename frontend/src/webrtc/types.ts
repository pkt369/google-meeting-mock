export interface RoomParticipant {
  socketId: string;
  userName: string;
}

export interface IceServersResponse {
  iceServers: RTCIceServer[];
}

export interface UserJoinedPayload {
  socketId: string;
  userName: string;
}

export interface UserLeftPayload {
  socketId: string;
  userName: string;
}

export interface OfferPayload {
  fromSocketId: string;
  offer: RTCSessionDescriptionInit;
}

export interface AnswerPayload {
  fromSocketId: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidatePayload {
  fromSocketId: string;
  candidate: RTCIceCandidateInit;
}

export interface JoinRoomData {
  roomId: string;
  userName: string;
}

export interface SendOfferData {
  targetSocketId: string;
  offer: RTCSessionDescriptionInit;
}

export interface SendAnswerData {
  targetSocketId: string;
  answer: RTCSessionDescriptionInit;
}

export interface SendIceCandidateData {
  targetSocketId: string;
  candidate: RTCIceCandidateInit;
}

export interface Participant {
  socketId: string;
  userName: string;
  stream?: MediaStream;
}
