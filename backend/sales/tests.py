from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Client, Vente, VenteItem
from products.models import Produit, Categorie

User = get_user_model()


class ClientTestCase(TestCase):
    def setUp(self):
        self.client = Client.objects.create(
            nom='Test Client',
            email='test@example.com'
        )

    def test_client_creation(self):
        self.assertEqual(self.client.nom, 'Test Client')
        self.assertTrue(self.client.est_actif)


class VenteTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.client = Client.objects.create(nom='Test Client')
        self.categorie = Categorie.objects.create(nom='Test Category')
        self.produit = Produit.objects.create(
            nom='Test Product',
            reference='TST001',
            categorie=self.categorie,
            prix_achat=10.00,
            prix_vente=20.00
        )

    def test_vente_creation(self):
        vente = Vente.objects.create(
            numero='VNT-00001',
            client=self.client,
            utilisateur=self.user
        )
        self.assertEqual(vente.client, self.client)
        self.assertEqual(vente.statut, 'brouillon')

    def test_vente_totals_calculation(self):
        vente = Vente.objects.create(
            client=self.client,
            utilisateur=self.user
        )
        VenteItem.objects.create(
            vente=vente,
            produit=self.produit,
            quantite=2,
            prix_unitaire=20.00
        )
        vente.calculer_totaux()
        self.assertEqual(float(vente.montant_ht), 40.00)
        self.assertEqual(float(vente.montant_ttc), 48.00)
