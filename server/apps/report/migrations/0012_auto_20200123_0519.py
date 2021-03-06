# Generated by Django 2.1.12 on 2020-01-23 05:19

from django.db import migrations, models


def delete_old_registerchildbyageandgender_records(apps, schema_editor):
    RegisterChildByAgeAndGender = apps.get_model('report', 'RegisterChildByAgeAndGender')
    RegisterChildByAgeAndGender.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0012_auto_20190909_1550'),
        ('report', '0011_auto_20191224_1055'),
    ]

    operations = [
        migrations.RunPython(
            delete_old_registerchildbyageandgender_records,
            reverse_code=migrations.RunPython.noop,
        ),

        migrations.AddField(
            model_name='registerchildbyageandgender',
            name='age',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AlterUniqueTogether(
            name='registerchildbyageandgender',
            unique_together={('project', 'date', 'age', 'gender')},
        ),
        migrations.RemoveField(
            model_name='registerchildbyageandgender',
            name='age_range',
        ),
    ]
