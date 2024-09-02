import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Page4 = () => {
  const [username, setUsername] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const startggURL = "https://api.start.gg/gql/alpha";
  const starggKey = process.env.REACT_APP_STARTGG_API_KEY;

  const getPlayerId = async (username) => {
    setLoading(true);
    setError(null);
    setPlayerId('');

    try {
      const response = await fetch(startggURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + starggKey,
        },
        body: JSON.stringify({
          query: `query PlayerByName($username: String!) {
            players(query: { name: $username }) {
              nodes {
                id
                name
              }
            }
          }`,
          variables: {
            username: username,
          },
        }),
      });

      const data = await response.json();
      console.log('Respuesta de la API para PlayerByName:', JSON.stringify(data, null, 2));

      if (data.data && data.data.players && data.data.players.nodes.length > 0) {
        setPlayerId(data.data.players.nodes[0].id);
      } else {
        setError('No se encontró ningún jugador con ese nombre.');
      }
    } catch (err) {
      console.error('Error al obtener el ID del jugador:', err);
      setError('Error al obtener el ID del jugador');
    }

    setLoading(false);
  };

  const handleSearch = () => {
    getPlayerId(username);
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

  return (
    <motion.div
      className="container mt-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className="text-center mt-5" variants={itemVariants}>
        Buscar ID del Jugador
      </motion.h1>
      <motion.div className="mb-3" variants={itemVariants}>
        <input
          type="text"
          className="form-control"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ingrese el nombre de usuario"
        />
      </motion.div>
      <motion.button
        className="btn btn-primary"
        onClick={handleSearch}
        disabled={loading}
        variants={itemVariants}
      >
        {loading ? 'Buscando...' : 'Buscar ID'}
      </motion.button>
      {error && (
        <motion.div className="mt-3 text-danger" variants={itemVariants}>
          {error}
        </motion.div>
      )}
      {playerId && (
        <motion.div className="mt-3" variants={itemVariants}>
          <p>ID del jugador: {playerId}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Page4;
