#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from sales.models import Client
from products.models import Categorie, Produit

# Create test clients
clients_data = [
    {'nom': 'Acme Corporation', 'type_client': 'entreprise', 'email': 'contact@acme.com', 'telephone': '0123456789', 'adresse': '123 Rue de la Paix', 'code_postal': '75001', 'ville': 'Paris'},
    {'nom': 'Jean Dupont', 'type_client': 'particulier', 'email': 'jean@example.com', 'telephone': '0612345678', 'adresse': '456 Avenue des Champs', 'code_postal': '75008', 'ville': 'Paris'},
    {'nom': 'Tech Solutions', 'type_client': 'entreprise', 'email': 'info@techsol.fr', 'telephone': '0532145896', 'adresse': '789 Boulevard Montmartre', 'code_postal': '75002', 'ville': 'Paris'},
    {'nom': 'Marie Martin', 'type_client': 'particulier', 'email': 'marie@example.com', 'telephone': '0687654321', 'adresse': '321 Rue de Rivoli', 'code_postal': '75004', 'ville': 'Paris'},
]

for client_data in clients_data:
    client, created = Client.objects.get_or_create(
        nom=client_data['nom'],
        defaults=client_data
    )
    if created:
        print(f"✓ Client créé: {client.nom}")
    else:
        print(f"  Client existe déjà: {client.nom}")

# Create test categories
categories = [
    {'nom': 'Électronique', 'description': 'Produits électroniques'},
    {'nom': 'Logiciels', 'description': 'Logiciels et licences'},
    {'nom': 'Services', 'description': 'Services professionnels'},
]

for cat_data in categories:
    cat, created = Categorie.objects.get_or_create(**cat_data)
    if created:
        print(f"✓ Catégorie créée: {cat.nom}")

# Create test products
cat_elec = Categorie.objects.get(nom='Électronique')
cat_soft = Categorie.objects.get(nom='Logiciels')

products_data = [
    {
        'nom': 'Laptop Dell XPS',
        'reference': 'DELL-XPS-001',
        'description': 'Laptop haute performance',
        'categorie': cat_elec,
        'prix_achat': 600.00,
        'prix_vente': 999.00,
        'quantite_en_stock': 10,
    },
    {
        'nom': 'Office 365 Licence',
        'reference': 'MS-OFF365-001',
        'description': 'Licence annuelle Microsoft Office',
        'categorie': cat_soft,
        'prix_achat': 50.00,
        'prix_vente': 99.00,
        'quantite_en_stock': 50,
    },
    {
        'nom': 'Moniteur 27" 4K',
        'reference': 'MON-27K-001',
        'description': 'Moniteur ultra haute définition',
        'categorie': cat_elec,
        'prix_achat': 200.00,
        'prix_vente': 399.00,
        'quantite_en_stock': 15,
    },
    {
        'nom': 'Support technique',
        'reference': 'SUP-TECH-001',
        'description': 'Support technique mensuel',
        'categorie': Categorie.objects.get(nom='Services'),
        'prix_achat': 100.00,
        'prix_vente': 250.00,
        'quantite_en_stock': 100,
    },
]

for prod_data in products_data:
    prod, created = Produit.objects.get_or_create(
        reference=prod_data['reference'],
        defaults=prod_data
    )
    if created:
        print(f"✓ Produit créé: {prod.nom}")
    else:
        print(f"  Produit existe déjà: {prod.nom}")

print("\n✓ Données de test créées avec succès!")
