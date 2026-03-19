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