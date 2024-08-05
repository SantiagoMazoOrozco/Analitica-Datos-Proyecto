const express = require('express');
const path = require('path');
const { getEventResults } = require('./getEventResults'); // Asegúrate de que esta ruta es correcta
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/results', async (req, res) => {
    const eventId = req.query.eventId;
    
    try {
        const results = await getEventResults(eventId);
        res.json({ results });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener resultados.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor en http://localhost:${port}`);
});
