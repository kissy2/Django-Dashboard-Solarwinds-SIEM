# Generated by Django 2.2 on 2019-05-06 18:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Alfaros', '0024_ticket_monitoring_notify_time'),
    ]

    operations = [
        migrations.AddField(
            model_name='alerts',
            name='s_updated',
            field=models.CharField(blank=True, default='False', max_length=5),
        ),
    ]
