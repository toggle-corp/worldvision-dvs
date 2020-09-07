from rest_framework import serializers

from report.report_fields import LABELS
from .models import Project, District


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ('name', 'code')


class MunicipalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ('name', 'code')


class MiniProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'name',)


class ProjectSerializer(serializers.ModelSerializer):
    rc_data = serializers.SerializerMethodField()
    district = DistrictSerializer()
    municipalities = MunicipalitySerializer(many=True)
    support_pariticipation_detail = serializers.SerializerMethodField()
    most_vulnerable_children_indicator = serializers.SerializerMethodField()
    most_vulnerable_children_vulnerability_marker = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'

    def get_rc_data(self, instance):
        # NOTE: Make sure the reports are sorted correctly
        report = instance.reports.first()
        if report and report.data:
            fields = [
                'planned', 'totalRc', 'sponsored',
                'available', 'hold', 'death',
                'totalMale', 'totalFemale', 'totalLeft',
            ]
            rc_data = report.data.get('rcData') or {}
            return [
                {
                    'name': LABELS[field],
                    'value': rc_data.get(field),
                } for field in fields
            ]

    def get_support_pariticipation_detail(self, obj):
        return self.context.get('support_pariticipation_detail', {}).get(obj.pk)

    def get_most_vulnerable_children_indicator(self, obj):
        return self.context.get('most_vulnerable_children_indicator', {}).get(obj.pk)

    def get_most_vulnerable_children_vulnerability_marker(self, obj):
        return self.context.get('most_vulnerable_children_vulnerability_marker', {}).get(obj.pk)
