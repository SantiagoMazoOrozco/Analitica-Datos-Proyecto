from django.shortcuts import render, get_object_or_404, redirect
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse, HttpResponseBadRequest
from django.db import connection
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.views.decorators.http import require_GET
from .forms import UploadFileForm, TournamentForm, PlayerForm, SetForm
from .models import Tournament, Player, Set
import os
import json

import time
import requests
import pandas as pd
import logging

# Constantes
STARTGG_URL = "https://api.start.gg/gql/alpha"
STARTGG_KEY = "204bdde1bb958e691497fa76febad15d"

# Asegúrate de que la clave de la API esté disponible
if not STARTGG_KEY:
    raise EnvironmentError("La variable de entorno 'REACT_APP_STARTGG_API_KEY' no está configurada.")

# Función de retardo
def delay(seconds):
    time.sleep(seconds)

# Vistas
def home(request):
    tournaments = Tournament.objects.all()
    return render(request, 'myapp/home.html', {'tournaments': tournaments})

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

#Vista Jugadores y sus CRUD

def view_all_players(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                "First_Name" AS first_name, 
                "Last_Name" AS last_name, 
                "Nickname" AS nickname, 
                "Country" AS country, 
                "Zone" AS zone, 
                "City" AS city, 
                "Team" AS team, 
                "Team_Secondary" AS team_secondary, 
                "Play_Offline" AS play_offline, 
                "Play_Online" AS play_online, 
                "Main_Character" AS main_character, 
                "Second_Option_Player" AS second_option_player, 
                "Third_Option_Player" AS third_option_player, 
                "Twitter" AS twitter, 
                "Instagram" AS instagram, 
                "TikTok" AS tiktok, 
                "User_Startgg" AS user_startgg, 
                "Code_Startgg" AS code_startgg, 
                "Url_StartGG" AS url_startgg, 
                "Url_Smashdata" AS url_smashdata, 
                "Combined_Teams" AS combined_teams, 
                "Combined_Characters" AS combined_characters, 
                "Logo_Team_1" AS logo_team_1, 
                "Logo_Team_2" AS logo_team_2, 
                "Logo_Main" AS logo_main, 
                "Logo_2" AS logo_2, 
                "Logo_3" AS logo_3,
                "ID" AS id
            FROM "main"."BDCS"
            ORDER BY "First_Name" ASC
            LIMIT 49999
            OFFSET 0;
        """)
        rows = cursor.fetchall()
        columns = [col[0] for col in cursor.description]
    
    players = [dict(zip(columns, row)) for row in rows]
    
    return render(request, 'myapp/players/view_all_players.html', {'players': players})



# Configurar el logger
logger = logging.getLogger(__name__)

def player_create(request):
    if request.method == 'POST':
        logger.debug("Solicitud POST recibida para crear jugador")
        form = PlayerForm(request.POST)
        if form.is_valid():
            player = form.save()
            logger.debug(f"Jugador guardado: {player}")
            return redirect('view_all_players')
        else:
            logger.error(f"Errores en el formulario: {form.errors}")
            return render(request, 'myapp/players/create_player.html', {'form': form, 'errors': form.errors})
    
    logger.debug("Solicitud GET recibida para crear jugador")
    form = PlayerForm()
    return render(request, 'myapp/players/create_player.html', {'form': form})

# Vista para editar un jugador
def edit_player(request, player_id):
    player = get_object_or_404(Player, id=player_id)
    
    if request.method == 'POST':
        player.first_name = request.POST['first_name']
        player.last_name = request.POST['last_name']
        player.nickname = request.POST['nickname']
        player.country = request.POST['country']
        player.zone = request.POST['zone']
        player.city = request.POST['city']
        player.team = request.POST['team']
        player.team_secondary = request.POST['team_secondary']
        player.play_offline = request.POST.get('play_offline') == 'on'
        player.play_online = request.POST.get('play_online') == 'on'
        player.main_character = request.POST['main_character']
        player.second_option_player = request.POST['second_option_player']
        player.third_option_player = request.POST['third_option_player']
        player.twitter = request.POST['twitter']
        player.instagram = request.POST['instagram']
        player.tiktok = request.POST['tiktok']
        player.user_startgg = request.POST['user_startgg']
        player.code_startgg = request.POST['code_startgg']
        player.url_startgg = request.POST['url_startgg']
        player.url_smashdata = request.POST['url_smashdata']
        player.combined_teams = request.POST['combined_teams']
        player.combined_characters = request.POST['combined_characters']
        player.logo_team_1 = request.POST['logo_team_1']
        player.logo_team_2 = request.POST['logo_team_2']
        player.logo_main = request.POST['logo_main']
        player.logo_2 = request.POST['logo_2']
        player.logo_3 = request.POST['logo_3']
        player.save()
        return redirect('view_all_players')  # Redirige a la lista de jugadores después de guardar

    return render(request, 'myapp/players/edit_player.html', {'player': player})

def enter_player_id(request):
    return render(request, 'myapp/players/enter_player_id.html')

def delete_player(request, player_id):
    player = get_object_or_404(Player, id=player_id)
    if request.method == 'POST':
        player.delete()
        return redirect('view_all_players')  # Redirige a la lista de jugadores después de eliminar
    return render(request, 'myapp/players/confirm_delete.html', {'player': player})
#Vista Torneos

@csrf_exempt
def view_colombia_tournament(request):
    if request.method == 'GET':
        return get_tournaments(request)
    else:
        return HttpResponseBadRequest('Método no permitido')

def get_tournaments(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                "Tournament_Name" AS tournament_name, 
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
# Configurar el logger
logger = logging.getLogger(__name__)

@csrf_protect
def add_tournament(request):
    if request.method == 'POST':
        logger.debug("Solicitud POST recibida")
        form = TournamentForm(request.POST)
        if form.is_valid():
            tournament = form.save()
            logger.debug(f"Torneo guardado: {tournament}")
            return redirect('view_colombia_tournament')
        else:
            logger.error(f"Errores en el formulario: {form.errors}")
            return render(request, 'myapp/tournaments/create_tournament.html', {'form': form, 'errors': form.errors})
    
    logger.debug("Solicitud GET recibida")
    form = TournamentForm()
    return render(request, 'myapp/tournaments/create_tournament.html', {'form': form})
    
@csrf_protect
def edit_tournament(request, pk):
    tournament = get_object_or_404(Tournament, pk=pk)
    if request.method == 'POST':
        form = TournamentForm(request.POST, instance=tournament)
        if form.is_valid():
            form.save()
            return redirect('view_colombia_tournament')
    else:
        form = TournamentForm(instance=tournament)
    return render(request, 'myapp/tournaments/edit_tournament.html', {'form': form, 'tournament': tournament})

def enter_tournament_id(request):
    return render(request, 'myapp/tournaments/enter_tournament_id.html')

@csrf_protect
def delete_tournament(request, pk):
    tournament = get_object_or_404(Tournament, pk=pk)
    if request.method == 'POST':
        tournament.delete()
        return redirect('view_colombia_tournament')
    return render(request, 'myapp/tournaments/confirm_delete.html', {'tournament': tournament})

def enter_tournament_id(request):
    return render(request, 'myapp/tournaments/enter_tournament_id.html')

def enter_tournament_id_for_delete(request):
    return render(request, 'myapp/tournaments/enter_tournament_id_for_delete.html')

#Excell
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

def upload_exceljugadores(request):
    if request.method == 'POST' and request.FILES['excel_file']:
        excel_file = request.FILES['excel_file']
        fs = FileSystemStorage()
        filename = fs.save(excel_file.name, excel_file)
        file = fs.path(filename)

        # Procesar el archivo Excel
        df = pd.read_excel(file)

        # Renombrar las columnas del DataFrame para que coincidan con los nombres de los campos en el modelo Player
        df.rename(columns={
            'First_Name': 'first_name',
            'Last_Name': 'last_name',
            'Nickname': 'nickname',
            'Country': 'country',
            'Zone': 'zone',
            'City': 'city',
            'Team': 'team',
            'Secondary_Team': 'team_secondary',
            'Play_Offline': 'play_offline',
            'Play_Online': 'play_online',
            'Main_Character': 'main_character',
            'Second_Option_Player': 'second_option_player',
            'Third_Option_Player': 'third_option_player',
            'Twitter': 'twitter',
            'Instagram': 'instagram',
            'TikTok': 'tiktok',
            'User_Startgg': 'user_startgg',
            'Code_Startgg': 'code_startgg',
            'Url_StartGG': 'url_startgg',
            'Url_Smashdata': 'url_smashdata',
            'Combined_Teams': 'combined_teams',
            'Combined_Characters': 'combined_characters',
            'Logo_Team_1': 'logo_team_1',
            'Logo_Team_2': 'logo_team_2',
            'Logo_Main': 'logo_main',
            'Logo_2': 'logo_2',
            'Logo_3': 'logo_3',
            'ID': 'id'
        }, inplace=True)

        # Convertir valores de texto a booleanos
        df['play_offline'] = df['play_offline'].map({'Sí': True, 'No': False})
        df['play_online'] = df['play_online'].map({'Sí': True, 'No': False})

        for _, row in df.iterrows():
            player_data = {
                'first_name': row['first_name'],
                'last_name': row['last_name'],
                'nickname': row['nickname'],
                'country': row['country'],
                'zone': row['zone'],
                'city': row['city'],
                'team': row['team'],
                'team_secondary': row['team_secondary'],
                'play_offline': row['play_offline'],
                'play_online': row['play_online'],
                'main_character': row['main_character'],
                'second_option_player': row['second_option_player'],
                'third_option_player': row['third_option_player'],
                'twitter': row['twitter'],
                'instagram': row['instagram'],
                'tiktok': row['tiktok'],
                'user_startgg': row['user_startgg'],
                'code_startgg': row['code_startgg'],
                'url_startgg': row['url_startgg'],
                'url_smashdata': row['url_smashdata'],
                'combined_teams': row['combined_teams'],
                'combined_characters': row['combined_characters'],
                'logo_team_1': row['logo_team_1'],
                'logo_team_2': row['logo_team_2'],
                'logo_main': row['logo_main'],
                'logo_2': row['logo_2'],
                'logo_3': row['logo_3']
            }
            if 'id' in row:
                player_data['id'] = int(row['id'])
            Player.objects.create(**player_data)

        return redirect('home')
    return render(request, 'myapp/upload_exceljugadores.html')
# API Consultas

def get_event_id_view(request):
    tournament_name = request.GET.get('tournament_name')
    event_name = request.GET.get('event_name')

    if not tournament_name or not event_name:
        return JsonResponse({'error': 'Faltan parámetros o son inválidos'}, status=400)

    event_slug = f"tournament/{tournament_name}/event/{event_name}"
    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': f'Bearer {STARTGG_KEY}'
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
            STARTGG_URL,
            headers=headers,
            json={'query': query, 'variables': variables}
        )
        
        response.raise_for_status()
        
        data = response.json()
        print('API response:', data)

        if 'errors' in data:
            print('API returned errors:', data['errors'])
            return JsonResponse({'error': 'Error in API response'}, status=400)

        if 'data' not in data or 'event' not in data['data']:
            print('Response structure:', data)
            return JsonResponse({'error': 'Invalid response structure'}, status=400)

        event_id = data['data']['event']['id']
        return JsonResponse({'event_id': event_id})
     
    except requests.exceptions.RequestException as e:
        print('Error al obtener el ID del evento:', e)
        return JsonResponse({'error': str(e)}, status=500)

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
    
