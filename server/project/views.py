from rest_framework import viewsets, response
from django.shortcuts import get_object_or_404

from .models import Project
from .serializers import ProjectSerializer
from summary_group.serializers import get_projects_summary
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
        serializer = ReportSerializer(
            project.selected_report,
            context={'request': request}
        )
        return response.Response(serializer.data)


class ProjectSummaryViewSet(viewsets.ViewSet):
    """
    Project's report viewset
    """

    def list(self, request, version):
        summary = get_projects_summary(Project.objects.all())
        return response.Response(summary)
