"""server URL Configuration
"""
from django.contrib import admin
from django.urls import path
from django.conf.urls import url, include, static
from django.views.static import serve
from django.views.decorators.clickjacking import xframe_options_exempt
from django.conf import settings
from rest_framework import routers

from site_setting.views import SiteSettingsViewSet
from summary_group.views import SummaryGroupViewSet
from project.views import (
    ProjectViewSet,
    ProjectReportViewSet,
    ProjectSummaryViewSet,
)

# Rest Routers
router = routers.DefaultRouter()

# Project routers
router.register(r'site-settings', SiteSettingsViewSet, base_name='site-settings')
router.register(r'projects', ProjectViewSet, base_name='project')
router.register(
    r'projects-report', ProjectReportViewSet, base_name='project-report'
)
router.register(
    r'projects-summary', ProjectSummaryViewSet, base_name='project-summary'
)
router.register(
    r'summary-groups', SummaryGroupViewSet, base_name='summary-group'
)

# Versioning : (v1|v2|v3)

API_PREFIX = r'^api/(?P<version>(v1))/'


def get_api_path(path):
    return '{}{}'.format(API_PREFIX, path)


urlpatterns = [
    path('admin/', admin.site.urls),

    url(get_api_path(''), include(router.urls)),
] + static.static(
    settings.MEDIA_URL, view=xframe_options_exempt(serve),
    document_root=settings.MEDIA_ROOT)
