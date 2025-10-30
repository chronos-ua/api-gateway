import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  afterInit() {
    console.log('✅ WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake auth or query
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (token) {
        const payload = this.jwtService.verify(token);
        client.data.user = payload;
        console.log(`✅ Client connected: ${client.id} (User: ${payload.email})`);
      } else {
        console.log(`⚠️  Client connected without authentication: ${client.id}`);
      }
    } catch (error) {
      console.log(`❌ Client connection failed: ${client.id}`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    console.log(`❌ Client disconnected: ${client.id}${user ? ` (User: ${user.email})` : ''}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: { message: string }, @ConnectedSocket() client: Socket): any {
    const user = client.data.user;
    console.log(`📨 Message from ${user?.email || 'anonymous'}: ${data.message}`);

    // Broadcast to all clients
    this.server.emit('message', {
      user: user?.email || 'anonymous',
      message: data.message,
      timestamp: new Date().toISOString(),
    });

    return {
      event: 'message',
      data: {
        status: 'received',
        echo: data.message,
      },
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('privateMessage')
  handlePrivateMessage(
    @MessageBody() data: { to: string; message: string },
    @ConnectedSocket() client: Socket,
  ): any {
    const user = client.data.user;
    console.log(`📨 Private message from ${user?.email}: ${data.message}`);

    return {
      event: 'privateMessage',
      data: {
        status: 'sent',
        from: user?.email,
        to: data.to,
        message: data.message,
      },
    };
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): any {
    return {
      event: 'pong',
      data: {
        timestamp: new Date().toISOString(),
        clientId: client.id,
      },
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket): any {
    const user = client.data.user;
    client.join(data.room);
    console.log(`📍 User ${user?.email} joined room: ${data.room}`);

    this.server.to(data.room).emit('userJoined', {
      user: user?.email,
      room: data.room,
      timestamp: new Date().toISOString(),
    });

    return {
      event: 'joinedRoom',
      data: {
        room: data.room,
        status: 'success',
      },
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket): any {
    const user = client.data.user;
    client.leave(data.room);
    console.log(`📍 User ${user?.email} left room: ${data.room}`);

    this.server.to(data.room).emit('userLeft', {
      user: user?.email,
      room: data.room,
      timestamp: new Date().toISOString(),
    });

    return {
      event: 'leftRoom',
      data: {
        room: data.room,
        status: 'success',
      },
    };
  }
}
