from django.urls import path
from . import views
from .views import get_event_id_view
from .views import get_event_results
from .views import get_sets_by_tournament_view

urlpatterns = [
    path('', views.home, name='home'),
    path('create/', views.player_create, name='player_create'),
    path('update/<int:pk>/', views.player_update, name='player_update'),
    path('delete/<int:pk>/', views.player_delete, name='player_delete'),
    path('view_all_players/', views.view_all_players, name='view_all_players'),
    path('api/get-event-id/', get_event_id_view, name='get_event_id'),
    path('api/get-sets-by-tournament/', get_sets_by_tournament_view, name='get_sets_by_tournament'),
]
