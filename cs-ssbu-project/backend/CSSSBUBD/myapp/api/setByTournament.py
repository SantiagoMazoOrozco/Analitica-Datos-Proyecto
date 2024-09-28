import os
import requests
from dotenv import load_dotenv
import time

# Cargar la clave de la API desde el archivo .env
load_dotenv()

startgg_url = "https://api.start.gg/gql/alpha"
startgg_key = os.getenv('REACT_APP_STARTGG_API_KEY')

if not startgg_key:
    raise ValueError('La clave de la API de Start.gg no está configurada. Verifica tu archivo .env')

def delay(seconds):
    time.sleep(seconds)

def get_sets_by_event(event_id, limit):
    sets = []
    page_number = 1
    total_sets = 0

    def process_nodes(nodes):
        nonlocal total_sets
        for node in nodes:
            if total_sets < limit:
                sets.append(node)
                total_sets += 1
                print(f"Set ID: {node['id']}, Display Score: {node['displayScore']}, Phase: {node['phaseGroup']['phase']['name']}, Event Name: {node['event']['name']}, Tournament Name: {node['event']['tournament']['name']}")

    while total_sets < limit:
        query = """
        query EventSets($eventId: ID!, $page: Int!, $perPage: Int!) {
            event(id: $eventId) {
                sets(page: $page, perPage: $perPage) {
                    nodes {
                        id
                        displayScore
                        phaseGroup {
                            phase {
                                name
                            }
                        }
                        event {
                            name
                            tournament {
                                name
                            }
                        }
                    }
                }
            }
        }
        """

        variables = {
            'eventId': event_id,
            'page': page_number,
            'perPage': limit
        }

        try:
            response = requests.post(
                startgg_url,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {startgg_key}'
                },
                json={'query': query, 'variables': variables}
            )

            response.raise_for_status()
            data = response.json()

            if 'errors' in data:
                raise Exception(', '.join(error['message'] for error in data['errors']))

            nodes = data['data']['event']['sets']['nodes']
            process_nodes(nodes)

            if len(nodes) < limit:
                break

            page_number += 1
            delay(1)
        except requests.exceptions.RequestException as e:
            print('Error fetching sets:', e)
            break

    return sets