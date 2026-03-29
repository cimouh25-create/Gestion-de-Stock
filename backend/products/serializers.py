from rest_framework import serializers
from .models import Categorie, Fournisseur, Produit, Achat, AchatItem


class CategorieSerializer(serializers.ModelSerializer):
    nombre_produits = serializers.IntegerField(
        source='produits.count', read_only=True
    )

    class Meta:
        model = Categorie
        fields = ['id', 'nom', 'description', 'nombre_produits', 'created_at']


class FournisseurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fournisseur
        fields = ['id', 'nom', 'email', 'telephone', 'adresse']


class ProduitSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(
        source='categorie.nom', read_only=True
    )
    fournisseur_nom = serializers.CharField(
        source='fournisseur.nom', read_only=True
    )
    stock_critique = serializers.BooleanField(read_only=True)
    valeur_stock = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    image_url = serializers.SerializerMethodField(read_only=True)

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f'/media/{obj.image.name}'
        return None

    class Meta:
        model = Produit
        fields = [
            'id', 'nom', 'reference', 'barcode', 'description',
            'categorie', 'categorie_nom',
            'fournisseur', 'fournisseur_nom',
            'image', 'image_url', 'prix_achat', 'prix_vente', 'cout_moyen_pondere',
            'quantite_en_stock', 'seuil_alerte',
            'stock_critique', 'valeur_stock',
            'est_actif', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'cout_moyen_pondere']


class ProduitListSerializer(serializers.ModelSerializer):
    """Serializer allégé pour les listes"""
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    stock_critique = serializers.BooleanField(read_only=True)
    image_url = serializers.SerializerMethodField(read_only=True)

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f'/media/{obj.image.name}'
        return None

    class Meta:
        model = Produit
        fields = [
            'id', 'nom', 'reference', 'barcode', 'description', 'categorie_nom',
            'image', 'image_url',
            'prix_achat', 'prix_vente', 'cout_moyen_pondere',
            'quantite_en_stock', 'seuil_alerte',
            'stock_critique', 'est_actif',
        ]


class AchatItemSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    produit_reference = serializers.CharField(source='produit.reference', read_only=True)

    class Meta:
        model = AchatItem
        fields = ['id', 'produit', 'produit_nom', 'produit_reference', 
                  'quantite', 'prix_unitaire', 'montant_total']


class AchatSerializer(serializers.ModelSerializer):
    items = AchatItemSerializer(many=True, read_only=True)
    fournisseur_nom = serializers.CharField(source='fournisseur.nom', read_only=True)

    class Meta:
        model = Achat
        fields = [
            'id', 'numero', 'fournisseur', 'fournisseur_nom',
            'date_achat', 'date_reception', 'statut',
            'montant_ht', 'montant_remise', 'montant_tva', 'montant_ttc',
            'taux_tva', 'notes', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['numero', 'created_at', 'updated_at', 'montant_ht', 
                           'montant_tva', 'montant_ttc', 'montant_total']


class AchatListSerializer(serializers.ModelSerializer):
    fournisseur_nom = serializers.CharField(source='fournisseur.nom', read_only=True)
    nombre_articles = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = Achat
        fields = [
            'id', 'numero', 'fournisseur', 'fournisseur_nom',
            'date_achat', 'date_reception', 'statut',
            'montant_ttc', 'nombre_articles'
        ]