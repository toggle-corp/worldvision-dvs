from django import forms

from server.widgets import RelatedFieldWidgetWrapper
from report.models import Report


class ProjectAdminForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        selected_report = self.fields.get('selected_report')
        if selected_report and self.instance:
            selected_report.widget.can_add_related = False
            selected_report.widget = RelatedFieldWidgetWrapper(
                widget=selected_report.widget,
                modal_id=self.instance.id,
                modal_name='project',
            )
            selected_report.queryset = Report.objects.filter(
                project=self.instance
            )
