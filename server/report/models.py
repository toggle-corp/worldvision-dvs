from django.db import models
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError
import logging

from project.models import Project
from .utils import parse_xml
from .extractor import extract_data
from .validators import validate_file_extension


logger = logging.getLogger(__name__)


class Report(models.Model):
    name = models.CharField(max_length=255)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='reports',
    )
    data = JSONField(default=None, blank=True, null=True)
    file = models.FileField(upload_to='reports/', validators=[validate_file_extension])

    @staticmethod
    def extract_from_file(file):
        try:
            return extract_data(
                parse_xml(
                    file.open().read()
                )
            )
        except (IndexError, ValueError, KeyError) as e:
            logger.exception('{0} XML Extraction Failed: "{1}" {0}'.format('*' * 22, file))
            raise ValidationError(u'Unsupported xml file')

    def is_selected(self):
        selected_report = self.project.selected_report
        if selected_report and selected_report == self:
            return True
        return False

    def __str__(self):
        return self.name
