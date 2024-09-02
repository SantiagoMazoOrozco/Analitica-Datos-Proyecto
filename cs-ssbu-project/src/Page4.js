import React, { useState } from 'react';

const Page4 = () => {
    const [eventId, setEventId] = useState('');
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const apiKey = process.env.REACT_APP_START_GG_KEY;

    const handleInputChange = (e) => {
        setEventId(e.target.value);
    };

    const fetchCompletedMatches = async () => {
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
                    query: `query EventSets($eventId: ID!, $page: Int!, $perPage: Int!) {
                                event(id: $eventId) {
                                    sets(page: $page, perPage: $perPage, sortType: STANDARD) {
                                        pageInfo { total }
                                        nodes { id slots { entrant { name } } }
                                    }
                                }
                            }`,
                    variables: { eventId, page: 1, perPage: 5 },
                }),
            });

            const data = await response.json();
            if (data.data && data.data.event) {
                setMatches(data.data.event.sets.nodes);
            } else {
                setError('No se encontraron sets completados.');
            }
        } catch (error) {
            setError('Error al recuperar los sets completados.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (eventId) {
            fetchCompletedMatches();
        } else {
            setError('Por favor ingrese un ID de evento válido.');
        }
    };

    return (
        <div>
            <h2>Buscar Sets Completados por ID de Evento</h2>
            <input 
                type="text" 
                value={eventId} 
                onChange={handleInputChange} 
                placeholder="Ingresa el ID del evento"
            />
            <button onClick={handleSearch}>Buscar</button>

            {loading && <p>Cargando...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div>
                {matches.length > 0 && (
                    <ul>
                        {matches.map((match) => (
                            <li key={match.id}>
                                {match.slots.map((slot, index) => (
                                    <span key={index}>{slot.entrant.name}{index === 0 ? ' vs ' : ''}</span>
                                ))}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Page4;
