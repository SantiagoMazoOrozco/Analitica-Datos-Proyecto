import axios from 'axios';

// Asegúrate de que la variable de entorno esté definida
const startggURL = "https://api.start.gg/gql/alpha";
const starggKey = "204bdde1bb958e691497fa76febad15d";

if (!starggKey) {
  throw new Error('La clave de la API de Start.gg no está definida. Asegúrate de que REACT_APP_STARTGG_API_KEY esté configurada en tu archivo .env.');
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const getEventDetails = async (eventId) => {
  try {
    const response = await axios.post(startggURL, {
      query: `
        query EventDetails($eventId: ID!) { 
          event(id: $eventId) {
            name
            startAt
          }
        }
      `,
      variables: {
        eventId: eventId
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${starggKey}`
      }
    });

    const data = response.data;
    console.log('Respuesta de la API para EventDetails:', data);

    if (data.errors) {
      console.error('Errores en la respuesta de la API para EventDetails:', data.errors);
      console.error('Detalles del error:', data.errors[0]);
      throw new Error('Error en la respuesta de la API para EventDetails');
    }

    if (data.data && data.data.event) {
      return {
        name: data.data.event.name,
        date: new Date(data.data.event.startAt * 1000).toLocaleDateString(),
        location: 'Ubicación no disponible' // Ajuste para manejar la ausencia de venueAddress
      };
    } else {
      console.error('Datos de respuesta no esperados para EventDetails:', data);
      throw new Error('Datos de respuesta no esperados para EventDetails');
    }
  } catch (err) {
    console.error('Error al obtener detalles del evento:', err);
    throw err;
  }
};

export const getEventResults = async (eventId) => {
  let numEntrants = 0;
  let numEntrantsFound = 0;
  let pageNumber = 1;
  let results = [];

  // Primera solicitud para obtener el número total de participantes
  try {
    const response = await axios.post(startggURL, {
      query: `
        query EventSets($eventId: ID!) { 
          event(id: $eventId) {
            sets(sortType: STANDARD) {
              pageInfo { total }
            }
          }
        }
      `,
      variables: {
        eventId: eventId
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${starggKey}`
      }
    });

    const data = response.data;
    console.log('Respuesta de la API para EventSets:', data);

    if (data.errors) {
      console.error('Errores en la respuesta de la API para EventSets:', data.errors);
      console.error('Detalles del error:', data.errors[0]);
      throw new Error('Error en la respuesta de la API para EventSets');
    }

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
      const response = await axios.post(startggURL, {
        query: `
          query EventStandings($eventId: ID!, $page: Int!, $perPage: Int!) { 
            event(id: $eventId) {
              standings(query: { perPage: $perPage, page: $page }) {
                nodes {
                  placement
                  entrant { name }
                }
              }
            }
          }
        `,
        variables: {
          eventId: eventId,
          page: pageNumber,
          perPage: 50
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${starggKey}`
        }
      });

      const data = response.data;
      console.log('Respuesta de la API para EventStandings:', data);

      if (data.errors) {
        console.error('Errores en la respuesta de la API para EventStandings:', data.errors);
        console.error('Detalles del error:', data.errors[0]);
        throw new Error('Error en la respuesta de la API para EventStandings');
      }

      if (data.data && data.data.event && data.data.event.standings && data.data.event.standings.nodes) {
        let nodes = data.data.event.standings.nodes;
        if (nodes.length === 0) {
          console.log('No se encontraron más resultados.');
          break; // Salir del bucle si no hay más resultados
        }
        nodes.forEach(node => {
          results.push({ player: node.entrant.name, score: node.placement });
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

  return results;
};