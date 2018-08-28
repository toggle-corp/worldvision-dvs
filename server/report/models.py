from django.db import models
from django.contrib.postgres.fields import JSONField

from project.models import Project
from .utils import parse_xml, extract_data


class Report(models.Model):
    name = models.CharField(max_length=255)
    project = models.ForeignKey(Project,  on_delete=models.CASCADE)
    data = JSONField(default=None, blank=True, null=True)
    file = models.FileField(upload_to='reports/')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.original_file = self.file

    def save(self, *args, **kwargs):
        if self.original_file != self.file:
            self.data = extract_data(
                parse_xml(
                    self.file.open().read()
                )
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return '%s -> Report: %s' % (self.project.name, self.name)
