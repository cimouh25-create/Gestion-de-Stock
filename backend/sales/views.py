from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Client, Vente, VenteItem
from .serializers import (
    ClientSerializer, VenteListSerializer, VenteDetailSerializer, VenteCreateSerializer, VenteUpdateSerializer
)


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'email', 'telephone']
    ordering_fields = ['created_at', 'nom']
    ordering = ['-created_at']


class VenteViewSet(viewsets.ModelViewSet):
    queryset = Vente.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
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
    def livrer(self, request, pk=None):
        """Marque une vente comme livrée"""
        vente = self.get_object()
        if vente.statut == 'annulée':
            return Response(
                {'erreur': 'Une vente annulée ne peut pas être livrée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        vente.statut = 'livrée'
        vente.save()
        return Response(VenteDetailSerializer(vente).data)

    @action(detail=True, methods=['post'])
    def annuler(self, request, pk=None):
        """Annule une vente"""
        vente = self.get_object()
        vente.statut = 'annulée'
        vente.save()
        return Response(VenteDetailSerializer(vente).data)
