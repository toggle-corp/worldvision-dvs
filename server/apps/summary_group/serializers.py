from rest_framework import serializers

from report.report_fields import LABELS
from .models import SummaryGroup


def get_projects_summary(projects):
    def normalize(fields, data):
        return [
            {'key': key, 'value': data[key], 'label': LABELS[key]}
            for key in fields
        ]

    def initial_dict(fields):
        return {field: 0 for field in fields}

    child_monitoring_fields = [
        '@NotSighted30Days', '@NotSighted60Days', '@NotSighted90Days',
        '@VisitCompleted'
    ]
    health_nutrition_fields = ['@HealthSatisfactory', '@HealthNotSatisfactory']
    correspondences_fields = ['pendingCurrent', 'pendingOverDue']
    rc_fields = [
        'planned', 'totalRc', 'sponsored', 'available', 'hold',
        'death', 'totalMale', 'totalFemale'
    ]

    child_monitoring = initial_dict(child_monitoring_fields)
    health_nutrition = initial_dict(health_nutrition_fields)
    correspondences = initial_dict(correspondences_fields)
    rc = initial_dict(rc_fields)

    for project in projects:
        report = project.selected_report
        if report and report.data:
            data = report.data
            for datum in data['childMonitoring']:
                key = datum['key']
                if key in child_monitoring:
                    child_monitoring[key] += datum['value']
            for datum in data['healthNutrition']:
                key = datum['key']
                if key in health_nutrition:
                    health_nutrition[key] += datum['value']
            for datum in data['correspondences']:
                for key in correspondences.keys():
                    correspondences[key] += datum[key]
            for key in rc.keys():
                rc[key] += data['rcData'][key]

    reportDate = None
    for project in projects:
        report = project.selected_report  # Latest Report
        if report:
            reportDate = report.data.get('reportDate')
            break

    return {
        'reportDate': reportDate,
        'childMonitoring': normalize(child_monitoring_fields, child_monitoring),
        'healthNutrition': normalize(health_nutrition_fields, health_nutrition),
        'correspondences': normalize(correspondences_fields, correspondences),
        'rc': normalize(rc_fields, rc),
    }


class SummaryGroupSerializer(serializers.ModelSerializer):
    summary = serializers.SerializerMethodField()

    class Meta:
        model = SummaryGroup
        fields = '__all__'

    def get_summary(self, obj):
        return get_projects_summary(obj.projects.all())
