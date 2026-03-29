from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, F

from .models import Categorie, Fournisseur, Produit, Achat, AchatItem
from .serializers import (
    CategorieSerializer, FournisseurSerializer,
    ProduitSerializer, ProduitListSerializer,
    AchatSerializer, AchatListSerializer, AchatItemSerializer
)


class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom']
    ordering_fields = ['nom', 'created_at']


class FournisseurViewSet(viewsets.ModelViewSet):
    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom', 'email']


class ProduitViewSet(viewsets.ModelViewSet):
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'reference', 'barcode', 'categorie__nom']
    ordering_fields = ['nom', 'quantite_en_stock', 'prix_vente', 'created_at']
    ordering = ['nom']

    def get_queryset(self):
        qs = Produit.objects.select_related('categorie', 'fournisseur')
        # Filtre par catégorie
        categorie = self.request.query_params.get('categorie')
        if categorie:
            qs = qs.filter(categorie_id=categorie)
        # Filtre actif/inactif
        est_actif = self.request.query_params.get('est_actif')
        if est_actif is not None:
            qs = qs.filter(est_actif=est_actif.lower() == 'true')
        # Filtre stock critique
        stock_critique = self.request.query_params.get('stock_critique')
        if stock_critique == 'true':
            qs = qs.filter(quantite_en_stock__lte=F('seuil_alerte'))

        barcode = self.request.query_params.get('barcode')
        if barcode:
            qs = qs.filter(barcode=barcode)

        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return ProduitListSerializer
        return ProduitSerializer

    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """Statistiques globales du stock"""
        qs = self.get_queryset()
        total_produits = qs.count()
        produits_critiques = qs.filter(
            quantite_en_stock__lte=F('seuil_alerte')
        ).count()
        valeur_totale = qs.aggregate(
            total=Sum(F('quantite_en_stock') * F('prix_achat'))
        )['total'] or 0

        return Response({
            'total_produits': total_produits,
            'produits_actifs': qs.filter(est_actif=True).count(),
            'produits_critiques': produits_critiques,
            'valeur_totale_stock': valeur_totale,
        })

    @action(detail=False, methods=['get'])
    def alertes(self, request):
        """Produits en dessous du seuil d'alerte"""
        qs = self.get_queryset().filter(
            quantite_en_stock__lte=F('seuil_alerte'),
            est_actif=True
        )
        serializer = ProduitListSerializer(qs, many=True)
        return Response(serializer.data)


class AchatViewSet(viewsets.ModelViewSet):
    queryset = Achat.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['numero', 'fournisseur__nom']
    ordering_fields = ['date_achat', 'montant_ttc', 'statut']
    ordering = ['-date_achat']

    def get_queryset(self):
        qs = Achat.objects.select_related('fournisseur').prefetch_related('items')
        # Filtre par statut
        statut = self.request.query_params.get('statut')
        if statut:
            qs = qs.filter(statut=statut)
        # Filtre par fournisseur
        fournisseur = self.request.query_params.get('fournisseur')
        if fournisseur:
            qs = qs.filter(fournisseur_id=fournisseur)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return AchatListSerializer
        return AchatSerializer

    @action(detail=True, methods=['post'])
    def ajouter_item(self, request, pk=None):
        """Ajouter un article à un achat"""
        achat = self.get_object()
        
        produit_id = request.data.get('produit_id')
        quantite = request.data.get('quantite')
        prix_unitaire = request.data.get('prix_unitaire')

        if not all([produit_id, quantite, prix_unitaire]):
            return Response(
                {'error': 'produit_id, quantite et prix_unitaire sont requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            produit = Produit.objects.get(id=produit_id)
            item, created = AchatItem.objects.update_or_create(
                achat=achat,
                produit=produit,
                defaults={
                    'quantite': quantite,
                    'prix_unitaire': prix_unitaire,
                }
            )
            serializer = AchatItemSerializer(item)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Produit.DoesNotExist:
            return Response(
                {'error': 'Produit non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['delete'])
    def supprimer_item(self, request, pk=None):
        """Supprimer un article d'un achat"""
        achat = self.get_object()
        item_id = request.data.get('item_id')

        try:
            item = AchatItem.objects.get(id=item_id, achat=achat)
            item.delete()
            achat.calculer_totaux()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except AchatItem.DoesNotExist:
            return Response(
                {'error': 'Article non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def confirmer(self, request, pk=None):
        """Confirmer un achat"""
        achat = self.get_object()
        if achat.statut == 'brouillon':
            achat.statut = 'confirmé'
            achat.save()
            return Response(
                AchatSerializer(achat).data,
                status=status.HTTP_200_OK
            )
        return Response(
            {'error': 'Seuls les brouillons peuvent être confirmés'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def recevoir(self, request, pk=None):
        """Marquer un achat comme reçu"""
        achat = self.get_object()
        if achat.statut in ['brouillon', 'confirmé']:
            achat.statut = 'reçu'
            from datetime import date
            achat.date_reception = date.today()
            achat.save()
            
            # Mettre à jour le stock et le CMP
            for item in achat.items.all():
                item.produit.quantite_en_stock += item.quantite
                item.produit.save()
            
            achat.mettre_a_jour_stock_et_cmp()
            
            return Response(
                AchatSerializer(achat).data,
                status=status.HTTP_200_OK
            )
        return Response(
            {'error': 'Cet achat ne peut pas être marqué comme reçu'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """Statistiques des achats"""
        qs = self.get_queryset()
        total_achats = qs.count()
        total_montant = qs.aggregate(
            total=Sum('montant_ttc')
        )['total'] or 0

        return Response({
            'total_achats': total_achats,
            'total_montant': total_montant,
            'achats_recus': qs.filter(statut='reçu').count(),
            'achats_en_attente': qs.exclude(statut__in=['reçu', 'annulé']).count(),
        })