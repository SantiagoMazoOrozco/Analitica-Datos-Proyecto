import React, { useState } from 'react';
import { getEventRegistrations } from './checkEventRegistrations'; // Asegúrate de que la ruta sea correcta

const Page4 = () => {
    const [tournamentId, setTournamentId] = useState('');
    const [sets, setSets] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const apiKey = process.env.REACT_APP_START_GG_KEY;

    const handleInputChange = (e) => {
        setTournamentId(e.target.value);
    };

    const fetchSetsByTournament = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('https://api.start.gg/gql/alpha', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    query: `query TournamentSets($tournamentId: ID!, $page: Int!, $perPage: Int!) { 
                                tournament(id: $tournamentId) {
                                    id
                                    events {
                                        id
                                        sets(perPage: $perPage, page: $page) {
                                            nodes {
                                                id
                                                displayScore
                                                phaseGroup {
                                                    phase {
                                                        id
                                                        name
                                                    }
                                                }
                                                event {
                                                    id
                                                    name
                                                    tournament {
                                                        id
                                                        name
                                                    }
                                                }
                                                slots {
                                                    entrant {
                                                        id
                                                        name
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }`,
                    variables: { tournamentId, page: 1, perPage: 5 },
                }),
            });

            const data = await response.json();
            if (data.data && data.data.tournament) {
                const sets = data.data.tournament.events.flatMap(event => event.sets.nodes);
                setSets(sets);

                // Obtener el ID del primer evento para buscar registros
                const eventId = data.data.tournament.events[0].id;
                const registrations = await getEventRegistrations(eventId);
                setRegistrations(registrations);
            } else {
                setError('No se encontraron sets para el torneo.');
            }
        } catch (error) {
            setError('Error al recuperar los sets del torneo.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (tournamentId) {
            fetchSetsByTournament();
        } else {
            setError('Por favor ingrese un ID de torneo válido.');
        }
    };

    return (
        <div>
            <h2>Buscar Sets por ID de Torneo</h2>
            <input 
                type="text" 
                value={tournamentId} 
                onChange={handleInputChange} 
                placeholder="Ingresa el ID del torneo"
            />
            <button onClick={handleSearch}>Buscar</button>

            {loading && <p>Cargando...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div>
                {sets.length > 0 && (
                    <ul>
                        {sets.map((set) => (
                            <li key={set.id}>
                                {set.slots.map((slot, index) => (
                                    <span key={index}>{slot.entrant.name}{index === 0 ? ' vs ' : ''}</span>
                                ))}
                                <br />
                                <span>Fase: {set.phaseGroup.phase.name}</span>
                                <br />
                                <span>Evento: {set.event.name}</span>
                                <br />
                                <span>Torneo: {set.event.tournament.name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <h3>Registros del Evento</h3>
                {registrations.length > 0 ? (
                    <ul>
                        {registrations.map((entrant, index) => (
                            <li key={index}>{entrant}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No se encontraron registros para el evento.</p>
                )}
            </div>
        </div>
    );
};

export default Page4;
