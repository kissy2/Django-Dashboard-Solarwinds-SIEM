# Generated by Django 2.2 on 2019-04-29 03:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Alfaros', '0016_auto_20190428_0121'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='timerules',
            name='id',
        ),
        migrations.AlterField(
            model_name='timerules',
            name='rule_name',
            field=models.CharField(max_length=500, primary_key=True, serialize=False),
        ),
    ]