# Generated by Django 2.1.12 on 2020-08-12 09:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0012_auto_20190909_1550'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='child_marriage_count',
            field=models.IntegerField(default=0),
        ),
    ]
