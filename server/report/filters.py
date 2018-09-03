from django.contrib import admin
from django.db.models import F, Q
from django.utils.translation import gettext_lazy as _


class SelectedReportListFilter(admin.SimpleListFilter):
    # Human-readable title which will be displayed in the
    # right admin sidebar just above the filter options.
    title = _('Selected Status')

    # Parameter for the filter that will be used in the URL query.
    parameter_name = 'is_selected'

    def lookups(self, request, model_admin):
        return (
            ('selected', _('Selected')),
            ('not_selected', _('Not Selected')),
        )

    def queryset(self, request, queryset):
        if self.value() == 'selected':
            return queryset.filter(project__selected_report=F('id'))
        elif self.value() == 'not_selected':
            return queryset.filter(~Q(project__selected_report=F('id')))
        else:
            return queryset.all()
