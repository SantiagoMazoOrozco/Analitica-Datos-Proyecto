require('dotenv').config();
const fetch = require('node-fetch');

const startggURL = "https://api.start.gg/gql/alpha";
const startggKey = process.env.STARGG_KEY;

if (!startggKey) {
    console.error('STARGG_KEY no está definido en el archivo .env');
    process.exit(1);
}

console.log('STARGG_KEY:', startggKey);

const testFetch = async () => {
    console.log('Iniciando la prueba de fetch...');
    try {
        const response = await fetch(startggURL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Accept': 'application/json',
                Authorization: 'Bearer ' + startggKey
            },
            body: JSON.stringify({
                query: "query { __typename }"
            })
        });

        console.log(`Status de la respuesta: ${response.status}`);
        const data = await response.json();
        console.log('Respuesta de la API:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
    }
};

testFetch();
