from rest_framework import serializers

from .models import Project, District


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ('name', 'code')


class ProjectSerializer(serializers.ModelSerializer):
    rcData = serializers.JSONField(source='get_rc_data')
    district = DistrictSerializer()

    class Meta:
        model = Project
        exclude = ('selected_report',)
