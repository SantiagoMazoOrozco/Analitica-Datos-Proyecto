import axios from 'axios';

// Asegúrate de que la variable de entorno esté definida
const startggURL = "https://api.start.gg/gql/alpha";
const starggKey = "204bdde1bb958e691497fa76febad15d";

if (!starggKey) {
  throw new Error('La clave de la API de Start.gg no está definida. Asegúrate de que REACT_APP_STARTGG_API_KEY esté configurada en tu archivo .env.');
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const getSetsByTournament = async (eventId, limit) => {
  let sets = [];
  let pageNumber = 1;
  let totalSets = 0;

  const processNodes = (nodes) => {
    for (const node of nodes) {
      if (totalSets < limit) {
        sets.push(node);
        totalSets += 1;
      }
    }
  };

  while (totalSets < limit) {
    try {
      const response = await axios.post(startggURL, {
        query: `
          query EventSets($eventId: ID!, $page: Int!, $perPage: Int!) {
            event(id: $eventId) {
              sets(page: $page, perPage: $perPage) {
                nodes {
                  id
                  displayScore
                  phaseGroup {
                    phase {
                      name
                    }
                  }
                  event {
                    name
                    tournament {
                      name
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          eventId: eventId,
          page: pageNumber,
          perPage: limit
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${starggKey}`
        }
      });

      const data = response.data;

      if (data.errors) {
        throw new Error(data.errors.map(error => error.message).join(', '));
      }

      const nodes = data.data.event.sets.nodes;
      processNodes(nodes);

      if (nodes.length < limit) {
        break;
      }

      pageNumber += 1;
      await delay(1000);
    } catch (error) {
      console.error('Error al obtener sets del torneo:', error);
      throw error;
    }
  }

  return sets;
};