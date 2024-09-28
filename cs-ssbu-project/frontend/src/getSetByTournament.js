import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { getSetsByTournament } from './api/api_setbytournament';
import 'bootstrap/dist/css/bootstrap.min.css';

const GetSetByTournament = () => {
  const [EventId, setEventId] = useState('');
  const [limit, setLimit] = useState(5); // Valor por defecto de 5 sets
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGetSetsByTournament = async () => {
    setLoading(true);
    setSets([]);

    try {
      const result = await getSetsByTournament(EventId, limit);
      setSets(result);
    } catch (error) {
      console.error('Error:', error);
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
    ["Set ID", "Display Score", "Event Name", "Tournament Name"],
    ...sets.map(set => [set.id, set.displayScore, set.event.name, set.event.tournament.name])
  ];

  return (
    <motion.div
      className="container mt-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className="text-center mb-4" variants={itemVariants} style={{ color: 'black' }}>
        Obtener Sets por Torneo
      </motion.h1>
      <motion.div className="mb-3" variants={itemVariants}>
        <input
          type="text"
          className="form-control"
          value={EventId}
          onChange={(e) => setEventId(e.target.value)}
          placeholder="Ingrese el ID del evento"
          style={{ color: 'black' }}
        />
      </motion.div>
      <motion.div className="mb-3" variants={itemVariants}>
        <input
          type="number"
          className="form-control"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="Ingrese el número de sets a mostrar"
          style={{ color: 'black' }}
        />
      </motion.div>
      <motion.button
        className="btn btn-primary"
        onClick={handleGetSetsByTournament}
        disabled={loading}
        variants={itemVariants}
      >
        {loading ? 'Cargando...' : 'Obtener Sets'}
      </motion.button>
      <motion.div className="mt-3" variants={itemVariants}>
        {sets.length > 0 ? (
          <ul>
            {sets.map(set => (
              <li key={set.id} style={{ backgroundColor: 'white', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
                <p style={{ color: 'black' }}><strong>Display Score:</strong> {set.displayScore}</p>
                <p style={{ color: 'black' }}><strong>Event Name:</strong> {set.event.name}</p>
                <p style={{ color: 'black' }}><strong>Tournament Name:</strong> {set.event.tournament.name}</p>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p style={{ color: 'black' }}>No se encontraron sets.</p>
        )}
      </motion.div>
      {sets.length > 0 && (
        <motion.div className="mt-4" variants={itemVariants}>
          <CSVLink
            data={csvData}
            filename={`sets_${EventId}.csv`}
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

export default GetSetByTournament;