from rest_framework import serializers
from .models import Categorie, Fournisseur, Produit


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
            'id', 'nom', 'reference', 'description',
            'categorie', 'categorie_nom',
            'fournisseur', 'fournisseur_nom',
            'image', 'image_url', 'prix_achat', 'prix_vente',
            'quantite_en_stock', 'seuil_alerte',
            'stock_critique', 'valeur_stock',
            'est_actif', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


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
            'id', 'nom', 'reference', 'description', 'categorie_nom',
            'image', 'image_url',
            'prix_achat', 'prix_vente',
            'quantite_en_stock', 'seuil_alerte',
            'stock_critique', 'est_actif',
        ]