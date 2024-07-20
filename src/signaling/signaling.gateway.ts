import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import { v4 as uuidv4} from 'uuid';


@WebSocketGateway()
export class SignalingGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createRoom')
  handleCreateRoom(@ConnectedSocket() client: Socket):void{
    const roomId = uuidv4();
    client.join(roomId)
    client.emit('roomCreated', {roomId})
  }

  @SubscribeMessage('join')
  handleMessage(@MessageBody() data:any, @ConnectedSocket() client: Socket): void {
    const roomId = data.roomId || uuidv4();
    client.join(roomId);
    client.emit('joined',{roomId});
  }

  @SubscribeMessage('signal')
  handleSignal(@MessageBody() data:any, @ConnectedSocket() client: Socket):void{
    const { roomId, signal} = data;
    client.to( roomId).emit('signal', signal);
  }
}
