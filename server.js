const WebSocket = require('ws');

// Cria um novo servidor WebSocket na porta 8080
const wss = new WebSocket.Server({ port: 8080 });

// Contador para IDs de usuário únicos
let userCounter = 0;

/**
 * Transmite uma mensagem para todos os clientes conectados.
 * @param {object} data O objeto de dados a ser transmitido.
 */
function broadcast(data) {
    const message = JSON.stringify(data);
    console.log("Transmitindo mensagem:", message);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

console.log('Servidor de chat WebSocket rodando na porta 8080...');

wss.on('connection', ws => {
    userCounter++;
    ws.userId = `Usuário-${userCounter}`;
    console.log(`Novo cliente conectado: ${ws.userId}`);

    // Notifica a todos sobre o novo usuário
    broadcast({
        type: 'notification',
        text: `${ws.userId} entrou no chat.`
    });

    ws.on('message', message => {
        const messageString = message.toString();
        console.log(`Mensagem recebida de ${ws.userId}: ${messageString}`);
        // Transmite a mensagem com informações do remetente
        broadcast({
            type: 'message',
            sender: ws.userId,
            text: messageString
        });
    });

    ws.on('close', () => {
        console.log(`Cliente desconectado: ${ws.userId}`);
        // Notifica a todos que o usuário saiu
        broadcast({
            type: 'notification',
            text: `${ws.userId} saiu do chat.`
        });
    });
});