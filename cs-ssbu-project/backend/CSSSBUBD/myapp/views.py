import os
import time
import traceback
import requests
import json
import pandas as pd
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from django.db import transaction
from django.db import close_old_connections
from .forms import UploadFileForm
from .forms import TournamentForm
from .forms import PlayerForm
from .models import Tournament, Event, Player, Set
from .forms import SetForm

from .api.getEventId import get_event_id

# Constantes
STARTGG_URL = "https://api.start.gg/gql/alpha"
STARTGG_KEY = os.getenv("REACT_APP_STARTGG_API_KEY")

# Asegúrate de que la clave de la API esté disponible
if not STARTGG_KEY:
    raise EnvironmentError("La variable de entorno 'REACT_APP_STARTGG_API_KEY' no está configurada.")

# Función de retardo
def delay(seconds):
    time.sleep(seconds)

# Vistas
def home(request):
    return render(request, 'myapp/home.html')


#Vista sets

def set_list(request):
    sets = Set.objects.all()
    return render(request, 'myapp/sets/set_list.html', {'sets': sets})

def set_create(request):
    if request.method == 'POST':
        form = SetForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('set_list')
    else:
        form = SetForm()
    return render(request, 'myapp/sets/set_form.html', {'form': form})

def set_update(request, pk):
    set_instance = get_object_or_404(Set, pk=pk)
    if request.method == 'POST':
        form = SetForm(request.POST, instance=set_instance)
        if form.is_valid():
            form.save()
            return redirect('set_list')
    else:
        form = SetForm(instance=set_instance)
    return render(request, 'myapp/sets/set_form.html', {'form': form})

def set_delete(request, pk):
    set_instance = get_object_or_404(Set, pk=pk)
    if request.method == 'POST':
        set_instance.delete()
        return redirect('set_list')
    return render(request, 'myapp/sets/set_confirm_delete.html', {'set': set_instance})

def view_all_sets(request):
    sets = Set.objects.all()
    return render(request, 'myapp/sets/set_list.html', {'sets': sets})
#Vista Jugadores

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

def player_list(request):
    players = Player.objects.all()
    return render(request, 'myapp/players/player_list.html', {'players': players})

def player_create(request):
    if request.method == 'POST':
        form = PlayerForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('player_list')
    else:
        form = PlayerForm()
    return render(request, 'myapp/players/player_form.html', {'form': form})

def player_update(request, pk):
    player = get_object_or_404(Player, pk=pk)
    if request.method == 'POST':
        form = PlayerForm(request.POST, instance=player)
        if form.is_valid():
            form.save()
            return redirect('player_list')
    else:
        form = PlayerForm(instance=player)
    return render(request, 'myapp/players/player_form.html', {'form': form})

def player_delete(request, pk):
    player = get_object_or_404(Player, pk=pk)
    if request.method == 'POST':
        player.delete()
        return redirect('player_list')
    return render(request, 'myapp/players/player_confirm_delete.html', {'player': player})

#Vista Torneos

@csrf_exempt
def view_colombia_tournament(request):
    if request.method == 'GET':
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    "Tournament Name" AS tournament_name, 
                    "Winner" AS winner, 
                    "Attendees" AS attendees, 
                    "Zona" AS zona, 
                    "Pais" AS pais, 
                    "Region" AS region, 
                    "Ciudad" AS ciudad, 
                    "Direccion" AS direccion, 
                    "Date" AS date, 
                    "ID" AS id, 
                    "URL" AS url
                FROM "main"."Colombia Tournament"
                ORDER BY "Tournament Name" ASC
                LIMIT 49999
                OFFSET 0;
            """)
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
        
        tournaments = [dict(zip(columns, row)) for row in rows]
        return render(request, 'myapp/tournaments/view_colombia_tournament.html', {'tournaments': tournaments})

    elif request.method == 'POST':
        form = TournamentForm(json.loads(request.body))
        if form.is_valid():
            form.save()
            return JsonResponse({'message': 'Torneo creado exitosamente'}, status=201)
        else:
            return JsonResponse({'errors': form.errors}, status=400)

    elif request.method == 'PUT':
        data = json.loads(request.body)
        tournament_id = data.get('id')
        tournament = get_object_or_404(Tournament, id=tournament_id)
        form = TournamentForm(data, instance=tournament)
        if form.is_valid():
            form.save()
            return JsonResponse({'message': 'Torneo actualizado exitosamente'}, status=200)
        else:
            return JsonResponse({'errors': form.errors}, status=400)

    elif request.method == 'DELETE':
        data = json.loads(request.body)
        tournament_id = data.get('id')
        tournament = get_object_or_404(Tournament, id=tournament_id)
        tournament.delete()
        return JsonResponse({'message': 'Torneo eliminado exitosamente'}, status=200)

    else:
        return HttpResponseBadRequest('Método no permitido')
#Vista Subir Archivo Excell Torneos
def upload_excel(request):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            file = request.FILES['file']
            df = pd.read_excel(file)

            # Renombrar las columnas del DataFrame si es necesario
            df.rename(columns={
                'Nombre del Torneo': 'Tournament Name',
                'Ganador': 'Winner',
                'Asistentes': 'Attendees',
                'Zona': 'Zona',
                'País': 'Pais',
                'Región': 'Region',
                'Ciudad': 'Ciudad',
                'Dirección': 'Direccion',
                'Fecha': 'Date',
                'ID': 'ID',
                'URL': 'URL'
            }, inplace=True)

            with connection.cursor() as cursor:
                for index, row in df.iterrows():
                    # Convertir el valor de la fecha a una cadena
                    date_str = row['Date'].strftime('%Y-%m-%d') if not pd.isnull(row['Date']) else None

                    cursor.execute("""
                        INSERT INTO "Colombia Tournament" (
                            "Tournament Name", "Winner", "Attendees", "Zona", "Pais", "Region", "Ciudad", "Direccion", "Date", "ID", "URL"
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT ("ID") DO NOTHING;
                    """, [
                        row['Tournament Name'], row['Winner'], row['Attendees'], row['Zona'], row['Pais'], row['Region'], row['Ciudad'], row['Direccion'], date_str, row['ID'], row['URL']
                    ])

            return redirect('view_colombia_tournament')
    else:
        form = UploadFileForm()
    return render(request, 'myapp/upload_excel.html', {'form': form})
# API Consultas
def get_event_id_view(request):
    tournament_name = request.GET.get('tournament_name')
    event_name = request.GET.get('event_name')

    if not tournament_name or not event_name:
        return JsonResponse({'error': 'Faltan parámetros o son inválidos'}, status=400)
    
    try:
        event_id = get_event_id(tournament_name, event_name)
        return JsonResponse({'event_id': event_id})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_event_results(request):
    if request.method == 'GET':
        try:
            event_id = request.GET.get('eventId')
            if not event_id:
                return JsonResponse({'error': 'Event ID is required'}, status=400)

            response = requests.post(STARTGG_URL, json={
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
                "Authorization": f"Bearer {STARTGG_KEY}"
            })

            event_data = response.json()
            if not event_data.get('data') or not event_data['data'].get('event'):
                return JsonResponse({'error': 'Event not found: ' + json.dumps(event_data)}, status=404)

            event_details = event_data['data']['event']
            tournament_name = event_details['name']
            tournament_date = time.strftime('%Y-%m-%d', time.localtime(event_details['startAt']))
            tournament_location = 'Ubicación no disponible'

            num_entrants = 0
            num_entrants_found = 0
            page_number = 1
            event_results = []

            response = requests.post(STARTGG_URL, json={
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
                "Authorization": f"Bearer {STARTGG_KEY}"
            })

            data = response.json()
            if not data.get('data') or not data['data'].get('event') or not data['data']['event'].get('sets') or not data['data']['event']['sets'].get('pageInfo'):
                return JsonResponse({'error': 'Unexpected response data for EventSets: ' + json.dumps(data)}, status=500)

            num_entrants = data['data']['event']['sets']['pageInfo']['total']
            delay(1)

            while num_entrants_found < num_entrants:
                response = requests.post(STARTGG_URL, json={
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
                    "Authorization": f"Bearer {STARTGG_KEY}"
                })

                data = response.json()
                if not data.get('data') or not data['data'].get('event') or not data['data']['event'].get('standings') or not data['data']['event']['standings'].get('nodes'):
                    break

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
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def get_sets_by_tournament_view(request):
    if request.method == 'GET':
        try:
            event_id = request.GET.get('eventId')
            limit = int(request.GET.get('limit', 5))
            if not event_id:
                return JsonResponse({'error': 'Event ID is required'}, status=400)

            sets = []
            page_number = 1
            total_sets = 0

            def process_nodes(nodes):
                nonlocal total_sets
                for node in nodes:
                    if total_sets < limit:
                        sets.append(node)
                        total_sets += 1

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

                response = requests.post(
                    STARTGG_URL,
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f'Bearer {STARTGG_KEY}'
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

            return JsonResponse(sets, safe=False)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid method'}, status=405)
def create_tournament(request):
    if request.method == 'POST':
        form = TournamentForm(request.POST)
        if form.is_valid():
            form.save()
            return JsonResponse({'message': 'Torneo creado exitosamente'}, status=201)
        else:
            return JsonResponse({'errors': form.errors}, status=400)
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)

# Funciones auxiliares
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