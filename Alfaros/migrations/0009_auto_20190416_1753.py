# Generated by Django 2.2 on 2019-04-16 16:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Alfaros', '0008_auto_20190413_0247'),
    ]

    operations = [
        migrations.AlterField(
            model_name='alerts',
            name='date',
            field=models.CharField(max_length=19),
        ),
    ]
