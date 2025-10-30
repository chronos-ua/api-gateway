# API Gateway

A modern Nest.js TypeScript API Gateway with HTTPS, WebSockets, Socket.IO, and Passport.js authentication (JWT + Google OAuth).

## Features

- 🔒 **HTTPS Support** - Secure connections with SSL/TLS
- 📡 **WebSocket & Socket.IO** - Real-time bidirectional communication
- 🔐 **JWT Authentication** - Stateless token-based authentication
- 🌐 **Google OAuth 2.0** - Social authentication integration
- 🛡️ **Passport.js** - Comprehensive authentication middleware
- 📝 **TypeScript** - Full type safety
- 🏗️ **Nest.js Framework** - Enterprise-grade Node.js framework

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenSSL (for certificate generation)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd api-gateway
```

2. Install dependencies:
```bash
npm install
```

3. Generate SSL certificates for HTTPS (development):
```bash
./generate-certs.sh
```

4. Create environment configuration:
```bash
cp .env.example .env
```

5. Configure your `.env` file with the required values:
   - Set a strong `JWT_SECRET`
   - Add your Google OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
   - Adjust ports and URLs as needed

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

## API Endpoints

### Health Check
- `GET /health` - Check API status

### Authentication

#### Local Login
- `POST /auth/login` - Login with email/password
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

#### Google OAuth
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/me` - Get current user profile (requires JWT)

#### Profile
- `GET /profile` - Get user profile (requires JWT authentication)

## WebSocket Events

Connect to the WebSocket server using Socket.IO client:

```javascript
import io from 'socket.io-client';

const socket = io('https://localhost:3443', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Events
socket.on('connect', () => console.log('Connected'));
socket.emit('message', { message: 'Hello!' });
socket.emit('ping');
socket.emit('joinRoom', { room: 'lobby' });
socket.emit('leaveRoom', { room: 'lobby' });
socket.emit('privateMessage', { to: 'user@example.com', message: 'Hi!' });
```

### WebSocket Events List

- `message` - Send a message to all connected clients (requires authentication)
- `privateMessage` - Send a private message (requires authentication)
- `ping` - Health check (no authentication required)
- `joinRoom` - Join a specific room (requires authentication)
- `leaveRoom` - Leave a room (requires authentication)

## Authentication Flow

### JWT Authentication
1. Login via `/auth/login` or `/auth/google`
2. Receive `access_token` in response
3. Include token in subsequent requests:
   - HTTP: `Authorization: Bearer <token>`
   - WebSocket: `auth: { token: '<token>' }`

### Google OAuth Flow
1. Navigate to `/auth/google`
2. Complete Google authentication
3. Redirect to callback with JWT token
4. Use token for authenticated requests

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Linting & Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
api-gateway/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── strategies/       # Passport strategies (JWT, Google)
│   │   ├── guards/           # Auth guards
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── events/               # WebSocket/Socket.IO module
│   │   ├── guards/           # WebSocket guards
│   │   ├── events.gateway.ts
│   │   └── events.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── app.module.ts
│   └── main.ts              # Application entry point
├── test/                     # Test files
├── certs/                    # SSL certificates
├── .env.example             # Environment template
├── package.json
└── README.md
```

## Security Considerations

- Change `JWT_SECRET` in production to a strong, random value
- Use proper SSL certificates in production (not self-signed)
- Store sensitive credentials in environment variables
- Implement rate limiting for authentication endpoints
- Use HTTPS in production
- Validate and sanitize all user inputs
- Implement proper session management

## Configuration

All configuration is managed through environment variables. See `.env.example` for available options:

- `PORT` - HTTP/HTTPS port (default: 3000)
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRATION` - Token expiration time (default: 24h)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - OAuth callback URL
- `SSL_KEY_PATH` - Path to SSL private key
- `SSL_CERT_PATH` - Path to SSL certificate
- `CORS_ORIGIN` - Allowed CORS origins

## License

MIT