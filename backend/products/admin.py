from django.contrib import admin
from .models import Categorie, Fournisseur, Produit

@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ['nom', 'description']
    search_fields = ['nom']

@admin.register(Fournisseur)
class FournisseurAdmin(admin.ModelAdmin):
    list_display = ['nom', 'email', 'telephone']
    search_fields = ['nom', 'email']

@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display = [
        'reference', 'nom', 'categorie',
        'quantite_en_stock', 'seuil_alerte',
        'prix_vente', 'est_actif'
    ]
    list_filter = ['categorie', 'est_actif', 'fournisseur']
    search_fields = ['nom', 'reference']
    list_editable = ['quantite_en_stock', 'est_actif']
    readonly_fields = ['created_at', 'updated_at']