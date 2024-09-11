from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('page1/', views.page1, name='page1'),
    path('page2/', views.page2, name='page2'),
    path('page3/', views.page3, name='page3'),
    path('page4/', views.page4, name='page4'),
    path('create/', views.player_create, name='player_create'),
    path('update/<int:pk>/', views.player_update, name='player_update'),
    path('delete/<int:pk>/', views.player_delete, name='player_delete'),
    path('view_all_players/', views.view_all_players, name='view_all_players'),
]
