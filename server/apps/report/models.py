import logging

from django.contrib.auth.models import User
from django.db import models
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError
from django.dispatch import receiver

from project.models import Project
from .utils import parse_xml, delete_file
from .extractor import extract_data
from .validators import validate_file_extension


logger = logging.getLogger(__name__)


class Gender():
    MALE = 'male'
    FEMALE = 'female'
    CHOICES = (
        (MALE, 'Male'),
        (FEMALE, 'Female'),
    )


class Report(models.Model):
    name = models.CharField(max_length=255)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='reports')
    date = models.DateField(default=None, null=True)
    data = JSONField(default=None, blank=True, null=True)
    file = models.FileField(upload_to='reports/', validators=[validate_file_extension])

    class Meta:
        verbose_name = 'ADP Management Report'
        verbose_name_plural = 'ADP Management Reports'
        ordering = ('-date',)

    @staticmethod
    def extract_from_file(file):
        try:
            return extract_data(
                parse_xml(
                    file.open().read()
                )
            )
        except (IndexError, ValueError, KeyError):
            logger.exception(
                '{0} XML Extraction Failed: "{1}" {0}'.format('*' * 22, file),
                exc_info=True,
            )
            raise ValidationError(u'Unsupported xml file')

    def __str__(self):
        return f"{self.name}"


class ProjectSummaryModel(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    date = models.DateField()

    def __str__(self):
        return f'{self.date} <{self.project}>'

    class Meta:
        abstract = True
        ordering = ('-date',)
        unique_together = ('project', 'date',)


class ProjectSOI(ProjectSummaryModel):
    total_closed = models.IntegerField(default=0)
    closed_on = models.IntegerField(default=0)

    @property
    def rating(self):
        if self.total_closed and self.closed_on:
            return (self.closed_on / self.total_closed) * 100


class RegisterChildByAgeAndGender(ProjectSummaryModel):
    age = models.IntegerField()
    gender = models.CharField(max_length=10, choices=Gender.CHOICES)
    count = models.IntegerField(default=0)

    class Meta:
        unique_together = ('project', 'date', 'age', 'gender',)


class PresenceAndParticipation(ProjectSummaryModel):
    total_rc_temporarily_away = models.IntegerField(default=0)
    total_no_of_rc_records_dropped_during_the_month = models.IntegerField(default=0)


class ChildFamilyParticipation(ProjectSummaryModel):
    CHILD_PARTICIPATION = 'child_participation'
    FAMILY_PARTICIPATION = 'family_participation'
    CHILD_SUPPORT = 'child_support'
    FAMILY_SUPPORT = 'family_support'
    BENEFIT_SUPPORT = 'benefit_support'

    TYPE_CHOICES = (
        # Participation
        (CHILD_PARTICIPATION, 'Child Participation'),
        (FAMILY_PARTICIPATION, 'Family Participation'),
        # Support
        (CHILD_SUPPORT, 'Child Support'),
        (FAMILY_SUPPORT, 'Family Support'),
        (BENEFIT_SUPPORT, 'Benefit Support'),
    )

    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    gender = models.CharField(max_length=10, choices=Gender.CHOICES)
    participation = models.IntegerField(default=0)
    count = models.IntegerField(default=0)

    class Meta:
        unique_together = ('project', 'date', 'type', 'participation', 'gender',)


class LanguagePeopleGroupDisability(ProjectSummaryModel):
    language = models.CharField(max_length=255)
    people_group = models.CharField(max_length=255)
    disability = models.CharField(max_length=255, null=True, blank=True)
    count = models.IntegerField(default=0)

    class Meta:
        unique_together = ('project', 'date', 'language', 'people_group', 'disability',)


class SupportPariticipationDetail(ProjectSummaryModel):
    type = models.CharField(max_length=255)
    comment = models.CharField(max_length=255)
    count = models.IntegerField(default=0)

    class Meta:
        unique_together = ('project', 'date', 'type', 'comment',)


@receiver(models.signals.post_delete, sender=Report)
def delete_report_file(sender, instance, *args, **kwargs):
    """ Deletes report file on `post_delete` """
    if instance.file:
        delete_file(instance.file.path)


class BulkImportReport(models.Model):
    """
    For bulk import logging
    """
    SUCCESS = 'success'
    FAILED = 'failed'
    STATUS_CHOICES = (
        (SUCCESS, 'Success'),
        (FAILED, 'Failed'),
    )

    report_type = models.CharField(max_length=100)
    file = models.FileField(upload_to='bulk-import-report/')  # Provide by user
    generated_on = models.DateField(default=None, null=True)  # Provide by user
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=10, null=True, choices=STATUS_CHOICES,)
    log_message = models.TextField(null=True)

    def __str__(self):
        return f'{self.report_type}:{self.generated_on}'
