from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets

from report.models import (
    Report,
    ProjectSOI,
    RegisterChildByAgeAndGender,
    PresenceAndParticipation,
    ChildFamilyParticipation,
)
from .serializers import (
    ReportSerializer,
    ProjectSOISerializer,
    RegisterChildByAgeAndGenderSerializer,
    PresenceAndParticipationSerializer,
    ChildFamilyParticipationSerializer,
)


class ProjectSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ('project', 'date',)


class ReportViewSet(ProjectSummaryViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer


class ProjectSOIViewSet(ProjectSummaryViewSet):
    queryset = ProjectSOI.objects.all()
    serializer_class = ProjectSOISerializer


class RegisterChildByAgeAndGenderViewSet(ProjectSummaryViewSet):
    queryset = RegisterChildByAgeAndGender.objects.all()
    serializer_class = RegisterChildByAgeAndGenderSerializer
    filter_backends = [DjangoFilterBackend]


class PresenceAndParticipationViewSet(ProjectSummaryViewSet):
    queryset = PresenceAndParticipation.objects.all()
    serializer_class = PresenceAndParticipationSerializer
    filter_backends = [DjangoFilterBackend]


class ChildFamilyParticipationViewSet(ProjectSummaryViewSet):
    queryset = ChildFamilyParticipation.objects.all()
    serializer_class = ChildFamilyParticipationSerializer
    filter_backends = [DjangoFilterBackend]
