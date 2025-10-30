import { Controller, Get, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    // IMPORTANT: This is a demo implementation
    // In production, you must:
    // 1. Query your database for the user by email
    // 2. Verify the password hash using bcrypt.compare()
    // 3. Return proper error messages for invalid credentials
    // 4. Implement rate limiting to prevent brute force attacks
    // 5. Consider adding 2FA for enhanced security

    if (!body.email || !body.password) {
      return { error: 'Email and password are required' };
    }

    // Demo user - replace with real database query
    const user = {
      id: Date.now().toString(),
      email: body.email,
      name: body.email.split('@')[0],
      provider: 'local',
    };
    return this.authService.login(user);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Request() req) {
    return this.authService.googleLogin(req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('status')
  getStatus() {
    return {
      message: 'Auth service is running',
      endpoints: {
        login: 'POST /auth/login',
        google: 'GET /auth/google',
        googleCallback: 'GET /auth/google/callback',
        me: 'GET /auth/me (requires JWT)',
      },
    };
  }
}
