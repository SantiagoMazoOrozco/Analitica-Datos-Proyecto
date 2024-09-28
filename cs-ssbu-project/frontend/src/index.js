import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import GetResultPage from './getResultPage';
import GetEventIdPage from './getEventIdPage';
import GetSetByTournament from './getSetByTournament'; // Importar la nueva página

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/getResultPage" element={<GetResultPage />} />
        <Route path="/getEventIdPage" element={<GetEventIdPage />} />
        <Route path="/getSetsByTournament" element={<GetSetByTournament />} /> {/* Añadir la nueva ruta */}
      </Routes>
    </Router>
  </React.StrictMode>
);