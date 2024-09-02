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
    startgg_user = models.CharField(max_length=100)
    team = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Set(models.Model):
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    nickname = models.CharField(max_length=100, null=True, blank=True)
    startgg_user = models.CharField(max_length=100, null=True, blank=True)
    team = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"