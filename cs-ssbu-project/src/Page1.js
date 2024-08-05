import React, { useState } from 'react';

const Page1 = () => {
  const [eventId, setEventId] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startggURL = "https://api.start.gg/gql/alpha";
  const starggKey = process.env.REACT_APP_STARTGG_API_KEY;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getEventResults = async (eventId) => {
    let numEntrants = 0;
    let numEntrantsFound = 0;
    let pageNumber = 1;
    const eventResults = [];

    try {
      const response = await fetch(startggURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + starggKey,
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
            perPage: 1,
          },
        }),
      });

      const data = await response.json();
      console.log('Respuesta de la API para EventSets:', data);

      if (data.data && data.data.event && data.data.event.sets && data.data.event.sets.pageInfo) {
        numEntrants = data.data.event.sets.pageInfo.total;
      } else {
        console.error('Datos de respuesta no esperados para EventSets:', data);
        throw new Error('Datos de respuesta no esperados para EventSets');
      }
    } catch (err) {
      console.error('Error al obtener sets del evento:', err);
      setError('Error al obtener sets del evento');
      return;
    }

    await delay(1000);

    while (numEntrantsFound < numEntrants) {
      try {
        const response = await fetch(startggURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + starggKey,
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
              perPage: 50,
            },
          }),
        });

        const data = await response.json();
        console.log('Respuesta de la API para EventStandings:', data);

        if (data.data && data.data.event && data.data.event.standings && data.data.event.standings.nodes) {
          let nodes = data.data.event.standings.nodes;
          if (nodes.length === 0) {
            console.log('No se encontraron más resultados.');
            break;
          }
          nodes.forEach(node => {
            eventResults.push(`${node.entrant.name} placed ${node.placement}`);
          });
          numEntrantsFound += nodes.length;
        } else {
          console.error('Datos de respuesta no esperados para EventStandings:', data);
          setError('Datos de respuesta no esperados para EventStandings');
          return;
        }
      } catch (err) {
        console.error('Error al obtener las posiciones del evento:', err);
        setError('Error al obtener las posiciones del evento');
        break;
      }

      pageNumber += 1;
      await delay(1000);
    }

    setResults(eventResults);
  };

  const handleGetResults = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    
    await getEventResults(eventId);
    
    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="text-center mt-5">Obtener Resultados</h1>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          placeholder="Ingrese el ID del Evento"
        />
      </div>
      <button className="btn btn-primary" onClick={handleGetResults} disabled={loading}>
        {loading ? 'Cargando...' : 'Obtener Resultados'}
      </button>
      {error && <div className="mt-3 text-danger">{error}</div>}
      <div className="mt-3">
        {results.length > 0 ? (
          <ul>
            {results.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ul>
        ) : (
          !loading && <p>No hay resultados para mostrar.</p>
        )}
      </div>
    </div>
  );
};

export default Page1;
