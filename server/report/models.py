from django.db import models
from django.contrib.postgres.fields import JSONField

from project.models import Project
from .utils import parse_xml
from .extractor import extract_data
from .validators import validate_file_extension


class Report(models.Model):
    name = models.CharField(max_length=255)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='reports',
    )
    data = JSONField(default=None, blank=True, null=True)
    file = models.FileField(upload_to='reports/', validators=[validate_file_extension])

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.original_file = self.file

    def is_selected(self):
        selected_report = self.project.selected_report
        if selected_report and selected_report == self:
            return True
        return False

    def extract_from_file(self):
        self.data = extract_data(
            parse_xml(
                self.file.open().read()
            )
        )

    def save(self, *args, **kwargs):
        if self.original_file != self.file:
            self.extract_from_file()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
