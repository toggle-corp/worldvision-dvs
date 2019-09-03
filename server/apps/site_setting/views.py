from rest_framework import viewsets, response

from .models import SiteSetting
from .serializers import SiteSettingsSerializer


class SiteSettingsViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for listing or retrieving projects.
    """
    def list(self, request, version):
        site_settings = SiteSetting.objects.first()
        serializer = SiteSettingsSerializer(site_settings)
        return response.Response(serializer.data)
