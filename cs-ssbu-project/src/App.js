import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'; // Asegúrate de que este archivo esté importado correctamente

const App = () => {
  return (
    <div className="app-container">
      <div className="overlay">
        <div className="container mt-5 text-center text-light">
          <h1 className="display-4 mb-3">Bienvenido</h1>
          <p className="lead mb-4">Seleccione una opción para continuar:</p>
          <nav>
            <ul className="nav justify-content-center">
              <li className="nav-item">
                <Link className="nav-link btn btn-light mx-2 custom-btn" to="/page1">
                  <i className="fas fa-chart-bar"></i> Obtener Resultados
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link btn btn-light mx-2 custom-btn" to="/page2">
                  <i className="fas fa-id-card"></i> Obtener ID
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link btn btn-light mx-2 custom-btn" to="/page3">
                  <i className="fas fa-user"></i> Obtener Detalles del Jugador
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <footer className="footer mt-auto py-3 bg-dark text-light text-center">
        <div className="container">
          <span>© 2024 Mi Aplicación. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
