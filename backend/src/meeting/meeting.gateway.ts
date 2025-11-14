import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RoomParticipant {
  socketId: string;
  userName: string;
}

interface JoinRoomDto {
  roomId: string;
  userName: string;
}

interface OfferDto {
  targetSocketId: string;
  offer: RTCSessionDescriptionInit;
}

interface AnswerDto {
  targetSocketId: string;
  answer: RTCSessionDescriptionInit;
}

interface IceCandidateDto {
  targetSocketId: string;
  candidate: RTCIceCandidateInit;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
@Injectable()
export class MeetingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MeetingGateway.name);
  private rooms: Map<string, RoomParticipant[]> = new Map();

  constructor(private configService: ConfigService) {}

  handleConnection(client: Socket) {
    this.logger.log(`User connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`User disconnected: ${client.id}`);

    // 모든 방에서 해당 소켓 제거
    this.rooms.forEach((participants, roomId) => {
      const index = participants.findIndex((p) => p.socketId === client.id);
      if (index !== -1) {
        const [removedParticipant] = participants.splice(index, 1);

        // 다른 참가자들에게 알림
        client.to(roomId).emit('user-left', {
          socketId: client.id,
          userName: removedParticipant.userName,
        });

        this.logger.log(`${removedParticipant.userName} left room ${roomId}`);

        // 방이 비었으면 삭제
        if (participants.length === 0) {
          this.rooms.delete(roomId);
          this.logger.log(`Room ${roomId} deleted (empty)`);
        }
      }
    });
  }

  @SubscribeMessage('get-ice-servers')
  handleGetIceServers(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} requesting ICE servers`);

    const stunServers = this.configService.get<string[]>('iceServers.stun');
    const turnServer = this.configService.get<any>('iceServers.turn');

    const iceServers: RTCIceServer[] = [
      ...stunServers.map((url) => ({ urls: url })),
    ];

    // TURN 서버가 설정되어 있으면 추가
    if (turnServer) {
      iceServers.push(turnServer);
    }

    return { iceServers };
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userName } = data;
    this.logger.log(`${userName} (${client.id}) joining room: ${roomId}`);

    // 방이 없으면 생성
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, []);
    }

    const room = this.rooms.get(roomId);

    // 방에 참가자 추가
    room.push({ socketId: client.id, userName });
    client.join(roomId);

    // 기존 참가자들에게 새 참가자 알림
    client.to(roomId).emit('user-joined', {
      socketId: client.id,
      userName,
    });

    // 새 참가자에게 기존 참가자 목록 전송
    const existingParticipants = room.filter((p) => p.socketId !== client.id);
    client.emit('existing-participants', existingParticipants);

    this.logger.log(
      `Room ${roomId} participants:`,
      room.map((p) => p.userName),
    );
  }

  @SubscribeMessage('offer')
  handleOffer(@MessageBody() data: OfferDto, @ConnectedSocket() client: Socket) {
    const { targetSocketId, offer } = data;
    this.logger.log(`Sending offer from ${client.id} to ${targetSocketId}`);

    this.server.to(targetSocketId).emit('offer', {
      fromSocketId: client.id,
      offer,
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody() data: AnswerDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { targetSocketId, answer } = data;
    this.logger.log(`Sending answer from ${client.id} to ${targetSocketId}`);

    this.server.to(targetSocketId).emit('answer', {
      fromSocketId: client.id,
      answer,
    });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody() data: IceCandidateDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { targetSocketId, candidate } = data;
    this.logger.log(`Sending ICE candidate from ${client.id} to ${targetSocketId}`);

    this.server.to(targetSocketId).emit('ice-candidate', {
      fromSocketId: client.id,
      candidate,
    });
  }
}
