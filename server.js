import { createServer } from 'node:http';
import express from 'express';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);

// Força WebSocket puro para evitar problemas de sticky-session do HTTP polling na Vercel
const io = new Server(server, {
  transports: ['websocket']
});

app.use(express.json());
app.use(express.static('public'));

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    clientesConectados: io.engine.clientsCount,
    timestamp: new Date().toISOString()
  });
});

io.on('connection', (socket) => {
  const userId = `User-${socket.id.slice(0, 4)}`;

  // Avisa apenas quem acabou de entrar
  socket.emit('system', `Conectado como ${userId}`);

  // Escuta evento customizado 'chat-message'
  socket.on('chat-message', (text) => {
    io.emit('chat-message', {
      sender: userId,
      text,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
  });
});

if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

export default server;
