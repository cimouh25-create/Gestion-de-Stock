# Generated migration for updating Remise types and removing taux_tva

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0004_alter_vente_statut'),
    ]

    operations = [
        migrations.AddField(
            model_name='vente',
            name='type_remise',
            field=models.CharField(choices=[('gros', 'Gros (-30%)'), ('semi-gros', 'Semi-gros (-10%)'), ('détails', 'Détails (0%)')], default='détails', max_length=20),
        ),
        migrations.RemoveField(
            model_name='vente',
            name='montant_remise',
        ),
        migrations.RemoveField(
            model_name='vente',
            name='taux_tva',
        ),
    ]
