import { io } from 'socket.io-client';

// In production (nginx), connect to same host. In dev, connect to backend directly.
const URL = import.meta.env.DEV ? 'http://localhost:3001' : '/';
const socket = io(URL, { autoConnect: false });

export default socket;
