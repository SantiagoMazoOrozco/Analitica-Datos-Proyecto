import React, { useState } from 'react';
import { CSVLink } from 'react-csv';
import { getEventDetails, getEventResults } from './api/api_result'; // Importa las funciones desde api/api_result.js

const Page1 = () => {
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
    <div>
      <h1>Page 1</h1>
      <input
        type="text"
        placeholder="Event ID"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
      />
      <button onClick={handleGetResults}>Get Results</button>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {tournamentName && (
        <div>
          <h2>{tournamentName}</h2>
          <p>{tournamentDate}</p>
          <p>{tournamentLocation}</p>
        </div>
      )}
      {results.length > 0 && (
        <div>
          <CSVLink data={results} filename={`${tournamentName}_results.csv`}>
            Download CSV
          </CSVLink>
          <table>
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

export default Page1;