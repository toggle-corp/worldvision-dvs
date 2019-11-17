"""server URL Configuration
"""
from django.contrib import admin
from django.urls import path
from django.conf.urls import url, include, static
from django.views.static import serve
from django.views.decorators.clickjacking import xframe_options_exempt
from django.conf import settings
from django.views.generic.base import RedirectView
from rest_framework import routers, permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from site_setting.views import SiteSettingsViewSet
from summary_group.views import SummaryGroupViewSet
from project.views import (
    ProjectViewSet,
    ProjectReportViewSet,
    ProjectSummaryViewSet,
    ProjectSummaryTrendViewSet,
)
from report.views import (
    ReportViewSet,
    ProjectSOIViewSet,
    RegisterChildByAgeAndGenderViewSet,
    PresenceAndParticipationViewSet,
    ChildFamilyParticipationViewSet,
    ProjectLanguagePeopleGroupDisabilityViewSet,
)

api_schema_view = get_schema_view(
    openapi.Info(
        title="DEEP API",
        default_version='v1',
        description="DEEP API",
        contact=openapi.Contact(email="admin@thedeep.io"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# Rest Routers
router = routers.DefaultRouter()

# Site settings
router.register(r'site-settings', SiteSettingsViewSet, basename='site-settings')
# Projects list
router.register(r'projects', ProjectViewSet, basename='project')
# Selected Project's report
router.register(r'projects-report', ProjectReportViewSet, basename='project-report')
# All projects report summary
router.register(r'projects-summary', ProjectSummaryViewSet, basename='project-summary')
# All projects report summary (Trend)
router.register(r'projects-summary-trend', ProjectSummaryTrendViewSet, basename='project-summary-trend')
# Grouped projects report summary
router.register(r'summary-groups', SummaryGroupViewSet, basename='summary-group')

# Report Models ViewSet
router.register(r'project-reports',
                ReportViewSet, basename='project-raw-report')
router.register(r'projects-soi',
                ProjectSOIViewSet, basename='project-soi')
router.register(r'register-childs-by-age-and-gender',
                RegisterChildByAgeAndGenderViewSet, basename='register-child-by-age-and-gender')
router.register(r'presence-and-participations',
                PresenceAndParticipationViewSet, basename='presence-and-participation')
router.register(r'child-family-participations',
                ChildFamilyParticipationViewSet, basename='child-Family-participation')
router.register(
    r'project-language-people-group-disabilities',
    ProjectLanguagePeopleGroupDisabilityViewSet,
    basename='project-language-people-group-disability',
)

# Versioning : (v1|v2|v3)
API_PREFIX = r'^api/(?P<version>(v1))/'


def get_api_path(path):
    return '{}{}'.format(API_PREFIX, path)


urlpatterns = [
    path('', RedirectView.as_view(url='admin/')),
    path('admin/', admin.site.urls),

    # API Documentation
    url(
        r'^api-docs(?P<format>\.json|\.yaml)$',
        api_schema_view.without_ui(cache_timeout=0), name='schema-json'
    ),
    url(r'^api-docs/$', api_schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    url(r'^redoc/$', api_schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    url(get_api_path(''), include(router.urls)),
] + static.static(
    settings.MEDIA_URL, view=xframe_options_exempt(serve),
    document_root=settings.MEDIA_ROOT)

if 'silk' in settings.INSTALLED_APPS:
    urlpatterns += [
        url(r'^silk/', include('silk.urls', namespace='silk')),
    ]
