"""server URL Configuration
"""
from django.contrib import admin
from django.urls import path
from django.conf.urls import url, include, static
from django.views.static import serve
from django.views.decorators.clickjacking import xframe_options_exempt
from django.conf import settings
from rest_framework import routers, permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

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
