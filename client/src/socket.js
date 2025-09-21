import { io } from 'socket.io-client';

// @ts-ignore
const URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(URL, {
  autoConnect: true
});