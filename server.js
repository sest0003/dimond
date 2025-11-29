const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'character-selection.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

app.listen(PORT, () => {
    console.log(`Diamond Pacman server körs på port ${PORT}`);
    console.log(`Öppna http://localhost:${PORT} för att spela`);
});
