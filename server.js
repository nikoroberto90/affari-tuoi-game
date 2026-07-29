const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public'))); // Assicurati che i file html siano nella cartella public!

const premiBase = [
    0, 1, 5, 10, 20, 50, 100, 200, 500, 1000,
    5000, 10000, 15000, 20000, 30000, 50000, 75000, 100000, 200000, 300000
];

let pacchiGioco = [];

function avviaNuovaPartita() {
    let premiMescolati = [...premiBase].sort(() => Math.random() - 0.5);
    pacchiGioco = premiMescolati.map((premio, index) => ({
        numeroPacco: index + 1,
        valore: premio,
        aperto: false
    }));
    console.log("Nuova partita avviata. Pacchi mescolati!");
}

avviaNuovaPartita();

io.on('connection', (socket) => {
    // Invia stato iniziale
    socket.emit('stato-pacchi', pacchiGioco);

    socket.on('comando-apri-pacco', (numeroPacco) => {
        const pacco = pacchiGioco.find(p => p.numeroPacco === numeroPacco);
        if (pacco && !pacco.aperto) {
            pacco.aperto = true;
            io.emit('display-apri-pacco', pacco);
            io.emit('stato-pacchi', pacchiGioco); // Aggiorna regia
        }
    });

    socket.on('comando-offerta', (cifra) => io.emit('display-mostra-offerta', cifra));
    socket.on('comando-nascondi-offerta', () => io.emit('display-nascondi-offerta'));
    
    // Novità: Gestione Audio
    socket.on('comando-audio', (tipo) => io.emit('play-audio', tipo));

    // Novità: Reset partita
    socket.on('comando-nuova-partita', () => {
        avviaNuovaPartita();
        io.emit('stato-pacchi', pacchiGioco); // Forza reset grafico display e regia
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server attivo sulla porta ${PORT}`);
});