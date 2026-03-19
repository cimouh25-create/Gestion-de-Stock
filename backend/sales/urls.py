from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, VenteViewSet

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'ventes', VenteViewSet, basename='vente')

urlpatterns = [
    path('', include(router.urls)),
]
