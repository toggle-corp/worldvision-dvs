import json

from django.urls import path
from django.urls import reverse
from django.contrib import admin
from django.contrib.admin import helpers
from django.utils.safestring import mark_safe
from django.shortcuts import redirect, render

from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import JsonLexer

from .models import (
    Report,
    ProjectSOI,
    RegisterChildByAgeAndGender,
    PresenceAndParticipation,
    ChildFamilyParticipation,
)
from .filters import SelectedReportListFilter
from .forms import ReportAdminForm, BulkImportForm


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    exclude = ('data',)
    readonly_fields = ('data_prettified',)
    search_fields = ('name', 'project__name', 'file')
    list_display = ('name', 'get_project', 'file', 'is_selected')
    list_filter = (SelectedReportListFilter,)
    autocomplete_fields = ('project',)
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


class ProjectSummaryAdmin(admin.ModelAdmin):
    autocomplete_fields = ('project',)

    def get_list_display(self, request):
        return [
            field.name for field in self.model._meta.fields if field.name != 'id'
        ]

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['additional_addlinks'] = [{
            'url': self.get_import_namespace(),
            'label': 'Bulk Import',
        }]
        return super().changelist_view(request, extra_context=extra_context)

    def get_import_namespace(self, absolute=True):
        info = self.model._meta.app_label, self.model._meta.model_name
        return '{}{}_{}_import'.format('admin:' if absolute else '', *info)

    def get_urls(self):
        return [
            path(
                'import/', self.admin_site.admin_view(self.import_data),
                name=self.get_import_namespace(False),
            ),
        ] + super().get_urls()

    def import_data(self, request):
        if request.method == 'POST':
            form = BulkImportForm(request.POST, request.FILES, bulk_model=self.model)
            if form.is_valid():
                generated_on = form.data.get('generated_on')
                BulkImportForm.handle_uploaded_file(request, generated_on, self.model)
                return redirect(
                    'admin:{}_{}_changelist'.format(
                        self.model._meta.app_label, self.model._meta.model_name,
                    )
                )
        form = BulkImportForm(bulk_model=self.model)

        context = {
            **self.admin_site.each_context(request),
            'has_view_permission': self.has_view_permission(request),
            'app_label': self.model._meta.app_label,
            'opts': self.model._meta,
            'form': form,
            'adminform': helpers.AdminForm(
                form,
                list([(None, {'fields': form.base_fields})]),
                self.get_prepopulated_fields(request),
            )
        }
        return render(request, "admin/bulk_import_form.html", context)


admin.register(ProjectSOI)(ProjectSummaryAdmin)
admin.register(RegisterChildByAgeAndGender)(ProjectSummaryAdmin)
admin.register(PresenceAndParticipation)(ProjectSummaryAdmin)
admin.register(ChildFamilyParticipation)(ProjectSummaryAdmin)