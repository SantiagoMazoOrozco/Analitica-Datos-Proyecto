import React, { useState } from 'react';
import { getSetsByEvent } from './SetByTournament';

const Page3 = () => {
    const [eventId, setEventId] = useState('');
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        setEventId(e.target.value);
    };

    const fetchSets = async () => {
        setLoading(true);
        setError(null);
        try {
            const sets = await getSetsByEvent(eventId, 10); // Ajusta el límite según sea necesario
            console.log('Sets obtenidos:', sets);
            setSets(sets);
        } catch (error) {
            setError('Error al recuperar los sets del evento.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (eventId) {
            fetchSets();
        } else {
            setError('Por favor ingrese un ID de evento válido.');
        }
    };

    return (
        <div>
            <h2>Buscar Sets por ID de Evento</h2>
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
        </div>
    );
};

export default Page3;