import traceback
import logging
import xmltodict
import io
import csv

from django.contrib.admin.widgets import AdminDateWidget
from django.db import transaction
from django import forms
from django.utils.safestring import mark_safe
from django.contrib import messages

from .models import (
    Report,
    ProjectSOI,
    RegisterChildByAgeAndGender,
    PresenceAndParticipation,
    ChildFamilyParticipation,
    LanguagePeopleGroupDisability,
)
from .bulk_import import (
    SOI,
    child_family_participation,
    presence_and_participation,
    register_child_by_age_and_gender,
    language_people_group_disability,
)
from .utils import delete_file

logger = logging.getLogger(__name__)

BULK_IMPORTER = {
    ProjectSOI: SOI,
    RegisterChildByAgeAndGender: register_child_by_age_and_gender,
    PresenceAndParticipation: presence_and_participation,
    ChildFamilyParticipation: child_family_participation,
    LanguagePeopleGroupDisability: language_people_group_disability,
}

# where user needs to provide the data information
DATE_REQUIRED_MODELS = [
    PresenceAndParticipation,
    ChildFamilyParticipation,
    LanguagePeopleGroupDisability,
]

# where the import files should be CSV (instead of xlm)
CSV_IMPORT_MODELS = [
    LanguagePeopleGroupDisability,
]


class ReportAdminForm(forms.ModelForm):
    class Meta:
        model = Report
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.original_report_file = self.instance.file
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
            if self.original_report_file:
                delete_file(self.original_report_file.path)
        report = super().save(*args, **kwargs)
        return report


class BulkImportForm(forms.Form):
    file = forms.FileField(
        widget=forms.FileInput(
            attrs={'accept': 'text/xml'}
        )
    )
    generated_on = forms.DateField(
        widget=AdminDateWidget(),
        required=False,
        help_text='Overrides generated date for the document.',
    )

    def __init__(self, *args, **kwargs):
        bulk_model = kwargs.pop('bulk_model', 0)

        super().__init__(*args, **kwargs)
        if bulk_model in DATE_REQUIRED_MODELS:
            self.fields['generated_on'].required = True
            self.fields['generated_on'].help_text = 'Required'
        if bulk_model in CSV_IMPORT_MODELS:
            self.fields['file'].widget.attrs['accept'] = 'text/csv'

    @staticmethod
    def handle_uploaded_file(request, generated_on, model):
        file = request.FILES['file']
        try:
            if model in CSV_IMPORT_MODELS:
                raw_data = csv.DictReader(
                    io.StringIO(file.read().decode('utf-8')),
                    skipinitialspace=True,
                )
            else:
                raw_data = xmltodict.parse(file.open().read())
            with transaction.atomic():
                BULK_IMPORTER.get(model).extract(raw_data, generated_on)
            messages.add_message(
                request,
                messages.INFO,
                mark_safe(
                    f"Successfully imported <b>{file}</b> "
                    f"to <b>{model._meta.verbose_name.upper()}</b>"
                ),
            )
        except Exception:
            logger.error(f'Error importing {model}', exc_info=True)
            messages.add_message(
                request,
                messages.ERROR,
                mark_safe(
                    f"Importing <b>{file}</b> failed for <b>{model._meta.verbose_name.upper()}</b>"
                    " !! Check file structure and try again!!"
                    f"<br /><pre>{traceback.format_exc()}</pre>"
                ),
            )
