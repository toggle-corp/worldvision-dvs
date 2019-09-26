from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action

from .serializers import (
    SimpleSummaryGroupSerializer,
    SummaryGroupSerializer,
    SummaryGroupTrendSerializer,
)
from .models import SummaryGroup


class SummaryGroupViewSet(ReadOnlyModelViewSet):
    queryset = SummaryGroup.objects.all()
    serializer_class = SummaryGroupSerializer

    def get_serializer_class(self):
        if self.action == 'list':
            return SimpleSummaryGroupSerializer
        return super().get_serializer_class()

    @action(
        detail=True,
        methods=['get'],
        url_path='trend',
    )
    def trend(self, request, pk, version):
        instance = self.get_object()
        serializer = SummaryGroupTrendSerializer(instance)
        return Response(serializer.data)
