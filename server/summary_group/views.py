from rest_framework import viewsets

from .serializers import SummaryGroupSerializer
from .models import SummaryGroup


class SummaryGroupViewSet(viewsets.ModelViewSet):
    queryset = SummaryGroup.objects.all()
    serializer_class = SummaryGroupSerializer
