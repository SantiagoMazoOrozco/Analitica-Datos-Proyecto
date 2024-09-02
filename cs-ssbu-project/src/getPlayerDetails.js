const getPlayerDetails = async (playerId) => {
    try {
        const response = await fetch(startggURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + startggKey
            },
            body: JSON.stringify({
                query: `
                    query PlayerSets($playerId: ID!) {
                        player(id: $playerId) {
                            id
                            sets(perPage: 5, page: 1) {
                                nodes {
                                    id
                                    displayScore
                                    event {
                                        id
                                        name
                                        tournament {
                                            id
                                            name
                                        }
                                    }
                                }
                            }
                        }
                    }
                `,
                variables: { playerId: playerId }
            })
        });

        const data = await response.json();
        console.log('API response:', data);

        // Verifica la estructura completa de la respuesta
        if (data.errors) {
            console.error('API returned errors:', data.errors);
            throw new Error('Error in API response');
        }

        // Imprime la estructura completa de la respuesta para depuración
        console.log('Response structure:', JSON.stringify(data, null, 2));

        // Ajusta según la estructura de la respuesta
        if (!data.data || !data.data.player || !data.data.player.sets || !data.data.player.sets.nodes) {
            console.error('Invalid response structure:', JSON.stringify(data, null, 2));
            throw new Error('Invalid response structure');
        }

        const player = data.data.player;
        console.log('Player Sets:', player.sets.nodes);
        return player.sets.nodes;

    } catch (error) {
        console.error('Error al obtener detalles del jugador:', error);
        throw error;
    }
};
