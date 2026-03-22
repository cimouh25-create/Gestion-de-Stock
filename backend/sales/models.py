from django.db import models
from django.core.validators import MinValueValidator
from products.models import Produit
from django.contrib.auth import get_user_model
from datetime import datetime


User = get_user_model()


class Client(models.Model):
    TYPES = [
        ('entreprise', 'Entreprise'),
        ('particulier', 'Particulier'),
    ]
    
    nom = models.CharField(max_length=200)
    type_client = models.CharField(max_length=20, choices=TYPES, default='particulier')
    email = models.EmailField(blank=True)
    telephone = models.CharField(max_length=20, blank=True)
    adresse = models.TextField(blank=True)
    code_postal = models.CharField(max_length=20, blank=True)
    ville = models.CharField(max_length=100, blank=True)
    contact_principal = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    est_actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'

    def __str__(self):
        return self.nom


class Vente(models.Model):
    STATUTS = [
        ('brouillon', 'Brouillon'),
        ('confirmée', 'Confirmée'),
        ('annulée', 'Annulée'),
    ]
    
    numero = models.CharField(max_length=50, unique=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='ventes')
    date_vente = models.DateField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=STATUTS, default='brouillon')
    est_paye = models.BooleanField(default=False, verbose_name="Payé")
    montant_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    montant_remise = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    montant_ht = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    montant_tva = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    montant_ttc = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    taux_tva = models.DecimalField(max_digits=5, decimal_places=2, default=20)
    utilisateur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Vente'
        verbose_name_plural = 'Ventes'

    def __str__(self):
        return f"Vente {self.numero} - {self.client.nom}"

    def generer_numero(self):
        """Génère un numéro de vente unique avec format YYYYNNNN (ex: 260001)"""
        year = datetime.now().year % 100  # Dernier 2 chiffres de l'année
        
        # Récupère le dernier numéro avec le même préfixe année
        last_vente = Vente.objects.filter(numero__startswith=str(year)).order_by('-numero').first()
        
        if last_vente and last_vente.numero:
            try:
                # Extrait le nombre du dernier numéro
                last_num = int(last_vente.numero)
                next_num = last_num + 1
            except (ValueError, IndexError):
                next_num = int(str(year) + '0001')
        else:
            next_num = int(str(year) + '0001')
        
        return str(next_num)

    def save(self, *args, **kwargs):
        # Auto-générer le numéro s'il n'existe pas
        if not self.numero:
            self.numero = self.generer_numero()
        super().save(*args, **kwargs)

    def calculer_totaux(self):
        """Recalcule les montants totaux"""
        items = self.items.all()
        self.montant_ht = sum(item.montant_total for item in items) - self.montant_remise
        self.montant_tva = self.montant_ht * (self.taux_tva / 100)
        self.montant_ttc = self.montant_ht + self.montant_tva
        self.montant_total = self.montant_ttc
        self.save()


class VenteItem(models.Model):
    vente = models.ForeignKey(Vente, on_delete=models.CASCADE, related_name='items')
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    montant_total = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Ligne de vente'
        verbose_name_plural = 'Lignes de vente'
        unique_together = ['vente', 'produit']

    def __str__(self):
        return f"{self.produit.nom} x {self.quantite}"

    def save(self, *args, **kwargs):
        # Récupérer l'ancienne quantité si elle existe
        old_quantity = 0
        if self.pk:
            try:
                old_instance = VenteItem.objects.get(pk=self.pk)
                old_quantity = old_instance.quantite
            except VenteItem.DoesNotExist:
                old_quantity = 0
        
        # Calculer la différence de quantité
        quantity_diff = self.quantite - old_quantity
        
        self.montant_total = self.quantite * self.prix_unitaire
        super().save(*args, **kwargs)
        
        # Mettre à jour le stock du produit si la vente est confirmée
        if self.vente.statut == 'confirmée':
            self.produit.quantite_en_stock -= quantity_diff
            if self.produit.quantite_en_stock < 0:
                self.produit.quantite_en_stock = 0
            self.produit.save()
        
        self.vente.calculer_totaux()

    def delete(self, *args, **kwargs):
        """Restaurer le stock lors de la suppression"""
        if self.vente.statut == 'confirmée':
            self.produit.quantite_en_stock += self.quantite
            self.produit.save()
        super().delete(*args, **kwargs)
        self.vente.calculer_totaux()
