import os
import requests
from dotenv import load_dotenv
from django.http import JsonResponse

# Cargar la clave de la API desde el archivo .env
load_dotenv()

startgg_url = "https://api.start.gg/gql/alpha"
startgg_key = os.getenv('REACT_APP_STARTGG_API_KEY')

if not startgg_key:
    raise ValueError('La clave de la API de Start.gg no está configurada. Verifica tu archivo .env')

def get_event_id(tournament_name, event_name):
    event_slug = f"tournament/{tournament_name}/event/{event_name}"
    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': f'Bearer {startgg_key}'
    }
    
    query = """
    query EventQuery($slug: String) {
        event(slug: $slug) {
            id
            name
        }
    }
    """
    
    variables = {
        'slug': event_slug
    }
    
    try:
        response = requests.post(
            startgg_url,
            headers=headers,
            json={'query': query, 'variables': variables}
        )
        
        response.raise_for_status()
        
        data = response.json()
        print('API response:', data)

        if 'errors' in data:
            print('API returned errors:', data['errors'])
            return JsonResponse({"error": "Error in API response"}, status=400)

        if 'data' not in data or 'event' not in data['data']:
            print('Response structure:', data)
            return JsonResponse({"error": "Invalid response structure"}, status=400)

        event_id = data['data']['event']['id']
        return event_id
     
    except requests.exceptions.RequestException as e:
        print('Error al obtener el ID del evento:', e)
        raise e

# Vista para manejar la solicitud desde el frontend
def get_event_id_view(request):
    tournament_name = request.GET.get('tournament_name')
    event_name = request.GET.get('event_name')

    if not tournament_name or not event_name:
        return JsonResponse({"error": "Missing parameters"}, status=400)

    try:
        event_id = get_event_id(tournament_name, event_name)
        return JsonResponse({"event_id": event_id}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
