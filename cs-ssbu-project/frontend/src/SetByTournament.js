require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const startggURL = "https://api.start.gg/gql/alpha";
const starggKey = process.env.REACT_APP_STARTGG_API_KEY;

//const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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

  while (totalSets < limit) {
    const query = `
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
    `;

    const variables = {
      eventId: eventId,
      page: pageNumber,
      perPage: limit
    };

    try {
      const response = await fetch(startggURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${starggKey}`
        },
        body: JSON.stringify({ query, variables })
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors.map(error => error.message).join(', '));
      }

      const nodes = data.data.event.sets.nodes;
      processNodes(nodes);

      if (nodes.length < limit) {
        break;
      }

      pageNumber++;
    } catch (error) {
      console.error('Error fetching sets:', error);
      break;
    }
  }

  return sets;
};

module.exports = { getSetsByEvent };