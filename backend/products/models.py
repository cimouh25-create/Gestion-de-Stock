from django.db import models
from django.core.validators import MinValueValidator

class Categorie(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Catégorie'
        ordering = ['nom']

    def __str__(self):
        return self.nom


class Fournisseur(models.Model):
    nom = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    telephone = models.CharField(max_length=20, blank=True)
    adresse = models.TextField(blank=True)

    def __str__(self):
        return self.nom


class Produit(models.Model):
    nom = models.CharField(max_length=200)
    reference = models.CharField(max_length=50, unique=True)
    barcode = models.CharField(max_length=128, unique=True, blank=True, null=True)
    description = models.TextField(blank=True)
    categorie = models.ForeignKey(
        Categorie, on_delete=models.SET_NULL,
        null=True, related_name='produits'
    )
    fournisseur = models.ForeignKey(
        Fournisseur, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='produits'
    )
    image = models.ImageField(upload_to='produits/', blank=True, null=True)
    prix_achat = models.DecimalField(max_digits=10, decimal_places=2,
                                     validators=[MinValueValidator(0)])
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2,
                                      validators=[MinValueValidator(0)])
    cout_moyen_pondere = models.DecimalField(max_digits=10, decimal_places=2,
                                             default=0, validators=[MinValueValidator(0)],
                                             verbose_name="CMP (Coût Moyen Pondéré)")
    quantite_en_stock = models.IntegerField(default=0,
                                             validators=[MinValueValidator(0)])
    seuil_alerte = models.IntegerField(default=5,
                                        validators=[MinValueValidator(0)])
    est_actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Produit'
        ordering = ['nom']

    def __str__(self):
        return f"{self.reference} - {self.nom}"

    @property
    def stock_critique(self):
        return self.quantite_en_stock <= self.seuil_alerte

    @property
    def valeur_stock(self):
        return self.quantite_en_stock * self.prix_achat


class Achat(models.Model):
    """Modèle pour les achats de produits"""
    STATUTS = [
        ('brouillon', 'Brouillon'),
        ('confirmé', 'Confirmé'),
        ('reçu', 'Reçu'),
        ('annulé', 'Annulé'),
    ]
    
    numero = models.CharField(max_length=50, unique=True, blank=True)
    fournisseur = models.ForeignKey(Fournisseur, on_delete=models.CASCADE, related_name='achats')
    date_achat = models.DateField(auto_now_add=True)
    date_reception = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUTS, default='brouillon')
    montant_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    montant_remise = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    montant_ht = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    montant_tva = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    montant_ttc = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    taux_tva = models.DecimalField(max_digits=5, decimal_places=2, default=20)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Achat'
        verbose_name_plural = 'Achats'

    def __str__(self):
        return f"Achat {self.numero} - {self.fournisseur.nom}"

    def generer_numero(self):
        """Génère un numéro d'achat unique avec format AAYYNNNN (ACN prefix)"""
        from datetime import datetime
        prefix = "AC" + str(datetime.now().year % 100)
        
        last_achat = Achat.objects.filter(numero__startswith=prefix).order_by('-numero').first()
        
        if last_achat and last_achat.numero:
            try:
                last_num = int(last_achat.numero[4:])
                next_num = last_num + 1
            except (ValueError, IndexError):
                next_num = 1
        else:
            next_num = 1
        
        return f"{prefix}{str(next_num).zfill(4)}"

    def save(self, *args, **kwargs):
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

    def mettre_a_jour_stock_et_cmp(self):
        """Met à jour le stock et le CMP pour tous les produits"""
        for item in self.items.all():
            produit = item.produit
            
            # Récalculer le CMP si l'achat est reçu
            if self.statut == 'reçu':
                # Récupérer tous les achats reçus pour ce produit
                from django.db.models import Sum, DecimalField, F
                from django.db.models import Q
                
                achat_items = AchatItem.objects.filter(
                    produit=produit,
                    achat__statut='reçu'
                )
                
                total_quantite = achat_items.aggregate(
                    total=Sum('quantite')
                )['total'] or 0
                
                total_valeur = sum(
                    ai.quantite * ai.prix_unitaire 
                    for ai in achat_items
                )
                
                if total_quantite > 0:
                    produit.cout_moyen_pondere = total_valeur / total_quantite
                    produit.save()


class AchatItem(models.Model):
    """Modèle pour les articles d'achat"""
    achat = models.ForeignKey(Achat, on_delete=models.CASCADE, related_name='items')
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    montant_total = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Ligne d\'achat'
        verbose_name_plural = 'Lignes d\'achat'
        unique_together = ['achat', 'produit']

    def __str__(self):
        return f"{self.produit.nom} x {self.quantite}"

    def save(self, *args, **kwargs):
        # Récupérer l'ancienne quantité si elle existe
        old_quantity = 0
        if self.pk:
            try:
                old_instance = AchatItem.objects.get(pk=self.pk)
                old_quantity = old_instance.quantite
            except AchatItem.DoesNotExist:
                old_quantity = 0
        
        # Calculer la différence de quantité
        quantity_diff = int(self.quantite) - int(old_quantity)

        self.montant_total = int(self.quantite) * float(self.prix_unitaire)
        super().save(*args, **kwargs)
        
        # Mettre à jour le stock si l'achat est reçu
        if self.achat.statut == 'reçu':
            self.produit.quantite_en_stock += quantity_diff
            if self.produit.quantite_en_stock < 0:
                self.produit.quantite_en_stock = 0
            self.produit.save()
            self.achat.mettre_a_jour_stock_et_cmp()
        
        self.achat.calculer_totaux()

    def delete(self, *args, **kwargs):
        """Restaurer le stock lors de la suppression"""
        if self.achat.statut == 'reçu':
            self.produit.quantite_en_stock -= self.quantite
            if self.produit.quantite_en_stock < 0:
                self.produit.quantite_en_stock = 0
            self.produit.save()
            self.achat.mettre_a_jour_stock_et_cmp()
        super().delete(*args, **kwargs)
        self.achat.calculer_totaux()