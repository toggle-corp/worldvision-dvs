from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from rest_framework import viewsets, response

from summary_group.serializers import get_projects_summary
from report.models import Report
from report.serializers import ReportSerializer
from .models import Project
from .serializers import ProjectSerializer


class ProjectViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for listing or retrieving projects.
    """
    def list(self, request, version):
        queryset = Project.objects.prefetch_related(
            Prefetch('reports', queryset=Report.objects.order_by('-id')),
            'district', 'municipalities',
        ).all()
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
