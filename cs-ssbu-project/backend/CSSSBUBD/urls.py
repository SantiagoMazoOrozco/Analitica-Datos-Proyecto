# CSSSBUBD/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('CSSSBUBD.myapp.urls')),
    path('', include('CSSSBUBD.myapp.urls')),  # Incluir URLs de tu aplicación
]
