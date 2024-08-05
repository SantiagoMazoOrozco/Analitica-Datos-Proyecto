require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const startggURL = "https://api.start.gg/gql/alpha";
const startggKey = process.env.REACT_APP_STARTGG_API_KEY;

//console.log('Start.gg API Key:', startggKey); // Agrega esta línea para verificar la clave

if (!startggKey) {
    throw new Error('La clave de la API de Start.gg no está configurada. Verifica tu archivo .env');
}

const getEventId = async (tournamentName, eventName) => {
    const eventSlug = `tournament/${tournamentName}/event/${eventName}`;

    try {
        const response = await fetch(startggURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + startggKey
            },
            body: JSON.stringify({
                query: "query EventQuery($slug: String) { event(slug: $slug) { id name } }",
                variables: { slug: eventSlug }
            })
        });

        const data = await response.json();
        console.log('API response:', data);

        if (data.errors) {
            console.error('API returned errors:', data.errors);
            throw new Error('Error in API response');
        }

        if (!data.data || !data.data.event) {
            console.error('Response structure:', data);
            throw new Error('Invalid response structure');
        }

        const eventId = data.data.event.id;
        console.log('Event ID:', eventId);
        return eventId;

    } catch (error) {
        console.error('Error al obtener el ID del evento:', error);
        throw error;
    }
};

module.exports = { getEventId };