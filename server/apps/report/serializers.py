from django.db import models
from django.db.models import Sum
from django.db.models.functions import Cast
from django.contrib.postgres.fields.jsonb import KeyTextTransform
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
    MostVulnerableChildrenIndicator,
    MostVulnerableChildrenVulnerabilityMarker,
)

from project.serializers import MiniProjectSerializer


class BaseSerializer(serializers.ModelSerializer):
    project_detail = MiniProjectSerializer(source='project', read_only=True)


class ReportSerializer(BaseSerializer):
    support_pariticipation_detail = serializers.SerializerMethodField()
    most_vulnerable_children_indicator = serializers.SerializerMethodField()
    most_vulnerable_children_vulnerability_marker = serializers.SerializerMethodField()

    def get_support_pariticipation_detail(self, obj):
        return SupportPariticipationDetail.objects.filter(project=obj.project).values('type', 'comment').annotate(
            count_sum=Sum('count')
        ).values('type', 'comment', 'count_sum')

    def get_most_vulnerable_children_indicator(self, obj):
        return MostVulnerableChildrenIndicator.objects.filter(project=obj.project).aggregate(
            total_mvc_count=Sum('mvc_count'),
            total_rc_not_vc_count=Sum('rc_not_vc_count'),
            total_rc_count=Sum('rc_count'),
        )

    def get_most_vulnerable_children_vulnerability_marker(self, obj):
        return MostVulnerableChildrenVulnerabilityMarker.objects.filter(project=obj.project).aggregate(
            **{
                field_label: Sum(Cast(KeyTextTransform(field, 'data'), models.IntegerField()))
                for field, field_label in MostVulnerableChildrenVulnerabilityMarker.get_data_fields()
            },
        )

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
