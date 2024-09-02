import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Page4 = () => {
  const [playerId, setPlayerId] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startggURL = "https://api.start.gg/gql/alpha";
  const starggKey = process.env.REACT_APP_STARTGG_API_KEY;

  const getPlayerDetails = async (playerId) => {
    try {
      const response = await fetch(startggURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + starggKey,
        },
        body: JSON.stringify({
          query: `
            query PlayerDetails($playerId: ID!) {
              player(id: $playerId) {
                id
                name
                gamerTag
                country {
                  name
                }
                events {
                  nodes {
                    id
                    name
                  }
                }
              }
            }
          `,
          variables: { playerId },
        }),
      });

      const data = await response.json();
      console.log('Respuesta de la API para PlayerDetails:', JSON.stringify(data, null, 2));

      if (data.data && data.data.player) {
        setPlayerData(data.data.player);
      } else {
        console.error('No se encontró el jugador:', JSON.stringify(data, null, 2));
        setError('No se encontró el jugador');
      }
    } catch (err) {
      console.error('Error al obtener detalles del jugador:', err);
      setError('Error al obtener detalles del jugador');
    }
  };

  const handleGetPlayerDetails = async () => {
    setLoading(true);
    setError(null);
    setPlayerData(null);
    
    await getPlayerDetails(playerId);
    
    setLoading(false);
  };

  return (
    <motion.div className="container mt-5">
      <motion.h1 className="text-center mt-5">
        Obtener Detalles del Jugador
      </motion.h1>
      <motion.div className="mb-3">
        <input
          type="text"
          className="form-control"
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          placeholder="Ingrese el ID del Jugador"
        />
      </motion.div>
      <motion.button
        className="btn btn-primary"
        onClick={handleGetPlayerDetails}
        disabled={loading}
      >
        {loading ? 'Cargando...' : 'Obtener Detalles'}
      </motion.button>
      {error && (
        <motion.div className="mt-3 text-danger">
          {error}
        </motion.div>
      )}
      {playerData && (
        <motion.div className="mt-3">
          <h2>Detalles del Jugador</h2>
          <p><strong>Nombre:</strong> {playerData.name}</p>
          <p><strong>Gamer Tag:</strong> {playerData.gamerTag}</p>
          <p><strong>País:</strong> {playerData.country.name}</p>
          <h3>Eventos Participados:</h3>
          <ul>
            {playerData.events.nodes.map((event, index) => (
              <li key={index}>{event.name}</li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Page4;
