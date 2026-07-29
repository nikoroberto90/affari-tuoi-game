const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Diciamo ad Express di usare la cartella 'public' per i file HTML/CSS/JS
app.use(express.static(path.join(__dirname, 'public')));

// I premi classici di Affari Tuoi
const premiBase = [
    0, 1, 5, 10, 20, 50, 100, 200, 500, 1000,
    5000, 10000, 15000, 20000, 30000, 50000, 75000, 100000, 200000, 300000
];

let pacchiGioco = [];

// Funzione per mescolare i premi
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

// Gestione delle connessioni in tempo reale
io.on('connection', (socket) => {
    console.log('Un dispositivo si è connesso');

    // Invia lo stato attuale dei pacchi a chi si connette (utile per la Regia)
    socket.emit('stato-pacchi', pacchiGioco);

    // Quando la Regia chiede di aprire un pacco
    socket.on('comando-apri-pacco', (numeroPacco) => {
        const pacco = pacchiGioco.find(p => p.numeroPacco === numeroPacco);
        if (pacco && !pacco.aperto) {
            pacco.aperto = true;
            // Invia il comando al Display per mostrare l'animazione
            io.emit('display-apri-pacco', pacco);
            // Aggiorna la Regia
            io.emit('stato-pacchi', pacchiGioco);
        }
    });

    // Quando la Regia invia un'offerta del Dottore
    socket.on('comando-offerta', (cifra) => {
        io.emit('display-mostra-offerta', cifra);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server attivo!`);
    console.log(`- Schermo Display: http://localhost:${PORT}/display.html`);
    console.log(`- Regia Mobile: http://localhost:${PORT}/regia.html`);
});