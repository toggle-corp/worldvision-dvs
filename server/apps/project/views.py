from django.db import models
from django.db.models import Prefetch, Sum
from django.db.models.functions import Cast
from django.shortcuts import get_object_or_404
from django.contrib.postgres.fields.jsonb import KeyTextTransform
from rest_framework import viewsets, response

from summary_group.serializers import get_projects_summary
from report.models import Report
from report.serializers import ReportSerializer
from report.models import (
    SupportPariticipationDetail,
    MostVulnerableChildrenIndicator,
    MostVulnerableChildrenVulnerabilityMarker,
)

from .models import Project
from .serializers import ProjectSerializer


class ProjectViewSet(viewsets.ViewSet):
    """
    # TODO: Use viewset (Also refactor)
    A simple ViewSet for listing or retrieving projects.
    """
    def list(self, request, version):
        queryset = Project.objects.prefetch_related(
            Prefetch('reports', queryset=Report.objects.order_by('-id')),
            'district', 'municipalities',
        ).all()

        support_pariticipation_detail = {
            data.pop('project'): data
            for data in SupportPariticipationDetail.objects.order_by().values('project', 'type', 'comment').annotate(
                count_sum=Sum('count')
            ).values('project', 'type', 'comment', 'count_sum')
        }
        most_vulnerable_children_indicator = {
            data.pop('project'): data
            for data in MostVulnerableChildrenIndicator.objects.order_by().values('project').annotate(
                total_mvc_count=Sum('mvc_count'),
                total_rc_not_vc_count=Sum('rc_not_vc_count'),
                total_rc_count=Sum('rc_count'),
            ).values('project', 'total_mvc_count', 'total_rc_not_vc_count', 'total_rc_count')
        }
        most_vulnerable_children_vulnerability_marker = {
            data.pop('project'): data
            for data in MostVulnerableChildrenVulnerabilityMarker.objects.order_by().values('project').annotate(
                **{
                    field_label: Sum(Cast(KeyTextTransform(field, 'data'), models.IntegerField()))
                    for field, field_label in MostVulnerableChildrenVulnerabilityMarker.get_data_fields()
                },
            ).values('project', *[f for _, f in MostVulnerableChildrenVulnerabilityMarker.get_data_fields()])
        }

        context = {
            'request': request,
            'most_vulnerable_children_indicator': most_vulnerable_children_indicator,
            'most_vulnerable_children_vulnerability_marker': most_vulnerable_children_vulnerability_marker,
            'support_pariticipation_detail': support_pariticipation_detail,
        }
        serializer = ProjectSerializer(queryset, context=context, many=True)
        return response.Response(serializer.data)


class ProjectReportViewSet(viewsets.ViewSet):
    """
    Project's report viewset
    """
    def retrieve(self, request, version, pk=None):
        queryset = Project.objects.all()
        project = get_object_or_404(queryset, pk=pk)
        serializer = ReportSerializer(
            project.recent_report,
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


class ProjectSummaryTrendViewSet(viewsets.ViewSet):
    """
    Project's report viewset
    """

    def list(self, request, version):
        summary = get_projects_summary(Project.objects.all(), group_by_date=True)
        return response.Response(summary)
