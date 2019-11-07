from django.db.models import Sum
from rest_framework import serializers

from project.models import Project
from report.models import (
    Report,
    ProjectSOI,
    RegisterChildByAgeAndGender,
    PresenceAndParticipation,
    ChildFamilyParticipation,
    LanguagePeopleGroupDisability,
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


class ProjectLanguagePeopleGroupDisabilitySerializer(serializers.ModelSerializer):
    project_id = serializers.IntegerField(source='id')
    disabilities = serializers.SerializerMethodField()

    def get_disabilities(self, instance):
        qs = LanguagePeopleGroupDisability.objects.filter(project=instance)
        return {
            field: list(
                qs.values('date', field).annotate(
                    count=Sum('count', distinct=True),
                ).values('date', f'{field}', 'count')
            ) for field in ('language', 'people_group', 'disability')
        }

    class Meta:
        model = Project
        fields = ('project_id', 'disabilities')
