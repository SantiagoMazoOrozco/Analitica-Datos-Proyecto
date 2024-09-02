from django.shortcuts import render
<<<<<<< HEAD
from .models import DBCS

def my_view(request):
    data = BDCS.objects.all()
    return render(request, 'my_template.html', {'data': data})
=======
from django.http import JsonResponse
from .models import Tournament, Event, Player, Set

def home(request):
    return render(request, 'myapp/home.html')

def page1(request):
    if request.method == 'POST':
        event_id = request.POST.get('event_id')
        results = get_event_results(event_id)
        return JsonResponse(results, safe=False)
    return render(request, 'myapp/page1.html')

def page2(request):
    if request.method == 'POST':
        tournament_name = request.POST.get('tournament_name')
        event_name = request.POST.get('event_name')
        event_id = get_event_id(tournament_name, event_name)
        return JsonResponse({'event_id': event_id})
    return render(request, 'myapp/page2.html')

def page3(request):
    if request.method == 'POST':
        player_id = request.POST.get('player_id')
        limit = int(request.POST.get('limit', 5))
        sets = get_sets_by_player(player_id, limit)
        return JsonResponse(sets, safe=False)
    return render(request, 'myapp/page3.html')

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
>>>>>>> 59d6183aadefbd7cf6888696ef1f6a8df6c7294f
