from django.db import models

class Tournament(models.Model):
    name = models.CharField(max_length=255)

class Event(models.Model):
    name = models.CharField(max_length=255)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)

class Player(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    nickname = models.CharField(max_length=100)
    country = models.CharField(max_length=100,default='Colombia')
    zone = models.CharField(max_length=100)
    city = models.CharField(max_length=100,default='No Data')
    team = models.CharField(max_length=100, blank=True, null=True)
    secondary_team = models.CharField(max_length=100, blank=True, null=True)
    play_offline = models.BooleanField(default=True)
    play_online = models.BooleanField(default=True)
    main_character = models.CharField(max_length=100)
    second_option_player = models.CharField(max_length=100, blank=True, null=True)
    third_option_player = models.CharField(max_length=100, blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    tiktok = models.URLField(blank=True, null=True)
    user_startgg = models.CharField(max_length=100, blank=True, null=True)
    code_startgg = models.CharField(max_length=20, blank=True, null=True)
    url_startgg = models.URLField(blank=True, null=True)
    url_smashdata = models.URLField(blank=True, null=True)
    combined_teams = models.TextField(blank=True, null=True)
    combined_characters = models.TextField(blank=True, null=True)
    logo_team_1 = models.URLField(blank=True, null=True)
    logo_team_2 = models.URLField(blank=True, null=True)
    logo_main = models.URLField(blank=True, null=True)
    logo_2 = models.URLField(blank=True, null=True)
    logo_3 = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.nickname} ({self.first_name} {self.last_name})"
class Set(models.Model):
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    nickname = models.CharField(max_length=100, null=True, blank=True)
    startgg_user = models.CharField(max_length=100, null=True, blank=True)
    team = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"