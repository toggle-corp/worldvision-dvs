import json

from django.urls import reverse
from django.contrib import admin
from django.utils.safestring import mark_safe
from django.contrib import messages

from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import JsonLexer

from .models import Report
from .filters import SelectedReportListFilter
from .forms import ReportAdminForm


class ReportAdmin(admin.ModelAdmin):
    exclude = ('data',)
    readonly_fields = ('data_prettified',)
    search_fields = ('name', 'project__name', 'file')
    list_display = ('name', 'get_project', 'file', 'is_selected')
    list_filter = (SelectedReportListFilter,)
    form = ReportAdminForm

    def get_project(self, instance):
        project = instance.project
        link = reverse('admin:project_project_change', args=(project.id,))
        return mark_safe('<a href="%s">%s</a>' % (link, project.name))

    get_project.short_description = 'Project'

    def data_prettified(self, instance):
        """Function to display pretty version of our data"""

        # Convert the data to sorted, indented JSON
        response = json.dumps(instance.data, sort_keys=True, indent=2)

        # Truncate the data. Alter as needed
        # response = response[:5000]

        # Get the Pygments formatter
        formatter = HtmlFormatter(style='colorful')

        # Highlight the data
        response = highlight(response, JsonLexer(), formatter)

        # Get the stylesheet
        style = "<style>" + formatter.get_style_defs() + "</style><br>"

        # Safe the output
        over_styles = getattr(self, 'data_styles', '') if instance.data else ''
        return mark_safe(
            style +
            '<div style="' + over_styles + '">' +
            response +
            '<div>'
        )

    data_prettified.short_description = 'data'

    def check_integrity_for_delete(self, request, obj):
        project = obj.project
        if project.selected_report == obj:
            self.message_user(
                request,
                ('Can\'t Delete %(report)s, because it\'s selected by Project: %(project)s') % {
                    'report': obj.name,
                    'project': project.name,
                },
                messages.ERROR,
            )
            return False
        return True

    def delete_queryset(self, request, queryset):
        for obj in queryset.all():
            if not self.check_integrity_for_delete(request, obj):
                return
        super().delete_queryset(request, queryset)

    def delete_model(self, request, obj):
        if self.check_integrity_for_delete(request, obj):
            super().delete_model(request, obj)


admin.register(Report)(ReportAdmin)
