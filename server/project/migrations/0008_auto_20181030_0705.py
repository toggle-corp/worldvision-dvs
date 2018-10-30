# Generated by Django 2.1 on 2018-10-30 07:05

from django.db import migrations, models
import django.db.models.deletion
from django.core.management import call_command


def load_initial_municipalities(apps, schema_editor):
    call_command('loaddata', 'initial_municipalities.json', app_label='project')


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0007_auto_20180913_1614'),
    ]

    operations = [
        migrations.CreateModel(
            name='Municipality',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('code', models.CharField(max_length=255, unique=True)),
                ('district', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='municipalities', to='project.District')),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.AddField(
            model_name='project',
            name='municipality',
            field=models.ManyToManyField(blank=True, to='project.Municipality'),
        ),
        migrations.RunPython(load_initial_municipalities),
    ]
