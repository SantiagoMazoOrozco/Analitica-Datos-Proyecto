<<<<<<< HEAD
=======
from django.db import models

class Tournament(models.Model):
    name = models.CharField(max_length=255)

class Event(models.Model):
    name = models.CharField(max_length=255)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)

class Player(models.Model):
    name = models.CharField(max_length=255)

class Set(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    result = models.TextField()
>>>>>>> 59d6183aadefbd7cf6888696ef1f6a8df6c7294f
