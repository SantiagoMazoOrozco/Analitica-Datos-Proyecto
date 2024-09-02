require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const startggURL = "https://api.start.gg/gql/alpha";
const starggKey = process.env.REACT_APP_STARTGG_API_KEY;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  searchPlayersByName: async function (name) {
    let pageNumber = 1;
    let allPlayers = [];
    
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
            query: `query SearchPlayers($name: String!, $page: Int!, $perPage: Int!) { 
                players(query: { name: $name, perPage: $perPage, page: $page }) {
                    nodes {
                        id
                        name
                        tag
                    }
                    pageInfo {
                        hasNextPage
                    }
                }
            }`,
            variables: {
              name: name,
              page: pageNumber,
              perPage: 10
            },
          })
        });

        const data = await response.json();
        console.log('Respuesta de la API para SearchPlayers:', data);

        if (data.data && data.data.players && data.data.players.nodes) {
          const nodes = data.data.players.nodes;
          if (nodes.length === 0) {
            console.log('No se encontraron más jugadores.');
            break; // Salir del bucle si no hay más resultados
          }
          nodes.forEach(node => {
            allPlayers.push({
              id: node.id,
              name: node.name,
              tag: node.tag
            });
          });
          if (!data.data.players.pageInfo.hasNextPage) {
            break; // Salir del bucle si no hay más páginas
          }
          pageNumber += 1;
          await delay(1000);
        } else {
          console.error('Datos de respuesta no esperados para SearchPlayers:', data);
          throw new Error('Datos de respuesta no esperados para SearchPlayers');
        }
      } catch (err) {
        console.error('Error al buscar jugadores:', err);
        break; // Salir del bucle en caso de error
      }
    }
    
    return allPlayers;
  }
};
