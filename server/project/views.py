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
        user = get_object_or_404(queryset, pk=pk)
        serializer = ReportSerializer(user.selected_report)
        return response.Response(serializer.data)
