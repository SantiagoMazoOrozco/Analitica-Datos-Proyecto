from django.shortcuts import render
from .models import DBCS

def my_view(request):
    data = BDCS.objects.all()
    return render(request, 'my_template.html', {'data': data})
