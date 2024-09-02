require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const startggURL = "https://api.start.gg/gql/alpha";
const starggKey = process.env.REACT_APP_STARTGG_API_KEY;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  getEventResults: async function (eventId) {
    let numEntrants = 0;
    let numEntrantsFound = 0;
    let pageNumber = 1;

    // Primera solicitud para obtener el número total de participantes
    try {
      const response = await fetch(startggURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + starggKey
        },
        body: JSON.stringify({
          query: `query EventSets($eventId: ID!) { 
              event(id: $eventId) {
                  sets(page: 1, perPage: 1) {
                      pageInfo { total }
                  }
              }
          }`,
          variables: {
            eventId: eventId
          },
        })
      });

      const data = await response.json();
      console.log('Respuesta de la API para EventSets:', data);

      // Verifica la estructura de la respuesta
      if (data.data && data.data.event && data.data.event.sets && data.data.event.sets.pageInfo) {
        numEntrants = data.data.event.sets.pageInfo.total;
      } else {
        console.error('Datos de respuesta no esperados para EventSets:', data);
        throw new Error('Datos de respuesta no esperados para EventSets');
      }
    } catch (err) {
      console.error('Error al obtener sets del evento:', err);
      throw err;
    }

    await delay(1000);

    // Bucle para obtener los resultados del evento
    while (numEntrantsFound < numEntrants) {
      try {
        const response = await fetch(startggURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + starggKey
          },
          body: JSON.stringify({
            query: `query EventStandings($eventId: ID!, $page: Int!, $perPage: Int!) { 
                event(id: $eventId) {
                    standings(page: $page, perPage: $perPage) {
                        nodes {
                            placement
                            entrant { name }
                        }
                    }
                }
            }`,
            variables: {
              eventId: eventId,
              page: pageNumber,
              perPage: 50
            },
          })
        });

        const data = await response.json();
        console.log('Respuesta de la API para EventStandings:', data);

        // Verifica la estructura de la respuesta
        if (data.data && data.data.event && data.data.event.standings && data.data.event.standings.nodes) {
          let nodes = data.data.event.standings.nodes;
          if (nodes.length === 0) {
            console.log('No se encontraron más resultados.');
            break; // Salir del bucle si no hay más resultados
          }
          nodes.forEach(node => {
            console.log(`${node.entrant.name} placed ${node.placement}`);
          });
          numEntrantsFound += nodes.length;
        } else {
          console.error('Datos de respuesta no esperados para EventStandings:', data);
          throw new Error('Datos de respuesta no esperados para EventStandings');
        }
      } catch (err) {
        console.error('Error al obtener las posiciones del evento:', err);
        break; // Salir del bucle en caso de error
      }

      pageNumber += 1;
      await delay(1000);
    }
  }
}
