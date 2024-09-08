import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CSVLink } from 'react-csv';

const Page3 = () => {
  const [eventId, setEventId] = useState('');
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startggURL = "https://api.start.gg/gql/alpha";
  const starggKey = process.env.REACT_APP_STARTGG_API_KEY;

  const getCompletedSets = async (eventId) => {
    try {
      const response = await fetch(startggURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${starggKey}`,
        },
        body: JSON.stringify({
          query: `query CompletedSets($eventId: ID!) {
            event(id: $eventId) {
              sets {
                nodes {
                  id
                  winnerId
                  loserId
                  state
                }
              }
            }
          }`,
          variables: { eventId },
        }),
      });

      const data = await response.json();
      console.log('Respuesta completa de la API para CompletedSets:', data);

      if (data.data && data.data.event && data.data.event.sets) {
        setSets(data.data.event.sets.nodes);
      } else {
        console.error('Datos de respuesta no esperados para CompletedSets:', data);
        throw new Error('Datos de respuesta no esperados para CompletedSets');
      }
    } catch (err) {
      console.error('Error al obtener los sets completos:', err);
      setError('Error al obtener los sets completos');
    }
  };

  const handleGetSets = async () => {
    setLoading(true);
    setError(null);

    await getCompletedSets(eventId);

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

  const csvData = [
    ["Set ID", "Winner ID", "Loser ID", "State"],
    ...sets.map(set => [set.id, set.winnerId, set.loserId, set.state]),
  ];

  return (
    <motion.div
      className="container mt-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className="text-center mt-5" variants={itemVariants}>
        Obtener Sets Completos del Evento
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
        onClick={handleGetSets}
        disabled={loading}
        variants={itemVariants}
      >
        {loading ? 'Cargando...' : 'Obtener Sets'}
      </motion.button>
      {error && (
        <motion.div className="mt-3 text-danger" variants={itemVariants}>
          {error}
        </motion.div>
      )}
      <motion.div className="mt-3" variants={itemVariants}>
        {sets.length > 0 ? (
          <ul>
            {sets.map((set) => (
              <motion.li key={set.id} variants={itemVariants}>
                ID del Set: {set.id}, Ganador: {set.winnerId}, Perdedor: {set.loserId}, Estado: {set.state}
              </motion.li>
            ))}
          </ul>
        ) : !loading ? (
          <motion.p variants={itemVariants}>
            No hay sets para mostrar.
          </motion.p>
        ) : null}
      </motion.div>
      {sets.length > 0 && (
        <motion.div className="mt-3" variants={itemVariants}>
          <CSVLink data={csvData} filename={`sets-${eventId}.csv`}>
            Descargar CSV
          </CSVLink>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Page3;
