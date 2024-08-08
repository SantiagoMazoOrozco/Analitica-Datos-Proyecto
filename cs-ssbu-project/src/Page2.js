import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Importa el componente Link
import { getEventId } from './getEventId';
import 'bootstrap/dist/css/bootstrap.min.css';

const Page2 = () => {
  const [tournamentName, setTournamentName] = useState('');
  const [eventName, setEventName] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetEventId = async () => {
    setLoading(true);
    setResult('Cargando...');

    try {
      const id = await getEventId(tournamentName, eventName);
      setResult(`Event ID: ${id}`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
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

  return (
    <motion.div
      className="container mt-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className="text-center mb-4" variants={itemVariants}>
        Obtener ID del Evento
      </motion.h1>
      <motion.div className="mb-3" variants={itemVariants}>
        <input
          type="text"
          className="form-control"
          value={tournamentName}
          onChange={(e) => setTournamentName(e.target.value)}
          placeholder="Ingrese el nombre del torneo"
        />
      </motion.div>
      <motion.div className="mb-3" variants={itemVariants}>
        <input
          type="text"
          className="form-control"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Ingrese el nombre del evento"
        />
      </motion.div>
      <motion.button
        className="btn btn-primary"
        onClick={handleGetEventId}
        disabled={loading}
        variants={itemVariants}
      >
        {loading ? 'Cargando...' : 'Obtener ID del Evento'}
      </motion.button>
      <motion.div id="result" className="mt-3" variants={itemVariants}>
        {result}
      </motion.div>
      <motion.div className="mt-4" variants={itemVariants}>
        <Link to="/" className="btn btn-secondary">
          Volver al Inicio
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default Page2;
