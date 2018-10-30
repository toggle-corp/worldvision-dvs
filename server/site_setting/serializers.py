from rest_framework import serializers

from .models import SiteSetting


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = '__all__'
