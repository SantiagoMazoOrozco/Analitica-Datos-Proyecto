require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const startggURL = "https://api.start.gg/gql/alpha";
const starggKey = process.env.REACT_APP_STARTGG_API_KEY;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const getSetsByEvent = async function (eventId, limit) {
  let sets = [];
  let pageNumber = 1;
  let totalSets = 0;

  const processNodes = (nodes) => {
    nodes.forEach(node => {
      if (totalSets < limit) {
        sets.push(node);
        totalSets++;
        console.log(`Set ID: ${node.id}, Display Score: ${node.displayScore}, Phase: ${node.phaseGroup.phase.name}, Event Name: ${node.event.name}, Tournament Name: ${node.event.tournament.name}`);
      }
    });
  };

  // Bucle para obtener los sets del evento
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
          query: `query EventSets($eventId: ID!, $page: Int!, $perPage: Int!) { 
              event(id: $eventId) {
                  id
                  sets(perPage: $perPage, page: $page) {
                      nodes {
                          id
                          displayScore
                          phaseGroup {
                              phase {
                                  id
                                  name
                              }
                          }
                          event {
                              id
                              name
                              tournament {
                                  id
                                  name
                              }
                          }
                          slots {
                              entrant {
                                  id
                                  name
                              }
                          }
                      }
                  }
              }
          }`,
          variables: {
            eventId: eventId,
            page: pageNumber,
            perPage: 5
          },
        })
      });

      const data = await response.json();
      console.log('Respuesta de la API para EventSets:', data);

      // Verifica si hay errores en la respuesta
      if (data.errors) {
        console.error('Errores de la API:', data.errors);
        throw new Error('Errores en la respuesta de la API');
      }

      // Verifica la estructura de la respuesta
      if (data.data && data.data.event && data.data.event.sets) {
        let nodes = data.data.event.sets.nodes;
        if (nodes.length === 0) {
          console.log('No se encontraron más sets.');
          break; // Salir del bucle si no hay más sets
        }
        processNodes(nodes);
        if (totalSets >= limit) {
          break; // Salir del bucle si se ha alcanzado el límite
        }
      } else {
        console.error('Datos de respuesta no esperados para EventSets:', data);
        throw new Error('Datos de respuesta no esperados para EventSets');
      }
    } catch (err) {
      console.error('Error al obtener los sets del evento:', err);
      break; // Salir del bucle en caso de error
    }

    pageNumber += 1;
    await delay(1000);
  }

  return sets;
}

module.exports = { getSetsByEvent };