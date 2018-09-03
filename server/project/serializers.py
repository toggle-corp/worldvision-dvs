from rest_framework import serializers

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    rcData = serializers.JSONField(source='get_rc_data')

    class Meta:
        model = Project
        exclude = ('selected_report',)
