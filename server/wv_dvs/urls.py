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
from report.views import (
    ReportViewSet,
    ProjectSOIViewSet,
    RegisterChildByAgeAndGenderViewSet,
    PresenceAndParticipationViewSet,
    ChildFamilyParticipationViewSet,
)


# Rest Routers
router = routers.DefaultRouter()

# Site settings
router.register(r'site-settings', SiteSettingsViewSet, base_name='site-settings')
# Projects list
router.register(r'projects', ProjectViewSet, base_name='project')
# Selected Project's report
router.register(r'projects-report', ProjectReportViewSet, base_name='project-report')
# All projects report summary
router.register(r'projects-summary', ProjectSummaryViewSet, base_name='project-summary')
# Grouped projects report summary
router.register(r'summary-groups', SummaryGroupViewSet, base_name='summary-group')

# Report Models ViewSet
router.register(r'project-reports',
                ReportViewSet, base_name='project-raw-report')
router.register(r'projects-soi',
                ProjectSOIViewSet, base_name='project-soi')
router.register(r'register-childs-by-age-and-gender',
                RegisterChildByAgeAndGenderViewSet, base_name='register-child-by-age-and-gender')
router.register(r'presence-and-participations',
                PresenceAndParticipationViewSet, base_name='presence-and-participation')
router.register(r'child-Family-participations',
                ChildFamilyParticipationViewSet, base_name='child-Family-participation')

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
