require('dotenv').config();
const fetch = require('node-fetch');

const startggURL = "https://api.start.gg/gql/alpha";
const startggKey = process.env.STARGG_KEY;

const getEventId = async (tournamentName, eventName) => {
    console.log('STARGG_KEY:', startggKey); // Verifica que la clave esté cargada correctamente
    const eventSlug = `tournament/${tournamentName}/event/${eventName}`;
    try {
        console.log('Starting API call...');

        const response = await fetch(startggURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                Authorization: 'Bearer ' + startggKey
            },
            body: JSON.stringify({
                query: "query EventQuery($slug:String) {event(slug: $slug) {id name}}",
                variables: { slug: eventSlug }
            })
        });

        if (!response.ok) {
            console.error('Network response was not ok:', response.statusText);
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('API response:', data);

        if (data.errors) {
            console.error('API returned errors:', data.errors);
            throw new Error('Error in API response');
        }

        if (!data.data || !data.data.event) {
            console.error('Invalid response structure:', data);
            throw new Error('Invalid response structure');
        }

        const eventId = data.data.event.id;
        console.log('Event ID:', eventId);
        return eventId;
    } catch (error) {
        console.error('Error getting event ID:', error);
        throw error;
    }
};

// Read arguments from command line
const [,, tournamentName, eventName] = process.argv;

if (!tournamentName || !eventName) {
    console.error('Usage: node getEventId.js <tournamentName> <eventName>');
    process.exit(1);
}

getEventId(tournamentName, eventName)
    .then(eventId => console.log(`Event ID for ${eventName}: ${eventId}`))
    .catch(error => console.error('Failed to get event ID:', error));
