from django.urls import path
from . import views
from .views import get_event_id_view, get_event_results, get_sets_by_tournament_view, view_colombia_tournament, upload_excel, create_tournament, view_all_sets, set_create, set_update, set_delete,upload_exceljugadores,enter_player_id
from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    # Otras rutas...
    
   #Apis
   
    path('api/get-event-id/', views.get_event_id_view, name='get_event_id'),
    path('api/get-sets-by-tournament/', views.get_sets_by_tournament_view, name='get_sets_by_tournament'),
    path('upload-excel/', views.upload_excel, name='upload_excel'),
    path('upload_exceljugadores/', upload_exceljugadores, name='upload_exceljugadores'),
    
    #Players
    path('view-all-players/', views.view_all_players, name='view_all_players'),
    path('create/', views.player_create, name='player_create'),
    path('edit/<int:player_id>/', views.edit_player, name='edit_player'),  # Asegúrate de que sea <int:player_id>
    path('enter_player_id/', views.enter_player_id, name='enter_player_id'),
    path('delete/<int:player_id>/', views.delete_player, name='delete_player'),  # Nueva ruta para eliminar jugadores
    
    

    
    # Rutas Tournaments
    
    path('view-colombia-tournament/', views.view_colombia_tournament, name='view_colombia_tournament'),
    path('add_tournament/', views.add_tournament, name='add_tournament'),  # Actualizar la URL
    path('edit_tournament/<int:pk>/', views.edit_tournament, name='edit_tournament'),
    path('enter_tournament_id/', views.enter_tournament_id, name='enter_tournament_id'),
    path('delete_tournament/<int:pk>/', views.delete_tournament, name='delete_tournament'),
    path('enter_tournament_id_for_delete/', views.enter_tournament_id_for_delete, name='enter_tournament_id_for_delete'),
    # Rutas Sets
    path('view_all_sets/', views.view_all_sets, name='view_all_sets'),
    path('set/create/', views.set_create, name='set_create'),
    path('set/update/<int:pk>/', views.set_update, name='set_update'),
    path('set/delete/<int:pk>/', views.set_delete, name='set_delete'),
]