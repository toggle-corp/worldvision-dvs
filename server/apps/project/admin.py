from django.utils.safestring import mark_safe
from django.contrib import admin
from django.urls import reverse

from wv_dvs.admin import ModelAdmin
from report.models import Report
from report.forms import ReportAdminForm
from .models import Project, District, Municipality
from .forms import ProjectAdminForm


class ReportInline(admin.TabularInline):
    exclude = ('data',)
    show_change_link = True
    model = Report
    form = ReportAdminForm
    extra = 0

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Project)
class ProjectAdmin(ModelAdmin):
    inlines = (ReportInline,)
    form = ProjectAdminForm
    search_fields = ('name', 'number',)
    list_display = (
        'name', 'number', 'long', 'lat', 'recent_report', 'get_district',
    )
    list_filter = ('district',)
    autocomplete_fields = ('district',)
    filter_horizontal = ('municipalities',)
    save_on_top = True

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('reports', 'district')

    def get_district(self, instance):
        district = instance.district
        if district:
            link = reverse('admin:project_district_change', args=(district.id,))
            return mark_safe('<a href="%s">%s</a>' % (link, district))

    get_district.short_description = 'District'

    def recent_report(self, instance):
        report = instance.selected_report
        if report:
            link = reverse('admin:report_report_change', args=(report.id,))
            return mark_safe('<a href="%s">%s</a>' % (link, report.name))

    recent_report.short_description = 'Recent Report'

    def get_exclude(self, request, obj=None):
        if not obj:
            return ('selected_report',)

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        instance = form.instance
        reports = instance.reports.all()
        if not instance.selected_report and reports and len(reports):
            instance.selected_report = reports[0]
            instance.save()


@admin.register(District)
class DistrictAdmin(ModelAdmin):
    search_fields = ('name', 'code')
    list_display = ('name', 'code')
    ordering = ('name', 'code')


@admin.register(Municipality)
class MunicipalityAdmin(ModelAdmin):
    list_display = ('name', 'code', 'get_district')
    search_fields = ('name', 'code')
    ordering = ('name', 'code')
    list_filter = ('district',)
    autocomplete_fields = ('district',)

    def get_district(self, instance):
        district = instance.district
        if district:
            link = reverse('admin:project_district_change', args=(district.id,))
            return mark_safe('<a href="%s">%s</a>' % (link, district))

    get_district.short_description = 'District'
