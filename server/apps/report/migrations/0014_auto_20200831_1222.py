# Generated by Django 2.1.15 on 2020-08-31 12:22

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0013_project_child_marriage_count'),
        ('report', '0013_auto_20200814_1150'),
    ]

    operations = [
        migrations.CreateModel(
            name='MostVulnerableChildrenIndicator',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('mvc_count', models.IntegerField(default=0)),
                ('rc_not_vc_count', models.IntegerField(default=0)),
                ('rc_count', models.IntegerField(default=0)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='project.Project')),
            ],
        ),
        migrations.CreateModel(
            name='MostVulnerableChildrenVulnerabilityMarker',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('data', django.contrib.postgres.fields.jsonb.JSONField(default=dict)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='project.Project')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='mostvulnerablechildrenvulnerabilitymarker',
            unique_together={('project', 'date')},
        ),
        migrations.AlterUniqueTogether(
            name='mostvulnerablechildrenindicator',
            unique_together={('project', 'date')},
        ),
    ]
