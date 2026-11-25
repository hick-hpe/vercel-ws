import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

// A Vercel injeta a variável PORT automaticamente (padrão 80 nos containers)
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        const html = fs.readFileSync('./index.html');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    ws.send('Conectado ao container na Vercel!');

    ws.on('message', (data) => {
        const texto = data.toString();
        // Devolve a mensagem para todos os clientes conectados nesta instância
        wss.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(`Eco do servidor: ${texto}`);
            }
        });
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
});
