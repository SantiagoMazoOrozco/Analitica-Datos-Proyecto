require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const startggURL = "https://api.start.gg/gql/alpha";
const starggKey = process.env.REACT_APP_STARTGG_API_KEY;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const getSetsByPlayer = async function (playerId, limit) {
  let sets = [];
  let pageNumber = 1;
  let totalSets = 0;

  const processNodes = (nodes) => {
    nodes.forEach(node => {
      if (totalSets < limit) {
        sets.push(node);
        totalSets++;
        console.log(`Set ID: ${node.id}, Display Score: ${node.displayScore}, Event Name: ${node.event.name}, Tournament Name: ${node.event.tournament.name}`);
      }
    });
  };

  // Bucle para obtener los sets del jugador
  while (true) {
    try {
      const response = await fetch(startggURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + starggKey
        },
        body: JSON.stringify({
          query: `query PlayerSets($playerId: ID!, $page: Int!, $perPage: Int!) { 
              player(id: $playerId) {
                  id
                  sets(perPage: $perPage, page: $page) {
                      nodes {
                          id
                          displayScore
                          event {
                              id
                              name
                              tournament {
                                  id
                                  name
                              }
                          }
                      }
                  }
              }
          }`,
          variables: {
            playerId: playerId,
            page: pageNumber,
            perPage: 5
          },
        })
      });

      const data = await response.json();
      console.log('Respuesta de la API para PlayerSets:', data);

      // Verifica si hay errores en la respuesta
      if (data.errors) {
        console.error('Errores de la API:', data.errors);
        throw new Error('Errores en la respuesta de la API');
      }

      // Verifica la estructura de la respuesta
      if (data.data && data.data.player && data.data.player.sets && data.data.player.sets.nodes) {
        let nodes = data.data.player.sets.nodes;
        if (nodes.length === 0) {
          console.log('No se encontraron más sets.');
          break; // Salir del bucle si no hay más sets
        }
        processNodes(nodes);
        if (totalSets >= limit) {
          break; // Salir del bucle si se ha alcanzado el límite
        }
      } else {
        console.error('Datos de respuesta no esperados para PlayerSets:', data);
        throw new Error('Datos de respuesta no esperados para PlayerSets');
      }
    } catch (err) {
      console.error('Error al obtener los sets del jugador:', err);
      break; // Salir del bucle en caso de error
    }

    pageNumber += 1;
    await delay(1000);
  }

  return sets;
}

module.exports = { getSetsByPlayer };