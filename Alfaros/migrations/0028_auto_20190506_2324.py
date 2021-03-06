# Generated by Django 2.2 on 2019-05-06 22:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Alfaros', '0027_auto_20190506_2311'),
    ]

    operations = [
        migrations.AlterField(
            model_name='open_ticket',
            name='current',
            field=models.DecimalField(decimal_places=10, max_digits=20),
        ),
        migrations.AlterField(
            model_name='open_ticket',
            name='expiring',
            field=models.DecimalField(decimal_places=10, max_digits=20),
        ),
        migrations.AlterField(
            model_name='open_ticket',
            name='half',
            field=models.DecimalField(decimal_places=10, max_digits=20),
        ),
        migrations.AlterField(
            model_name='open_ticket',
            name='time',
            field=models.DecimalField(decimal_places=10, max_digits=20),
        ),
        migrations.AlterField(
            model_name='ticket_monitoring',
            name='time',
            field=models.DecimalField(decimal_places=10, max_digits=20),
        ),
    ]
