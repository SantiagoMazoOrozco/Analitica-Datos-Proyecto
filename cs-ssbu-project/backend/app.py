from flask import Flask, jsonify, request
import requests
import os
from dotenv import load_dotenv

load_dotenv()  # Carga las variables de entorno desde el archivo .env

app = Flask(__name__)

@app.route('/api/eventId', methods=['GET'])
def get_event_id():
    tournament_name = request.args.get('tournamentName')
    event_name = request.args.get('eventName')
    startgg_key = os.getenv('STARGG_KEY')  # Obtiene la variable de entorno STARGG_KEY
    
    print('STARGG_KEY:', startgg_key)  # Verifica que la clave esté cargada correctamente

    if not tournament_name or not event_name:
        return jsonify({'error': 'Missing tournamentName or eventName'}), 400

    event_slug = f'tournament/{tournament_name}/event/{event_name}'
    query = """
    query EventQuery($slug: String) {
        event(slug: $slug) {
            id
            name
        }
    }
    """
    url = "https://api.start.gg/gql/alpha"

    response = requests.post(
        url,
        json={
            'query': query,
            'variables': {'slug': event_slug}
        },
        headers={
            'Authorization': f'Bearer {startgg_key}',
            'Content-Type': 'application/json'
        }
    )

    if response.status_code != 200:
        return jsonify({'error': 'API request failed'}), 500

    data = response.json()
    
    if 'errors' in data:
        return jsonify({'error': 'API returned errors'}), 500

    if 'data' not in data or 'event' not in data['data']:
        return jsonify({'error': 'Invalid response structure'}), 500

    event_id = data['data']['event']['id']
    return jsonify({'eventId': event_id})

if __name__ == '__main__':
    app.run(debug=True)
