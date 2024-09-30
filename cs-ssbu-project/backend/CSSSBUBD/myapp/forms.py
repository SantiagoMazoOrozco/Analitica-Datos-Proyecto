from django import forms
from .models import Set, Player, Tournament

class PlayerForm(forms.ModelForm):
    class Meta:
        model = Player
        fields = '__all__'

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