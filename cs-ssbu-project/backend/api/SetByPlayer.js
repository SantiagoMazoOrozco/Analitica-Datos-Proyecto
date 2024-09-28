const SetByPlayer = (req, res) => {
    const playerId = req.params.id;
    // Lógica para obtener las partidas del jugador (consulta a una API, por ejemplo)
    res.json({ message: `Player ID: ${playerId}` });
  };
  
  module.exports = { SetByPlayer };