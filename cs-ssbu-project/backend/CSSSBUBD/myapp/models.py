from django.db import models

class Tournament(models.Model):
    id = models.IntegerField(primary_key=True, unique=True)
    tournament_name = models.CharField(max_length=255, null=True, blank=True)
    winner = models.CharField(max_length=255, null=True, blank=True)
    attendees = models.IntegerField(null=True, blank=True)
    zona = models.CharField(max_length=255, null=True, blank=True)
    pais = models.CharField(max_length=255, null=True, blank=True)
    region = models.CharField(max_length=255, null=True, blank=True)
    ciudad = models.CharField(max_length=255, null=True, blank=True)
    direccion = models.CharField(max_length=255, null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    url = models.URLField(null=True, blank=True)

    class Meta:
        db_table = 'Colombia Tournament'

    def __str__(self):
        return self.tournament_name



class Player(models.Model):
    id = models.IntegerField(primary_key=True, unique=True)  # Asegúrate de que sea un campo numérico
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    nickname = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='Colombia')
    zone = models.CharField(max_length=100)
    city = models.CharField(max_length=100, default='No Data')
    team = models.CharField(max_length=100, blank=True, null=True)
    team_secondary = models.CharField(max_length=100, blank=True, null=True, default='No data')
    play_offline = models.BooleanField(default=True)
    play_online = models.BooleanField(default=True)
    main_character = models.CharField(max_length=100)
    second_option_player = models.CharField(max_length=100, blank=True, null=True)
    third_option_player = models.CharField(max_length=100, blank=True, null=True)
    twitter = models.TextField(blank=True, null=True)
    instagram = models.TextField(blank=True, null=True)
    tiktok = models.TextField(blank=True, null=True)
    user_startgg = models.CharField(max_length=100, blank=True, null=True)
    code_startgg = models.CharField(max_length=20, blank=True, null=True,)
    url_startgg = models.URLField(blank=True, null=True)
    url_smashdata = models.URLField(blank=True, null=True)
    combined_teams = models.TextField(blank=True, null=True)
    combined_characters = models.TextField(blank=True, null=True)
    logo_team_1 = models.TextField(blank=True, null=True)
    logo_team_2 = models.TextField(blank=True, null=True)
    logo_main = models.TextField(blank=True, null=True)
    logo_2 = models.TextField(blank=True, null=True)
    logo_3 = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'BDCS'

    def __str__(self):
        return f"{self.nickname} ({self.first_name} {self.last_name})"

class Set(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    display_score = models.CharField(max_length=100, null=True, blank=True, default='')
    phase_name = models.CharField(max_length=100, null=True, blank=True, default='')
    event_name = models.CharField(max_length=100, null=True, blank=True, default='')
    tournament_name = models.CharField(max_length=100, null=True, blank=True, default='')

    def __str__(self):
        return f"{self.id} - {self.display_score}"