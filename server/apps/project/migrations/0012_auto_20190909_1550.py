# Generated by Django 2.1.12 on 2019-09-09 15:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0011_remove_project_selected_report'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='lat',
            field=models.DecimalField(decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AlterField(
            model_name='project',
            name='long',
            field=models.DecimalField(decimal_places=6, max_digits=9, null=True),
        ),
    ]