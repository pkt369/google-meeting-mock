export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  iceServers: {
    stun: [
      process.env.STUN_SERVER_URL || 'stun:stun.l.google.com:19302',
      process.env.STUN_SERVER_URL_2 || 'stun:stun1.l.google.com:19302',
    ],
    turn: process.env.TURN_SERVER_URL
      ? {
          urls: process.env.TURN_SERVER_URL,
          username: process.env.TURN_USERNAME,
          credential: process.env.TURN_PASSWORD,
        }
      : null,
  },
});
