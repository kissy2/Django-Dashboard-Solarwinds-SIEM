# Generated by Django 2.2 on 2019-05-07 22:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Alfaros', '0034_auto_20190507_2344'),
    ]

    operations = [
        migrations.AlterField(
            model_name='report',
            name='instance',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='Alfaros.generate_report'),
        ),
    ]
