# Generated by Django 2.1 on 2018-08-28 19:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0002_project_selected_report'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='selected_report',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='report.Report'),
        ),
    ]
