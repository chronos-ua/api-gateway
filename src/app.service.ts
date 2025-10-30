import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'API Gateway is running! Use /auth endpoints for authentication and connect to WebSocket for real-time features.';
  }
}
