from django.contrib import admin

from .models import Project
from report.models import Report


class ReportInline(admin.TabularInline):
    model = Report
    max_num = 1
    # exclude = ('data',)
    readonly_fields = ('data',)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    inlines = (ReportInline,)

    def get_exclude(self, request, obj=None):
        if not obj:
            return ('selected_report',)
