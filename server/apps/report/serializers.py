from rest_framework import serializers

from report.models import (
    Report,
    ProjectSOI,
    RegisterChildByAgeAndGender,
    PresenceAndParticipation,
    ChildFamilyParticipation,
)


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'


class ProjectSOISerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectSOI
        fields = '__all__'


class RegisterChildByAgeAndGenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegisterChildByAgeAndGender
        fields = '__all__'


class PresenceAndParticipationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PresenceAndParticipation
        fields = '__all__'


class ChildFamilyParticipationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChildFamilyParticipation
        fields = '__all__'
