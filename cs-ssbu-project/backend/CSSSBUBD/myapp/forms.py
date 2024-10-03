from django import forms
from .models import Set, Player, Tournament

class PlayerForm(forms.ModelForm):
    class Meta:
        model = Player
        fields = [
            'first_name', 
            'last_name', 
            'nickname', 
            'country', 
            'zone', 
            'city', 
            'team', 
            'team_secondary', 
            'play_offline', 
            'play_online', 
            'main_character', 
            'second_option_player', 
            'third_option_player', 
            'twitter', 
            'instagram', 
            'tiktok', 
            'user_startgg', 
            'code_startgg', 
            'url_startgg', 
            'url_smashdata', 
            'combined_teams', 
            'combined_characters', 
            'logo_team_1', 
            'logo_team_2', 
            'logo_main', 
            'logo_2', 
            'logo_3'
        ]

class UploadFileForm(forms.Form):
    file = forms.FileField()

from django import forms
from .models import Tournament

class TournamentForm(forms.ModelForm):
    class Meta:
        model = Tournament
        fields = [
            'tournament_name', 'winner', 'attendees', 'zona', 'pais', 
            'region', 'ciudad', 'direccion', 'date', 'url'
        ]

class SetForm(forms.ModelForm):
    class Meta:
        model = Set
        fields = ['id', 'display_score', 'phase_name', 'event_name', 'tournament_name']