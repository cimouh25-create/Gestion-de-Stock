from django.contrib import admin
from .models import Client, Vente, VenteItem


class VenteItemInline(admin.TabularInline):
    model = VenteItem
    extra = 1
    readonly_fields = ['montant_total']


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['nom', 'type_client', 'email', 'telephone', 'est_actif', 'created_at']
    list_filter = ['type_client', 'est_actif', 'created_at']
    search_fields = ['nom', 'email', 'telephone']
    fieldsets = (
        ('Informations générales', {
            'fields': ('nom', 'type_client', 'est_actif')
        }),
        ('Contact', {
            'fields': ('email', 'telephone', 'contact_principal')
        }),
        ('Adresse', {
            'fields': ('adresse', 'code_postal', 'ville')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
    )


@admin.register(Vente)
class VenteAdmin(admin.ModelAdmin):
    list_display = ['numero', 'client', 'date_vente', 'statut', 'montant_ttc', 'utilisateur']
    list_filter = ['statut', 'date_vente', 'taux_tva']
    search_fields = ['numero', 'client__nom']
    readonly_fields = ['numero', 'montant_total', 'montant_ht', 'montant_tva', 'montant_ttc', 'created_at', 'updated_at']
    inlines = [VenteItemInline]
    fieldsets = (
        ('Informations', {
            'fields': ('numero', 'client', 'date_vente', 'utilisateur', 'statut')
        }),
        ('Détails commerciaux', {
            'fields': ('taux_tva', 'montant_remise')
        }),
        ('Calculs', {
            'fields': ('montant_ht', 'montant_tva', 'montant_ttc', 'montant_total'),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
