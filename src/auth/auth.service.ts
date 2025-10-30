import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  provider?: string;
}

@Injectable()
export class AuthService {
  // IMPORTANT: In-memory user store is for DEMO purposes only
  // In production, you MUST replace this with a proper database solution:
  // - Use PostgreSQL, MongoDB, MySQL, or another database
  // - Implement proper user repositories with TypeORM, Prisma, or Mongoose
  // - Store password hashes, not plain passwords
  // - Implement proper session management
  // - Consider distributed caching (Redis) for multi-instance deployments
  private users: Map<string, User> = new Map();

  constructor(private jwtService: JwtService) {}

  async validateUser(email: string): Promise<any> {
    // This is a simple example - in production, query database
    const user = Array.from(this.users.values()).find((u) => u.email === email);
    if (user) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      email: user.email,
      sub: user.id,
      name: user.name,
      provider: user.provider || 'local',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    };
  }

  async googleLogin(req: any) {
    if (!req.user) {
      return { message: 'No user from google' };
    }

    const user: User = {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
      provider: 'google',
    };

    // Store or update user in database
    this.users.set(user.id, user);

    return this.login(user);
  }

  async validateToken(payload: any): Promise<User> {
    // In production, validate against database
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      provider: payload.provider,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
