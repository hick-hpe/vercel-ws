import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

const io = new Server(server, {
  transports: ['websocket']
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Entrega o index.html explicitamente na raiz /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    clientesConectados: io.engine.clientsCount,
    timestamp: new Date().toISOString()
  });
});

io.on('connection', (socket) => {
  const userId = `User-${socket.id.slice(0, 4)}`;
  socket.emit('system', `Conectado como ${userId}`);

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
