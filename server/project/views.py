from rest_framework import viewsets, response
from django.shortcuts import get_object_or_404

from .models import Project
from .serializers import ProjectSerializer
from report.serializers import ReportSerializer


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
    def list(self, request, version):
        child_monitoring = {
            '@NotSighted90Days': 0,
            '@NotSighted60Days': 0,
            '@NotSighted30Days': 0,
        }
        health_nutrition = {
            '@HealthSatisfactory': 0,
            '@HealthNotSatisfactory': 0,
        }
        correspondences = {
            'pendingCurrent': 0,
            'pendingOverDue': 0,
        }
        for project in Project.objects.all():
            report = project.selected_report
            if report and report.data:
                for datum in report.data['childMonitoring']:
                    key = datum['key']
                    if key in child_monitoring:
                        child_monitoring[key] += datum['value']
                for datum in report.data['healthNutrition']:
                    key = datum['key']
                    if key in health_nutrition:
                        health_nutrition[key] += datum['value']
                for datum in report.data['correspondences']:
                    for key in correspondences.keys():
                        correspondences[key] += datum[key]
        return response.Response({
            'childMonitoring': child_monitoring,
            'healthNutrition': health_nutrition,
            'correspondences': correspondences,
        })
