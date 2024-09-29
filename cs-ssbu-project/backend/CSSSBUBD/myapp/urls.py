from django.urls import path
from . import views
from .views import get_event_id_view, get_event_results, get_sets_by_tournament_view, view_colombia_tournament, upload_excel, create_tournament, view_all_sets, set_create, set_update, set_delete

urlpatterns = [
    path('', views.home, name='home'),
    path('create/', views.player_create, name='player_create'),
    path('update/<int:pk>/', views.player_update, name='player_update'),
    path('delete/<int:pk>/', views.player_delete, name='player_delete'),
    path('view_all_players/', views.view_all_players, name='view_all_players'),
    path('api/get-event-id/', views.get_event_id_view, name='get_event_id'),
    path('api/get-sets-by-tournament/', get_sets_by_tournament_view, name='get_sets_by_tournament'),
    path('upload-excel/', upload_excel, name='upload_excel'),
    path('create-tournament/', create_tournament, name='create_tournament'),
    path('view-colombia-tournament/', view_colombia_tournament, name='view_colombia_tournament'),
    path('view_all_sets/', view_all_sets, name='view_all_sets'),
    path('set/create/', set_create, name='set_create'),
    path('set/update/<int:pk>/', set_update, name='set_update'),
    path('set/delete/<int:pk>/', set_delete, name='set_delete'),
]