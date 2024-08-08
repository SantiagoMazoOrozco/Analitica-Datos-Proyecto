import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CSVLink } from 'react-csv';

const Page1 = () => {
  const [eventId, setEventId] = useState('');
  const [tournamentName, setTournamentName] = useState('');
  const [tournamentDate, setTournamentDate] = useState('');
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
          query: `query EventDetails($eventId: ID!) {
            event(id: $eventId) {
              name
              startAt
              tournament {
                name
              }
              sets(page: 1, perPage: 1, sortType: STANDARD) {
                pageInfo { total }
                nodes { id slots { entrant { name } } }
              }
            }
          }`,
          variables: {
            eventId: eventId,
          },
        }),
      });

      const data = await response.json();
      console.log('Respuesta de la API para EventDetails:', data);

      if (data.data && data.data.event && data.data.event.sets && data.data.event.sets.pageInfo) {
        numEntrants = data.data.event.sets.pageInfo.total;
        setTournamentName(data.data.event.tournament.name);
        
        // Convertir el timestamp a una fecha legible
        const timestamp = data.data.event.startAt;
        const date = new Date(timestamp * 1000);
        setTournamentDate(date.toLocaleDateString());
      } else {
        console.error('Datos de respuesta no esperados para EventDetails:', data);
        throw new Error('Datos de respuesta no esperados para EventDetails');
      }
    } catch (err) {
      console.error('Error al obtener detalles del evento:', err);
      setError('Error al obtener detalles del evento');
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
            const nameParts = node.entrant.name.split(' | ');
            const team = nameParts.length > 1 ? nameParts[0] : ''; // Asigna un equipo si está presente
            const player = nameParts[nameParts.length > 1 ? 1 : 0]; // Asigna el nombre del jugador
            eventResults.push({
              team: team,
              player: player,
              placement: node.placement,
            });
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

  const containerVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 50,
        damping: 10,
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  // Formatear datos para CSV
  const csvData = [
    ["Tournament Name", "Tournament ID", "Tournament Date", "Team", "Player", "Placement"],
    ...results.map(result => [tournamentName, eventId, tournamentDate, result.team, result.player, result.placement])
  ];

  return (
    <motion.div
      className="container mt-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className="text-center mt-5" variants={itemVariants}>
        Obtener Resultados
      </motion.h1>
      <motion.div className="mb-3" variants={itemVariants}>
        <input
          type="text"
          className="form-control"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          placeholder="Ingrese el ID del Evento"
        />
      </motion.div>
      <motion.button
        className="btn btn-primary"
        onClick={handleGetResults}
        disabled={loading}
        variants={itemVariants}
      >
        {loading ? 'Cargando...' : 'Obtener Resultados'}
      </motion.button>
      {error && (
        <motion.div className="mt-3 text-danger" variants={itemVariants}>
          {error}
        </motion.div>
      )}
      <motion.div className="mt-3" variants={itemVariants}>
        {results.length > 0 ? (
          <ul>
            {results.map((result, index) => (
              <motion.li key={index} variants={itemVariants}>
                {`${result.team ? result.team + ' | ' : ''}${result.player} placed ${result.placement}`}
              </motion.li>
            ))}
          </ul>
        ) : (
          !loading && <motion.p variants={itemVariants}>No hay resultados para mostrar.</motion.p>
        )}
      </motion.div>
      {results.length > 0 && (
        <motion.div className="mt-4" variants={itemVariants}>
          <CSVLink
            data={csvData}
            filename={`${tournamentName}_results.csv`}
            className="btn btn-success"
          >
            Descargar CSV
          </CSVLink>
        </motion.div>
      )}
      <motion.div className="mt-4" variants={itemVariants}>
        <Link to="/" className="btn btn-secondary">
          Volver al Inicio
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default Page1;
