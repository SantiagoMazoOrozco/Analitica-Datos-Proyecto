// src/checkEventRegistrations.js
import fetch from 'node-fetch'; // Asegúrate de que node-fetch esté instalado en tu proyecto

const startggURL = "https://api.start.gg/gql/alpha";
const starggKey = process.env.REACT_APP_STARTGG_API_KEY;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const getEventRegistrations = async (eventId) => {
  let numEntrants = 0;
  let numEntrantsFound = 0;
  let pageNumber = 1;
  let entrants = [];

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
        query: `query EventSets($eventId: ID!, $page: Int!, $perPage: Int!) { 
            event(id: $eventId) {
                sets(page: $page, perPage: $perPage, sortType: STANDARD) {
                    pageInfo { total }
                    nodes { id slots { entrant { name } } }
                }
            }
        }`,
        variables: {
          eventId: eventId,
          page: 1,
          perPage: 1
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
                  standings(query: { perPage: $perPage, page: $page }) {
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
          entrants.push(node.entrant.name);
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

  return entrants;
};
