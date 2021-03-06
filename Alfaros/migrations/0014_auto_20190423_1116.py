# Generated by Django 2.2 on 2019-04-23 10:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Alfaros', '0013_auto_20190423_0007'),
    ]

    operations = [
        migrations.CreateModel(
            name='AlertSettings',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rule_name', models.CharField(max_length=500)),
            ],
        ),
        migrations.CreateModel(
            name='TimeRules',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rule_name', models.CharField(max_length=500)),
                ('time', models.CharField(max_length=19)),
                ('severity', models.CharField(max_length=19)),
                ('def_time', models.CharField(default='', max_length=500)),
            ],
        ),
        migrations.AlterField(
            model_name='alerts',
            name='destination',
            field=models.CharField(blank=True, default='Unknown', max_length=200),
        ),
        migrations.AlterField(
            model_name='alerts',
            name='is_threat',
            field=models.CharField(blank=True, default='Unknown', max_length=5),
        ),
        migrations.AlterField(
            model_name='alerts',
            name='manager',
            field=models.CharField(blank=True, default='Pending...', max_length=100),
        ),
        migrations.AlterField(
            model_name='alerts',
            name='source',
            field=models.CharField(blank=True, default='Unknown', max_length=200),
        ),
        migrations.AlterField(
            model_name='alerts',
            name='status',
            field=models.CharField(blank=True, default='Pending...', max_length=100),
        ),
        migrations.AlterField(
            model_name='alerts',
            name='tool_alias',
            field=models.CharField(blank=True, default='Unknown', max_length=500),
        ),
    ]
