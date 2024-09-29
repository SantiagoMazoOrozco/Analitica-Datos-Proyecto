const getEventId = async (tournamentName, eventName) => {
  try {
    const response = await fetch(`http://localhost:8000/api/get-event-id/?tournament_name=${tournamentName}&event_name=${eventName}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }

    const data = await response.json();
    return data.event_id; // Supongo que la respuesta es el `event_id` o lo que retorne tu backend
  } catch (error) {
    console.error('Error al obtener el ID del evento:', error);
    throw error;
  }
};

export default getEventId;