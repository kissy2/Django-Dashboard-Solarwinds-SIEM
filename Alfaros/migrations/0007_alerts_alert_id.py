# Generated by Django 2.2 on 2019-04-12 21:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Alfaros', '0006_alerts_manager'),
    ]

    operations = [
        migrations.AddField(
            model_name='alerts',
            name='alert_id',
            field=models.CharField(default='aaa', max_length=50),
            preserve_default=False,
        ),
    ]
