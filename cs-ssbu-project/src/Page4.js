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
              sets {
                pageInfo {
                  total
                }
                nodes {
                  id
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
          variables: { eventId: eventId },
        }),
      });

      const data = await response.json();
      console.log('Respuesta de la API para EventDetails:', JSON.stringify(data, null, 2));

      if (data.data && data.data.event && data.data.event.sets && data.data.event.sets.nodes) {
        setTournamentName(data.data.event.tournament.name);
        setTournamentDate(new Date(data.data.event.startAt * 1000).toLocaleDateString());

        // Mapea los resultados a la estructura deseada
        const standings = data.data.event.sets.nodes.map(result => {
          const player1 = result.slots[0].entrant;
          const player2 = result.slots[1].entrant;

          return {
            team: '', // Si tienes información de equipo, agrega aquí
            player: player1.name,
            playerId: player1.id,
            placement: `Played against ${player2.name}`, // Ejemplo de cómo podrías mostrar el oponente
          };
        });

        setResults(standings);
      } else {
        console.error('Datos de respuesta no esperados para EventDetails:', JSON.stringify(data, null, 2));
        setError('Datos de respuesta no esperados para EventDetails');
        return;
      }
    } catch (err) {
      console.error('Error al obtener resultados del evento:', err);
      setError('Error al obtener resultados del evento');
      return;
    }

    await delay(1000);
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
    ["Tournament Name", "Tournament ID", "Tournament Date", "Team", "Player", "Player ID", "Placement"],
    ...results.map(result => [tournamentName, eventId, tournamentDate, result.team, result.player, result.playerId, result.placement])
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
                {`${result.team ? result.team + ' | ' : ''}${result.player} (ID: ${result.playerId}) ${result.placement}`}
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
