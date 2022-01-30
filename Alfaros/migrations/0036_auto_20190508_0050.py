# Generated by Django 2.2 on 2019-05-07 23:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Alfaros', '0035_auto_20190507_2348'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='report',
            name='instance',
        ),
        migrations.AddField(
            model_name='report',
            name='creation_date',
            field=models.CharField(default='', max_length=19),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='report',
            name='next_run_time',
            field=models.CharField(default='', max_length=19),
        ),
        migrations.AddField(
            model_name='report',
            name='owner',
            field=models.CharField(default='System', max_length=100),
        ),
        migrations.AddField(
            model_name='report',
            name='report_name',
            field=models.CharField(default='', max_length=500),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='report',
            name='schedule',
            field=models.CharField(default='', max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='report',
            name='type',
            field=models.CharField(default='Default', max_length=100),
        ),
        migrations.AddField(
            model_name='report',
            name='view',
            field=models.CharField(default='HTML', max_length=50),
        ),
        migrations.DeleteModel(
            name='generate_report',
        ),
    ]
