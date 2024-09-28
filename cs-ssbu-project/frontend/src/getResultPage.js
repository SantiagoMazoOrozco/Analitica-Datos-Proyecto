import React, { useState } from 'react';
import { CSVLink } from 'react-csv';
import { getEventDetails, getEventResults } from './api/api_result'; // Importa las funciones desde api/api_result.js
import 'bootstrap/dist/css/bootstrap.min.css';

const GetResultPage = () => {
  const [eventId, setEventId] = useState('');
  const [tournamentName, setTournamentName] = useState('');
  const [tournamentDate, setTournamentDate] = useState('');
  const [tournamentLocation, setTournamentLocation] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const details = await getEventDetails(eventId);
      setTournamentName(details.name);
      setTournamentDate(details.date);
      setTournamentLocation(details.location);

      const data = await getEventResults(eventId);
      setResults(data);
    } catch (err) {
      setError('Error al obtener los resultados o detalles del evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Get Result Page</h1>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Event ID"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        />
      </div>
      <div className="text-center mb-4">
        <button className="btn btn-primary" onClick={handleGetResults} disabled={loading}>
          {loading ? 'Cargando...' : 'Get Results'}
        </button>
      </div>
      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-danger">{error}</p>}
      {tournamentName && (
        <div className="text-center mb-4">
          <h2>{tournamentName}</h2>
          <p>{tournamentDate}</p>
          <p>{tournamentLocation}</p>
        </div>
      )}
      {results.length > 0 && (
        <div>
          <div className="text-center mb-4">
            <CSVLink className="btn btn-success" data={results} filename={`${tournamentName}_results.csv`}>
              Download CSV
            </CSVLink>
          </div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Player</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td>{result.player}</td>
                  <td>{result.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GetResultPage;