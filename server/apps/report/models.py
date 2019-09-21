import logging

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
        ordering = ('-id',)

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

    def is_selected(self):
        selected_report = self.project.selected_report
        if selected_report and selected_report == self:
            return True
        return False

    def __str__(self):
        return f"{self.name} {(self.is_selected() and '<-- (Currently Selected)') or ''}"


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
    ZERO_TO_SIX = '<=6'
    SEVEN_TO_TWELVE = '7-12'
    THIRTEEN_OR_ABOVE = '>=13'
    AGE_RANGE_CHOICES = (
        (ZERO_TO_SIX, '<=6'),
        (SEVEN_TO_TWELVE, '7-12'),
        (THIRTEEN_OR_ABOVE, '>=13'),
    )

    age_range = models.CharField(max_length=10, choices=AGE_RANGE_CHOICES)
    gender = models.CharField(max_length=10, choices=Gender.CHOICES)
    count = models.IntegerField(default=0)

    @classmethod
    def get_range_for_age(cls, _age):
        age = int(_age)
        if age <= 6:
            return cls.ZERO_TO_SIX
        elif age >= 7 and age <= 12:
            return cls.SEVEN_TO_TWELVE
        return cls.THIRTEEN_OR_ABOVE

    class Meta:
        unique_together = ('project', 'date', 'age_range', 'gender',)


class PresenceAndParticipation(ProjectSummaryModel):
    total_rc_temporarily_away = models.IntegerField(default=0)
    total_no_of_rc_records_dropped_during_the_month = models.IntegerField(default=0)


class ChildFamilyParticipation(ProjectSummaryModel):
    CHILD_PARTICIPATION = 'child_participation'
    FAMILY_PARTICIPATION = 'family_participation'
    CHILD_SUPPORT = 'child_support'
    FAMILY_SUPPORT = 'family_support'
    TYPE_CHOICES = (
        # Participation
        (CHILD_PARTICIPATION, 'Child Participation'),
        (FAMILY_PARTICIPATION, 'Family Participation'),
        # Support
        (CHILD_SUPPORT, 'Child Support'),
        (FAMILY_SUPPORT, 'Family Support'),
    )

    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    gender = models.CharField(max_length=10, choices=Gender.CHOICES)
    participation = models.IntegerField(default=0)
    count = models.IntegerField(default=0)

    class Meta:
        unique_together = ('project', 'date', 'type', 'participation', 'gender',)


@receiver(models.signals.post_delete, sender=Report)
def delete_report_file(sender, instance, *args, **kwargs):
    """ Deletes report file on `post_delete` """
    if instance.file:
        delete_file(instance.file.path)
