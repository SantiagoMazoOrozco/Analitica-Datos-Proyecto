import requests
import time

startgg_url = "https://api.start.gg/gql/alpha"
stargg_key = "204bdde1bb958e691497fa76febad15d"  # Asegúrate de usar la clave correcta aquí

def delay(seconds):
    time.sleep(seconds)

def get_event_results(event_id):
    num_entrants = 0
    num_entrants_found = 0
    page_number = 1
    results = []

    try:
        # Primera solicitud para obtener el número total de participantes
        response = requests.post(startgg_url, json={
            "query": """
            query EventSets($eventId: ID!, $page: Int!, $perPage: Int!) { 
                event(id: $eventId) {
                    sets(page: $page, perPage: $perPage, sortType: STANDARD) {
                        pageInfo { total }
                        nodes { id slots { entrant { name } } }
                    }
                }
            }
            """,
            "variables": {
                "eventId": event_id,
                "page": 1,
                "perPage": 1
            }
        }, headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {stargg_key}"
        })

        data = response.json()
        if data.get('data') and data['data'].get('event') and data['data']['event'].get('sets') and data['data']['event']['sets'].get('pageInfo'):
            num_entrants = data['data']['event']['sets']['pageInfo']['total']
        else:
            raise Exception('Datos de respuesta no esperados para EventSets')

        delay(1)

        while num_entrants_found < num_entrants:
            response = requests.post(startgg_url, json={
                "query": """
                query EventStandings($eventId: ID!, $page: Int!, $perPage: Int!) { 
                    event(id: $eventId) {
                        standings(query: { perPage: $perPage, page: $page }) {
                            nodes {
                                placement
                                entrant { name }
                            }
                        }
                    }
                }
                """,
                "variables": {
                    "eventId": event_id,
                    "page": page_number,
                    "perPage": 50
                }
            }, headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": f"Bearer {stargg_key}"
            })

            data = response.json()
            if data.get('data') and data['data'].get('event') and data['data']['event'].get('standings') and data['data']['event']['standings'].get('nodes'):
                nodes = data['data']['event']['standings']['nodes']
                if not nodes:
                    break
                for node in nodes:
                    results.append({
                        'name': node['entrant']['name'],
                        'placement': node['placement']
                    })
                num_entrants_found += len(nodes)
            else:
                raise Exception('Datos de respuesta no esperados para EventStandings')

            page_number += 1
            delay(1)
    except Exception as e:
        print('Error al obtener las posiciones del evento:', e)
        results = {"error": str(e)}

    return results
