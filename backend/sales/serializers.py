from rest_framework import serializers
from .models import Client, Vente, VenteItem
from products.models import Produit


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ProduitSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produit
        fields = ['id', 'nom', 'reference', 'prix_vente', 'quantite_en_stock']


class VenteItemSerializer(serializers.ModelSerializer):
    produit = ProduitSimpleSerializer(read_only=True)
    produit_id = serializers.PrimaryKeyRelatedField(
        queryset=Produit.objects.all(),
        write_only=True,
        source='produit'
    )

    class Meta:
        model = VenteItem
        fields = ['id', 'produit', 'produit_id', 'quantite', 'prix_unitaire', 'type_remise', 'montant_total']
        read_only_fields = ['montant_total']


class VenteDetailSerializer(serializers.ModelSerializer):
    client = ClientSerializer()
    items = VenteItemSerializer(many=True, read_only=True)
    utilisateur_nom = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Vente
        fields = '__all__'
        read_only_fields = ['numero', 'montant_total', 'montant_ht', 'montant_ttc', 'created_at', 'updated_at']

    def get_utilisateur_nom(self, obj):
        if obj.utilisateur:
            return obj.utilisateur.get_full_name() or obj.utilisateur.username
        return None


class VenteListSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    utilisateur_nom = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Vente
        fields = ['id', 'numero', 'client', 'client_nom', 'date_vente', 'statut', 'est_paye', 'montant_ttc', 'utilisateur_nom', 'created_at']
        read_only_fields = ['numero', 'montant_ttc', 'created_at']

    def get_utilisateur_nom(self, obj):
        if obj.utilisateur:
            return obj.utilisateur.get_full_name() or obj.utilisateur.username
        return 'Anonyme'


class VenteUpdateSerializer(serializers.ModelSerializer):
    items = VenteItemSerializer(many=True, write_only=True)

    class Meta:
        model = Vente
        fields = ['client', 'statut', 'est_paye', 'notes', 'items']

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        
        # Update vente fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Delete existing items and create new ones
        instance.items.all().delete()
        for item_data in items_data:
            VenteItem.objects.create(vente=instance, **item_data)
        
        instance.calculer_totaux()
        instance.save()
        return instance


class VenteCreateSerializer(serializers.ModelSerializer):
    items = VenteItemSerializer(many=True, write_only=True)

    class Meta:
        model = Vente
        fields = ['client', 'statut', 'est_paye', 'notes', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        validated_data['utilisateur'] = self.context['request'].user
        vente = Vente.objects.create(**validated_data)
        
        for item_data in items_data:
            VenteItem.objects.create(vente=vente, **item_data)
        
        vente.calculer_totaux()
        vente.save()
        return vente
