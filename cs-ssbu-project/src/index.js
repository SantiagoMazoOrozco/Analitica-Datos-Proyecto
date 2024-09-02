import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import Page1 from './Page1';
import Page2 from './Page2';
import Page3 from './Page3'; // Importa Page3 aquí

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/page1" element={<Page1 />} />
        <Route path="/page2" element={<Page2 />} />
        <Route path="/page3" element={<Page3 />} /> {/* Agrega la ruta para Page3 */}
      </Routes>
    </Router>
  </React.StrictMode>
);
