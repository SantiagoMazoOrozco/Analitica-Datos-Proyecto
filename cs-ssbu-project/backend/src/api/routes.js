const express = require('express');
const router = express.Router();
const { getEventId } = require('./getEventId');  // Importar la función

// Ruta para obtener el ID del evento
router.get('/eventId', async (req, res) => {
  const { tournamentName, eventName } = req.query;
  try {
    const eventId = await getEventId(tournamentName, eventName);
    res.json({ eventId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
