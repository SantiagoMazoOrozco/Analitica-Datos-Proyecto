import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import GetResultPage from './getResultPage';
import GetEventIdPage from './getEventIdPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/getResultPage" element={<GetResultPage />} />
        <Route path="/getEventIdPage" element={<GetEventIdPage />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
