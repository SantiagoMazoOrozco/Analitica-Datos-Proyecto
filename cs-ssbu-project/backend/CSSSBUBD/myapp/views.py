from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from .models import Tournament, Event, Player, Set
from django.db import connection
from .forms import PlayerForm

def home(request):
    return render(request, 'myapp/home.html')

# Página para obtener resultados de un evento
def page1(request):
    if request.method == 'POST':
        event_id = request.POST.get('event_id')
        results = get_event_results(event_id)
        return JsonResponse(results, safe=False)
    return render(request, 'myapp/page1.html')

# Página para obtener el ID de un evento a partir del nombre del torneo y evento
def page2(request):
    if request.method == 'POST':
        tournament_name = request.POST.get('tournament_name')
        event_name = request.POST.get('event_name')
        event_id = get_event_id(tournament_name, event_name)
        return JsonResponse({'event_id': event_id})
    return render(request, 'myapp/page2.html')

# Página para obtener sets jugados por un jugador específico
def page3(request):
    if request.method == 'POST':
        player_id = request.POST.get('player_id')
        limit = int(request.POST.get('limit', 5))
        sets = get_sets_by_player(player_id, limit)
        return JsonResponse(sets, safe=False)
    return render(request, 'myapp/page3.html')

# Página para buscar un jugador por su nombre
def page4(request):
    if request.method == 'POST':
        player_name = request.POST.get('player_name')
        player_data = get_player_by_name(player_name)
        return JsonResponse(player_data)
    return render(request, 'myapp/page4.html')

# Funciones auxiliares para interactuar con la base de datos
def get_event_results(event_id):
    sets = Set.objects.filter(event_id=event_id).values('player__name', 'result')
    return list(sets)

def get_event_id(tournament_name, event_name):
    try:
        event = Event.objects.get(name=event_name, tournament__name=tournament_name)
        return event.id
    except Event.DoesNotExist:
        return None

def get_sets_by_player(player_id, limit):
    sets = Set.objects.filter(player_id=player_id).values('event__name', 'result')[:limit]
    return list(sets)

def get_player_by_name(player_name):
    try:
        player = Player.objects.get(name=player_name)
        return {'id': player.id, 'name': player.name}
    except Player.DoesNotExist:
        return {}

# Página para ver todos los jugadores en la base de datos usando SQL
def view_all_players(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                "First Name" AS first_name, 
                "Last Name" AS last_name, 
                "Nickname" AS nickname, 
                "Country" AS country, 
                "Zone" AS zone, 
                "City" AS city, 
                "Team" AS team, 
                "Secundary Team" AS secundary_team, 
                "Play Offline?" AS play_offline, 
                "Play Online?" AS play_online, 
                "Main Character" AS main_character, 
                "Second Option Player" AS second_option_player, 
                "Third Option Player" AS third_option_player, 
                "Twitter (X)" AS twitter, 
                "Instagram" AS instagram, 
                "TikTok" AS tiktok, 
                "User Startgg" AS user_startgg, 
                "Code Startgg (Formato - c40d0715)" AS code_startgg, 
                "Url StartGG" AS url_startgg, 
                "Url Smashdata" AS url_smashdata, 
                "Combined Teams" AS combined_teams, 
                "Combined Characters" AS combined_characters, 
                "Logo Team 1" AS logo_team_1, 
                "Logo Team 2" AS logo_team_2, 
                "Logo Main" AS logo_main, 
                "Logo 2" AS logo_2, 
                "Logo 3" AS logo_3
            FROM "main"."BDCS"
            ORDER BY "First Name" ASC
            LIMIT 49999
            OFFSET 0;
        """)
        rows = cursor.fetchall()
        columns = [col[0] for col in cursor.description]
    
    players = [dict(zip(columns, row)) for row in rows]
    
    return render(request, 'myapp/view_all_players.html', {'players': players})


# Lista todos los jugadores utilizando ORM de Django
def player_list(request):
    players = Player.objects.all()
    return render(request, 'player_list.html', {'players': players})

# Crear un nuevo jugador
def player_create(request):
    if request.method == 'POST':
        form = PlayerForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('player_list')
    else:
        form = PlayerForm()
    return render(request, 'player_form.html', {'form': form})

# Actualizar un jugador existente
def player_update(request, pk):
    player = get_object_or_404(Player, pk=pk)
    if request.method == 'POST':
        form = PlayerForm(request.POST, instance=player)
        if form.is_valid():
            form.save()
            return redirect('player_list')
    else:
        form = PlayerForm(instance=player)
    return render(request, 'player_form.html', {'form': form})

# Eliminar un jugador
def player_delete(request, pk):
    player = get_object_or_404(Player, pk=pk)
    if request.method == 'POST':
        player.delete()
        return redirect('player_list')
    return render(request, 'player_confirm_delete.html', {'player': player})

#API CONSULTAS

# Id

from django.http import JsonResponse
from .api.getEventId import get_event_id

def get_event_id_view(request):
    tournament_name = request.GET.get('tournament_name')
    event_name = request.GET.get('event_name')

    # Depuración para verificar si los parámetros se reciben correctamente
    if not tournament_name or not event_name:
        return JsonResponse({'error': 'Faltan parámetros o son inválidos'}, status=400)
    
    try:
        # Verifica qué valores están siendo pasados
        print(f"Tournament Name: {tournament_name}, Event Name: {event_name}")
        
        event_id = get_event_id(tournament_name, event_name)
        return JsonResponse({'event_id': event_id})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
#Resultados:
# myapp/views.py

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests
import json
import os
import time
import traceback

# Cargar variables de entorno
startgg_url = "https://api.start.gg/gql/alpha"
stargg_key = os.getenv("REACT_APP_STARTGG_API_KEY")

def delay(seconds):
    time.sleep(seconds)

@csrf_exempt
def get_event_results(request):
    if request.method == 'GET':
        try:
            # Obtener el eventId de los parámetros de consulta
            event_id = request.GET.get('eventId')
            if not event_id:
                return JsonResponse({'error': 'Event ID is required'}, status=400)

            # Obtener detalles del evento
            response = requests.post(startgg_url, json={
                "query": """
                query EventDetails($eventId: ID!) { 
                    event(id: $eventId) {
                        name
                        startAt
                    }
                }
                """,
                "variables": {
                    "eventId": event_id
                }
            }, headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": f"Bearer {stargg_key}"
            })

            event_data = response.json()
            print('Respuesta completa de la API para EventDetails:', event_data)  # Agrega esta línea para ver la respuesta completa

            if not event_data.get('data') or not event_data['data'].get('event'):
                return JsonResponse({'error': 'Event not found: ' + json.dumps(event_data)}, status=404)

            event_details = event_data['data']['event']
            tournament_name = event_details['name']
            tournament_date = time.strftime('%Y-%m-%d', time.localtime(event_details['startAt']))
            tournament_location = 'Ubicación no disponible'  # Puedes actualizar esto si tienes otra fuente para la ubicación

            num_entrants = 0
            num_entrants_found = 0
            page_number = 1
            event_results = []

            # Primera solicitud para obtener el número total de sets (o participantes)
            response = requests.post(startgg_url, json={
                "query": """
                query EventSets($eventId: ID!) { 
                    event(id: $eventId) {
                        sets(sortType: STANDARD) {
                            pageInfo { total }
                        }
                    }
                }
                """,
                "variables": {
                    "eventId": event_id
                }
            }, headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": f"Bearer {stargg_key}"
            })

            data = response.json()
            print('Respuesta completa de la API para EventSets:', data)  # Agrega esta línea para ver la respuesta completa

            if not data.get('data') or not data['data'].get('event') or not data['data']['event'].get('sets') or not data['data']['event']['sets'].get('pageInfo'):
                return JsonResponse({'error': 'Unexpected response data for EventSets: ' + json.dumps(data)}, status=500)

            num_entrants = data['data']['event']['sets']['pageInfo']['total']
            delay(1)

            # Bucle para obtener los resultados del evento
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
                print('Respuesta completa de la API para EventStandings:', data)  # Agrega esta línea para ver la respuesta completa

                if not data.get('data') or not data['data'].get('event') or not data['data']['event'].get('standings') or not data['data']['event']['standings'].get('nodes'):
                    print('Unexpected response data for EventStandings:', data)  # Agrega esta línea para ver la respuesta inesperada
                    break  # Salir del bucle si no hay más datos disponibles

                nodes = data['data']['event']['standings']['nodes']
                if not nodes:
                    break
                for node in nodes:
                    event_results.append({
                        'player': node['entrant']['name'],
                        'placement': node['placement']
                    })
                num_entrants_found += len(nodes)

                page_number += 1
                delay(1)

            return JsonResponse({
                'tournamentName': tournament_name,
                'tournamentLocation': tournament_location,
                'tournamentDate': tournament_date,
                'eventResults': event_results
            })

        except Exception as e:
            print('Error:', str(e))  # Agrega esta línea para ver el error en la consola
            print(traceback.format_exc())  # Agrega esta línea para ver el traceback completo
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid method'}, status=405)