import React, { useState } from 'react';
import axios from 'axios';

const Page4 = () => {
  const [playerName, setPlayerName] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      const response = await axios.post('https://api.start.gg/graphql/alpha', {
        query: `
          query GetPlayerByName($playerName: String!) {
            player(slug: $playerName) {
              id
              tag
              team {
                id
                name
              }
            }
          }
        `,
        variables: { playerName }
      });

      if (response.data.data.player) {
        setPlayerData(response.data.data.player);
        setError('');
      } else {
        setPlayerData(null);
        setError('Jugador no encontrado.');
      }
    } catch (err) {
      setError('Error al buscar el jugador.');
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Buscar Jugador</h1>
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Nombre del Jugador"
      />
      <button onClick={handleSearch}>Buscar</button>
      {error && <p>{error}</p>}
      {playerData && (
        <div>
          <h2>Detalles del Jugador</h2>
          <p>ID: {playerData.id}</p>
          <p>Tag: {playerData.tag}</p>
          <p>Equipo: {playerData.team?.name || 'Sin equipo'}</p>
        </div>
      )}
    </div>
  );
};

export default Page4;
