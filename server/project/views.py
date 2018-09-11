from rest_framework import viewsets, response
from django.shortcuts import get_object_or_404

from .models import Project
from .serializers import ProjectSerializer
from report.serializers import ReportSerializer
from report.report_fields import LABELS


class ProjectViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for listing or retrieving projects.
    """
    def list(self, request, version):
        queryset = Project.objects.all()
        serializer = ProjectSerializer(queryset, many=True)
        return response.Response(serializer.data)


class ProjectReportViewSet(viewsets.ViewSet):
    """
    Project's report viewset
    """
    def retrieve(self, request, version, pk=None):
        queryset = Project.objects.all()
        project = get_object_or_404(queryset, pk=pk)
        serializer = ReportSerializer(project.selected_report)
        return response.Response(serializer.data)


class ProjectSummaryViewSet(viewsets.ViewSet):
    """
    Project's report viewset
    """

    def normalize(self, fields, data):
        return [
            {'key': key, 'value': data[key], 'label': LABELS[key]}
            for key in fields
        ]

    def initial_dict(self, fields):
        return {field: 0 for field in fields}

    def list(self, request, version):
        child_monitoring_fields = ['@NotSighted30Days', '@NotSighted60Days', '@NotSighted90Days']
        health_nutrition_fields = ['@HealthSatisfactory', '@HealthNotSatisfactory']
        correspondences_fields = ['pendingCurrent', 'pendingOverDue']
        rc_fields = ['planned', 'sponsored', 'available', 'hold', 'death']

        child_monitoring = self.initial_dict(child_monitoring_fields)
        health_nutrition = self.initial_dict(health_nutrition_fields)
        correspondences = self.initial_dict(correspondences_fields)
        rc = self.initial_dict(rc_fields)

        for project in Project.objects.all():
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
        return response.Response({
            'reportDate': Project.objects.first().selected_report.data.get('reportDate'),
            'childMonitoring': self.normalize(child_monitoring_fields, child_monitoring),
            'healthNutrition': self.normalize(health_nutrition_fields, health_nutrition),
            'correspondences': self.normalize(correspondences_fields, correspondences),
            'rc': self.normalize(rc_fields, rc),
        })
