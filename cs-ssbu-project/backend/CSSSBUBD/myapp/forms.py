from django import forms
from .models import Player

class PlayerForm(forms.ModelForm):
    class Meta:
        model = Player
        fields = '__all__'

#Subir Archivo Excell

class UploadFileForm(forms.Form):
    file = forms.FileField()
    
#Formulario Colombia_Tournamet
class TournamentForm(forms.Form):
    tournament_name = forms.CharField(label='Tournament Name', max_length=100)
    winner = forms.CharField(label='Winner', max_length=100)
    attendees = forms.IntegerField(label='Attendees')
    zona = forms.CharField(label='Zona', max_length=100)
    pais = forms.CharField(label='Pais', max_length=100)
    region = forms.CharField(label='Region', max_length=100)
    ciudad = forms.CharField(label='Ciudad', max_length=100)
    direccion = forms.CharField(label='Direccion', max_length=100)
    date = forms.CharField(label='Date', max_length=100)
    id = forms.IntegerField(label='ID')
    url = forms.CharField(label='URL', max_length=200)    