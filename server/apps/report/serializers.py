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
    SupportPariticipationDetail,
)

from project.serializers import MiniProjectSerializer


class BaseSerializer(serializers.ModelSerializer):
    project_detail = MiniProjectSerializer(source='project', read_only=True)


class ReportSerializer(BaseSerializer):
    class Meta:
        model = Report
        fields = '__all__'


class ProjectSOISerializer(BaseSerializer):
    class Meta:
        model = ProjectSOI
        fields = '__all__'


class RegisterChildByAgeAndGenderSerializer(BaseSerializer):
    class Meta:
        model = RegisterChildByAgeAndGender
        fields = '__all__'


class PresenceAndParticipationSerializer(BaseSerializer):
    class Meta:
        model = PresenceAndParticipation
        fields = '__all__'


class ChildFamilyParticipationSerializer(BaseSerializer):
    class Meta:
        model = ChildFamilyParticipation
        fields = '__all__'


class SupportPariticipationDetailSerializer(BaseSerializer):
    class Meta:
        model = SupportPariticipationDetail
        fields = '__all__'


class ProjectLanguagePeopleGroupDisabilitySerializer(serializers.ModelSerializer):
    project_id = serializers.IntegerField(source='id')
    language = serializers.SerializerMethodField()
    people_group = serializers.SerializerMethodField()
    disability = serializers.SerializerMethodField()

    def _get_field_value(self, instance, field):
        qs = LanguagePeopleGroupDisability.objects.filter(project=instance)
        return list(
            qs.values('date', field).annotate(
                count=Sum('count', distinct=True),
            ).values('date', f'{field}', 'count')
        )

    def get_language(self, instance):
        return self._get_field_value(instance, 'language')

    def get_people_group(self, instance):
        return self._get_field_value(instance, 'people_group')

    def get_disability(self, instance):
        return self._get_field_value(instance, 'disability')

    class Meta:
        model = Project
        fields = ('project_id', 'language', 'people_group', 'disability')
