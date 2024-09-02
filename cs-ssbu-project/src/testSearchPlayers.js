const { searchPlayersByName } = require('./getPlayerByName');

(async () => {
  const playerName = 'Alpuq'; // Nombre del jugador a buscar
  try {
    const players = await searchPlayersByName(playerName);
    console.log('Jugadores encontrados:', players);
  } catch (err) {
    console.error('Error al buscar jugadores:', err);
  }
})();
