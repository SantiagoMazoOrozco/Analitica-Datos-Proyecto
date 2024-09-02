const getPlayerIdByUsername = async (username) => {
    try {
      const response = await fetch(startggURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + starggKey,
        },
        body: JSON.stringify({
          query: `query PlayerSearch($username: String!) {
            players(query: $username) {
              nodes {
                id
                name
              }
            }
          }`,
          variables: { username: username },
        }),
      });
  
      const data = await response.json();
      console.log('Respuesta de la API para PlayerSearch:', JSON.stringify(data, null, 2));
  
      if (data.data && data.data.players && data.data.players.nodes.length > 0) {
        return data.data.players.nodes[0].id; // Obtén el primer ID si hay múltiples resultados
      } else {
        console.error('No se encontró el jugador:', JSON.stringify(data, null, 2));
        return null;
      }
    } catch (err) {
      console.error('Error al obtener el ID del jugador:', err);
      return null;
    }
  };
  