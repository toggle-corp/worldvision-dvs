from django.utils.safestring import mark_safe
from django.contrib import admin
from django.urls import reverse

from report.admin import ReportAdmin
from report.models import Report
from .models import Project, District, Municipality
from .forms import ProjectAdminForm


class ReportInline(ReportAdmin, admin.TabularInline):
    model = Report
    max_num = 1
    data_styles = 'overflow:scroll;height:500px'

    def __init__(self, *args, **kwargs):
        super(admin.TabularInline, self).__init__(*args, **kwargs)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    inlines = (ReportInline,)
    form = ProjectAdminForm
    search_fields = ('name', 'long', 'lat', 'selected_report__name')
    list_display = (
        'name', 'long', 'lat', 'get_selected_report', 'get_district',
    )
    list_select_related = ('selected_report',)
    list_filter = ('district',)

    def get_district(self, instance):
        district = instance.district
        if district:
            link = reverse('admin:project_district_change', args=(district.id,))
            return mark_safe('<a href="%s">%s</a>' % (link, district))

    get_district.short_description = 'District'

    def get_selected_report(self, instance):
        report = instance.selected_report
        if report:
            link = reverse('admin:report_report_change', args=(report.id,))
            return mark_safe('<a href="%s">%s</a>' % (link, report.name))

    get_selected_report.short_description = 'Selected Report'

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
class DistrictAdmin(admin.ModelAdmin):
    search_fields = ('name', 'code')
    list_display = ('name', 'code')
    ordering = ('name', 'code')


@admin.register(Municipality)
class MunicipalityAdmin(admin.ModelAdmin):
    search_fields = ('name', 'code', 'get_district')
    list_display = ('name', 'code', 'get_district')
    ordering = ('name', 'code')
    list_filter = ('district',)

    def get_district(self, instance):
        district = instance.district
        if district:
            link = reverse('admin:project_district_change', args=(district.id,))
            return mark_safe('<a href="%s">%s</a>' % (link, district))

    get_district.short_description = 'District'
