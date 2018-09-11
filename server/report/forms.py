from django import forms

from .models import Report


class ReportAdminForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        file = self.fields.get('file')
        if file:
            file.widget.attrs = {'accept': '.xml'}

    def clean(self):
        cleaned_data = super().clean()
        file = cleaned_data['file']
        if self.instance.file != file:
            cleaned_data['data'] = Report.extract_from_file(file)

    def save(self, *args, **kwargs):
        if self.cleaned_data.get('data'):
            self.instance.data = self.cleaned_data.get('data')
        report = super().save(*args, **kwargs)
        return report
