# Generated by Django 2.1 on 2018-10-30 09:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('site_setting', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='SiteSettings',
            new_name='SiteSetting',
        ),
    ]
