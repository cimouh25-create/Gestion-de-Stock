from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategorieViewSet, FournisseurViewSet, ProduitViewSet

router = DefaultRouter()
router.register('categories', CategorieViewSet, basename='categorie')
router.register('fournisseurs', FournisseurViewSet, basename='fournisseur')
router.register('produits', ProduitViewSet, basename='produit')

urlpatterns = [
    path('', include(router.urls)),
]