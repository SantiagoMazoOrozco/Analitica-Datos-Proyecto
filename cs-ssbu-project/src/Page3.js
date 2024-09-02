import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CSVLink } from 'react-csv';
import { getPlayerDetails } from './getPlayerDetails'; // Ajusta la ruta según sea necesario


const Page3 = () => {
  const [playerId, setPlayerId] = useState('');
  const [playerDetails, setPlayerDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetPlayerDetails = async () => {
    setLoading(true);
    setError(null);
    setPlayerDetails([]);

    try {
      const details = await getPlayerDetails(playerId); // Llama a la función importada
      setPlayerDetails([details]);
    } catch (err) {
      setError('Error al obtener detalles del jugador');
    } finally {
      setLoading(false);
    }
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
    ["Player ID", "Gamer Tag", "Characters", "Country"],
    ...playerDetails.map(detail => [detail.id, detail.gamerTag, detail.characters, detail.country])
  ];

  return (
    <motion.div
      className="container mt-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className="text-center mt-5" variants={itemVariants}>
        Obtener Detalles del Jugador
      </motion.h1>
      <motion.div className="mb-3" variants={itemVariants}>
        <input
          type="text"
          className="form-control"
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          placeholder="Ingrese el ID del Jugador"
        />
      </motion.div>
      <motion.button
        className="btn btn-primary"
        onClick={handleGetPlayerDetails}
        disabled={loading}
        variants={itemVariants}
      >
        {loading ? 'Cargando...' : 'Obtener Detalles'}
      </motion.button>
      {error && (
        <motion.div className="mt-3 text-danger" variants={itemVariants}>
          {error}
        </motion.div>
      )}
      <motion.div className="mt-3" variants={itemVariants}>
        {playerDetails.length > 0 ? (
          <ul>
            {playerDetails.map((detail, index) => (
              <motion.li key={index} variants={itemVariants}>
                {`${detail.gamerTag} (${detail.characters}) - ${detail.country} [ID: ${detail.id}]`}
              </motion.li>
            ))}
          </ul>
        ) : (
          !loading && <motion.p variants={itemVariants}>No hay detalles para mostrar.</motion.p>
        )}
      </motion.div>
      {playerDetails.length > 0 && (
        <motion.div className="mt-4" variants={itemVariants}>
          <CSVLink
            data={csvData}
            filename={`player_details_${playerId}.csv`}
            className="btn btn-success"
          >
            Descargar CSV
          </CSVLink>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Page3;
