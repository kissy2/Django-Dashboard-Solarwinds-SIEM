# Generated by Django 2.2 on 2019-04-22 22:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Alfaros', '0010_remove_alerts_is_threat'),
    ]

    operations = [
        migrations.AddField(
            model_name='alerts',
            name='is_threat',
            field=models.CharField(blank=True, default='', max_length=5),
        ),
        migrations.AlterField(
            model_name='alerts',
            name='destination',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AlterField(
            model_name='alerts',
            name='manager',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AlterField(
            model_name='alerts',
            name='source',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AlterField(
            model_name='alerts',
            name='status',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AlterField(
            model_name='alerts',
            name='tool_alias',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
    ]