from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Client, Vente, VenteItem
from .serializers import (
    ClientSerializer, VenteListSerializer, VenteDetailSerializer, VenteCreateSerializer, VenteUpdateSerializer
)
from django_filters.rest_framework import DjangoFilterBackend


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'email', 'telephone']
    ordering_fields = ['created_at', 'nom']
    ordering = ['-created_at']


class VenteViewSet(viewsets.ModelViewSet):
    queryset = Vente.objects.all()
    serializer_class = VenteDetailSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['statut']
    search_fields = ['numero', 'client__nom']
    ordering_fields = ['date_vente', 'montant_ttc', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return VenteListSerializer
        elif self.action == 'create':
            return VenteCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return VenteUpdateSerializer
        return VenteDetailSerializer

    def perform_create(self, serializer):
        # Only set utilisateur if user is authenticated
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(utilisateur=self.request.user)
        else:
            serializer.save()

    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """Retourne les statistiques de ventes"""
        # Période par défaut: 30 derniers jours
        jours = int(request.query_params.get('jours', 30))
        date_debut = timezone.now() - timedelta(days=jours)

        ventes = Vente.objects.filter(created_at__gte=date_debut)
        
        stats = {
            'total_ventes': ventes.count(),
            'montant_total': float(ventes.aggregate(Sum('montant_ttc'))['montant_ttc__sum'] or 0),
            'montant_moyen': float(ventes.aggregate(Sum('montant_ttc'))['montant_ttc__sum'] or 0) / max(ventes.count(), 1),
            'clients_distincts': ventes.values('client_id').distinct().count(),
            'par_statut': dict(
                ventes.values('statut').annotate(count=Count('id')).values_list('statut', 'count')
            ),
            'par_client': list(
                ventes.values('client__nom')
                .annotate(montant=Sum('montant_ttc'), count=Count('id'))
                .order_by('-montant')[:10]
            ),
        }
        return Response(stats)

    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        """Valide une vente (brouillon -> confirmée)"""
        vente = self.get_object()
        if vente.statut != 'brouillon':
            return Response(
                {'erreur': 'Seules les brouillons peuvent être validés'},
                status=status.HTTP_400_BAD_REQUEST
            )
        vente.statut = 'confirmée'
        vente.save()
        return Response(VenteDetailSerializer(vente).data)

    @action(detail=True, methods=['post'])
    def annuler(self, request, pk=None):
        """Annule une vente"""
        vente = self.get_object()
        vente.statut = 'annulée'
        vente.save()
        return Response(VenteDetailSerializer(vente).data)

    @action(detail=True, methods=['get'])
    def facture(self, request, pk=None):
        """Génère un aperçu imprimable de la facture"""
        vente = self.get_object()
        
        html = f"""
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Facture {vente.numero}</title>
            <style>
                body {{ font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }}
                .header {{ display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }}
                .company-info h1 {{ margin: 0; color: #2c3e50; }}
                .invoice-details {{ text-align: right; }}
                .client-info {{ margin-bottom: 40px; background: #f9f9f9; padding: 20px; border-radius: 8px; }}
                table {{ width: 100%; border-collapse: collapse; margin-bottom: 30px; }}
                th {{ text-align: left; padding: 12px; background: #2c3e50; color: white; }}
                td {{ padding: 12px; border-bottom: 1px solid #eee; }}
                .totals {{ text-align: right; }}
                .total-final {{ font-size: 1.2em; font-weight: bold; color: #2c3e50; margin-top: 10px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-info"><h1>Gestion de Stock</h1><p>Facture #{vente.numero}</p></div>
                <div class="invoice-details"><p><strong>Date:</strong> {vente.date_vente.strftime('%d/%m/%Y')}</p><p><strong>Statut:</strong> {vente.get_statut_display()}</p></div>
            </div>
            <div class="client-info">
                <h3>Client: {vente.client.nom}</h3>
                {f'<p>{vente.client.adresse}</p>' if vente.client.adresse else ''}
                {f'<p>Tél: {vente.client.telephone}</p>' if vente.client.telephone else ''}
            </div>
            <table>
                <thead><tr><th>Désignation</th><th>Qté</th><th>Prix Unit.</th><th>Total</th></tr></thead>
                <tbody>
        """
        for item in vente.items.all():
            html += f"<tr><td>{item.produit.nom}</td><td>{item.quantite}</td><td>{item.prix_unitaire:.2f} €</td><td>{item.montant_total:.2f} €</td></tr>"
            
        html += f"""
                </tbody>
            </table>
            <div class="totals"><p>Total HT: {vente.montant_ht:.2f} €</p><p>TVA ({vente.taux_tva}%): {vente.montant_tva:.2f} €</p><p class="total-final">Total TTC: {vente.montant_ttc:.2f} €</p></div>
            <script>window.onload = function() {{ window.print(); }}</script>
        </body>
        </html>
        """
        return HttpResponse(html)
